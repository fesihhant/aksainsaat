import React, { useState, useEffect, useRef } from 'react';
import { serverUrl } from '../../utils/utils';
import OptimizedImage from './OptimizedImage';
import '../../css/HomePage.css';

const ProjectSlider = ({ projects, navigate }) => {
    const [current, setCurrent] = useState(0);
    const intervalRef = useRef();

    // Sadece resmi olan projeler
    const slides = projects
        .filter(p => p.imageUrls && p.imageUrls.length > 0)
        .map(p => ({
            id: p.id,
            name: p.name,
            imageUrl: p.imageUrls[0].startsWith('http') ? p.imageUrls[0] : `${serverUrl}${p.imageUrls[0]}`,
            project: p
        }));

    useEffect(() => {
        if (slides.length < 2) return;
        intervalRef.current = setInterval(() => {
            setCurrent(prev => (prev + 1) % slides.length);
        }, 3500);
        return () => clearInterval(intervalRef.current);
    }, [slides.length]);

    if (slides.length === 0) return null;

    const goToPrev = () => setCurrent(prev => (prev - 1 + slides.length) % slides.length);
    const goToNext = () => setCurrent(prev => (prev + 1) % slides.length);

    return (
        <div className="project-slider-container" style={{ position: 'relative', margin: '0 auto auto auto'}}>
            <button
                className="slider-arrow left"
                onClick={goToPrev}
            >
                &#8592;
            </button>
            <div className="project-slider" style={{ width: '100%', height: '60vw', maxHeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '60vw', // veya height: '70vh', ihtiyaca göre
                        maxHeight: 700,
                        margin: '0 auto',
                        boxShadow: '0 2px 12px #0002',
                        borderRadius: 0,
                        overflow: 'hidden',
                        background: '#fff'
                    }}
                >
                    <OptimizedImage
                        src={slides[current].imageUrl}
                        alt={slides[current].name}
                        priority={current === 0} // İlk resim kritik (above-the-fold)
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            background: '#fff'
                        }}
                    />
                    
                    <div className="project-details">
                        {slides[current].name} 
                    </div>
                    <button className="project-detail-button" 
                        onClick={() => navigate(`/project-detail/${slides[current].project._id}`)}>
                        Proje Detayları
                    </button>
                </div>
            </div>
            <button
                className="slider-arrow right"
                onClick={goToNext}
            >
                &#8594;
            </button>
        </div>
    );
};

export default ProjectSlider;