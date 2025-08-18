import React from 'react';
// import { SpinLoader } from '../../../spin-loader/spin-loader';
import './full-loader.less';
import { SpinLoader } from './spin-loader/spin-loader';

const FullLoader = ({ loaderIcon }: { loaderIcon?: React.ReactElement }) => {
    return (
        <div className='full-loader'>
            <SpinLoader size='small' loaderIcon={loaderIcon} />
        </div>
    );
};

export default React.memo(FullLoader);
