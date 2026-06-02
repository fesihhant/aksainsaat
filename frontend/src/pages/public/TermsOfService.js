import React, { useState, useEffect } from 'react';
import Breadcrumbs from './Breadcrumbs';
import { useApiCall } from '../../utils/apiCalls';
import '../../css/HomePage.css';
import { HtmlRenderer } from '../../utils/utils';
import Loading from '../../components/htmlComponent/Loading';


const TermsOfService = () => {
    const [formData, setFormData] = useState({
        title:'',
        content:''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
        
    const { apiData, apiError, apiLoading, refetch } = useApiCall(
        '/termsOfServices',
        'GET',
        null,
        false,
        { cache: true, staleTimeMs: 5 * 60 * 1000, cacheStorage: 'both', dedupe: true, timeoutMs: 45000, retry: 1, retryDelayMs: 500 }
    );

    useEffect(() => {
        if (apiData && apiData.termsOfService) {
            if (apiData.success && apiData.termsOfService.length > 0) {    
                setFormData(apiData.termsOfService[0]);
            } 
        }
        if (apiError) {
            setError('Sunucudan veri alınırken bir hata oluştu: ' + apiError.message);
        }
        setLoading(apiLoading);
       
    }, [apiData, apiError, apiLoading]);

    return (
        <div className="home-container">
            <div className="main-content">
                <Breadcrumbs />
                <div className="about-form-container">   
                    {apiLoading && !formData.title ? (
                        <Loading message="Veriler yükleniyor..." />
                    ) : null}
                    {error && (
                        <div className="error-message">
                            {error}
                            <button className="submit-button" style={{ marginLeft: 12 }} onClick={refetch}>
                                Yeniden Dene
                            </button>
                        </div>
                    )}
                    {formData && formData.title && (
                        <div>
                            <h2>{formData.title}</h2>
                            <br/>   
                            <HtmlRenderer html={formData.content} />
                        </div>
                    )} 
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
