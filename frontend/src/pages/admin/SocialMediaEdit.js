import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Breadcrumbs from '../public/Breadcrumbs';
import { Checkbox } from '@mui/material';
import { apiUrl } from '../../utils/utils';
import { apiRequest, invalidateApiCacheMany } from '../../utils/apiCalls';

const SocialMediaEdit = () => {
const { id } = useParams();
const navigate = useNavigate();
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [form, setForm] = useState({ name: '', mediaLink: '', active: true });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch(`${apiUrl}/social-media/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.account) {
        setForm(data.account);
      } else {
        setError(data.message || 'Sosyal medya bilgileri yüklenemedi');
      }
    } catch (error) {
      console.error('Sosyal medya bilgileri getirme hatası:', error);
      setError(error.message || 'Sunucu bağlantısı başarısız');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login');
        return;
    }
    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/social-media/${id}` : '/social-media';

        const data = await apiRequest(method, url, form, {
            isToken: true,
            retry: 1,
            retryDelayMs: 500,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (data.success) {
            invalidateApiCacheMany([
                { method: 'GET', urlPrefix: '/social-media' }
            ]);
            navigate('/social-media'); // Ürünler sayfasına yönlendirme
        } else {
            setError(data.message || 'Bir hata oluştu');
        }
    } catch (error) {
        setLoading(false); 
        setError(error.message || 'Sunucu bağlantısı başarısız');
    } finally {
        setLoading(false);
    }
  };

  const pathnames = [
        {
          path: 'Sosyal Medya Hesapları',
          link: '/social-media',
        },
        {
          path: (id ? 'Düzenle' : 'Yeni Hesap Ekle'),
          link: '',
        }
    ];

  // Loading durumunda göster
  if (loading && !form.name && id) {
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
                <form id="dataForm" onSubmit={handleSubmit} className="edit-form">
                    <div className="page-header">
                        <div className="form-actions">
                            <button 
                                type="submit"
                                form="dataForm"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Kaydediliyor...' : (id ? 'Güncelle' : 'Kaydet')}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => navigate('/social-media')}
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
                        <label htmlFor="name">Sosyal Medya İsmi</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>     
                    <div className="form-group">
                        <label htmlFor="mediaLink">Bağlantı Adresi</label>
                        <input
                            type="text"
                            id="mediaLink"
                            name="mediaLink"
                            value={form.mediaLink}
                            onChange={handleChange}
                            required
                        />
                    </div>              
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="active">Aktif mi?</label>
                            <Checkbox style={{ height: '24px', maxWidth: '24px', color: 'cadetblue' }}
                                type="checkbox"                            
                                id="active"
                                name="active"
                                checked={form.active}
                                value={form.active}
                                onChange={handleChange}
                            />                     
                        </div>
                    </div> 
                </form>
            </div>
        </div>
  );
};

export default SocialMediaEdit;