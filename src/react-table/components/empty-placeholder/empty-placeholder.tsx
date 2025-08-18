import Empty from 'antd/es/empty';
import NoDataImage from '../../assets/icons/empty.svg?react';

const styles = { image: { height: 60 } };

export const EmptyPlaceholder = ({
    text,
    image,
    children,
}: {
    text: string;
    image: string | React.ReactElement;
    children?: React.ReactNode;
}) => (
    <Empty
        className='ant-empty-normal'
        image={image}
        styles={styles}
        description={<span>{text}</span>}
    >
        {children}
    </Empty>
);

export const emptyStateImages = {
    defaultImage: Empty.PRESENTED_IMAGE_SIMPLE,
    noDataImage: <NoDataImage />,
};

export const emptyStateMessages = {
    noMatchOnFilter: 'No matches found, try another filter',
};
