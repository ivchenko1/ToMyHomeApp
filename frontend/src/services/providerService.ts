/**
 * Provider Service - zarządzanie danymi usługodawców
 * Używa TYLKO Firebase Firestore
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    where,
    updateDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

// ============================================
// TYPY
// ============================================

export interface ServiceItem {
    id: string;
    name: string;
    description: string;
    duration: string;
    price: number;
    oldPrice?: number;
    discount?: number;
    badge?: string;
    category: string;
}

export interface WorkingHours {
    monday: { from: string; to: string; enabled: boolean };
    tuesday: { from: string; to: string; enabled: boolean };
    wednesday: { from: string; to: string; enabled: boolean };
    thursday: { from: string; to: string; enabled: boolean };
    friday: { from: string; to: string; enabled: boolean };
    saturday: { from: string; to: string; enabled: boolean };
    sunday: { from: string; to: string; enabled: boolean };
}

export interface ProviderLocation {
    city: string;
    district: string;
    address: string;
    postalCode: string;
    lat: number;
    lng: number;
}

export interface Provider {
    id: string;
    ownerId: string;
    name: string;
    profession: string;
    description: string;
    experience: string;
    category: string;
    location: ProviderLocation;
    locationString: string;
    travelRadius: number;
    hasTravel: boolean;
    image: string;
    portfolio: { id: string; image: string; title: string }[];
    services: ServiceItem[];
    serviceNames: string[];
    features: string[];
    priceFrom: number;
    rating: number;
    reviewsCount: number;
    completedServices: number;
    punctuality: number;
    regularClients: number;
    certifications: string[];
    workingHours: WorkingHours;
    acceptsCard: boolean;
    responseTime: string;
    isPremium: boolean;
    isVerified: boolean;
    isActive: boolean;
    isAvailableToday: boolean;
    createdAt: string;
    updatedAt: string;
    // Dane właściciela/użytkownika
    ownerEmail?: string;
    ownerUsername?: string;
    ownerPhone?: string;
    ownerAvatar?: string;
}

// ============================================
// HELPERS
// ============================================

const FIREBASE_COLLECTION = 'providers';

const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

const getDefaultWorkingHours = (): WorkingHours => ({
    monday: { from: '09:00', to: '18:00', enabled: true },
    tuesday: { from: '09:00', to: '18:00', enabled: true },
    wednesday: { from: '09:00', to: '18:00', enabled: true },
    thursday: { from: '09:00', to: '18:00', enabled: true },
    friday: { from: '09:00', to: '18:00', enabled: true },
    saturday: { from: '10:00', to: '15:00', enabled: true },
    sunday: { from: '00:00', to: '00:00', enabled: false },
});

/**
 * Normalizuje dane do formatu Provider
 */
const normalizeProvider = (data: any, id?: string): Provider => {
    const now = new Date().toISOString();
    const providerId = id || data.id?.toString() || generateId();

    // Obsługa usług
    let services: ServiceItem[] = [];
    if (data.services && Array.isArray(data.services)) {
        services = data.services.map((s: any, i: number) => ({
            id: s.id || `service-${i}`,
            name: s.name || '',
            description: s.description || '',
            duration: s.duration || '30 min',
            price: Number(s.price) || 0,
            oldPrice: s.oldPrice ? Number(s.oldPrice) : undefined,
            discount: s.discount ? Number(s.discount) : undefined,
            badge: s.badge,
            category: s.category || 'Usługi',
        }));
    }

    // Obsługa lokalizacji
    let location: ProviderLocation;
    if (data.location && typeof data.location === 'object') {
        location = {
            city: data.location.city || '',
            district: data.location.district || '',
            address: data.location.address || '',
            postalCode: data.location.postalCode || '',
            lat: Number(data.location.lat) || 52.2297,
            lng: Number(data.location.lng) || 21.0122,
        };
    } else {
        location = {
            city: '',
            district: '',
            address: '',
            postalCode: '',
            lat: 52.2297,
            lng: 21.0122,
        };
    }

    const locationString = [location.city, location.district].filter(Boolean).join(', ') || 'Nie podano';

    return {
        id: providerId,
        ownerId: data.ownerId?.toString() || '',
        name: data.name || '',
        profession: data.profession || '',
        description: data.description || '',
        experience: data.experience || '',
        category: data.category || '',
        location,
        locationString,
        travelRadius: Number(data.travelRadius) || 10,
        hasTravel: data.hasTravel ?? true,
        image: data.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop',
        portfolio: data.portfolio || [],
        services,
        serviceNames: services.map(s => s.name),
        features: data.features || [],
        priceFrom: services.length > 0 ? Math.min(...services.map(s => s.price)) : 0,
        rating: Number(data.rating) || 0,
        reviewsCount: Number(data.reviewsCount) || 0,
        completedServices: Number(data.completedServices) || 0,
        punctuality: Number(data.punctuality) || 95,
        regularClients: Number(data.regularClients) || 0,
        certifications: data.certifications || [],
        workingHours: data.workingHours || getDefaultWorkingHours(),
        acceptsCard: data.acceptsCard ?? true,
        responseTime: data.responseTime || '24h',
        isPremium: data.isPremium || false,
        isVerified: data.isVerified || false,
        isActive: data.isActive ?? true,
        isAvailableToday: data.isAvailableToday ?? true,
        createdAt: data.createdAt || now,
        updatedAt: data.updatedAt || now,
        // Dane właściciela/użytkownika
        ownerEmail: data.ownerEmail || '',
        ownerUsername: data.ownerUsername || '',
        ownerPhone: data.ownerPhone || '',
        ownerAvatar: data.ownerAvatar || '',
    };
};

// ============================================
// PUBLIC API - TYLKO FIREBASE
// ============================================

export const providerService = {
    /**
     * Pobierz wszystkich usługodawców z Firebase
     */
    async getAll(): Promise<Provider[]> {
        try {
            // Pobierz wszystkich bez filtrowania
            const snapshot = await getDocs(collection(db, FIREBASE_COLLECTION));
            console.log('Firebase getAll - znaleziono:', snapshot.docs.length);
            return snapshot.docs.map(doc => normalizeProvider({ ...doc.data(), id: doc.id }));
        } catch (error) {
            console.error('Firebase getAll error:', error);
            return [];
        }
    },

    /**
     * Pobierz usługodawcę po ID z Firebase
     */
    async getById(id: string): Promise<Provider | null> {
        try {
            const docRef = doc(db, FIREBASE_COLLECTION, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return normalizeProvider({ ...docSnap.data(), id: docSnap.id });
            }
            return null;
        } catch (error) {
            console.error('Firebase getById error:', error);
            return null;
        }
    },

    /**
     * Pobierz usługodawców po kategorii
     */
    async getByCategory(category: string): Promise<Provider[]> {
        try {
            const q = query(
                collection(db, FIREBASE_COLLECTION),
                where('category', '==', category)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => normalizeProvider({ ...doc.data(), id: doc.id }));
        } catch (error) {
            console.error('Firebase getByCategory error:', error);
            return [];
        }
    },

    /**
     * Pobierz usługodawców danego użytkownika
     */
    async getByOwner(ownerId: string): Promise<Provider[]> {
        try {
            const q = query(collection(db, FIREBASE_COLLECTION), where('ownerId', '==', ownerId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => normalizeProvider({ ...doc.data(), id: doc.id }));
        } catch (error) {
            console.error('Firebase getByOwner error:', error);
            return [];
        }
    },

    /**
     * Sprawdź czy nazwa salonu jest unikalna
     */
    async isNameUnique(name: string, excludeId?: string): Promise<boolean> {
        try {
            const normalizedName = name.trim().toLowerCase();
            const q = query(collection(db, FIREBASE_COLLECTION));
            const snapshot = await getDocs(q);
            
            for (const doc of snapshot.docs) {
                const provider = doc.data() as Provider;
                // Pomiń własny profil przy edycji
                if (excludeId && provider.id === excludeId) continue;
                
                // Porównaj znormalizowane nazwy
                if (provider.name.trim().toLowerCase() === normalizedName) {
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.error('isNameUnique error:', error);
            return true; // W razie błędu pozwól kontynuować
        }
    },

    /**
     * Sprawdź czy numer telefonu jest unikalny
     */
    async isPhoneUnique(phone: string, excludeId?: string): Promise<boolean> {
        try {
            // Wyciągnij tylko cyfry z numeru
            const normalizedPhone = phone.replace(/\D/g, '');
            if (!normalizedPhone || normalizedPhone.length < 9) return true;
            
            const q = query(collection(db, FIREBASE_COLLECTION));
            const snapshot = await getDocs(q);
            
            for (const doc of snapshot.docs) {
                const provider = doc.data() as Provider;
                // Pomiń własny profil przy edycji
                if (excludeId && provider.id === excludeId) continue;
                
                // Porównaj znormalizowane numery (tylko cyfry)
                const providerPhone = (provider.phone || '').replace(/\D/g, '');
                if (providerPhone && providerPhone.includes(normalizedPhone.slice(-9))) {
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.error('isPhoneUnique error:', error);
            return true; // W razie błędu pozwól kontynuować
        }
    },

    /**
     * Utwórz nowego usługodawcę w Firebase
     */
    async create(data: Partial<Provider>, ownerId: string): Promise<Provider> {
        // Sprawdź unikalność nazwy
        if (data.name) {
            const isUnique = await this.isNameUnique(data.name);
            if (!isUnique) {
                throw new Error('DUPLICATE_NAME');
            }
        }

        // Sprawdź unikalność telefonu
        if (data.phone) {
            const isPhoneUnique = await this.isPhoneUnique(data.phone);
            if (!isPhoneUnique) {
                throw new Error('DUPLICATE_PHONE');
            }
        }

        const id = generateId();
        const provider = normalizeProvider({ ...data, ownerId, isActive: true }, id);

        // Usuń wszystkie pola undefined - Firebase ich nie akceptuje
        const cleanProvider = JSON.parse(JSON.stringify(provider));

        try {
            console.log('Firebase create - zapisuję:', cleanProvider);
            await setDoc(doc(db, FIREBASE_COLLECTION, id), cleanProvider);
            console.log('Firebase create - zapisano pomyślnie');
            window.dispatchEvent(new CustomEvent('providerCreated', { detail: provider }));
            return provider;
        } catch (error) {
            console.error('Firebase create error:', error);
            throw error;
        }
    },

    /**
     * Zaktualizuj usługodawcę w Firebase
     */
    async update(id: string, data: Partial<Provider>): Promise<Provider | null> {
        try {
            const existing = await this.getById(id);
            if (!existing) return null;

            // Sprawdź unikalność nazwy (jeśli się zmienia)
            if (data.name && data.name !== existing.name) {
                const isUnique = await this.isNameUnique(data.name, id);
                if (!isUnique) {
                    throw new Error('DUPLICATE_NAME');
                }
            }

            // Sprawdź unikalność telefonu (jeśli się zmienia)
            if (data.phone && data.phone !== existing.phone) {
                const isPhoneUnique = await this.isPhoneUnique(data.phone, id);
                if (!isPhoneUnique) {
                    throw new Error('DUPLICATE_PHONE');
                }
            }

            const updated = normalizeProvider({ ...existing, ...data }, id);
            updated.updatedAt = new Date().toISOString();

            // Usuń wszystkie pola undefined - Firebase ich nie akceptuje
            const cleanUpdated = JSON.parse(JSON.stringify(updated));

            await updateDoc(doc(db, FIREBASE_COLLECTION, id), cleanUpdated);
            window.dispatchEvent(new CustomEvent('providerUpdated', { detail: updated }));
            return updated;
        } catch (error) {
            console.error('Firebase update error:', error);
            throw error;
        }
    },

    /**
     * Usuń usługodawcę z Firebase
     */
    async delete(id: string): Promise<boolean> {
        try {
            await deleteDoc(doc(db, FIREBASE_COLLECTION, id));
            window.dispatchEvent(new CustomEvent('providerDeleted', { detail: { id } }));
            return true;
        } catch (error) {
            console.error('Firebase delete error:', error);
            return false;
        }
    },

    /**
     * Upload zdjęcia do Firebase Storage
     */
    async uploadImage(file: File, providerId: string): Promise<string> {
        try {
            const fileName = `providers/${providerId}/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, fileName);
            await uploadBytes(storageRef, file);
            return getDownloadURL(storageRef);
        } catch (error) {
            console.error('Firebase upload error:', error);
            throw error;
        }
    },

    /**
     * Dodaj usługę do usługodawcy
     */
    async addService(providerId: string, service: Omit<ServiceItem, 'id'>): Promise<Provider | null> {
        const provider = await this.getById(providerId);
        if (!provider) return null;

        const newService = { ...service, id: generateId() };
        const updatedServices = [...provider.services, newService];

        return this.update(providerId, {
            services: updatedServices,
            serviceNames: updatedServices.map(s => s.name),
            priceFrom: Math.min(...updatedServices.map(s => s.price)),
        });
    },

    /**
     * Usuń usługę z usługodawcy
     */
    async removeService(providerId: string, serviceId: string): Promise<Provider | null> {
        const provider = await this.getById(providerId);
        if (!provider) return null;

        const updatedServices = provider.services.filter(s => s.id !== serviceId);
        return this.update(providerId, {
            services: updatedServices,
            serviceNames: updatedServices.map(s => s.name),
            priceFrom: updatedServices.length > 0 ? Math.min(...updatedServices.map(s => s.price)) : 0,
        });
    },
};

export default providerService;