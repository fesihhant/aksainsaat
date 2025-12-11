import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Breadcrumbs from '../public/Breadcrumbs';
import { apiUrl, serverUrl, formatPhoneNumber } from '../../utils/utils';

import '../../css/EditUser.css';
import '../../css/HomePage.css';

const defaultAvatars = [
    'avatar1.jpg',
    'avatar2.jpg',
    'avatar3.jpg',
    'avatar4.jpg',
    'avatar5.jpg',
    'avatar6.jpg',
    // 'default.jpg'
];
 
const EditUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone:'',
        password: '',
        role: 'user',
        avatar: null,
        avatarType: 'preset'
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [selectedDefaultAvatar, setSelectedDefaultAvatar] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchUser = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${apiUrl}/users/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setFormData({
                    fullName: data.user.fullName,
                    email: data.user.email,
                    phone:data.user.phone || '',
                    password: '',
                    role: data.user.role || 'user',
                    avatar: null,
                    avatarType: data.user.avatarType || 'preset'
                });
                
                if (data.user.avatar) {
                    setAvatarPreview(`${serverUrl}${data.user.avatar}`);
                }
            } else {
                setError(data.message || 'Kullanıcı bilgileri yüklenemedi');
            }
        } catch (error) {
            console.error('Kullanıcı bilgileri getirme hatası:', error);
            setError(error.message || 'Sunucu bağlantısı başarısız');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        if (id) {
            fetchUser();
        }
    }, [id, fetchUser]);

    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;
        if (name === 'phone') {
          newValue = formatPhoneNumber(value);
        }
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Resim boyutu 5MB\'dan küçük olmalıdır');
                return;
            }

            if (!file.type.startsWith('image/')) {
                setError('Lütfen geçerli bir resim dosyası seçin');
                return;
            }

            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setSelectedDefaultAvatar(null);
            setError('');
        }
    };

    const handleDefaultAvatarSelect = (avatar) => {
        setSelectedDefaultAvatar(avatar);
        setAvatarPreview(`${serverUrl}/uploads/avatars/${avatar}`);
        setAvatarFile(null);
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

            const formDataToSend = new FormData();
            formDataToSend.append('fullName', formData.fullName);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);
            if (formData.password) {
                formDataToSend.append('password', formData.password);
            }
            formDataToSend.append('role', formData.role);
            formDataToSend.append('avatarType', formData.avatarType);
            if (avatarFile) {
                formDataToSend.append('avatar', avatarFile);
            } else if (selectedDefaultAvatar) {
                formDataToSend.append('defaultAvatar', selectedDefaultAvatar);
            }

            const url = id
                ? `${apiUrl}/users/${id}`
                : `${apiUrl}/users`;

            const response = await fetch(url, {
                method: id ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            const data = await response.json();

            if (data.success) {
                navigate('/users');
            } else {
                setError(data.message || 'Kullanıcı kaydedilirken bir hata oluştu');
            }
        } catch (error) {
            console.error('Form gönderme hatası:', error);
            setError('Sunucu bağlantısı başarısız');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser || currentUser.role !== 'admin') {
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
    }
    
    const pathnames = [
        {
          path: 'Kullanıcılar',
          link: '/users',
        },
        {
          path: (!id ? 'Yeni Kullanıcı' : 'Kullanıcı Düzenle'),
          link: '',
        }
    ];
    
    // Loading durumunda göster
    if (loading && !formData.fullName && id) {
        return (
            <div className="home-container">
                <div className="main-content">
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <div>Yükleniyor...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="home-container">
            <div className="main-content">
                <Breadcrumbs breadcrumbs={pathnames} />
                <form id="userForm" onSubmit={handleSubmit} className="edit-user-form">
                    <div className="page-header">
                        <div className="form-actions">
                            <button 
                                type="submit"
                                form="userForm"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Kaydediliyor...' : (!id ? 'Kaydet' : 'Güncelle')}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => navigate('/users')}
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
                        <label htmlFor="fullName">Ad Soyad</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">E-posta</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>


                    <div className="form-group">
                        <label htmlFor="phone">Telefon</label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Şifre
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required={!id}
                        />
                        {id && <span className="text-red-600" style={{marginTop:'auto'}}> Şifre boş bırakılırsa değişmez.</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Yetki</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                        >
                            <option value="admin">Yönetici</option>
                            <option value="user">Kullanıcı</option>
                        </select>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="avatarSection">Profil Resmi</label>
                            <div id="avatarSection" className="avatar-section">
                                <div className="avatar-content" >
                                    
                                    <div className="upload-section">
                                        <label htmlFor="avatar" className="upload-label" style={{ textAlign: 'center',width: '100%',color: 'white' }}>
                                            Resim Yükle
                                            <input
                                                type="file"
                                                id="avatar"
                                                onChange={handleAvatarChange}
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                        {avatarPreview ? (
                                            <div className="avatar-preview">
                                                <img loading="lazy" src={avatarPreview} alt="Avatar önizleme" />
                                            </div>
                                        ) : (
                                            <div className="avatar-preview">
                                                <img loading="lazy" src={`${serverUrl}/uploads/avatars/default.jpg`} alt="Varsayılan avatar" />
                                            </div>
                                        )}
                                    </div>
 
                                    <div className="avatar-options" >
                                        <div className="default-avatars" style={{display:'contents'}}>
                                            <label>Hazır Avatarlar</label>
                                            <div className="avatar-grid">
                                                {defaultAvatars.map((avatar) => (
                                                    <div 
                                                        key={avatar}
                                                        className={`avatar-option ${selectedDefaultAvatar === avatar ? 'selected' : ''}`}
                                                        onClick={() => handleDefaultAvatarSelect(avatar)}
                                                    >
                                                        <img loading="lazy" 
                                                            src={`${serverUrl}/uploads/avatars/${avatar}`}
                                                            alt={`Avatar ${avatar}`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
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

export default EditUser;
