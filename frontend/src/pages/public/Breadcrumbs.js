import { Link } from 'react-router-dom';


const Breadcrumbs = () => { 

    const getPageTitle = (pageName) => {
        if (!pageName) return '';
        pageName = pageName.toLowerCase();
        switch (pageName) {
            case 'login':
                return 'Giriş';
            case 'register':
                return 'Kayıt Ol';
            case 'reset-password':
                return 'Şifremi Sıfırla';
            case 'profile':
                return 'Profil';
            case 'new':
                return 'Yeni';
            case 'edit':
                return 'Güncelle';
            case 'projects':
                return 'Projeler';
            case 'projectList':
                return 'Projeler';
            case 'project':
                return 'Proje';
            case 'editProject':
                return 'Proje Güncelle';
            case 'addProject':
                return 'Yeni';
            case 'project-detail':
                return 'Proje detayı';   
            case 'references':
                return 'Referanslar';
            case 'reference':   
                return 'Referans';
            case 'editReference':
                return 'Güncelle';
            case 'addReference':
                return 'Yeni';

            case 'introductionbooklet':
                return 'Tanıtım Kitapçığı';

            case 'socialmediaList':
                return 'Sosyal Medya Hesapları';
            case 'social-media':
                return 'Sosyal Medya Hesabları';

             
            case 'about':
                return 'Biz Kimiz';     
            case 'editabout':
                return 'Biz Kimiz Güncelle';       
            case 'contact':
                return 'İletişim';           
            case 'home':
                return 'Anasayfa';
            case 'admin':
                return 'Yönetici';
            case 'adminPanel':
                return 'Yönetim Paneli';
                
            case 'editSocialMedia':
                return 'Güncelle';
            case 'addSocialMedia':
                return 'Yeni';
            
            case 'termsofservices':
                return 'Kullanım Şartları';  
            case 'terms-of-service':
                return 'Kullanım Şartları';

            case 'privacy-policy':
                return 'Gizlilik Politikası';
            case 'privacypolicies':
                return 'Gizlilik Politikaları';

            case 'categories':
                return 'Kategoriler';
            case 'category':
                return 'Kategori';
            case 'editCategory':
                return 'Güncelle';
            case 'addCategory':
                return 'Yeni';

            case 'categoryTypes':
                return 'Kategori Türleri';
            case 'categoryType':
                return 'Kategori Türü';
            case 'editcategoryType':
                return 'Güncelle';
            case 'addCategoryType':
                return 'Yeni';

            case 'users':
                return 'Kullanıcılar';
            case 'user':
                return 'Kullanıcı';
            case 'editUser':    
                return 'Güncelle';
            case 'addUser':
                return 'Yeni';

            case 'languages':
                return 'Diller';
            case 'translations':
                return 'Çeviriler';
                
            case 'activities':
                return 'Faaliyetlerimiz';
            case 'notfound':
                return 'Sayfa Bulunamadı';
            default:
                return '';
        }
    }

    
    const pathname = window.location.pathname;
    const segments = pathname
        .split('/')
        .filter(Boolean)
        .map(seg => {
            try {
                return decodeURIComponent(seg);
            } catch {
                return seg;
            }
        });

    const isId = (segment) => /^[0-9a-fA-F]{24}$/.test(segment) || /^\d+$/.test(segment);

    // Özel durum: /project-detail/:slug için "project-detail" segmentini gizle,
    // sadece proje adını göster (Anasayfa / Proje Adı)
    const visibleSegments = segments.filter((seg, idx, arr) => {
        if (isId(seg)) return false;
        if (seg === 'project-detail' && idx < arr.length - 1) return false;
        return true;
    });

    let pathSoFar = '';
    return (
        <>
        <nav className="breadcrumbs">
            <Link to="/">Anasayfa</Link>
            {visibleSegments.map((seg, idx, arr) => {
                pathSoFar += '/' + seg;
                const title = getPageTitle(seg) || seg;
                const isLast = idx === arr.length - 1;
                return (
                <span key={idx}>
                    &nbsp;/ {isLast
                    ? <span>{title}</span>
                    : <Link to={pathSoFar}>{title}</Link>
                    }
                </span>
                );
            })}
        </nav>
        </>
    );
}
export default Breadcrumbs;