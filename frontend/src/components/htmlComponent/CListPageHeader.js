import CSearchBar from './CSearchBar';
import CNewButton from './CNewButton';

const CListPageHeader = ({ pageName, error, searchTerm, handleSearch, url, showNewButton }) => {
    
    return (
        <>
            <div className="page-header">                
                {/* <h1 className='headerClass'>{getPageIcon(pageName)} {getPageTitleText(pageName)}</h1>  */}
                <div className="header-actions">
                    <CSearchBar searchTerm={searchTerm} handleSearch={handleSearch}/>
                   {showNewButton && <CNewButton url={url} /> }
                </div>
            </div> 
            {error && <div className="error-message">{error}</div>}   
        </>
    );
};

export default CListPageHeader;