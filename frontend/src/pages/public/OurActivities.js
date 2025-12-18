import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Breadcrumbs from './Breadcrumbs';
import CHelmet from '../../components/htmlComponent/CHelmet';
import EmptyRecord from './EmptyRecord';
import OptimizedImage from '../../components/htmlComponent/OptimizedImage';
import {substringValue, apiUrl, serverUrl} from '../../utils/utils';


const OurActivities = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [projects, setProjects] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [statusType, setStatusType] = useState('');
    const [activeStatus, setActiveStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
     
    const categoryId = location.state?.categoryId;

    useEffect(() => {
        
        const fetchCategoryName = async () => {
            try {   
                const response = await fetch(`${apiUrl}/categories/getCategoryNameById?categoryId=${categoryId}`);
                const data = await response.json();

                if (data.success) {
                    const categoryName = data.category.name;
                    setCategoryName(categoryName);
                } else {
                    setCategoryName('');
                    console.error('Kategori adı alınamadı:', data.message);
                }
            } catch (error) {   
                setCategoryName('');
                console.error('Kategori adı alınırken hata:', error);
            }
        };

        const fetchProjects = async () => {
            try {                
                const response = await fetch(`${apiUrl}/projects/projectList`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
    
                if (data.success) {
                    const filteredProjects = data.projects.filter(x => x.typeofActivityId?._id == categoryId);
                    if (filteredProjects.length > 0) {
                        setProjects(filteredProjects);
                    } else {
                        setProjects([]);
                        console.error('Bu kategoriye ait proje bulunamadı'); 
                    }
                } else {
                    console.error('Projeler alınamadı:', data.message);
                }
            } catch (error) {
                console.error('Projeler alınırken hata:', error);
            }
        };

        if (categoryId) {
            fetchCategoryName();
            fetchProjects();
        }
    }, [categoryId]);

    
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    }; 

    const pathnames = [
    {
        path: 'Faaliyetlerimiz' + (categoryName ? ' - ' + categoryName : ''),
        link: '',
    }];
    
    const filteredprojects = projects
        .filter(x =>
            (x.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            x.description.toLowerCase().includes(searchTerm.toLowerCase()))
            &&
            (statusType === '' || x.statusType === statusType)
        );
    return (
        <>
        <CHelmet pageName="Faaliyetlerimiz" content={categoryName} categoryName={categoryName} />
        <div className="home-container">
            <div className="main-content">
                <Breadcrumbs /> 
                <ul className="filter-list">
                    <li
                        className={activeStatus === '' ? 'active' : ''}
                        onClick={() => { setStatusType(''); setActiveStatus(''); }}
                    >
                        Tümü
                    </li>
                    <li
                        className={activeStatus === 'true' ? 'active' : ''}
                        onClick={() => { setStatusType('true'); setActiveStatus('true'); }}
                    >
                        Tamamlanan Projeler
                    </li>
                    <li
                        className={activeStatus === 'false' ? 'active' : ''}
                        onClick={() => { setStatusType('false'); setActiveStatus('false'); }}
                    >
                        Devam Eden Projeler
                    </li>
                </ul>
                <div className="box-grid" style={{ gridTemplateColumns: `${filteredprojects.length > 0 && filteredprojects.length < 3 ? 'repeat(auto-fit, minmax(0,400px))' : 'repeat(auto-fit, minmax(400px, 1fr))'}` }}>
                    {filteredprojects.length === 0 && (
                        <EmptyRecord 
                            message={categoryName ? `${categoryName} kategorisine ait proje bulunamadı.` : 'Proje bulunamadı.'}                            
                        />
                    )}
                    {filteredprojects                 
                        .map(p => (
                        <div key={p._id || p.id} className="box-card">
                            <div className="box-card-image">
                                <OptimizedImage
                                    src={p.imageUrls && p.imageUrls.length > 0 
                                        ? `${serverUrl}${p.imageUrls[0]}` 
                                        : `${serverUrl}/uploads/projects/default.png`}
                                    alt={p.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <div className="box-cart-content" onClick={() => navigate(`/project-detail/${encodeURIComponent(p.name)}`)}>
                                <div className="title">
                                <h3>{substringValue(p.name,150)}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div> 
        </div>
        </>
    );
};

export default OurActivities;