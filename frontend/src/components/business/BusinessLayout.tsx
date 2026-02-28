import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../App';
import BusinessHeader from './BusinessHeader';
import BusinessSidebar from './BusinessSidebar';
import { Loader2 } from 'lucide-react';

const BusinessLayout = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Pokaż loader podczas ładowania auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-500">Ładowanie...</p>
        </div>
      </div>
    );
  }

  // Sprawdź czy użytkownik jest usługodawcą
  const isProvider = user?.accountType === 'provider' || !!user?.businessName;

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth?redirect=/biznes" replace />;
  }

  // Redirect to home if not a provider
  if (!isProvider) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessHeader />
      
      <div className="flex">
        <BusinessSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        <main className="flex-1 min-h-[calc(100vh-64px)] p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BusinessLayout;
