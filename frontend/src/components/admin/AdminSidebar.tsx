import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  Settings,
  Shield,
  X,
  LogOut,
  Crown,
  Flag,
} from 'lucide-react';
import { useAuth } from '../../App';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isSuperAdmin?: boolean;
}

const AdminSidebar = ({ isOpen, onClose, isSuperAdmin = false }: AdminSidebarProps) => {
  const { logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/admin' },
    { icon: Users, label: 'Użytkownicy', to: '/admin/uzytkownicy' },
    { icon: Briefcase, label: 'Usługodawcy', to: '/admin/uslugodawcy' },
    { icon: Calendar, label: 'Rezerwacje', to: '/admin/rezerwacje' },
    { icon: Flag, label: 'Zgłoszenia', to: '/admin/zgloszenia' },
    { icon: Settings, label: 'Ustawienia', to: '/admin/ustawienia' },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/#/';
  };

  return (
    <>
      {/* Overlay dla mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 lg:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isSuperAdmin ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-red-600'
                }`}>
                  {isSuperAdmin ? <Crown className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="font-bold text-lg">
                    {isSuperAdmin ? 'Super Admin' : 'Admin Panel'}
                  </h2>
                  <p className="text-xs text-gray-400">ToMyHomeApp</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? isSuperAdmin 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                        : 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <NavLink
              to="/"
              className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition-all mb-2"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Wróć do strony</span>
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-600/20 hover:text-red-300 rounded-xl transition-all w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Wyloguj się</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
