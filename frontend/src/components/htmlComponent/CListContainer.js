import Breadcrumbs from '../../pages/public/Breadcrumbs';

import CListPageHeader from './CListPageHeader';
import CDataGrid from './CDataGrid';
 
const CListContainer = ({pageName, error, searchTerm, handleSearch, url, filteredData, columns, loading,pageSize }) => {
    
    return (
        <div className="home-container">
            <div className="main-content">
                <Breadcrumbs />
                <div className="data-grid-container">
                    <CListPageHeader pageName={pageName} error={error} searchTerm={searchTerm} handleSearch={handleSearch} url={url} />
                    <CDataGrid filteredData={filteredData} columns={columns} loading={loading} pageSize={pageSize} />
                </div>
            </div>
        </div>
    );
};

export default CListContainer;