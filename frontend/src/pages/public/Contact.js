import React, { useState } from 'react';
import { Helmet} from 'react-helmet-async';

import Breadcrumbs from './Breadcrumbs';
import { apiUrl } from '../../utils/utils';

import '../../css/HomePage.css';   

const Contact = () => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
        succesMessage:''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${apiUrl}/contact/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {

                setShowSuccess(true);
                setFormData({ name: '', email: '', message: '', succesMessage: 'Mesajınız başarıyla gönderilmiştir.' });
                setTimeout(() => setShowSuccess(false), 5000);
            } else {
                alert('Mail gönderilemedi: ' + data.message);
            }
        } catch (err) {
            alert('Sunucu hatası: ' + err.message);
        }
    }; 
     
    return (
        <>
        <Helmet>
            <script type="application/ld+json">
                {`
                {
                    "@context": "https://schema.org",
                    "@type": "LocalBusiness",
                    "name": "Aksa İnşaat",
                    "image": "https://www.aksainsaat.com.tr/aksa-insaat.png",
                    "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Bektaş Sk No:6/18",
                    "addressLocality": "Kartal",
                    "addressRegion": "İstanbul",
                    "postalCode": "34880",
                    "addressCountry": "TR"
                    },
                    "telephone": "+902164511313",
                    "url": "https://www.aksainsaat.com.tr",
                    "aggregateRating": {
                    "@type": "AggregateRating",
                    }
                }
                `}
            </script>
            
            {/* "ratingValue": "4.9", google da işletmeye verilen puan 
            "reviewCount": "141" google da işletmeye verilen puan veya yorum sayisi */}
        </Helmet>

            <div className="home-container">
                <div className="main-content">
                    <Breadcrumbs/>
                    <div className="form-container" >
                        
                        <div className='row'>
                            <div className='col-6'>
                                <form onSubmit={handleSubmit}>
                                    <div className='succes-message' style={{display: showSuccess ? 'block' : 'none'}} >
                                        {formData.succesMessage}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="name">Adınız:</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            maxLength={250}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">E-posta:</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            maxLength={250}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="message">Mesajınız:</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows="10"
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="form-actions">
                                        <div className="form-group">
                                            <label htmlFor='submit' ></label>
                                            <button id='submit' type="submit" className="submit-button">
                                                Gönder
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className='col-4'>
                                <iframe frameborder="0" scrolling="no" marginheight="0" marginwidth="0"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3015.048200284835!2d29.210003075509068!3d40.91468902518324!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cac4c112ee7bd5%3A0x384117202fbc4b85!2zT3J0YSwgQmVrdGHFnyBTay4gTm86NiBEOjE3LCAzNDg2MCBLYXJ0YWwvxLBzdGFuYnVs!5e0!3m2!1str!2str!4v1749721323356!5m2!1str!2str" 
                                style={{borderRadius:'10px', border:'2px solid cadetblue'}}
                                width="500" height="400" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
                                aria-label="Orta Mahalle, Bektaş Sk. No:6/16, 06460 Kartal/İstanbul"></iframe>
                            </div>
                       </div> 
                    </div>
                </div>
            </div>
        </>
    );
};

export default Contact;
