import React, { useCallback, useEffect, useMemo, useRef, useState, useReducer } from 'react';
import { Row, Table } from '@tanstack/react-table';
import AnimateHeight from 'react-animate-height';
import { getCustomRendererColSpan } from '../utils';
import classNames from 'classnames';
import { RenderDetailPanelProps } from '../../types';
import {
    useContainerDimensions,
    ContainerDimensionsHandle,
} from '../../hooks/use-container-dimensions';
export interface DetailPanelRowProps {
    row: Row<any>;
    table: Table<any>;
    columns: any[];
    addExtraColumn: boolean;
    renderDetailPanel: (props: RenderDetailPanelProps) => React.ReactNode;
}

const PADDING = 8;
const HEIGHT_PERCENTAGE = 0.65;

interface PanelState {
    panelHeight?: number | undefined;
    shouldRender?: boolean;
    shouldTransition?: boolean;
}

type PanelAction =
    | { type: 'SET_PANEL_HEIGHT'; height: number | undefined }
    | { type: 'EXPAND_PANEL' }
    | { type: 'COLLAPSE_PANEL' }
    | { type: 'FINISH_TRANSITION' }
    | {
          type: 'CUSTOM_RENDER_TRANSITION';
          shouldRender: boolean;
          shouldTransition: boolean;
      };

const panelReducer = (state: PanelState, action: PanelAction): PanelState => {
    switch (action.type) {
        case 'SET_PANEL_HEIGHT':
            return { ...state, panelHeight: action.height };
        case 'EXPAND_PANEL':
            return { ...state, shouldTransition: true };
        case 'COLLAPSE_PANEL':
            return { ...state, shouldRender: false, shouldTransition: true };
        case 'FINISH_TRANSITION':
            return { ...state, shouldTransition: false };
        case 'CUSTOM_RENDER_TRANSITION':
            return {
                ...state,
                shouldRender: action.shouldRender,
                shouldTransition: action.shouldTransition,
            };
        default:
            return state;
    }
};

export const DetailPanelRow = (props: DetailPanelRowProps) => {
    let isExpanded = props.row.getIsExpanded();
    if (!props.row.getCanExpand || !props.row.getCanExpand()) {
        return null;
    }

    return <DetailPanelRowComponent {...props} key={props.row.id} isExpanded={isExpanded} />;
};

const initialPanelState: PanelState = {
    panelHeight: undefined,
    shouldRender: false,
    shouldTransition: false,
};

const DetailPanelRowComponent = React.memo(
    ({
        row,
        columns,
        table,
        renderDetailPanel: RenderDetailPanel,
        addExtraColumn,
        isExpanded,
    }: DetailPanelRowProps & { isExpanded: boolean }) => {
        const containerRef = table?.options.meta?.containerRef;
        // Fallback ref when containerRef is undefined
        const fallbackRef = useRef<HTMLDivElement>(null);
        const effectiveRef = containerRef || fallbackRef;
        const dimensionsRef = useRef<ContainerDimensionsHandle | null>(null);

        // const isExpanded = row.getIsExpanded();

        const [contentMeasurements, setContentmeasurements] = useState<{
            width: number;
            height: number;
        }>({ width: 0, height: 0 });

        const [panelState, dispatch] = useReducer(panelReducer, initialPanelState);
        const { panelHeight, shouldRender, shouldTransition } = panelState;

        const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
        const TRANSITION_DURATION = 400; // ms - Adjust if your CSS transition duration is different

        // Handle expansion state changes
        useEffect(() => {
            // Clear any existing timer before setting a new one
            if (animationTimerRef.current) {
                clearTimeout(animationTimerRef.current);
                animationTimerRef.current = null;
            }

            if (isExpanded) {
                dispatch({ type: 'EXPAND_PANEL' });
                // Set timer to render content after animation starts
                animationTimerRef.current = setTimeout(() => {
                    dispatch({
                        type: 'CUSTOM_RENDER_TRANSITION',
                        shouldTransition: false,
                        shouldRender: true,
                    });
                    // Don't nullify the reference here to ensure cleanup works
                }, TRANSITION_DURATION);
            } else {
                // Unmount content immediately on collapse start
                dispatch({ type: 'COLLAPSE_PANEL' });
                animationTimerRef.current = setTimeout(() => {
                    dispatch({ type: 'FINISH_TRANSITION' });
                }, TRANSITION_DURATION);
            }

            // Cleanup function ensures timer is cleared on unmount or when dependencies change
            return () => {
                if (animationTimerRef.current) {
                    clearTimeout(animationTimerRef.current);
                    animationTimerRef.current = null;
                }
            };
        }, [isExpanded]);

        // Handle render state changes
        useEffect(() => {
            if (!shouldRender) {
                dispatch({ type: 'SET_PANEL_HEIGHT', height: undefined });
                // No additional timer needed here
            }
        }, [shouldRender]);

        const setWidth = useCallback((width: number) => {
            setContentmeasurements((prev) => ({
                width: width,
                height: prev.height,
            }));
        }, []);

        const setHeight = useCallback((height: number | undefined) => {
            dispatch({ type: 'SET_PANEL_HEIGHT', height });
        }, []);

        const setContainerDimensions = useCallback(
            (dimensions: { width: number; height: number }) => {
                const height = Math.floor(dimensions.height * HEIGHT_PERCENTAGE);
                setContentmeasurements({
                    width: dimensions.width - PADDING,
                    height: height,
                });
            },
            [],
        );

        // Use the dimensions hook with proper ref
        useContainerDimensions(effectiveRef, setContainerDimensions, dimensionsRef);

        const detailPanelContentStyle = useMemo((): React.CSSProperties => {
            const width = contentMeasurements.width ? contentMeasurements.width : '100%';
            const maxHeight = contentMeasurements.height ? contentMeasurements.height : '100%';
            return {
                width: `${width}px`,
                maxHeight: `${maxHeight}px`,
            };
        }, [contentMeasurements]);

        const animateHeight = useMemo(() => {
            return isExpanded
                ? panelHeight
                    ? panelHeight + 21
                    : (contentMeasurements.height ?? 'auto')
                : 0;
        }, [isExpanded, panelHeight, contentMeasurements.height]);

        return (
            <tr className='detail-panel-row'>
                <td colSpan={getCustomRendererColSpan(columns) + (addExtraColumn ? 1 : 0)}>
                    <AnimateHeight
                        duration={TRANSITION_DURATION}
                        height={animateHeight}
                        className={classNames('cell detail-panel-content', {
                            'detail-panel-content-expanded': shouldRender,
                            'detail-panel-content-collapsed': !shouldRender,
                            'detail-panel-content-transitioning': shouldRender || shouldTransition,
                        })}
                        style={detailPanelContentStyle}
                    >
                        {shouldRender ? (
                            <RenderDetailPanel
                                row={row}
                                table={table}
                                contentMeasurements={contentMeasurements}
                                setWidth={setWidth}
                                setHeight={setHeight}
                            />
                        ) : null}
                    </AnimateHeight>
                </td>
            </tr>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.row.id === nextProps.row.id && prevProps.isExpanded === nextProps.isExpanded
        );
    },
);
