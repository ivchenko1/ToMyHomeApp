import axios from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse, User, Provider } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth service
export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      // For demo, simulate successful login
      const mockUser: User = {
        id: 1,
        username: email.split('@')[0],
        email: email,
        phone: '+48 123 456 789',
      };
      return {
        user: mockUser,
        token: 'mock-jwt-token-' + Date.now(),
      };
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      // For demo, simulate successful registration
      const mockUser: User = {
        id: Date.now(),
        username: data.username,
        email: data.email,
        phone: data.phone,
        accountType: data.accountType || 'client',
        businessName: data.businessName,
      };
      return {
        user: mockUser,
        token: 'mock-jwt-token-' + Date.now(),
      };
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Logout locally even if API fails
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  },
};

// Providers service
export const providersService = {
  async getProviders(params?: {
    category?: string;
    location?: string;
    minRating?: number;
  }): Promise<Provider[]> {
    try {
      const response = await api.get<Provider[]>('/providers', { params });
      return response.data;
    } catch (error) {
      // Return local providers if API fails
      const localProviders = JSON.parse(localStorage.getItem('localProviders') || '[]');
      return localProviders;
    }
  },

  async getProviderById(id: number): Promise<Provider | null> {
    try {
      const response = await api.get<Provider>(`/providers/${id}`);
      return response.data;
    } catch (error) {
      // Check local providers
      const localProviders = JSON.parse(localStorage.getItem('localProviders') || '[]');
      return localProviders.find((p: Provider) => p.id === id) || null;
    }
  },

  async createProvider(data: CreateProviderRequest): Promise<Provider> {
    try {
      const response = await api.post<Provider>('/providers', data);
      return response.data;
    } catch (error) {
      // Save locally if API fails
      const localProviders = JSON.parse(localStorage.getItem('localProviders') || '[]');
      const newProvider: Provider = {
        id: Date.now(),
        name: data.businessName,
        profession: data.profession,
        rating: 0,
        reviewsCount: 0,
        location: `${data.location.city}, ${data.location.district}`,
        distance: '0 km',
        description: data.description,
        services: data.services.map(s => s.name),
        features: data.features,
        priceFrom: Math.min(...data.services.map(s => s.price)),
        image: data.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop',
        isPremium: false,
        isAvailableToday: true,
      };
      localProviders.push(newProvider);
      localStorage.setItem('localProviders', JSON.stringify(localProviders));
      return newProvider;
    }
  },

  async getMyProvider(): Promise<Provider | null> {
    try {
      const response = await api.get<Provider>('/providers/my');
      return response.data;
    } catch (error) {
      // Check local providers for current user
      const localProviders = JSON.parse(localStorage.getItem('localProviders') || '[]');
      return localProviders.length > 0 ? localProviders[localProviders.length - 1] : null;
    }
  },

  async updateMyProvider(data: UpdateProviderRequest): Promise<Provider | null> {
    try {
      const response = await api.put<Provider>('/providers/my', data);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  async deleteMyProvider(): Promise<boolean> {
    try {
      await api.delete('/providers/my');
      return true;
    } catch (error) {
      return false;
    }
  },

  async addService(service: ServiceItemDto): Promise<boolean> {
    try {
      await api.post('/providers/my/services', service);
      return true;
    } catch (error) {
      return false;
    }
  },

  async updateService(serviceId: string, service: ServiceItemDto): Promise<boolean> {
    try {
      await api.put(`/providers/my/services/${serviceId}`, service);
      return true;
    } catch (error) {
      return false;
    }
  },

  async deleteService(serviceId: string): Promise<boolean> {
    try {
      await api.delete(`/providers/my/services/${serviceId}`);
      return true;
    } catch (error) {
      return false;
    }
  },
};

// Types for provider requests
export interface CreateProviderRequest {
  businessName: string;
  profession: string;
  category: string;
  description: string;
  experience: string;
  location: {
    city: string;
    district: string;
    address: string;
    postalCode: string;
  };
  services: ServiceItemDto[];
  features: string[];
  image?: string;
  workingHours?: WorkingHoursDto;
}

export interface UpdateProviderRequest {
  businessName?: string;
  profession?: string;
  description?: string;
  location?: string;
  image?: string;
  isActive?: boolean;
  services?: ServiceItemDto[];
  features?: string[];
}

export interface ServiceItemDto {
  id?: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  isActive?: boolean;
}

export interface WorkingHoursDto {
  monday: DayHoursDto;
  tuesday: DayHoursDto;
  wednesday: DayHoursDto;
  thursday: DayHoursDto;
  friday: DayHoursDto;
  saturday: DayHoursDto;
  sunday: DayHoursDto;
}

export interface DayHoursDto {
  from: string;
  to: string;
  enabled: boolean;
}

// Services service
export const servicesService = {
  async getServices() {
    try {
      const response = await api.get('/services');
      return response.data;
    } catch (error) {
      return [];
    }
  },
};

// Bookings service
export const bookingsService = {
  async createBooking(data: {
    providerId: number;
    serviceId: string;
    date: string;
    time: string;
    address: string;
  }) {
    try {
      const response = await api.post('/bookings', data);
      return response.data;
    } catch (error) {
      throw new Error('Błąd podczas tworzenia rezerwacji');
    }
  },

  async getUserBookings() {
    try {
      const response = await api.get('/bookings/my');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  async cancelBooking(id: number) {
    try {
      await api.delete(`/bookings/${id}`);
    } catch (error) {
      throw new Error('Błąd podczas anulowania rezerwacji');
    }
  },
};

export default api;
