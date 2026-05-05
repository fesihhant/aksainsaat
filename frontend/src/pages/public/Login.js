import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiUrl } from '../../utils/utils';
import {changeModalStyle} from '../../utils/loginUtil';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
 
    const handleSubmitLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // AuthContext'i güncelle
                login(data.user, data.token);

                // Kullanıcı adını localStorage'a kaydet
                localStorage.setItem('fullName', data.user.fullName);

                // Admin ise yönetim paneline, değilse ana sayfaya yönlendir
                if (data.user.role === 'admin') {
                   window.location.href='/projects';
                } else {
                    window.location.href='/';
                }
            } else {
                setError(data.message || 'Giriş yapılırken bir hata oluştu');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Sunucu bağlantısı başarısız');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Yükleniyor...</div>;
    }

    return (
        <div className="home-container">
            <div className="main-content">
                <div data-active-modal="login" aria-label="Modal">
                    <div class="modal-container md" style={{display:'inline-flex',justifyContent:'center'}}>
                        <div class="modal-header">
                            <h5 class="modal-title">Giriş Yap</h5>
                        </div>
                        <div class="modal-content ">
                            <form onSubmit={handleSubmitLogin} class="form-content">
                                {error && (
                                    <div className="error-message" style={{color: 'red', marginBottom: '1rem', padding: '0.5rem'}}>
                                        {error}
                                    </div>
                                )}
                                <div class="form-field">
                                    <div class="form-field-wrapper">
                                    <label htmlFor="loginUsername" style={{color:'rgb(161 161 170)'}}>Kullanıcı Adı</label>
                                    <input type="text" name="email" id="loginUsername"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required/>
                                    </div>
                                </div>
                                <div class="form-field">
                                    <div class="form-field-wrapper">
                                        <label htmlFor="loginPassword" style={{color:'rgb(161 161 170)'}} >Şifre</label>
                                        <input type="password" name="password" id="loginPassword"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required/>
                                    </div>
                                </div>
                                <div class="form-field">
                                    <button type="submit" class="primary">
                                    Giriş Yap
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="hidden-while-loading"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"></path></svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="spinning visible-while-loading"><path d="M256 64a16 16 0 1 0 0-32 16 16 0 1 0 0 32zm0-64a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm0 480a16 16 0 1 0 0-32 16 16 0 1 0 0 32zm0-64a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM64 256a16 16 0 1 0 -32 0 16 16 0 1 0 32 0zM0 256a48 48 0 1 1 96 0A48 48 0 1 1 0 256zm464 16a16 16 0 1 0 0-32 16 16 0 1 0 0 32zm0-64a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM120.2 391.8A16 16 0 1 0 97.6 414.4a16 16 0 1 0 22.6-22.6zM75 437a48 48 0 1 1 67.9-67.9A48 48 0 1 1 75 437zM97.6 120.2a16 16 0 1 0 22.6-22.6A16 16 0 1 0 97.6 120.2zM142.9 75A48 48 0 1 1 75 142.9 48 48 0 1 1 142.9 75zM414.4 414.4a16 16 0 1 0 -22.6-22.6 16 16 0 1 0 22.6 22.6zm-45.3-45.3A48 48 0 1 1 437 437a48 48 0 1 1 -67.9-67.9z"></path></svg>
                                    </button>
                                </div>
                                <hr class="or"/>
                                <div class="form-field horizontal">
                                    <button type="button" data-modal="forgotPassword" onClick={() => changeModalStyle('forgotPassword',true)}>Şifremi Unuttum</button>
                                    <button type="button" data-modal="sendActivation" onClick={() => changeModalStyle('sendActivation',true)}>E-Mail Aktivasyon</button>
                                    <button type="button" data-modal="register" onClick={() => changeModalStyle('register',true)}>Kayıt Ol</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default Login;
