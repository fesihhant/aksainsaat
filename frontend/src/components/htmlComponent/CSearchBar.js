const CSearchBar = ({ searchTerm, handleSearch }) => {
    return ( 
        <div className="search-box">
            <input
                type="text"
                placeholder="Ara..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
            />
        </div>
    );
};

export default CSearchBar;