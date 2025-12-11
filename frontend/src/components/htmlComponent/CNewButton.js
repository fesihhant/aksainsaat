
import React from 'react';
import { useNavigate } from 'react-router-dom';

const CNewButton = ({ url }) => {
        const navigate = useNavigate();
    
    return (
        <button  onClick={() => navigate(url)} className="submit-button" >
            Yeni
        </button>
    );
};

export default CNewButton;