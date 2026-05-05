import React, { useEffect, useState } from 'react';
import '../../css/imageSlider.css';
import '../../css/SocialMediaFloatingBar.css';
import { serverUrl, getSocialMedyaIcon, getSocialMediaBgColor } from '../../utils/utils';
import { useApiCall } from '../../utils/apiCalls';
import MailLinks  from '../../utils/MailLinks';


const Footer = () => {
    const [accounts, setData] = useState([]);
    const [contactInfo, setContactInfo] = useState([]);
    const [hovered, setHovered] = useState(null); 
    const [isPaused, setIsPaused] = useState(false);

    const { apiData: socialData, apiError: socialError } = useApiCall(
      '/social-media',
      'GET',
      null,
      false,
      { cache: true, staleTimeMs: 60 * 60 * 1000, cacheStorage: 'both', dedupe: true, timeoutMs: 45000, retry: 1, retryDelayMs: 500 }
    );

    const { apiData: aboutData, apiError: aboutError } = useApiCall(
      '/abouts',
      'GET',
      null,
      false,
      { cache: true, staleTimeMs: 30 * 60 * 1000, cacheStorage: 'both', dedupe: true, timeoutMs: 45000, retry: 1, retryDelayMs: 500 }
    );
    
     
    const [referenceList, setReferenceList] = useState([]);
    const scrollRef = React.useRef(null);  
    const { apiData: refData, apiError: refError } = useApiCall(
      '/references/referenceList',
      'GET',
      null,
      false,
      // { cache: true, staleTimeMs: 60 * 60 * 1000, cacheStorage: 'both', dedupe: true, timeoutMs: 45000, retry: 1, retryDelayMs: 500 }
    );

    useEffect(() => {
      if (socialData && socialData.success) {
        setData((socialData.accounts || []).filter((x) => x.active === true).sort());
      }
      if (socialError) {
        console.error('Sosyal medya verileri yüklenirken hata:', socialError);
      }
    }, [socialData, socialError]);

    useEffect(() => {
      if (aboutData && aboutData.success && aboutData.about && aboutData.about.length > 0) {
        setContactInfo(aboutData.about[0]);
      }
      if (aboutError) {
        console.error('İletişim bilgileri yüklenirken hata:', aboutError);
      }
    }, [aboutData, aboutError]);

    useEffect(() => {
      if (refData && refData.success) {
        const refs = (refData.references || []).map((r) => ({
          ...r,
          imageUrl: r.imageUrl ? `${serverUrl}${r.imageUrl.startsWith('/') ? r.imageUrl : '/' + r.imageUrl}` : r.imageUrl
        }));
        if (refs.length > 0) setReferenceList(refs);
      } else if (refData && !refData.success) {
        console.error('Referans resimleri alınamadı:', refData.message);
      }
      if (refError) {
        console.error('Referans resimleri alınırken hata:', refError);
      }
    }, [refData, refError]);

    // useEffect(() => {
    //   if (referenceList.length > 0) {
    //     let resetTimeout = null;
    //     const interval = setInterval(() => {
    //       if (scrollRef.current) {
    //         // Toleransı artırın (ör: 30px)
    //         if (
    //           scrollRef.current.scrollLeft + scrollRef.current.offsetWidth >=
    //           scrollRef.current.scrollWidth - 30
    //         ) {
    //           // Son resme gelince kısa bir bekleme ile başa dön
    //           if (!resetTimeout) {
    //               resetTimeout = setTimeout(() => {
    //                 scrollRef.current.scrollLeft = 0;
    //                 resetTimeout = null;
    //               }, 500); // 0.5 saniye bekle
    //           }
    //         } else {
    //           scrollRef.current.scrollLeft += 2;
    //         }
    //       }
    //     }, 30);
    //     return () => {
    //       clearInterval(interval);
    //       if (resetTimeout) clearTimeout(resetTimeout);
    //     };
    //   }
    // }, [referenceList]);

    useEffect(() => {
      if (referenceList.length > 0) {
        let resetTimeout = null;
        const interval = setInterval(() => {
          if (!isPaused && scrollRef.current) {
            if (
              scrollRef.current.scrollLeft + scrollRef.current.offsetWidth >=
              scrollRef.current.scrollWidth - 30
            ) {
              if (!resetTimeout) {
                resetTimeout = setTimeout(() => {
                  scrollRef.current.scrollLeft = 0;
                  resetTimeout = null;
                }, 500);
              }
            } else {
              scrollRef.current.scrollLeft += 2;
            }
          }
        }, 30);

        return () => {
          clearInterval(interval);
          if (resetTimeout) clearTimeout(resetTimeout);
        };
      }
    }, [referenceList, isPaused]);
  return ( 

    <div className="footer"> 
      {referenceList && referenceList.length > 0 && (       
        <div style={{ width:'100%', padding: 12, marginTop: 16 }}>
            {/* <div style={{color:'#003da6', fontWeight:'bold', marginBottom: 8}}>REFERANSLARIMIZ</div> */}
              <div className="image-section-slider">
                <div className="slider-container" ref={scrollRef}>
                  {referenceList.map((ref, index) => (
                    <div className="slider-feature-card" key={index}
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => setIsPaused(false)}
                    >
                      {ref.webLink ? (
                        <a href={ref.webLink} target="_blank" rel="noopener noreferrer">
                          <img
                            src={ref.imageUrl}
                            className="slider-image"
                            alt={`Referans ${index + 1}`}
                          />
                        </a>
                      ) : (
                        <img
                          src={ref.imageUrl}
                          className="slider-image"
                          alt={`Referans ${index + 1}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
        </div>
      )}
      <div style={{ width:'100%', marginTop: 16, backgroundColor:'black', color:'white', borderRadius:8, padding:'24px 16px' }}>
  
        {/* İletişim Bilgileri */}
        <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-around', marginBottom:16 }}>
          {contactInfo?.address && (
            <div>
              <i className="fa-solid fa-location-dot"></i>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'none', marginLeft: 6 }}
              >
                {contactInfo.address}
              </a>
            </div>
          )}

          {contactInfo?.phoneNumber && (
            <div>
              <i className="fa-solid fa-phone"></i>
              <a href={`tel:${contactInfo.phoneNumber}`} style={{ color:'inherit', marginLeft: 6 }}>
                {contactInfo.phoneNumber}
              </a>
            </div>
          )}

          {contactInfo?.fax && (
            <div>
              <i className="fa-solid fa-fax"></i>
              <span style={{ marginLeft: 6 }}>{contactInfo.fax}</span>
            </div>
          )}

          {contactInfo?.email && (
            <div> 
              <MailLinks mailaddress={contactInfo.email}/>
            </div>
          )}
        </div>

        {/* Sosyal Medya Hesapları */}
        <div className="social-media-footer-bar" style={{ textAlign:'center', marginBottom:16 }}>
          <ul style={{ display:'flex', justifyContent:'center', gap:'8px', listStyleType:'none', padding:0, margin:0 }}>
            {accounts.map((item, idx) => (
              <li key={item._id || item.name || idx}>
                <a
                  href={item.mediaLink}
                  className="social-media-link-footer"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={item.name}
                  style={{
                    backgroundColor: getSocialMediaBgColor(item.name),
                    // color:'white',
                    // borderRadius:'50%',
                    // width:36,
                    // height:36,
                    // display:'flex',
                    // alignItems:'center',
                    // justifyContent:'center',
                    transition:'background 0.2s, color 0.2s'
                  }}
                  onMouseEnter={() => setHovered(idx)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <i className={`fa-brands ${getSocialMedyaIcon(item.name)}`}></i>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Telif ve Yasal Bilgiler */}
        <div style={{ textAlign:'center', fontSize:'12px' }}>
          <p>
            <a href="/" style={{ color:'white', textDecoration:'none' }}>
              <i className="fa-solid fa-at"></i> aksainsaat
            </a> © Tüm hakları saklıdır. Telif hakkı ihlali düşündüğünüz içerikler için lütfen 
            <a href="/contact" style={{ color:'cornflowerblue', marginLeft:4 }}> iletişim sayfamızdan</a> bizimle iletişime geçin.  
            <a href="/privacy-policy" style={{ color:'cornflowerblue', marginLeft:4 }}> Gizlilik Politikası</a> | 
            <a href="/terms-of-service" style={{ color:'cornflowerblue', marginLeft:4 }}> Kullanım Şartları</a>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Footer;