import Spin, { SpinIndicator } from 'antd/es/spin';
import './spin-loader.less';

interface SpinLoaderProps {
    className?: string;
    tip?: string;
    size?: 'small' | 'default' | 'large';
    loaderIcon?: React.ReactElement;
}

export const SpinLoader: React.FC<SpinLoaderProps> = ({
    className = '',
    tip = '',
    size = 'default',
    loaderIcon,
    ...props
}) => {
    return (
        <div className={`${className} spin-loader ${size}`}>
            <Spin indicator={loaderIcon as SpinIndicator} {...props}></Spin>
            {tip && <h4 className='loading-message'>{tip}</h4>}
        </div>
    );
};
