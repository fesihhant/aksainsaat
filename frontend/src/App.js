import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Helmet} from 'react-helmet-async';

//#region "admin pages"

import Users from './pages/admin/Users';
import EditUser from './pages/admin/EditUser';

import Categories from './pages/admin/Categories';
import EditCategory from './pages/admin/EditCategory';

import CategoryTypes from './pages/admin/CategoryTypes';
import EditCategoryType from './pages/admin/EditCategoryType';

import AdminProject from './pages/admin/Projects';
import EditProject from './pages/admin/EditProject';
 
import References from './pages/admin/References';
import EditReference from './pages/admin/EditReference';
import IntroductionBookletEdit from './pages/admin/IntroductionBookletEdit';

import EditAbout from './pages/admin/EditAbout';
import SocialMediaList from './pages/admin/SocialMediaList';
import SocialMediaEdit from './pages/admin/SocialMediaEdit';

 
import PrivacyPolicyList from './pages/admin/PrivacyPolicyList';
import EditPrivacyPolicy from './pages/admin/EditPrivacyPolicy';

import TermsOfServiceList from './pages/admin/TermsOfServiceList';
import EditTermsOfService from './pages/admin/EditTermsOfService';


// #endregion

//#region "public pages"
import HomePage from './pages/public/HomePage';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

import About from './pages/public/About';
import Contact from './pages/public/Contact';

import ProjectList from './pages/public/Projects';
import ProjectDetail from './pages/public/ProjectDetail';
import OurActivities from './pages/public/OurActivities';
import ResetPassword from './pages/public/ResetPassword';
 
import SocialMediaFloatingBar from './components/htmlComponent/SocialMediaFloatingBar';
import Profile from './components/htmlComponent/Profile';  


// #endregion

//#region "private route"
import PrivateRoute from './pages/public/PrivateRoute';
//#endregion

//#region "styles"
import './App.css';
import './index.css';

import Banner from './pages/public/Banner';
import Footer from './pages/public/Footer';
//#endregion


//#region "public pages"
import NotFound from './pages/public/NotFound';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsOfService from './pages/public/TermsOfService';
//#endregion

<Helmet>
  <title>Aksa İnşaat </title>
  <meta name="description" content="İnşaat, doğalgaz, boru hattı" />
  <meta name="keywords" content="İnşaat, doğalgaz, boru hattı, belediye, bakanlık" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="/favicon.ico" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" integrity="sha384-k6RqeWeci5ZR/Lv4MR0sA0FfDOM8d7x1z5l5e5c5e5e5e5e5e5e5e5e5e5e5e5" crossOrigin="anonymous" />  
  <meta property="og:title" content="Aksa" />
  <meta property="og:description" content="İnşaat, doğalgaz, boru hattı" />
  <meta property="og:image" content="https://www.siteniz.com/proje.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
</Helmet>

function App() {
  // Kullanıcı bilgisini state'te tut
  const [storedUser, setStoredUser] = useState(JSON.parse(localStorage.getItem('user')) || {});

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* Banner'a user ve setUser gönder */}
          <Banner storedUser={storedUser} setStoredUser={setStoredUser} />
          <SocialMediaFloatingBar/>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/project-list" element={<ProjectList />} />
            <Route path="/project-detail/:slug" element={<ProjectDetail />} />
            <Route path="/activities" element={<OurActivities />} />
            
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
            <Route path="/user-activated/:activatedToken" element={<ResetPassword />} />
            
            <Route path="/profile" element={<Profile />} />

            <Route path="/test" element={<div>Test Çalışıyor</div>} />

            {/* Admin Routes */}
           
            <Route  path="/users" element={<PrivateRoute requireAdmin><Users /></PrivateRoute>} />
            <Route path="/users/new" element={<PrivateRoute requireAdmin><EditUser /></PrivateRoute>} />
            <Route path="/users/edit/:id" element={<PrivateRoute requireAdmin><EditUser /></PrivateRoute>}/> 
            
            <Route path="/categories" element={<PrivateRoute requireAdmin><Categories /></PrivateRoute>} /> 
            <Route path="/categories/new" element={ <PrivateRoute requireAdmin><EditCategory /></PrivateRoute>}/>
            <Route path="/categories/edit/:id" element={<PrivateRoute requireAdmin><EditCategory /></PrivateRoute>}/>  
             
            <Route path="/categoryTypes" element={<PrivateRoute requireAdmin ><CategoryTypes /></PrivateRoute>} /> 
            <Route path="/categoryTypes/new" element={ <PrivateRoute requireAdmin ><EditCategoryType /></PrivateRoute>}/>
            <Route path="/categoryTypes/edit/:id" element={<PrivateRoute requireAdmin ><EditCategoryType /></PrivateRoute>}/>  

            <Route path="/projects" element={<PrivateRoute requireAdmin><AdminProject /></PrivateRoute>}/>           
            <Route path="/projects/new" element={<PrivateRoute requireAdmin><EditProject /></PrivateRoute>}/>                             
            <Route path="/projects/edit/:id" element={<PrivateRoute requireAdmin><EditProject /></PrivateRoute>}/>   
            <Route path="/projectdetail" element={<PrivateRoute requireAdmin><EditProject /></PrivateRoute>}/> 
            
            <Route path="/references" element={<PrivateRoute requireAdmin><References /></PrivateRoute>}/>
            <Route path="/reference/new" element={<PrivateRoute requireAdmin><EditReference /></PrivateRoute>}/>
            <Route path="/reference/edit/:id" element={<PrivateRoute requireAdmin><EditReference /></PrivateRoute>}/>
            <Route path="/referencedetail" element={<PrivateRoute requireAdmin><EditReference /></PrivateRoute>}/>
            
            <Route path="/introductionBooklet" element={<PrivateRoute requireAdmin><IntroductionBookletEdit /></PrivateRoute>}/>
            
            <Route path="/editAbout" element={<PrivateRoute requireAdmin> <EditAbout /></PrivateRoute>} />
               
            <Route path="/social-media" element={<PrivateRoute requireAdmin> <SocialMediaList /></PrivateRoute>} />
            <Route path="/social-media/new" element={<PrivateRoute requireAdmin><SocialMediaEdit /></PrivateRoute>} />
            <Route path="/social-media/edit/:id" element={<PrivateRoute requireAdmin><SocialMediaEdit /></PrivateRoute>} />
            
            
            <Route path="/privacypolicies" element={<PrivateRoute requireAdmin ><PrivacyPolicyList /></PrivateRoute>} /> 
            <Route path="/privacypolicies/new" element={ <PrivateRoute requireAdmin><EditPrivacyPolicy /></PrivateRoute>}/>
            <Route path="/privacypolicies/edit/:id" element={<PrivateRoute requireAdmin><EditPrivacyPolicy /></PrivateRoute>}/>  
            
            <Route path="/termsofservices" element={<PrivateRoute requireAdmin><TermsOfServiceList /></PrivateRoute>} /> 
            <Route path="/termsofservices/new" element={ <PrivateRoute requireAdmin><EditTermsOfService /></PrivateRoute>}/>
            <Route path="/termsofservices/edit/:id" element={<PrivateRoute requireAdmin><EditTermsOfService /></PrivateRoute>}/>  

            <Route path="/privacy-policy" element={ <PrivacyPolicy />} />  
            <Route path="/terms-of-service" element={<TermsOfService />} />  
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer/>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
