// User types
export interface User {
  id: string; 
  username: string;
  email: string;
  phone: string;
  avatar?: string;
  createdAt?: string;
  accountType?: 'client' | 'provider';
  businessName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  phone: string;
  password: string;
  accountType?: 'client' | 'provider';
  businessName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Service types
export interface Service {
  id: string;
  name: string;
  icon: string;
  price: number;
  slug: string;
}

// Provider types
export interface Provider {
  id: number;
  name: string;
  profession: string;
  rating: number;
  reviewsCount: number;
  location: string;
  distance: string;
  description: string;
  services: string[];
  features: string[];
  priceFrom: number;
  image: string;
  isPremium?: boolean;
  isAvailableToday?: boolean;
}

// Review types
export interface Review {
  id: number;
  author: string;
  avatar: string;
  service: string;
  date: string;
  rating: number;
  content: string;
  helpful: number;
}

// Toast types
export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Filter types
export interface ProviderFilters {
  location: string;
  specialization: string;
  rating: string;
  priceFrom: number;
  priceTo: number;
  availableToday: boolean;
  withTravel: boolean;
  recommended: boolean;
}

// Firebase error type for better error handling
export interface FirebaseAuthError extends Error {
  code: string;
  message: string;
}

// Local provider type for localStorage data
export interface LocalProvider {
  id: number;
  ownerId?: string;
  name: string;
  profession?: string;
  category?: string;
  description?: string;
  location?: string;
  locationData?: {
    city: string;
    district: string;
    address: string;
    postalCode: string;
    lat: number;
    lng: number;
  };
  services?: string[];
  servicesData?: ServiceData[];
  features?: string[];
  priceFrom?: number;
  image?: string;
  isPremium?: boolean;
  isAvailableToday?: boolean;
  rating?: number;
  reviewsCount?: number;
  distance?: string;
  workingHours?: Record<string, { from: string; to: string; enabled: boolean }>;
  travelRadius?: number;
  experience?: string;
  createdAt?: string;
}

// Service data for local storage
export interface ServiceData {
  id?: string;
  name: string;
  price: number;
  duration: string;
  description?: string;
  isActive?: boolean;
  category?: string;
}

// Notification data type
export interface NotificationData {
  bookingId?: string;
  messageId?: string;
  providerId?: number;
  [key: string]: string | number | boolean | undefined;
}