import React, { useState, useEffect } from 'react';
import Breadcrumbs from './Breadcrumbs';
import { useApiCall } from '../../utils/apiCalls';
import {serverUrl} from '../../utils/utils';
import '../../css/HomePage.css';


const pathnames = [
    {
      path: 'Biz Kimiz',
      link: '',
    }
];

const About = () => {
    const [formData, setFormData] = useState({
        aboutText:'',
        visionText:'',
        missionText:''
    });
    const [bookletFormData, setBookletFormData]= useState({
        description: '',
        coverImageUrl: '',
        fileUrl: '',
    })
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
        
    const { apiData, apiError, apiLoading } = useApiCall('/abouts', 'GET', null, false);
    const { apiData: bookletData, apiError: bookletError, apiLoading: bookletLoading } = useApiCall('/introductionBooklet', 'GET', null, false);

    useEffect(() => {
        if (apiData && apiData.about) {
            if (apiData.success && apiData.about.length > 0) {    
                setFormData(apiData.about[0]);
            } 
        }
        if (apiError) {
            console.error('Sayfa yüklenirken hata:', apiError);
            setError('Sunucu bağlantısı başarısız');
        }
        setLoading(apiLoading);
       
        if(bookletData && bookletData.introductionBooklet){
            if (bookletData.success && bookletData.introductionBooklet.length > 0) {    
                setBookletFormData(bookletData.introductionBooklet[0]);
            } 
        }
    }, [apiData, apiError, apiLoading,bookletData, bookletError, bookletLoading]);

    return (
        <div className="home-container">
            <div className="main-content">
                <Breadcrumbs breadcrumbs={pathnames} />
                <div className="about-form-container">   
                     
                    {loading && <p>Yükleniyor...</p>}
                    {error && <div className="error-message">{error}</div>}
                    
                    {formData && formData.aboutText &&
                        <>
                            <h2>HAKKIMIZDA</h2>
                            <div dangerouslySetInnerHTML={{ __html: formData.aboutText }} />
                        </>
                    }
                    {formData && formData.visionText &&
                        <>
                            <h2>VİZYONUMUZ</h2>
                            <div dangerouslySetInnerHTML={{ __html: formData.visionText }} />
                        </>
                    }
                    {formData && formData.missionText &&
                        <>                            
                            <h2>MİSYONUMUZ</h2>
                            <div dangerouslySetInnerHTML={{ __html: formData.missionText }} />
                        </>
                    }
                    {bookletFormData && bookletFormData.coverImageUrl && bookletFormData.fileUrl && (
                        <>
                            <h2>Tanıtım Dosyası</h2>
                            <div style={{maxWidth:150,paddingLeft:'inherit'}}>
                                <a title='Tanıtım dosyasını indir'
                                    href={bookletFormData.fileUrl.startsWith('http') ? bookletFormData.fileUrl : `${serverUrl}/${bookletFormData.fileUrl.replace(/^\//, '')}`}
                                    download
                                    alt='Tanıtım dosyasını indir'
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img loading="lazy" src={serverUrl + bookletFormData.coverImageUrl} alt="Kapak resmi önizleme" style={{width:150}} />
                                </a>
                            </div>
                        </>  
                    )}
                </div>
            </div>
        </div>
    );
};

export default About;
