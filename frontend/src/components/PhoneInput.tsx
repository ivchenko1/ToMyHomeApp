import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const countries = [
  { code: '+48', flag: '🇵🇱', name: 'Polska', minDigits: 9, maxDigits: 9 },
  { code: '+49', flag: '🇩🇪', name: 'Niemcy', minDigits: 10, maxDigits: 11 },
  { code: '+33', flag: '🇫🇷', name: 'Francja', minDigits: 9, maxDigits: 9 },
  { code: '+34', flag: '🇪🇸', name: 'Hiszpania', minDigits: 9, maxDigits: 9 },
  { code: '+39', flag: '🇮🇹', name: 'Włochy', minDigits: 9, maxDigits: 10 },
  { code: '+44', flag: '🇬🇧', name: 'Wielka Brytania', minDigits: 10, maxDigits: 10 },
  { code: '+31', flag: '🇳🇱', name: 'Holandia', minDigits: 9, maxDigits: 9 },
  { code: '+32', flag: '🇧🇪', name: 'Belgia', minDigits: 8, maxDigits: 9 },
  { code: '+420', flag: '🇨🇿', name: 'Czechy', minDigits: 9, maxDigits: 9 },
  { code: '+421', flag: '🇸🇰', name: 'Słowacja', minDigits: 9, maxDigits: 9 },
  { code: '+43', flag: '🇦🇹', name: 'Austria', minDigits: 10, maxDigits: 13 },
  { code: '+41', flag: '🇨🇭', name: 'Szwajcaria', minDigits: 9, maxDigits: 9 },
  { code: '+351', flag: '🇵🇹', name: 'Portugalia', minDigits: 9, maxDigits: 9 },
  { code: '+353', flag: '🇮🇪', name: 'Irlandia', minDigits: 9, maxDigits: 9 },
  { code: '+352', flag: '🇱🇺', name: 'Luksemburg', minDigits: 8, maxDigits: 9 },
  { code: '+45', flag: '🇩🇰', name: 'Dania', minDigits: 8, maxDigits: 8 },
  { code: '+46', flag: '🇸🇪', name: 'Szwecja', minDigits: 9, maxDigits: 9 },
  { code: '+47', flag: '🇳🇴', name: 'Norwegia', minDigits: 8, maxDigits: 8 },
  { code: '+358', flag: '🇫🇮', name: 'Finlandia', minDigits: 9, maxDigits: 10 },
  { code: '+354', flag: '🇮🇸', name: 'Islandia', minDigits: 7, maxDigits: 7 },
  { code: '+30', flag: '🇬🇷', name: 'Grecja', minDigits: 10, maxDigits: 10 },
  { code: '+356', flag: '🇲🇹', name: 'Malta', minDigits: 8, maxDigits: 8 },
  { code: '+357', flag: '🇨🇾', name: 'Cypr', minDigits: 8, maxDigits: 8 },
  { code: '+36', flag: '🇭🇺', name: 'Węgry', minDigits: 9, maxDigits: 9 },
  { code: '+40', flag: '🇷🇴', name: 'Rumunia', minDigits: 9, maxDigits: 9 },
  { code: '+359', flag: '🇧🇬', name: 'Bułgaria', minDigits: 9, maxDigits: 9 },
  { code: '+385', flag: '🇭🇷', name: 'Chorwacja', minDigits: 9, maxDigits: 9 },
  { code: '+386', flag: '🇸🇮', name: 'Słowenia', minDigits: 8, maxDigits: 8 },
  { code: '+381', flag: '🇷🇸', name: 'Serbia', minDigits: 9, maxDigits: 9 },
  { code: '+382', flag: '🇲🇪', name: 'Czarnogóra', minDigits: 8, maxDigits: 8 },
  { code: '+383', flag: '🇽🇰', name: 'Kosowo', minDigits: 8, maxDigits: 8 },
  { code: '+389', flag: '🇲🇰', name: 'Macedonia Płn.', minDigits: 8, maxDigits: 8 },
  { code: '+380', flag: '🇺🇦', name: 'Ukraina', minDigits: 9, maxDigits: 9 },
  { code: '+375', flag: '🇧🇾', name: 'Białoruś', minDigits: 9, maxDigits: 9 },
  { code: '+7', flag: '🇷🇺', name: 'Rosja', minDigits: 10, maxDigits: 10 },
];

export const getCountryByCode = (code: string) => {
  return countries.find(c => c.code === code) || countries[0];
};

export const validatePhoneNumber = (countryCode: string, phoneNumber: string): { valid: boolean; message: string } => {
  const country = getCountryByCode(countryCode);
  const digits = phoneNumber.replace(/\D/g, '');
  
  if (!digits) {
    return { valid: false, message: 'Numer telefonu jest wymagany' };
  }
  
  if (digits.length < country.minDigits) {
    return { valid: false, message: `Numer dla ${country.name} musi mieć min. ${country.minDigits} cyfr` };
  }
  
  if (digits.length > country.maxDigits) {
    return { valid: false, message: `Numer dla ${country.name} może mieć max. ${country.maxDigits} cyfr` };
  }
  
  return { valid: true, message: '' };
};

interface PhoneInputProps {
  value: string;
  countryCode: string;
  onChange: (phone: string, countryCode: string) => void;
  className?: string;
  error?: string;
}

const PhoneInput = ({ value, countryCode, onChange, className = '', error }: PhoneInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const selectedCountry = getCountryByCode(countryCode);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.includes(searchQuery)
  );

  const handleCountrySelect = (country: typeof countries[0]) => {
    onChange(value, country.code);
    setIsOpen(false);
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^\d\s]/g, '');
    onChange(newValue, countryCode);
  };

  const getPlaceholder = () => {
    const digits = selectedCountry.minDigits === selectedCountry.maxDigits 
      ? selectedCountry.minDigits 
      : `${selectedCountry.minDigits}-${selectedCountry.maxDigits}`;
    return `${digits} cyfr`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className={`flex rounded-xl border-2 ${error ? 'border-red-300' : 'border-gray-200'} focus-within:border-primary overflow-hidden`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-3 py-3 bg-gray-50 hover:bg-gray-100 border-r border-gray-200 transition-colors min-w-[100px]"
        >
          <span className="text-xl">{selectedCountry.flag}</span>
          <span className="text-sm font-medium text-gray-700">{selectedCountry.code}</span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <input
          ref={inputRef}
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          placeholder={getPlaceholder()}
          maxLength={selectedCountry.maxDigits + 3} 
          className="flex-1 px-4 py-3 focus:outline-none"
        />
      </div>

      <p className="text-xs text-gray-500 mt-1">
        {selectedCountry.name}: {selectedCountry.minDigits === selectedCountry.maxDigits 
          ? `${selectedCountry.minDigits} cyfr` 
          : `${selectedCountry.minDigits}-${selectedCountry.maxDigits} cyfr`}
      </p>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-primary/30 rounded-xl shadow-2xl max-h-80 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj kraju..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          <div className="overflow-y-auto max-h-60">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleCountrySelect(country)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors text-left ${
                  country.code === countryCode ? 'bg-primary/5' : ''
                }`}
              >
                <span className="text-2xl">{country.flag}</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{country.name}</div>
                  <div className="text-xs text-gray-500">{country.code}</div>
                </div>
                {country.code === countryCode && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneInput;