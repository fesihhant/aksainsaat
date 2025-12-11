import { useEffect, useState } from 'react';
import '../../css/SocialMediaFloatingBar.css';
import { apiUrl, getSocialMedyaIcon, getSocialMediaBgColor } from '../../utils/utils';
 
const SocialMediaFloatingBar = () => {
  const [accounts, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);
  
  
  useEffect(() => {
      
      const fetchData = async () => {
          try {
              const response = await fetch(`${apiUrl}/social-media`, {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json'
                  }
              });
              const data = await response.json();

              if (data.success) {
                  setData(data.accounts.filter((x) => x.active == true).sort());              
              }
          } catch (error) {
              console.error('Veriler yüklenirken hata:', error);
          } finally {
              setLoading(false);
          }
      };

      fetchData();
  }, []);
if (loading) {
    return <div>Yükleniyor...</div>;
  }
return (
    <div className="social-media-bar">
      {accounts.map((item, idx) => (
        <a
          key={item.name}
          href={item.mediaLink}
          className="social-media-link"
          target="_blank"
          rel="noopener noreferrer"
          title={item.name}
          style={{
            backgroundColor: hovered === idx ? getSocialMediaBgColor(item.name) : getSocialMediaBgColor(item.name),
            // backgroundColor:getSocialMediaBgColor(item.name),
            transition: 'background 0.2s, color 0.2s'
          }}           
          onMouseEnter={() => setHovered(idx)}   // Masaüstü hover başlatır
          onMouseLeave={() => setHovered(null)}  // Masaüstü hover biter
          onTouchStart={() => setHovered(idx)}   // Mobilde dokunma başlatır
          onTouchEnd={() => setHovered(null)}    // Mobilde dokunma biter
          onClick={() => {
            // Mobilde bazı tarayıcılar için ekstra güvenlik:
            setHovered(idx);
            setTimeout(() => setHovered(null), 300); // 300ms sonra hover'ı kaldır
          }}
        >
          <i className={`fa-brands ${getSocialMedyaIcon(item.name)}`}></i>
          <span className="social-media-label">{item.name}</span>
        </a>
      ))}
    </div>
  );
}

export default SocialMediaFloatingBar;