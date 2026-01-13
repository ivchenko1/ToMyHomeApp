import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  Clock,
  Star,
} from 'lucide-react';
import { useAuth } from '../../App';
import messageService from '../../services/messageService';

interface BusinessSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const BusinessSidebar = ({ isOpen = true, onClose }: BusinessSidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Subskrybuj nieprzeczytane wiadomości
  useEffect(() => {
    if (!user?.id) {
      setUnreadMessages(0);
      return;
    }
    
    const unsubscribe = messageService.subscribeToUnreadCount(
      user.id,
      (count) => {
        setUnreadMessages(count);
      }
    );
    
    return () => unsubscribe();
  }, [user?.id]);

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      to: '/biznes',
      exact: true
    },
    { 
      icon: Briefcase, 
      label: 'Moje usługi', 
      to: '/biznes/uslugi' 
    },
    { 
      icon: PlusCircle, 
      label: 'Dodaj usługę', 
      to: '/biznes/dodaj-usluge' 
    },
    { 
      icon: Clock, 
      label: 'Godziny pracy', 
      to: '/biznes/godziny-pracy' 
    },
    { 
      icon: Calendar, 
      label: 'Kalendarz', 
      to: '/biznes/kalendarz' 
    },
    { 
      icon: MessageSquare, 
      label: 'Wiadomości', 
      to: '/biznes/wiadomosci',
      hasBadge: true
    },
    { 
      icon: Star, 
      label: 'Opinie', 
      to: '/biznes/opinie' 
    },
    { 
      icon: BarChart3, 
      label: 'Statystyki', 
      to: '/biznes/statystyki' 
    },
  ];

  const bottomItems = [
    { icon: Settings, label: 'Ustawienia', to: '/biznes/ustawienia' },
    { icon: HelpCircle, label: 'Pomoc', to: '/biznes/pomoc' },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-16 left-0 z-40
          w-64 h-[calc(100vh-64px)] bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Main Menu */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <div className="mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
                Menu główne
              </span>
            </div>
            
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${isActive(item.to, item.exact)
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.hasBadge && unreadMessages > 0 && (
                  <span className={`
                    w-2.5 h-2.5 rounded-full
                    ${isActive(item.to, item.exact) 
                      ? 'bg-white' 
                      : 'bg-red-500'}
                  `} />
                )}
              </Link>
            ))}
          </nav>

          {/* Bottom Menu */}
          <div className="p-4 border-t border-gray-100">
            {bottomItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${isActive(item.to)
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Pro Banner */}
          <div className="p-4">
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white">
              <h4 className="font-bold mb-1">Przejdź na PRO</h4>
              <p className="text-xs text-white/80 mb-3">
                Odblokuj wszystkie funkcje i zwiększ widoczność
              </p>
              <button className="w-full py-2 bg-white text-emerald-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                Sprawdź ofertę
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default BusinessSidebar;
