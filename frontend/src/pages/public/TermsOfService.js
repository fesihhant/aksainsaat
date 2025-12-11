import React, { useState, useEffect } from 'react';
import Breadcrumbs from './Breadcrumbs';
import { useApiCall } from '../../utils/apiCalls';
import '../../css/HomePage.css';


const TermsOfService = () => {
    const [formData, setFormData] = useState({
        title:'',
        content:''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
        
    const { apiData, apiError, apiLoading } = useApiCall('/termsOfServices', 'GET', null, false);

    useEffect(() => {
        if (apiData && apiData.termsOfService) {
            if (apiData.success && apiData.termsOfService.length > 0) {    
                setFormData(apiData.termsOfService[0]);
            } 
        }
        if (apiError) {
            console.error(apiError);
            setError('Sunucudan veri alınırken bir hata oluştu');
        }
        setLoading(apiLoading);
       
    }, [apiData, apiError, apiLoading]);

    return (
        <div className="home-container">
            <div className="main-content">
                <Breadcrumbs />
                <div className="about-form-container">   
                     
                    {loading && <p>Yükleniyor...</p>}
                    {error && <div className="error-message">{error}</div>}
                    
                    {formData && formData.title &&
                        <>
                            <div>
                                <h2>{formData.title}</h2>
                                <br/>   
                                <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                            </div>
                        </>
                    } 
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
