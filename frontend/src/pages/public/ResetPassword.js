import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import {apiUrl} from '../../utils/utils';
import {changeModalStyle} from '../../utils/loginUtil';
// import { set } from 'mongoose';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [tokenValid, setTokenValid] = useState(false);   
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
        const [success, setSuccess] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    let { resetToken, activatedToken } = useParams();

    resetToken = decodeURIComponent(resetToken);
    activatedToken = decodeURIComponent(activatedToken);

    useEffect(() => {
        const fetchCheckResetToken = async () => {
            try {
                setLoading(true);
                const url = resetToken ? `${apiUrl}/auth/check-reset-token?resetToken=${resetToken}` : `${apiUrl}/auth/activate?activationToken=${activatedToken}`
                const response = await fetch(url);
                const data = await response.json();

                if (data.success) {
                    setTokenValid(true);
                } else {
                    setError(data.message);
                    setTokenValid(false);
                    console.error('check işlemi başarısız oldu:', data.message);
                }
                setLoading(false);
            } catch (error) {   
                setLoading(false);
                setTokenValid(false);
                setError(error.message);
                console.error('check işlemi yapılırken hata:', error.message);
            }
        };
 
        if (resetToken) {
            fetchCheckResetToken(); 
        }
    }, [resetToken]);

     
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Şifreler uyuşmuyor!');
            return;
        }
        setLoading(true);
        setError('');

        const res = await fetch(`${apiUrl}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resetToken, password })
        });

        const data = await res.json();
        
        if (data.success) {
            setSuccess('Şifreniz başarıyla güncellendi, lütfen giriş yapın.');
            setError('');
            setTimeout(() => {
                changeModalStyle('login',true);
                setLoading(false);
                }, 5000);
            
            
            // navigate('/login');
        } else {
            setError(data.message);
        }
    };

    const pathnames = [
    {
        path: 'Şifre güncelleme ekranı',
        link: '',
    }];
    
    
    if (loading) return <div>Yükleniyor...</div>;
    if (!tokenValid) return <div>{error || 'Geçersiz veya süresi dolmuş bağlantı.'}</div>;

    return (
        <div className="home-container">
            <div className="main-content">
                <Breadcrumbs breadcrumbs={pathnames} />
                <hr></hr>
                <br></br>
                <form onSubmit={handleSubmit} className="form-container">
                     <div className="page-header">
                         <h2>Yeni Şifre Belirle</h2>
                     </div>               
                     <hr></hr>
                     <br></br>
                     {error && <div style={{ color: 'red' }}>{error}</div>}
                     {success && <div style={{ color: 'green' }}>{success}</div>}
                     <div className="form-group">
                         <label htmlFor="password">Yeni Şifre</label>
                         <input
                             name='password'
                             type="password"
                             placeholder="Yeni Şifre"
                             value={password}
                             onChange={e => setPassword(e.target.value)}
                             required
                         />
                     </div>
                     <div className="form-group">
                         <label htmlFor="passAgain">Şifre Tekrar</label>
                         <input
                             name='passAgain'
                             type="password"
                             placeholder="Yeni Şifre Tekrar"
                             value={confirmPassword}
                             onChange={e => setConfirmPassword(e.target.value)}
                             required
                         />
                     </div>
                     <div className='form-actions'>
                        <div className='form-group'>
                            <label htmlFor="submit"></label>
                            <button type="submit" className='submit-button' disabled={loading}>Şifreyi Güncelle</button>
                        </div>
                     </div>
                  
                 </form>
            </div> 
        </div>
    );
};

export default ResetPassword;