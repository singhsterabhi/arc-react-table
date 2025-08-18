import { EmptyPlaceholder, emptyStateImages } from '../empty-placeholder/empty-placeholder';
import './no-data.less';

const NoData = () => {
    return (
        <div className='react-table-no-data'>
            <EmptyPlaceholder text='No data' image={emptyStateImages.noDataImage} />
        </div>
    );
};

export default NoData;
