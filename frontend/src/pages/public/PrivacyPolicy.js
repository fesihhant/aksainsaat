import React, { useState, useEffect } from 'react';
import Breadcrumbs from './Breadcrumbs';
import { useApiCall } from '../../utils/apiCalls';
import '../../css/HomePage.css';
import { HtmlRenderer } from '../../utils/utils';


const PrivacyPolicy = () => {
    const [formData, setFormData] = useState({
        title:'',
        content:''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
        
    const { apiData, apiError, apiLoading, refetch } = useApiCall(
        '/privacyPolicies',
        'GET',
        null,
        false,
        { cache: true, staleTimeMs: 5 * 60 * 1000, cacheStorage: 'both', dedupe: true, timeoutMs: 45000, retry: 1, retryDelayMs: 500 }
    );

    useEffect(() => {
        if (apiData && apiData.privacyPolicy) {
            if (apiData.success && apiData.privacyPolicy.length > 0) {    
                setFormData(apiData.privacyPolicy[0]);
            } 
        }
        if (apiError) {
            console.error('Sayfa yüklenirken hata:', apiError);
            setError('Sunucudan veri alınırken bir hata oluştu');
        }
        setLoading(apiLoading);
       
    }, [apiData, apiError, apiLoading]);

    return (
        <div className="home-container">
            <div className="main-content">
                <Breadcrumbs />
                <div className="about-form-container">   
                    {apiLoading && !formData.title ? (
                        <div className="skeleton" style={{ minHeight: 200, marginBottom: 20 }} />
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

export default PrivacyPolicy;
