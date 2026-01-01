import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../App';
import BusinessHeader from './BusinessHeader';
import BusinessSidebar from './BusinessSidebar';

const BusinessLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
