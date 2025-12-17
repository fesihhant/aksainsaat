import { useEffect, useState } from 'react';
import '../../css/SocialMediaFloatingBar.css';
import { getSocialMedyaIcon, getSocialMediaBgColor } from '../../utils/utils';
import { useApiCall } from '../../utils/apiCalls';
 
const SocialMediaFloatingBar = () => {
  const [accounts, setData] = useState([]);
  const [hovered, setHovered] = useState(null);
  
  const { apiData, apiError, apiLoading } = useApiCall(
    '/social-media',
    'GET',
    null,
    false,
    { cache: true, staleTimeMs: 60 * 60 * 1000, cacheStorage: 'both', dedupe: true, timeoutMs: 45000, retry: 1, retryDelayMs: 500 }
  );
  
  useEffect(() => {
    if (apiData && apiData.success) {
      setData((apiData.accounts || []).filter((x) => x.active === true).sort());
    }
    if (apiError) {
      console.error('Veriler yüklenirken hata:', apiError);
    }
  }, [apiData, apiError]);

  // Sayfayı kilitleme: loading durumunda bar'ı göstermiyoruz (placeholder da olabilir).
  if (apiLoading && accounts.length === 0) return null;

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