import React, { useEffect, useState } from 'react';
import '../../css/imageSlider.css';
import '../../css/SocialMediaFloatingBar.css';
import { useNavigate  } from 'react-router-dom';
import { apiUrl, serverUrl, getSocialMedyaIcon, getSocialMediaBgColor } from '../../utils/utils';


const Footer = () => {
    const navigate = useNavigate();
    const [accounts, setData] = useState([]);
    const [contactInfo, setContactInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hovered, setHovered] = useState(null); 
    

    useEffect(() => {          
        const fetchSocialMediaData = async () => {
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
        fetchSocialMediaData();

        const fetchContactData = async () => {
            try {
                const response = await fetch(`${apiUrl}/abouts`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
  
                if (data.success) {
                    setContactInfo(data.about[0]);              
                }
            } catch (error) {
                console.error('Veriler yüklenirken hata:', error);
            } finally {
                setLoading(false);
            }
        };  
        fetchContactData();
    }, []);
    
     
    const [referenceList, setReferenceList] = useState([]);
    const scrollRef = React.useRef(null);  
    useEffect(() => {
      fetchReferenceList();
    }, []);

    useEffect(() => {
      if (referenceList.length > 0) {
        let resetTimeout = null;
        const interval = setInterval(() => {
          if (scrollRef.current) {
            // Toleransı artırın (ör: 30px)
            if (
              scrollRef.current.scrollLeft + scrollRef.current.offsetWidth >=
              scrollRef.current.scrollWidth - 30
            ) {
              // Son resme gelince kısa bir bekleme ile başa dön
              if (!resetTimeout) {
                  resetTimeout = setTimeout(() => {
                    scrollRef.current.scrollLeft = 0;
                    resetTimeout = null;
                  }, 500); // 0.5 saniye bekle
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
    }, [referenceList]);

    const fetchReferenceList = async () => {
      try {
        const response = await fetch(`${apiUrl}/references/referenceList`);
        const data = await response.json();

        if (data.success) {

          data.references.map(ref => {
              ref.imageUrl = `${serverUrl}${ref.imageUrl}`;
          });

          if(data.references.length > 0){
            setReferenceList(data.references);
          }
        } else {
          console.error('Referans resimleri alınamadı:', data.message);
        }
      } catch (error) {
        console.error('Referans resimleri alınırken hata:', error);
      }
    };

    if (loading) {
        return <div>Yükleniyor...</div>;
    }
  return ( 

    <div class="footer"> 
      {referenceList && referenceList.length > 0 && (
        
          
            <div style={{ width:'100%', padding: 12, marginTop: 16 }}>
              <div style={{color:'#003da6', fontWeight:'bold', marginBottom: 8}}>REFERANSLARIMIZ</div>
                <div className="image-section-slider">
                  <div className="slider-container" ref={scrollRef}>
                    {referenceList.map((ref, index) => (
                    <div className="slider-feature-card" key={index}>
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

      <div className='form-container'>         
        <div class="row" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div class="col-4 social-media-footer-bar">
              <ul style={{ display: 'flex', justifyContent:'flex-end', gap:'4px', listStyleType: 'none', padding: 0, margin: 0}}>        
              {accounts.map((item, idx) => (
                <li>
                  <a
                      key={item.name}
                      href={item.mediaLink}
                      className="social-media-link-footer"
                      target="_blank"
                      rel="noopener noreferrer"
                      title={item.name}
                      style={{ backgroundColor: hovered === idx ? getSocialMediaBgColor(item.name) : getSocialMediaBgColor(item.name),
                                  backgroundColor:getSocialMediaBgColor(item.name),
                                  transition: 'background 0.2s, color 0.2s'
                      }}
                  >
                      <i className={`fa-brands ${getSocialMedyaIcon(item.name)}`}></i>
                  </a>
                </li> 
              
              ))}
            </ul>
            </div>
            {/* <div class="col-8">               
                <p style={{textAlign:'center', fontSize:'12px', color:'gray'}}>
                    <a href="/">@aksainsaat </a> telif hakkı ihlali düşündüğünüz içerikler için lütfen 
                    <a href="/contact" style={{color:'darkblue'}}> iletişim sayfamızdan</a> bizimle iletişime geçin.
                    <a href="/privacy-policy" style={{color:'darkblue'}}> Gizlilik Politikası</a> | 
                    <a href="/terms-of-service" style={{color:'darkblue'}}> Kullanım Şartları</a>
                </p>
            </div> */}
        </div> 
      </div>   
      
      <div style={{ width:'100%', padding: 12, marginTop: 16,backgroundColor:'black',color:'white', borderRadius:8, padding:8 }}>
        <div class="row" style={{alignItems: 'center', justifyContent: 'space-around'}}>
            <div className='col-6'>
                {contactInfo && contactInfo.address && (
                    <>
                        <i className="fa-solid fa-location-dot"></i>
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                            &nbsp;{contactInfo.address}
                        </a> 
                    </>
                )}
            </div>
            <div className='col-2'>
                {contactInfo && contactInfo.phoneNumber && (
                    <span><i class="fa-solid fa-phone"></i> <a href={`tel:${contactInfo.phoneNumber}`} >{contactInfo.phoneNumber}</a></span>
                )}
            </div>
            <div className='col-2'>
                {contactInfo && contactInfo.email && (
                    <span> <i class="fa-solid fa-envelope"></i> <a href={`mailto:${contactInfo.email}`} >{contactInfo.email}</a></span>
                )}
            </div>
            <div className='col-2'>
                {contactInfo && contactInfo.fax && (
                    <span> <i class="fa-solid fa-fax"></i> {contactInfo.fax}</span>
                )}
            </div>
        </div>
        <br/>
        <br/>
        <div class="row" style={{alignItems: 'center', justifyContent: 'space-around'}}>              
            <div>
              <p style={{textAlign:'center', fontSize:'12px'}}>
                  <a href="/"><i class="fa-solid fa-at"></i>aksainsaat </a> telif hakkı ihlali düşündüğünüz içerikler için lütfen 
                  <a href="/contact" style={{color:'cornflowerblue'}}> iletişim sayfamızdan</a> bizimle iletişime geçin.
                  <a href="/privacy-policy" style={{color:'cornflowerblue'}}> Gizlilik Politikası</a> | 
                  <a href="/terms-of-service" style={{color:'cornflowerblue'}}> Kullanım Şartları</a>
              </p>
            </div>
        </div> 
      </div>         
    </div>
  );
}
export default Footer;