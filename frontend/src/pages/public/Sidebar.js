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

    const handleMenuClick = (path) => {
        navigate(path);
    };

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
        <div class="navbar">
            {
                token && storedUser && storedUser.role == 'admin' ?
                (                    
                    <div class="dropdown">
                        <button class="dropbtn">Yönetici 
                            <i class="fa fa-caret-down"></i>
                        </button>
                        <div class="dropdown-content">
                            <a onClick={() => handleMenuClick('/users')}>Kullanıcılar</a>
                            <a onClick={() => handleMenuClick('/projects')} >Projeler</a>
                            <a onClick={() => handleMenuClick('/categories')}>Kategoriler</a>
                            <a onClick={() => handleMenuClick('/categoryTypes')} >Kategori Türleri</a>
                            <a onClick={() => handleMenuClick('/references')} >Referanslar</a>
                            <a onClick={() => handleMenuClick('/introductionBooklet')} >Tanıtım Kitapçığı</a>
                            <a onClick={() => handleMenuClick('/editAbout')} >Biz Kimiz</a>
                            <a onClick={() => handleMenuClick('/social-media')} >Sosyal Medya</a>
                            <a onClick={() => handleMenuClick('/privacypolicies')}>Gizlilik Politikası</a>
                            <a onClick={() => handleMenuClick('/termsofservices')}>Kullanım şartları</a>
                        </div>
                    </div>
                ) : <div></div>
            }
            <a onClick={() => handleMenuClick('/')}>Anasayfa</a>
            {categories.length > 0 && 
            
                <div class="dropdown">
                    <button class="dropbtn">Faaliyetlerimiz
                        <i class="fa fa-caret-down"></i>
                    </button>
                    <div class="dropdown-content">
                        {categories.map((category) => (
                            <a key={category._id} onClick={() => handleCategoryClick(category._id)}>
                                {category.name}
                            </a>
                        ))}
                    </div>
                </div>
            }
            
            <a onClick={() => handleMenuClick('/about')}>Biz Kimiz</a>
            <a onClick={() => handleMenuClick('/contact')} >İletişim</a>
        </div>
        
    );
};

export default Sidebar;
