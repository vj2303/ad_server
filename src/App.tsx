
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CreativeProvider } from './context/CreativeContext';
import { MetaAdsProvider } from './context/MetaAdsContext';
import { MetaAccountsProvider } from './context/MetaAccountsContext';
import { Toaster } from '@/components/ui/toaster';
import Index from './pages/Index';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import NotFound from './pages/NotFound';
import UploadCreative from './pages/creatives/UploadCreative';
import CreativeGallery from './pages/creatives/CreativeGallery';
import CreativeDetail from './pages/creatives/CreativeDetail';
import Profile from './pages/profile/Profile';
import Ads from './pages/ads/Ad'
import Saved from './pages/saved'
import AccountsPage from './pages/ads/AccountPage';


function App() {
  return (
    <Router>
      <AuthProvider>
        <CreativeProvider>
          <MetaAdsProvider>
          <MetaAccountsProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<UploadCreative />} />
              <Route path="/creatives" element={<CreativeGallery />} />
              <Route path="/creatives/:id" element={<CreativeDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/ads" element={<Ads />} />
              <Route path="/ads" element={<AccountsPage />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            </MetaAccountsProvider>
          </MetaAdsProvider>
        </CreativeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
