import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css'; // CSS dosyasını ekliyoruz
import { useAuth } from '../../context/AuthContext';

import Breadcrumbs from '../public/Breadcrumbs';
import { useApiCall, apiRequest, invalidateApiCacheMany } from '../../utils/apiCalls';
import { serverUrl, apiUrl } from '../../utils/utils';

import '../../css/NewProduct.css';
import TextAreaComponent from '../../components/htmlComponent/TextAreaComponent';

const IntroductionBookletEdit = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [coverImage, setCoverImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [pdfFile, setPdfFile] = useState(null);
    const [pdfPreview, setPdfPreview] = useState(null);

    const [formData, setFormData] = useState(
    {
        description: '',
        coverImageUrl: '',
        fileUrl: ''
    });

    const { apiData, apiError, apiLoading } = useApiCall(
        '/introductionBooklet',
        'GET',
        null,
        true,
        { dedupe: true, timeoutMs: 45000, retry: 1, retryDelayMs: 500 }
    );

    useEffect(() => {
        if (apiData && apiData.introductionBooklet) {
            if (apiData.success && apiData.introductionBooklet.length > 0) {   
                let introductionBooklet = apiData.introductionBooklet[0];
                setFormData(introductionBooklet);
                if (introductionBooklet.coverImageUrl) {
                    setImagePreview(`${serverUrl}${introductionBooklet.coverImageUrl}`);
                }else {
                    setCoverImage(null);
                    setImagePreview(null);
                }
                if (introductionBooklet.fileUrl) {
                    setPdfPreview(`${serverUrl}${introductionBooklet.fileUrl}`)
                }else {
                    setPdfFile(null);
                    setPdfPreview(null);
                }   
            } else {
                setCoverImage(null);
                setImagePreview(null);
                setPdfFile(null);
                setPdfPreview(null);
            }
        }else {
            setCoverImage(null);
            setImagePreview(null);
            setPdfFile(null);
            setPdfPreview(null);
        }
        if (apiError) {            
            setCoverImage(null);
            setImagePreview(null);
            setPdfFile(null);
            setPdfPreview(null);
            setError('Sunucu bağlantısı başarısız');
        }
        setLoading(apiLoading);
    }, [apiData, apiError, apiLoading]);


    // Handler fonksiyonu
    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(() =>file);            
            setPdfPreview(() =>URL.createObjectURL(file));
            setError('');
        } else {
            setError('Lütfen PDF formatında bir dosya seçin.');
            setPdfFile(null);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file.size > 5 * 1024 * 1024) {
            setError('Resim boyutu 5MB\'dan küçük olmalıdır');
            return false;
        }
        if (!file.type.startsWith('image/')) {
            setError('Lütfen geçerli bir resim dosyası seçin');
            return false;
        }
        setCoverImage(() => file);
        setImagePreview(() => URL.createObjectURL(file));
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            if (!imagePreview) {
                setError('Kapak resmi yüklenmedi');
                return;
            }
            if (!pdfPreview) {
                setError('Tanıtım kitapçığı PDF dosyası yüklenmedi');
                return;
            }

            const formDataToSend = new FormData();
            if (formData?._id) {
                formDataToSend.append('id', formData._id); // Güncelleme için ID
            }

            if (coverImage) {
               formDataToSend.append('image', coverImage); // Kapak resmi
            }
            if (pdfFile) {
                formDataToSend.append('bookletFile', pdfFile);
            }
            formDataToSend.append('description', formData.description);

            const url = formData?._id ? `/introductionBooklet/${formData._id}` : '/introductionBooklet';
            const method = formData?._id ? 'PUT' : 'POST';

            const data = await apiRequest(method, url, formDataToSend, {
                isToken: true,
                timeoutMs: 60000,
                retry: 1,
                retryDelayMs: 500,
                headers: {
                    // FormData kullanıldığı için Content-Type otomatik ayarlanacak
                    'Authorization': `Bearer ${token}`
                }
            });

            if (data.success) {
                setCoverImage(data.introductionBooklet.coverImageUrl);
                setImagePreview(`${serverUrl}${data.introductionBooklet.coverImageUrl}`);
                setPdfPreview(`${serverUrl}${data.introductionBooklet.fileUrl}`);
                setPdfFile(data.introductionBooklet.fileUrl);
                
                setFormData(data.introductionBooklet);
                setError('');
                invalidateApiCacheMany([
                    { method: 'GET', urlPrefix: '/introductionBooklet' }
                ]);
            } else {
                setError(data.message || 'Bir hata oluştu');
            }
        } catch (error) {
            console.error('Form gönderme hatası:', error);
            setError(error.message || 'Sunucu bağlantısı başarısız');
        } finally {
            setLoading(false);
        }
    };

    const pathnames = [
        {
          path: 'Tanıtım Kitapçığı',
          link: '',
        }
    ];

    
    if (!currentUser || currentUser.role !== 'admin') {
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
    }
    if (loading) {
        return <div className="loading">Yükleniyor...</div>;
    }
    return (
        <div className="home-container">
            <div className="main-content">
                <Breadcrumbs breadcrumbs={pathnames} />
                <form id="productForm" onSubmit={handleSubmit} className="new-product-form">
                    <div className="page-header">                        
                        {/* <h1 className='headerClass'>{<i class={getPageIcon('introductionBooklet')}></i>} {getPageTitleText('introductionBooklet')}</h1>  */}
                        <div className="form-actions">
                            <button
                                type="submit"
                                form="productForm"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Kaydediliyor...' : (formData?._id ? 'Güncelle' : 'Kaydet')}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="cancel-button"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                    <hr></hr>
                    <br></br>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="description">Açıklama</label>
                        <TextAreaComponent
                            field={{
                                name: 'description',
                                placeholder: 'Açıklama giriniz...',
                                required: true
                            }}
                            value={formData.description}
                            onBlur={value => setFormData((prev) => ({ ...prev, description: value }))}
                        />
                    </div>
                     <div className='row'>
                        <div className="form-group">
                            <label htmlFor="image">Tanıtım Kitapçığı</label>
                            <div>
                                <div className="upload-section">
                                    <label htmlFor="image" className="upload-label" style={{ textAlign: 'center',width: '100%',color: 'white' }}>
                                        Kapak Resmi Yükle
                                        <input
                                            type="file"
                                            id="image"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>
                                <div className="upload-section">
                                    <label htmlFor="bookletFile" className="upload-label" style={{ textAlign: 'center', width: '100%', color: 'white' }}>
                                        PDF Yükle
                                        <input
                                        type="file"
                                        id="bookletFile"
                                        accept="application/pdf"
                                        onChange={handlePdfChange}
                                        style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="avatar-options">                                        
                                <div>         
                                    <div style={{marginLeft: 20,maxWidth: 300}}>
                                        <>
                                        <div style={{ maxWidth: 200 }}>
                                            {!imagePreview && <span className="text-red-600"> Kapak resmi yükleyiniz!</span>}
                                            <a 
                                                href={pdfPreview ? pdfPreview : undefined}
                                                download
                                                target={ pdfPreview ? "_blank": undefined }
                                                rel="noopener noreferrer"> 
                                                {imagePreview && <img loading="lazy" src={imagePreview} alt="Kapak resmi önizleme" /> }
                                                {/* {pdfPreview ? <span className="text-green-600"> İndirilebilir</span> : <span className="text-red-600"> Tanıtım Dosyası Yükleyiniz!</span>} */}
                                            </a>
                                        </div>
                                        </>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> 
                </form>
            </div>
        </div>
    );
};

export default IntroductionBookletEdit;
