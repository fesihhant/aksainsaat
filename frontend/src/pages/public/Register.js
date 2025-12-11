import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../../utils/utils';
import '../../css/Login.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const [showPassword, setShowPassword] = useState(false);        
    const [showPasswordAgain, setShowPasswordAgain] = useState(false);  

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmitRegister = async (e) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (data.success) {
                // Registration successful
                navigate('/login');
            } else {
                // Registration failed
                setError(data.message || 'Kayıt işlemi başarısız');
            }
        } catch (error) {
            console.error('Kayıt hatası:', error);
            setError('Sunucu bağlantısı başarısız. Lütfen internet bağlantınızı kontrol edin.');
        }
    };

    return (
        <div className="contact-container">
            <div className="main-content">
                <div data-active-modal="register" aria-label="Modal">
                    <div class="modal-container md" style={{display:'inline-flex',justifyContent:'center'}}>
                        <div class="modal-header">
                            <h5 class="modal-title">Kayıt Ol</h5>
                        </div>
                        <div class="modal-content ">
                            {error && <div className="error-message">{error}</div>}
                            <form onSubmit={handleSubmitRegister} class="form-content">
                                <div class="form-field">
                                    <div class="form-field-wrapper">
                                        <label for="loginEmail" style={{color:'rgb(161 161 170)'}}>E-posta</label>
                                        <input  
                                            id="loginEmail"
                                            type="email" 
                                            name="email"
                                            value={formData.email}
                                            autocomplete="new-email"
                                            required
                                            onChange={handleInputChange}    
                                        />
                                    </div>
                                </div>
                                <div class="form-field">
                                    <div class="form-field-wrapper">
                                        <label for="fullName" style={{color:'rgb(161 161 170)'}}>Ad Soyad</label>
                                        <input 
                                            id="fullName"
                                            type="text" 
                                            name="fullName"                                             
                                            value={formData.fullName} 
                                            required
                                            onChange={handleInputChange}
                                            autocomplete="new-username"
                                        />
                                    </div>
                                </div>
                                <div class="form-field">
                                    <div class="form-field-wrapper">
                                        <label for="loginPassword" style={{color:'rgb(161 161 170)'}}>Şifre</label>
                                        <input
                                            id="loginPassword"
                                            type={showPassword ? "text" : "password"} // Şifreyi göster/gizle
                                            name="password"                                            
                                            value={formData.password} 
                                            required
                                            onChange={handleInputChange}
                                            autocomplete="new-password"
                                        />
                                        <i
                                            className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"} password-toggle-icon`}
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-hidden="true">

                                        </i>
                                    </div>
                                </div>
                                <div class="form-field">
                                    <div class="form-field-wrapper">
                                        <label for="loginPasswordAgain" style={{color:'rgb(161 161 170)'}}>Şifre (Tekrar)</label>
                                        <input
                                            id="loginPasswordAgain"
                                            type={showPasswordAgain ? "text" : "password"} // Şifreyi göster/gizle
                                            name="confirmPassword"                                           
                                            value={formData.confirmPassword} 
                                            required
                                            onChange={handleInputChange}
                                            autocomplete="new-password-again" 
                                        />
                                        <i
                                            className={`fa ${showPasswordAgain ? "fa-eye-slash" : "fa-eye"} password-toggle-icon`}
                                            onClick={() => setShowPasswordAgain(!showPasswordAgain)}
                                            aria-hidden="true">

                                        </i>
                                    </div>
                                </div>
                                <div class="form-field">
                                    <button type="submit" class="primary">
                                        Kayıt Ol
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="hidden-while-loading"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"></path></svg>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="spinning visible-while-loading"><path d="M256 64a16 16 0 1 0 0-32 16 16 0 1 0 0 32zm0-64a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm0 480a16 16 0 1 0 0-32 16 16 0 1 0 0 32zm0-64a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM64 256a16 16 0 1 0 -32 0 16 16 0 1 0 32 0zM0 256a48 48 0 1 1 96 0A48 48 0 1 1 0 256zm464 16a16 16 0 1 0 0-32 16 16 0 1 0 0 32zm0-64a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM120.2 391.8A16 16 0 1 0 97.6 414.4a16 16 0 1 0 22.6-22.6zM75 437a48 48 0 1 1 67.9-67.9A48 48 0 1 1 75 437zM97.6 120.2a16 16 0 1 0 22.6-22.6A16 16 0 1 0 97.6 120.2zM142.9 75A48 48 0 1 1 75 142.9 48 48 0 1 1 142.9 75zM414.4 414.4a16 16 0 1 0 -22.6-22.6 16 16 0 1 0 22.6 22.6zm-45.3-45.3A48 48 0 1 1 437 437a48 48 0 1 1 -67.9-67.9z"></path></svg>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
             </div>        
            
        </div>
    );
};

export default Register;
