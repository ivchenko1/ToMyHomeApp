import { useState, useEffect, createContext, useContext } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../App';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { Shield, Loader2 } from 'lucide-react';

// Context dla roli admina
interface AdminContextType {
  isSuperAdmin: boolean;
  role: 'admin' | 'superadmin' | null;
}

const AdminContext = createContext<AdminContextType>({ isSuperAdmin: false, role: null });

export const useAdminRole = () => useContext(AdminContext);

const AdminLayout = () => {
  const { isAuthenticated, isAdmin, isSuperAdmin, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Weryfikacja uprawnień...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth?redirect=/admin" replace />;
  }

  // Access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Brak dostępu</h1>
          <p className="text-gray-400 mb-6">
            Nie masz uprawnień do panelu administracyjnego. 
            Ta strona jest dostępna tylko dla administratorów platformy.
          </p>
          <div className="space-y-3">
            <a
              href="#/"
              className="block w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
            >
              Wróć do strony głównej
            </a>
            <p className="text-sm text-gray-500">
              Jeśli uważasz, że to błąd, skontaktuj się z administratorem.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ isSuperAdmin, role: isSuperAdmin ? 'superadmin' : 'admin' }}>
      <div className="min-h-screen bg-gray-100 flex">
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isSuperAdmin={isSuperAdmin}
        />

        <div className="flex-1 flex flex-col min-h-screen">
          <AdminHeader 
            onMenuClick={() => setIsSidebarOpen(true)} 
            isSuperAdmin={isSuperAdmin}
          />

          <main className="flex-1 p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
};

export default AdminLayout;
