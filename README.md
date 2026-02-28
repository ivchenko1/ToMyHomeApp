# ToMyHomeApp

Platforma do rezerwacji usług beauty i wellness z dojazdem do klienta.

## 🏗️ Struktura projektu

```
ToMyHomeApp/
├── frontend/                 # React + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Komponenty współdzielone
│   │   │   ├── business/     # Komponenty panelu biznesowego
│   │   │   │   ├── BusinessHeader.tsx
│   │   │   │   ├── BusinessSidebar.tsx
│   │   │   │   └── BusinessLayout.tsx
│   │   │   ├── Header.tsx    # Header dla klientów
│   │   │   ├── Footer.tsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── business/     # Strony panelu biznesowego
│   │   │   │   ├── BusinessDashboard.tsx
│   │   │   │   ├── BusinessServices.tsx
│   │   │   │   └── BusinessAddService.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProvidersPage.tsx
│   │   │   ├── ProviderDetailPage.tsx
│   │   │   └── ...
│   │   └── App.tsx
│   └── .env.example          # Zmienne środowiskowe
└── backend/                  # .NET Core API
    └── ToMyHomeApi/
```

## 🚀 Uruchomienie

### FireBase

```bash
npm install firebase
npm install -g firebase-tools
npm install firebase react-router-dom lucide-react
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend dostępny na: http://localhost:3000

### Backend (.NET)

```bash
cd backend/ToMyHomeApi
dotnet restore
dotnet run --urls "http://localhost:5000"
```

API dostępne na: http://localhost:5000

## 📱 Dwa panele

### Panel Klienta (/)
- Strona główna
- Lista usługodawców
- Profil usługodawcy z rezerwacją
- Wyszukiwanie i filtrowanie

### Panel Biznes (/biznes)
- Dashboard z statystykami
- Zarządzanie usługami
- Dodawanie nowych usług
- Kalendarz rezerwacji
- Wiadomości

## 🗺️ Google Maps API

Aby włączyć mapy:

1. Uzyskaj klucz API: https://console.cloud.google.com/google/maps-apis
2. Włącz API:
   - Maps JavaScript API
   - Places API
   - Geocoding API
3. Skopiuj `.env.example` do `.env`:
   ```bash
   cp .env.example .env
   ```
4. Dodaj klucz:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

## 📋 Endpointy API

### Providers
- `GET /api/providers` - lista usługodawców
- `GET /api/providers/{id}` - szczegóły usługodawcy
- `POST /api/providers` - utwórz profil (wymaga auth)
- `GET /api/providers/my` - mój profil (wymaga auth)
- `PUT /api/providers/my` - aktualizuj profil (wymaga auth)
- `DELETE /api/providers/my` - usuń profil (wymaga auth)

### Services
- `POST /api/providers/my/services` - dodaj usługę
- `PUT /api/providers/my/services/{id}` - edytuj usługę
- `DELETE /api/providers/my/services/{id}` - usuń usługę

### Auth
- `POST /api/auth/register` - rejestracja
- `POST /api/auth/login` - logowanie

### Bookings
- `POST /api/bookings` - utwórz rezerwację
- `GET /api/bookings/my` - moje rezerwacje

## 🎨 Stylizacja

- **Panel Klienta**: gradient fioletowo-różowy (primary → secondary)
- **Panel Biznes**: gradient zielony (emerald → teal)

## 📝 Tryb Demo

Gdy backend nie jest uruchomiony, aplikacja działa w trybie demo:
- Dane zapisywane są w localStorage
- Dodane usługi są widoczne natychmiast
- Można testować pełną funkcjonalność

## 🔧 Technologie

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: .NET 8, Entity Framework Core, SQLite
- **Mapy**: Google Maps JavaScript API
