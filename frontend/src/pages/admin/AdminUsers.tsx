import { useState, useEffect } from 'react';
import {
  Search,
  User,
  Shield,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  Phone,
  UserCheck,
  Crown,
} from 'lucide-react';
import adminService, { AdminUser, UserRole } from '../../services/adminService';
import { useToast, useAuth } from '../../App';
import { useAdminRole } from '../../components/admin/AdminLayout';

const AdminUsers = () => {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();
  const { role: currentUserRole, isSuperAdmin } = useAdminRole();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'client' | 'provider' | 'admin' | 'superadmin' | 'blocked'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, filterType]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      showToast('Błąd ładowania użytkowników', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.phone?.includes(query)
      );
    }

    // Type filter
    switch (filterType) {
      case 'client':
        filtered = filtered.filter((u) => u.accountType === 'client');
        break;
      case 'provider':
        filtered = filtered.filter((u) => u.accountType === 'provider');
        break;
      case 'admin':
        filtered = filtered.filter((u) => u.role === 'admin');
        break;
      case 'superadmin':
        filtered = filtered.filter((u) => u.role === 'superadmin');
        break;
      case 'blocked':
        filtered = filtered.filter((u) => u.isBlocked);
        break;
    }

    setFilteredUsers(filtered);
  };

  const canPerformAction = (targetUser: AdminUser, action: 'block' | 'delete' | 'changeRole'): boolean => {
    // Nie można wykonać akcji na sobie
    if (targetUser.id === currentUser?.id) {
      return false;
    }
    // Jeśli nie ma roli, nie można wykonać akcji
    if (!currentUserRole) {
      return false;
    }
    return adminService.canPerformActionOnUser(currentUserRole, targetUser.role, action);
  };

  const handleBlockUser = async () => {
    if (!selectedUser || !blockReason.trim()) {
      showToast('Podaj powód blokady', 'error');
      return;
    }

    if (!canPerformAction(selectedUser, 'block')) {
      showToast('Nie masz uprawnień do tej akcji', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const success = await adminService.blockUser(selectedUser.id, blockReason);
      if (success) {
        showToast('Użytkownik zablokowany', 'success');
        setShowBlockModal(false);
        setBlockReason('');
        loadUsers();
      } else {
        showToast('Błąd blokowania użytkownika', 'error');
      }
    } catch (error) {
      showToast('Błąd blokowania użytkownika', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockUser = async (user: AdminUser) => {
    if (!canPerformAction(user, 'block')) {
      showToast('Nie masz uprawnień do tej akcji', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const success = await adminService.unblockUser(user.id);
      if (success) {
        showToast('Użytkownik odblokowany', 'success');
        loadUsers();
      } else {
        showToast('Błąd odblokowywania użytkownika', 'error');
      }
    } catch (error) {
      showToast('Błąd odblokowywania użytkownika', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!canPerformAction(user, 'delete')) {
      showToast('Nie masz uprawnień do usunięcia tego użytkownika', 'error');
      return;
    }

    if (!window.confirm(`Czy na pewno chcesz usunąć użytkownika ${user.username}? Ta operacja jest nieodwracalna.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const success = await adminService.deleteUser(user.id);
      if (success) {
        showToast('Użytkownik usunięty', 'success');
        loadUsers();
      } else {
        showToast('Błąd usuwania użytkownika', 'error');
      }
    } catch (error) {
      showToast('Błąd usuwania użytkownika', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openRoleModal = (user: AdminUser) => {
    if (!canPerformAction(user, 'changeRole')) {
      showToast('Nie masz uprawnień do zmiany roli tego użytkownika', 'error');
      return;
    }
    setSelectedUser(user);
    setNewRole(user.role || 'user');
    setShowRoleModal(true);
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;

    // Sprawdź czy admin próbuje nadać rolę superadmin
    if (!isSuperAdmin && newRole === 'superadmin') {
      showToast('Tylko Super Admin może nadawać rolę Super Admin', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const success = await adminService.setUserRole(selectedUser.id, newRole);
      if (success) {
        showToast('Rola zmieniona pomyślnie', 'success');
        setShowRoleModal(false);
        loadUsers();
      } else {
        showToast('Błąd zmiany roli', 'error');
      }
    } catch (error) {
      showToast('Błąd zmiany roli', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role: UserRole | undefined) => {
    switch (role) {
      case 'superadmin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700">
            <Crown className="w-3 h-3" />
            Super Admin
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
            <Shield className="w-3 h-3" />
            Admin
          </span>
        );
      default:
        return null;
    }
  };

  const filters = [
    { value: 'all', label: 'Wszyscy', count: users.length },
    { value: 'client', label: 'Klienci', count: users.filter((u) => u.accountType === 'client').length },
    { value: 'provider', label: 'Usługodawcy', count: users.filter((u) => u.accountType === 'provider').length },
    { value: 'admin', label: 'Administratorzy', count: users.filter((u) => u.role === 'admin').length },
    { value: 'superadmin', label: 'Super Admini', count: users.filter((u) => u.role === 'superadmin').length },
    { value: 'blocked', label: 'Zablokowani', count: users.filter((u) => u.isBlocked).length },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Użytkownicy</h1>
        <p className="text-gray-500">Zarządzaj użytkownikami platformy</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj po nazwie, emailu lub telefonie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-red-500 focus:ring-0"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterType(filter.value as any)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filterType === filter.value
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Użytkownik</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Kontakt</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Typ / Rola</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Data rejestracji</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Nie znaleziono użytkowników
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
                          user.role === 'superadmin' 
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
                            : user.role === 'admin'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200'
                        }`}>
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : user.role === 'superadmin' ? (
                            <Crown className="w-5 h-5" />
                          ) : user.role === 'admin' ? (
                            <Shield className="w-5 h-5" />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.username}</p>
                          {user.businessName && (
                            <p className="text-xs text-gray-500">{user.businessName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {user.phoneCountryCode || ''} {user.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.accountType === 'provider'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.accountType === 'provider' ? 'Usługodawca' : 'Klient'}
                        </span>
                        {getRoleBadge(user.role)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                          <XCircle className="w-3 h-3" />
                          Zablokowany
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" />
                          Aktywny
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('pl-PL')
                          : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Block/Unblock */}
                        {canPerformAction(user, 'block') && (
                          user.isBlocked ? (
                            <button
                              onClick={() => handleUnblockUser(user)}
                              disabled={actionLoading}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Odblokuj"
                            >
                              <UserCheck className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowBlockModal(true);
                              }}
                              disabled={actionLoading}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Zablokuj"
                            >
                              <Ban className="w-5 h-5" />
                            </button>
                          )
                        )}

                        {/* Change Role */}
                        {canPerformAction(user, 'changeRole') && (
                          <button
                            onClick={() => openRoleModal(user)}
                            disabled={actionLoading}
                            className={`p-2 rounded-lg transition-colors ${
                              user.role === 'superadmin'
                                ? 'text-amber-600 hover:bg-amber-50'
                                : user.role === 'admin'
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            title="Zmień rolę"
                          >
                            {user.role === 'superadmin' ? (
                              <Crown className="w-5 h-5" />
                            ) : (
                              <Shield className="w-5 h-5" />
                            )}
                          </button>
                        )}

                        {/* Delete */}
                        {canPerformAction(user, 'delete') && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={actionLoading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Usuń"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}

                        {/* Show dash if no actions available */}
                        {!canPerformAction(user, 'block') && 
                         !canPerformAction(user, 'changeRole') && 
                         !canPerformAction(user, 'delete') && (
                          <span className="text-gray-400 px-2">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Block User Modal */}
      {showBlockModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Zablokuj użytkownika
            </h3>
            <p className="text-gray-600 mb-4">
              Zamierzasz zablokować użytkownika <strong>{selectedUser.username}</strong>.
              Podaj powód blokady:
            </p>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Powód blokady..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason('');
                }}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleBlockUser}
                disabled={actionLoading || !blockReason.trim()}
                className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Blokowanie...' : 'Zablokuj'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Zmień rolę użytkownika
            </h3>
            <p className="text-gray-600 mb-4">
              Zmień rolę użytkownika <strong>{selectedUser.username}</strong>:
            </p>
            <div className="space-y-2 mb-6">
              <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors ${
                newRole === 'user' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={newRole === 'user'}
                  onChange={() => setNewRole('user')}
                  className="sr-only"
                />
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Użytkownik</p>
                  <p className="text-xs text-gray-500">Standardowe uprawnienia</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors ${
                newRole === 'admin' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={newRole === 'admin'}
                  onChange={() => setNewRole('admin')}
                  className="sr-only"
                />
                <Shield className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium">Administrator</p>
                  <p className="text-xs text-gray-500">Zarządzanie platformą</p>
                </div>
              </label>

              {isSuperAdmin && (
                <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors ${
                  newRole === 'superadmin' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="superadmin"
                    checked={newRole === 'superadmin'}
                    onChange={() => setNewRole('superadmin')}
                    className="sr-only"
                  />
                  <Crown className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="font-medium">Super Admin</p>
                    <p className="text-xs text-gray-500">Pełna kontrola nad platformą</p>
                  </div>
                </label>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleChangeRole}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Zapisywanie...' : 'Zapisz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
