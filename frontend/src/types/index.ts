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

export interface Service {
  id: string;
  name: string;
  icon: string;
  price: number;
  slug: string;
}

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

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

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