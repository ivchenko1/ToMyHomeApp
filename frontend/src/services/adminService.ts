/**
 * Admin Service - zarządzanie użytkownikami, providerami i statystykami
 * Tylko dla administratorów
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================
// TYPY
// ============================================

export type UserRole = 'user' | 'admin' | 'superadmin';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  phoneCountryCode?: string;
  avatar?: string;
  accountType: 'client' | 'provider';
  role?: UserRole;
  businessName?: string;
  isBlocked?: boolean;
  blockedAt?: string;
  blockedReason?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AdminProvider {
  id: string;
  ownerId: string;
  name: string;
  profession: string;
  category: string;
  locationString: string;
  image: string;
  isVerified: boolean;
  isActive: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  rating: number;
  reviewsCount: number;
  completedBookings: number;
}

export interface AdminBooking {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  providerId: string;
  providerName: string;
  services: { name: string; price: number }[];
  date: string;
  time: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalProviders: number;
  totalBookings: number;
  pendingVerifications: number;
  activeProviders: number;
  blockedUsers: number;
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  totalRevenue: number;
  totalAdmins: number;
  totalSuperAdmins: number;
}

// ============================================
// FUNKCJE POMOCNICZE
// ============================================

const USERS_COLLECTION = 'users';
const PROVIDERS_COLLECTION = 'providers';
const BOOKINGS_COLLECTION = 'bookings';

// ============================================
// SPRAWDZANIE UPRAWNIEŃ
// ============================================

export const getUserRole = async (userId: string): Promise<UserRole> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role || 'user';
    }
    return 'user';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'user';
  }
};

export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId);
  return role === 'admin' || role === 'superadmin';
};

export const checkIsSuperAdmin = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId);
  return role === 'superadmin';
};

// ============================================
// STATYSTYKI PLATFORMY
// ============================================

export const getPlatformStats = async (): Promise<PlatformStats> => {
  try {
    // Pobierz wszystkich użytkowników
    const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    
    // Pobierz wszystkich providerów
    const providersSnapshot = await getDocs(collection(db, PROVIDERS_COLLECTION));
    const providers = providersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Pobierz wszystkie rezerwacje
    const bookingsSnapshot = await getDocs(collection(db, BOOKINGS_COLLECTION));
    const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    
    // Oblicz statystyki
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const todayBookings = bookings.filter(b => b.createdAt >= todayStart).length;
    const weekBookings = bookings.filter(b => b.createdAt >= weekAgo).length;
    const monthBookings = bookings.filter(b => b.createdAt >= monthAgo).length;
    
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    return {
      totalUsers: users.length,
      totalProviders: providers.length,
      totalBookings: bookings.length,
      pendingVerifications: providers.filter((p: any) => !p.isVerified && !p.rejectedAt).length,
      activeProviders: providers.filter((p: any) => p.isVerified && p.isActive !== false).length,
      blockedUsers: users.filter((u: any) => u.isBlocked).length,
      todayBookings,
      weekBookings,
      monthBookings,
      totalRevenue,
      totalAdmins: users.filter((u: any) => u.role === 'admin').length,
      totalSuperAdmins: users.filter((u: any) => u.role === 'superadmin').length,
    };
  } catch (error) {
    console.error('Error getting platform stats:', error);
    return {
      totalUsers: 0,
      totalProviders: 0,
      totalBookings: 0,
      pendingVerifications: 0,
      activeProviders: 0,
      blockedUsers: 0,
      todayBookings: 0,
      weekBookings: 0,
      monthBookings: 0,
      totalRevenue: 0,
      totalAdmins: 0,
      totalSuperAdmins: 0,
    };
  }
};

// ============================================
// ZARZĄDZANIE UŻYTKOWNIKAMI
// ============================================

export const getAllUsers = async (): Promise<AdminUser[]> => {
  try {
    const snapshot = await getDocs(collection(db, USERS_COLLECTION));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AdminUser[];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

export const getUserById = async (userId: string): Promise<AdminUser | null> => {
  try {
    const docSnap = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as AdminUser;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const updateUser = async (userId: string, data: Partial<AdminUser>): Promise<boolean> => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
};

// Sprawdź czy można wykonać akcję na użytkowniku
export const canPerformActionOnUser = (
  actorRole: UserRole,
  targetRole: UserRole | undefined,
  action: 'block' | 'delete' | 'changeRole'
): boolean => {
  const targetRoleNormalized = targetRole || 'user';
  
  // Super admin może wszystko
  if (actorRole === 'superadmin') {
    return true;
  }
  
  // Admin nie może nic robić z superadminami
  if (targetRoleNormalized === 'superadmin') {
    return false;
  }
  
  // Admin nie może zmieniać roli ani usuwać innych adminów
  if (actorRole === 'admin' && targetRoleNormalized === 'admin') {
    if (action === 'changeRole' || action === 'delete') {
      return false;
    }
  }
  
  // Admin może nadawać rolę admin tylko zwykłym użytkownikom (nie superadmin)
  if (actorRole === 'admin' && action === 'changeRole') {
    return targetRoleNormalized === 'user' || targetRoleNormalized === 'admin';
  }
  
  return true;
};

export const blockUser = async (userId: string, reason: string): Promise<boolean> => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      isBlocked: true,
      blockedAt: new Date().toISOString(),
      blockedReason: reason,
    });
    return true;
  } catch (error) {
    console.error('Error blocking user:', error);
    return false;
  }
};

export const unblockUser = async (userId: string): Promise<boolean> => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      isBlocked: false,
      blockedAt: null,
      blockedReason: null,
    });
    return true;
  } catch (error) {
    console.error('Error unblocking user:', error);
    return false;
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

export const setUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), { role });
    return true;
  } catch (error) {
    console.error('Error setting user role:', error);
    return false;
  }
};

// ============================================
// ZARZĄDZANIE PROVIDERAMI
// ============================================

export const getAllProviders = async (): Promise<AdminProvider[]> => {
  try {
    const snapshot = await getDocs(collection(db, PROVIDERS_COLLECTION));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AdminProvider[];
  } catch (error) {
    console.error('Error getting providers:', error);
    return [];
  }
};

export const getPendingProviders = async (): Promise<AdminProvider[]> => {
  try {
    const q = query(
      collection(db, PROVIDERS_COLLECTION),
      where('isVerified', '==', false)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }) as AdminProvider)
      .filter(p => !p.rejectedAt);
  } catch (error) {
    console.error('Error getting pending providers:', error);
    return [];
  }
};

export const verifyProvider = async (providerId: string, adminId: string): Promise<boolean> => {
  try {
    await updateDoc(doc(db, PROVIDERS_COLLECTION, providerId), {
      isVerified: true,
      isActive: true,
      verifiedAt: new Date().toISOString(),
      verifiedBy: adminId,
    });
    return true;
  } catch (error) {
    console.error('Error verifying provider:', error);
    return false;
  }
};

export const rejectProvider = async (providerId: string, reason: string): Promise<boolean> => {
  try {
    await updateDoc(doc(db, PROVIDERS_COLLECTION, providerId), {
      isVerified: false,
      rejectedAt: new Date().toISOString(),
      rejectedReason: reason,
    });
    return true;
  } catch (error) {
    console.error('Error rejecting provider:', error);
    return false;
  }
};

export const suspendProvider = async (providerId: string, reason: string): Promise<boolean> => {
  try {
    await updateDoc(doc(db, PROVIDERS_COLLECTION, providerId), {
      isActive: false,
      suspendedAt: new Date().toISOString(),
      suspendedReason: reason,
    });
    return true;
  } catch (error) {
    console.error('Error suspending provider:', error);
    return false;
  }
};

export const activateProvider = async (providerId: string): Promise<boolean> => {
  try {
    await updateDoc(doc(db, PROVIDERS_COLLECTION, providerId), {
      isActive: true,
      suspendedAt: null,
      suspendedReason: null,
    });
    return true;
  } catch (error) {
    console.error('Error activating provider:', error);
    return false;
  }
};

export const deleteProvider = async (providerId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, PROVIDERS_COLLECTION, providerId));
    return true;
  } catch (error) {
    console.error('Error deleting provider:', error);
    return false;
  }
};

// ============================================
// ZARZĄDZANIE REZERWACJAMI
// ============================================

export const getAllBookings = async (): Promise<AdminBooking[]> => {
  try {
    const snapshot = await getDocs(collection(db, BOOKINGS_COLLECTION));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AdminBooking[];
  } catch (error) {
    console.error('Error getting bookings:', error);
    return [];
  }
};

export const getRecentBookings = async (limitCount: number = 20): Promise<AdminBooking[]> => {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AdminBooking[];
  } catch (error) {
    console.error('Error getting recent bookings:', error);
    return [];
  }
};

export const updateBookingStatus = async (
  bookingId: string, 
  status: AdminBooking['status'],
  reason?: string
): Promise<boolean> => {
  try {
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
    };
    
    if (status === 'cancelled' && reason) {
      updateData.cancelledAt = new Date().toISOString();
      updateData.cancelledBy = 'admin';
      updateData.cancelReason = reason;
    }
    
    await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), updateData);
    return true;
  } catch (error) {
    console.error('Error updating booking status:', error);
    return false;
  }
};

// ============================================
// EXPORT
// ============================================

const adminService = {
  getUserRole,
  checkIsAdmin,
  checkIsSuperAdmin,
  canPerformActionOnUser,
  getPlatformStats,
  getAllUsers,
  getUserById,
  updateUser,
  blockUser,
  unblockUser,
  deleteUser,
  setUserRole,
  getAllProviders,
  getPendingProviders,
  verifyProvider,
  rejectProvider,
  suspendProvider,
  activateProvider,
  deleteProvider,
  getAllBookings,
  getRecentBookings,
  updateBookingStatus,
};

export default adminService;
