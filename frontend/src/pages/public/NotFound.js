// src/components/public/NotFound.js
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Breadcrumbs from './Breadcrumbs';

const NotFound = () => {  
   return (
         <>
             <Helmet>
                 <title>404 | Aksa İnşaat</title>
                 <meta name="description" content="Aksa İnşaat tarafından geliştirilen tüm projeleri burada bulabilirsiniz." />
                 <meta name="keywords" content="projeler, yazılım, Aksa İnşaat, react" />
                 <meta property="og:title" content="Projelerimiz" />
                 <meta property="og:description" content="Aksa İnşaat'ın geliştirdiği projeler hakkında detaylı bilgi alın." />
             </Helmet>
         
             <div className="home-container">
                 <div className="main-content">
                     <Breadcrumbs />
                     <div className="page-header">
                         <div className="header-actions">                         
                             <div className="search-box"> 
                             </div> 
                         </div>
                     </div>
                     <hr></hr>
                     <br></br>
                     <div style={{textAlign: 'center', marginTop: '80px', marginBottom: '80px'}}>
                        <h1>404</h1>
                        <h2>Aradığınız sayfa bulunamadı.</h2>
                     </div> 
                  </div>
             </div>
         </>
    
  );
};

export default NotFound;