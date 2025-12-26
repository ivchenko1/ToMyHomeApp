import { Menu, Bell, Search, Shield, Crown } from 'lucide-react';
import { useAuth } from '../../App';

interface AdminHeaderProps {
  onMenuClick: () => void;
  isSuperAdmin?: boolean;
}

const AdminHeader = ({ onMenuClick, isSuperAdmin = false }: AdminHeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2 w-64 lg:w-96">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj użytkowników, rezerwacji..."
              className="bg-transparent focus:outline-none text-sm flex-1"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Admin Badge */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            isSuperAdmin 
              ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {isSuperAdmin ? <Crown className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            {isSuperAdmin ? 'Super Admin' : 'Administrator'}
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-xl">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
              isSuperAdmin 
                ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                : 'bg-red-600'
            }`}>
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
