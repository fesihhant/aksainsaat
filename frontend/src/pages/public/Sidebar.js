import React,{useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryTypeEnum, apiUrl } from '../../utils/utils';
import '../../css/Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');    
    const [categories, setCategories] = useState([]);
    const baseUrl = `${apiUrl}/categories`;


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                
                const categoryTypeId = categoryTypeEnum.PROJECT; // Faaliyet türü için ID
                const response = await fetch(`${baseUrl}/categorytypes?categoryTypeId=${categoryTypeId}`);
                const data = await response.json();
                if (data.success) {
                    setCategories(data.categories);
                } else {
                    console.error('Kategoriler alınamadı:', data.message);
                }
            } catch (error) {
                console.error('Kategoriler alınırken hata:', error);
            }
        };

        fetchCategories();
    }, []);
    
    const handleCategoryClick = (catId) => {
        navigate('/activities', { state: {categoryId: catId }});
    };

    return (
        <div className="navbar">
            {
                token && storedUser && storedUser.role == 'admin' ?
                (                    
                    <div className="dropdown">
                        <button className="dropbtn">Yönetici 
                            <i className="fa fa-caret-down"></i>
                        </button>
                        <div className="dropdown-content">
                            <a href='/users'>Kullanıcılar</a>
                            <a href='/projects' >Projeler</a>
                            <a href='/categories'>Kategoriler</a>
                            <a href='/categoryTypes' >Kategori Türleri</a>
                            <a href='/references'>Referanslar</a>
                            <a href='/introductionbooklet' >Tanıtım Kitapçığı</a>
                            <a href='/editAbout'>Biz Kimiz</a>
                            <a href='/social-media' >Sosyal Medya</a>
                            <a href='/privacypolicies'>Gizlilik Politikası</a>
                            <a href='/termsofservices'>Kullanım şartları</a>
                        </div>
                    </div>
                ) : <div></div>
            }
            <a href='/'>Anasayfa</a>
            {categories.length > 0 && 
            
                <div className="dropdown">
                    <button className="dropbtn">Faaliyetlerimiz
                        <i className="fa fa-caret-down"></i>
                    </button>
                    <div className="dropdown-content">
                        {categories.map((category) => (
                            <a key={category._id} onClick={() => handleCategoryClick(category._id)}>
                                {category.name}
                            </a>
                        ))}
                    </div>
                </div>
            }
            
            <a href='/about'>Biz Kimiz</a>
            <a href='/contact'>İletişim</a>
        </div>
        
    );
};

export default Sidebar;
