import { useRef, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation  } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../../css/Banner.css';
import { changeModalStyle } from '../../utils/loginUtil';
import { apiUrl } from '../../utils/utils';

import logo from '../../images/aksa-insaat.png';


const Banner = ({ storedUser, setStoredUser }) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    const { login, logout } = useAuth();
    const [isLoggedIn, setIsLoggedIn] = useState(!!storedUser && !!storedUser.fullName);

    const [formData, setFormData] = useState({
            fullName: '',
            email: '',
            password: '',
            confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordAgain, setShowPasswordAgain] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);



    let { pathname: locationPathname } = useLocation();
    const isRegisterPage = locationPathname.includes('/register');
    const isloginPage = window.location.pathname.includes('/login');

    // Inside your component:
    const menuRef = useRef(null);

    useEffect(() => {


        const token = localStorage.getItem('token');
        setIsLoggedIn(!!storedUser && !!storedUser.fullName && !!token);

        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };


    }, [storedUser, menuRef]);

    // Banner scroll efekti
    const [showBanner, setShowBanner] = useState(true);
    const lastScrollY = useRef(window.scrollY);

    useEffect(() => {
        const handleScroll = () => {
        if (window.scrollY > lastScrollY.current) {
            // aşağı kayıyor
            setShowBanner(false);
        } else {
            // yukarı kayıyor
            setShowBanner(true);
        }
        lastScrollY.current = window.scrollY;
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);

    }, []);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogout = () => {
        logout();
        setStoredUser({});
        setIsLoggedIn(false);
        navigate('/');
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
                setStoredUser(data.user);
                setIsLoggedIn(true);
                changeActiveModal('login',false);

                // Admin ise yönetim paneline, değilse ana sayfaya yönlendir
                if (data.user.role === 'admin') {
                    navigate('/projects');
                } else {
                    navigate('/');
                }
            } else {
                setError(data.message || 'Giriş yapılırken bir hata oluştu');
            }
        } catch (error) {
            setError('' + error.message || 'Sunucu bağlantısı başarısız. Lütfen internet bağlantınızı kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${apiUrl}/auth/forget-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setError('');
                setFormData({fullName: '', email: '', password: '', confirmPassword: ''});
                setSuccess(data.message);
                setTimeout(() => {
                    changeActiveModal('forgotPassword',false);
                    setLoading(false);
                }, 5000);
                return;

            } else {
                setError(data.message || 'Girdiğiniz mail adresi hatalı olabilir, lütfen konrtol edip tekrar deneyiniz.');
                setLoading(false);
            }
        } catch (error) {
            setError('' + error.message || 'Sunucu bağlantısı başarısız. Lütfen internet bağlantınızı kontrol edin.');
        } finally {
            // Sadece başarısız olursa loading'i kapat
            if (!success) setLoading(false);
        }
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
                changeActiveModal('register',false);
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

    const handleSubmitSendActivation = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${apiUrl}/auth/send-activation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setError('');
                setFormData({fullName: '', email: '', password: '', confirmPassword: ''});
                setSuccess(data.message);
                setTimeout(() => {
                    changeActiveModal('sendActivation',false);
                    setLoading(false);
                }, 5000);
                return; // erken çık, finally çalışmasın

            } else {
                setError(data.message || 'Girdiğiniz mail adresi hatalı olabilir, lütfen konrtol edip tekrar deneyiniz.');
                setLoading(false);
            }
        } catch (error) {
            setError('' + error.message || 'Sunucu bağlantısı başarısız. Lütfen internet bağlantınızı kontrol edin.');
        } finally {
            // Sadece başarısız olursa loading'i kapat
            if (!success) setLoading(false);
        }
    };
    const changeActiveModal = (modalName, isActive) => {
        setError('');
        setSuccess('');
        setFormData({
            fullName: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
        changeModalStyle(modalName, isActive);
    }
    
    const [scrolled, setScrolled] = useState(false);
    const [hovered, setHovered] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
 
    return (
        <div
            id="banner"
            className={`banner${scrolled ? " banner-scrolled" : ""}${hovered ? " banner-hovered" : ""}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
           
            <div className="banner-content">
                <div className="navbarlogo">
                    <a onClick={() => navigate('/')}  ><img loading="lazy" src={logo} alt="Aksa inşaat" /></a>
                </div>                
                <div className="hamburger-menu" onClick={toggleMenu}>
                    <i className="fa fa-bars"></i>
                </div>
                <div ref={menuRef} className={`sidebar-menu ${isMenuOpen ? 'open' : ''}`}>
                    <div className="banner-right mobile-banner-right">
                        <div className="mobile-banner-grid">
                            <div className="mobile-banner-item">
                                {isLoggedIn ? (
                                    <div className="auth-buttons">
                                        <i className="fa fa-sign-out logout-button" onClick={handleLogout} aria-hidden="true"></i>
                                    </div>
                                ) : !isRegisterPage &&  !isloginPage && (
                                    <div className="auth-buttons">
                                        <i onClick={() => changeModalStyle('login',true)} className="fa fa-sign-in login-link" aria-hidden="true"></i>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <button className="close-menu" onClick={toggleMenu}>×</button>
                    <Sidebar />
                </div>

                <div className="banner-right desktop-banner-right">
                    {isLoggedIn ? (
                        <div className="auth-buttons">
                            <i className="fa fa-sign-out logout-button" onClick={handleLogout} aria-hidden="true"></i>
                        </div>
                    ) : !isRegisterPage &&  !isloginPage && (
                        <div className="auth-buttons">
                            <i onClick={() => changeModalStyle('login',true)} className="fa fa-sign-in login-link" aria-hidden="true"></i>
                        </div>
                    )}
                </div>


                
                 <div data-active-modal="login" className="modal" style={{display:'none'}} aria-label="Modal">
                     <div className="modal-overlay"></div>
                     <div className="modal-container md">
                         <div className="modal-header">
                             <h5 className="modal-title">Giriş Yap</h5>
                             <button className="modal-close" aria-label="Close modal" onClick={() => changeActiveModal('login',false)} >×</button>
                         </div>
                         <div className="modal-content ">
                             <form onSubmit={handleSubmitLogin} className="form-content">
                                 <div className="form-field">
                                     <div className="form-field-wrapper">
                                     <label htmlFor="loginUsername">Kullanıcı Adı</label>
                                     <input type="text" name="email" id="loginUsername"
                                         value={formData.email}
                                         onChange={handleInputChange}
                                         required/>
                                     </div>
                                 </div>
                                 <div className="form-field">
                                     <div className="form-field-wrapper">
                                         <label htmlFor="loginPassword">Şifre</label>
                                         <input type="password" name="password" id="loginPassword"
                                             value={formData.password}
                                             onChange={handleInputChange}
                                             required/>
                                     </div>
                                 </div>
                                 <div className="form-field">
                                     <button type="submit" className="primary">
                                     Giriş Yap
                                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="hidden-while-loading"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"></path></svg>
                                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="spinning visible-while-loading"><path d="M256 64a16 16 0 1 0 0-32 16 16 0 1 0 0 32zm0-64a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm0 480a16 16 0 1 0 0-32 16 16 0 1 0 0 32zm0-64a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM64 256a16 16 0 1 0 -32 0 16 16 0 1 0 32 0zM0 256a48 48 0 1 1 96 0A48 48 0 1 1 0 256zm464 16a16 16 0 1 0 0-32 16 16 0 1 0 0 32zm0-64a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM120.2 391.8A16 16 0 1 0 97.6 414.4a16 16 0 1 0 22.6-22.6zM75 437a48 48 0 1 1 67.9-67.9A48 48 0 1 1 75 437zM97.6 120.2a16 16 0 1 0 22.6-22.6A16 16 0 1 0 97.6 120.2zM142.9 75A48 48 0 1 1 75 142.9 48 48 0 1 1 142.9 75zM414.4 414.4a16 16 0 1 0 -22.6-22.6 16 16 0 1 0 22.6 22.6zm-45.3-45.3A48 48 0 1 1 437 437a48 48 0 1 1 -67.9-67.9z"></path></svg>
                                     </button>
                                 </div>
                                 <hr className="or"/>
                                 <div className="form-field horizontal">
                                     <button type="button" data-modal="forgotPassword" onClick={() => changeActiveModal('forgotPassword',true)}>Şifremi Unuttum</button>
                                     <button type="button" data-modal="sendActivation" onClick={() => changeActiveModal('sendActivation',true)}>E-Mail Aktivasyon</button>
                                     <button type="button" data-modal="register" onClick={() => changeActiveModal('register',true)}>Kayıt Ol</button>
                                 </div>
                                 {error && 
                                 <div className="form-field">
                                     <p className="error-message">{error}</p>
                                 </div>}
                             </form>
                         </div>
                     </div>
                 </div>
                 <div data-active-modal="register" className="modal" style={{display:'none'}} aria-label="Modal">
                     <div className="modal-overlay"></div>
                     <div className="modal-container md">
                         <div className="modal-header">
                             <h5 className="modal-title">Kayıt Ol</h5>
                             <button className="modal-close" aria-label="Close modal"  onClick={() => changeActiveModal('register',false)}>×</button>
                         </div>
                         <div className="modal-content ">
                             <form onSubmit={handleSubmitRegister} className="form-content">
                                 <div className="form-field">
                                     <div className="form-field-wrapper">
                                         <label htmlFor="loginEmail">E-posta</label>
                                         <input  
                                             id="loginEmail"
                                             type="email" 
                                             name="email"
                                             value={formData.email}
                                             autoComplete="new-email"
                                             required
                                             onChange={handleInputChange}    
                                         />
                                     </div>
                                 </div>
                                 <div className="form-field">
                                     <div className="form-field-wrapper">
                                         <label htmlFor="fullName">Ad Soyad</label>
                                         <input 
                                             id="fullName"
                                             type="text" 
                                             name="fullName"                                             
                                             value={formData.fullName} 
                                             required
                                             onChange={handleInputChange}
                                             autoComplete="new-username"
                                         />
                                     </div>
                                 </div>
                                 <div className="form-field">
                                     <div className="form-field-wrapper">
                                         <label htmlFor="loginPassword">Şifre</label>
                                         <input
                                             id="loginPassword"
                                             type={showPassword ? "text" : "password"} // Şifreyi göster/gizle
                                             name="password"                                            
                                             value={formData.password} 
                                             required
                                             onChange={handleInputChange}
                                             autoComplete="new-password"
                                         />
                                         <i
                                             className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"} password-toggle-icon`}
                                             onClick={() => setShowPassword(!showPassword)}
                                             aria-hidden="true">
                                         </i>
                                     </div>
                                 </div>
                                 <div className="form-field">
                                     <div className="form-field-wrapper">
                                         <label htmlFor="loginPasswordAgain">Şifre (Tekrar)</label>
                                         <input
                                             id="loginPasswordAgain"
                                             type={showPasswordAgain ? "text" : "password"} // Şifreyi göster/gizle
                                             name="confirmPassword"                                           
                                             value={formData.confirmPassword} 
                                             required
                                             onChange={handleInputChange}
                                             autoComplete="new-password-again" 
                                         />
                                         <i
                                             className={`fa ${showPasswordAgain ? "fa-eye-slash" : "fa-eye"} password-toggle-icon`}
                                             onClick={() => setShowPasswordAgain(!showPasswordAgain)}
                                             aria-hidden="true">
                                         </i>
                                     </div>
                                 </div>
                                 <div className="form-field">
                                     <button type="submit" className="primary">
                                         Kayıt Ol
                                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="hidden-while-loading"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"></path></svg>
                                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="spinning visible-while-loading"><path d="M256 64a16 16 0 1 0 0-32 16 16 0 1 0 0 32zm0-64a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm0 480a16 16 0 1 0 0-32 16 16 0 1 0 0 32zm0-64a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM64 256a16 16 0 1 0 -32 0 16 16 0 1 0 32 0zM0 256a48 48 0 1 1 96 0A48 48 0 1 1 0 256zm464 16a16 16 0 1 0 0-32 16 16 0 1 0 0 32zm0-64a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM120.2 391.8A16 16 0 1 0 97.6 414.4a16 16 0 1 0 22.6-22.6zM75 437a48 48 0 1 1 67.9-67.9A48 48 0 1 1 75 437zM97.6 120.2a16 16 0 1 0 22.6-22.6A16 16 0 1 0 97.6 120.2zM142.9 75A48 48 0 1 1 75 142.9 48 48 0 1 1 142.9 75zM414.4 414.4a16 16 0 1 0 -22.6-22.6 16 16 0 1 0 22.6 22.6zm-45.3-45.3A48 48 0 1 1 437 437a48 48 0 1 1 -67.9-67.9z"></path></svg>
                                     </button>
                                 </div>
                                 {error && 
                                 <div className="form-field">
                                     <p className="error-message">{error}</p>
                                 </div>}
                             </form>
                         </div>
                     </div>
                 </div>
                 <div data-active-modal="forgotPassword" className="modal"  style={{display:'none'}} aria-label="Modal">
                     <div
                         className="modal-overlay"
                         style={loading ? { pointerEvents: 'none', opacity: 0.7 } : {}}>
                     </div>
                     <div className="modal-container md">
                         <div className="modal-header">
                             <h5 className="modal-title">Şifremi Unuttum</h5>
                             <button
                                 className="modal-close"
                                 aria-label="Close modal"
                                 onClick={() => changeActiveModal('forgotPassword', false)}
                                 disabled={loading} // loading sırasında kapatma devre dışı
                                 style={loading ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                             >×</button>
                         </div>
                         <div className="modal-content ">
                             <form onSubmit={handleSubmitForgotPassword}  className="form-content">
                                 <div className="form-field">
                                     <div className="form-field-wrapper">
                                         <label htmlFor="email">E-posta</label>
                                         <input type="email" name="email" id="email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={loading} required/>
                                     </div>
                                 </div>
                                 <div className="form-field">
                                     <button type="submit" className="primary"
                                         disabled={loading}
                                         style={loading ? { opacity: 0.7, pointerEvents: 'none' } : {}}>
                                     {loading ? "Bekleyiniz..." : "Şifremi Sıfırla"}
                                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="hidden-while-loading"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"></path></svg>
                                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="spinning visible-while-loading"><path d="M256 64a16 16 0 1 0 0-32 16 16 0 1 0 0 32zm0-64a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm0 480a16 16 0 1 0 0-32 16 16 0 1 0 0 32zm0-64a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM64 256a16 16 0 1 0 -32 0 16 16 0 1 0 32 0zM0 256a48 48 0 1 1 96 0A48 48 0 1 1 0 256zm464 16a16 16 0 1 0 0-32 16 16 0 1 0 0 32zm0-64a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM120.2 391.8A16 16 0 1 0 97.6 414.4a16 16 0 1 0 22.6-22.6zM75 437a48 48 0 1 1 67.9-67.9A48 48 0 1 1 75 437zM97.6 120.2a16 16 0 1 0 22.6-22.6A16 16 0 1 0 97.6 120.2zM142.9 75A48 48 0 1 1 75 142.9 48 48 0 1 1 142.9 75zM414.4 414.4a16 16 0 1 0 -22.6-22.6 16 16 0 1 0 22.6 22.6zm-45.3-45.3A48 48 0 1 1 437 437a48 48 0 1 1 -67.9-67.9z"></path></svg>
                                     </button>
                                 </div>
                                 <hr className="or"/>
                                 <div className="form-field horizontal">
                                     <button type="button" data-modal="sendActivation" onClick={() => changeActiveModal('sendActivation',true)} disabled={loading}>E-Mail Aktivasyon</button>
                                     {
                                         !isloginPage &&    
                                         <button type="button" data-modal="login" onClick={() => changeActiveModal('login',true)} disabled={loading}>Giriş Yap</button>
                                     }
                                     <button type="button" data-modal="register" onClick={() => changeActiveModal('register',true)} disabled={loading}>Kayıt Ol</button>
                                 </div>
                                 {success && <div className="form-field"> <p className="form-message success">{success}</p></div>}
                                 {error && <div className="form-field"> <p className="error-message">{error}</p></div>}
                             </form>
                     </div>
                     </div>
                 </div>
              
                 <div data-active-modal="sendActivation" className="modal"  style={{display:'none'}} aria-label="Modal">
                     <div
                         className="modal-overlay"
                         style={loading ? { pointerEvents: 'none', opacity: 0.7 } : {}}>
                     </div>
                     <div className="modal-container md">
                     <div className="modal-header">
                         <h5 className="modal-title">E-Mail Aktivasyonu</h5>
                         <button
                                 className="modal-close"
                                 aria-label="Close modal"
                                 onClick={() => changeActiveModal('sendActivation', false)}
                                 disabled={loading} // loading sırasında kapatma devre dışı
                                 style={loading ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                             >×</button>
                     </div>
                     <div className="modal-content ">
                         <form onSubmit={handleSubmitSendActivation}  className="form-content">
                             <div className="form-field">
                                 <div className="form-field-wrapper">
                                     <label htmlFor="email">E-posta</label>
                                     <input type="email" name="email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={loading} required/>
                                 </div>
                             </div>
                             <div className="form-field">
                                 <button type="submit" className="primary"
                                     disabled={loading}
                                     style={loading ? { opacity: 0.7, pointerEvents: 'none' } : {}}>
                                     {loading ? "Bekleyiniz..." : "E-Mail Aktivasyonu Gönder"}
                                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="hidden-while-loading"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"></path></svg>
                                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="spinning visible-while-loading"><path d="M256 64a16 16 0 1 0 0-32 16 16 0 1 0 0 32zm0-64a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm0 480a16 16 0 1 0 0-32 16 16 0 1 0 0 32zm0-64a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM64 256a16 16 0 1 0 -32 0 16 16 0 1 0 32 0zM0 256a48 48 0 1 1 96 0A48 48 0 1 1 0 256zm464 16a16 16 0 1 0 0-32 16 16 0 1 0 0 32zm0-64a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM120.2 391.8A16 16 0 1 0 97.6 414.4a16 16 0 1 0 22.6-22.6zM75 437a48 48 0 1 1 67.9-67.9A48 48 0 1 1 75 437zM97.6 120.2a16 16 0 1 0 22.6-22.6A16 16 0 1 0 97.6 120.2zM142.9 75A48 48 0 1 1 75 142.9 48 48 0 1 1 142.9 75zM414.4 414.4a16 16 0 1 0 -22.6-22.6 16 16 0 1 0 22.6 22.6zm-45.3-45.3A48 48 0 1 1 437 437a48 48 0 1 1 -67.9-67.9z"></path></svg>
                                 </button>
                             </div>
                                 {error && 
                                 <div className="form-field">
                                     <p className="error-message">{error}</p>
                                 </div>}
                         </form>
                     </div>
                 </div>
                 </div>     
            </div>

        </div>
    );
};

export default Banner;