// Description: This component is a search bar that allows users to input a search term.
// It has a text input field and an icon. The input field is controlled by the `searchTerm` prop, and the `handleSearch` function is called whenever the input value changes. The component is styled with CSS classes for layout and appearance.
import React from 'react';

const CSearchBar = ({ searchTerm, handleSearch }) => {
    return ( 
        <div className="header-actions">
            <div className="search-box">
                <input
                    type="text"
                    placeholder="Ara..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>
        </div>
    );
};

export default CSearchBar;