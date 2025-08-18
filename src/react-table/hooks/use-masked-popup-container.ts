import { useCallback, useRef } from 'react';

export const useMaskedPopupContainer = () => {
    const maskedPopupContainer = useRef<HTMLDivElement>(null);

    const getMaskedPopupContainer = useCallback(
        (triggerNode: HTMLElement) => {
            if (maskedPopupContainer.current) {
                return maskedPopupContainer.current;
            }
            return triggerNode;
        },
        [maskedPopupContainer],
    );

    return { maskedPopupContainer, getMaskedPopupContainer };
};
