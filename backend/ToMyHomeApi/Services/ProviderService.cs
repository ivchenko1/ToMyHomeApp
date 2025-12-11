using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ToMyHomeApi.Data;
using ToMyHomeApi.Models;

namespace ToMyHomeApi.Services;

public interface IProviderService
{
    Task<List<ProviderDto>> GetProviders(string? category = null, string? location = null, decimal? minRating = null);
    Task<ProviderDto?> GetProviderById(int id);
    Task<List<ServiceCategoryDto>> GetCategories();
    Task<ProviderDto?> CreateProvider(int userId, CreateProviderRequest request);
    Task<ProviderDto?> GetProviderByOwnerId(int userId);
    Task<ProviderDto?> UpdateProvider(int userId, UpdateProviderRequest request);
    Task<bool> DeleteProvider(int userId);
    Task<bool> AddService(int userId, ServiceItemDto service);
    Task<bool> UpdateService(int userId, string serviceId, ServiceItemDto service);
    Task<bool> DeleteService(int userId, string serviceId);
}

public class ProviderService : IProviderService
{
    private readonly ApplicationDbContext _context;

    public ProviderService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProviderDto>> GetProviders(string? category = null, string? location = null, decimal? minRating = null)
    {
        var query = _context.Providers
            .Include(p => p.Category)
            .Where(p => p.OwnerId == null || p.IsAvailableToday) // Tylko aktywni
            .AsQueryable();

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(p => p.Category.Slug == category.ToLower());
        }

        if (!string.IsNullOrEmpty(location))
        {
            query = query.Where(p => p.Location.ToLower().Contains(location.ToLower()));
        }

        if (minRating.HasValue)
        {
            query = query.Where(p => p.Rating >= minRating.Value);
        }

        var providers = await query.OrderByDescending(p => p.Rating).ToListAsync();

        return providers.Select(MapToDto).ToList();
    }

    public async Task<ProviderDto?> GetProviderById(int id)
    {
        var provider = await _context.Providers
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        return provider != null ? MapToDto(provider) : null;
    }

    public async Task<List<ServiceCategoryDto>> GetCategories()
    {
        var categories = await _context.ServiceCategories.ToListAsync();

        return categories.Select(c => new ServiceCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Icon = c.Icon,
            Slug = c.Slug,
            PriceFrom = c.PriceFrom
        }).ToList();
    }

    public async Task<ProviderDto?> CreateProvider(int userId, CreateProviderRequest request)
    {
        // Sprawdź czy użytkownik już ma profil
        var existingProvider = await _context.Providers.FirstOrDefaultAsync(p => p.OwnerId == userId);
        if (existingProvider != null)
        {
            return null; // Użytkownik już ma profil
        }

        // Znajdź kategorię
        var category = await _context.ServiceCategories
            .FirstOrDefaultAsync(c => c.Slug == request.Category.ToLower());

        if (category == null)
        {
            // Domyślna kategoria "inne"
            category = await _context.ServiceCategories.FirstOrDefaultAsync(c => c.Slug == "inne")
                       ?? await _context.ServiceCategories.FirstAsync();
        }

        // Przygotuj lokalizację
        var locationString = $"{request.Location.City}";
        if (!string.IsNullOrEmpty(request.Location.District))
            locationString += $", {request.Location.District}";
        if (!string.IsNullOrEmpty(request.Location.Address))
            locationString += $", {request.Location.Address}";

        // Znajdź minimalną cenę usług
        var minPrice = request.Services.Any() 
            ? request.Services.Min(s => s.Price) 
            : category.PriceFrom;

        var provider = new Provider
        {
            OwnerId = userId,
            Name = request.BusinessName,
            Profession = request.Profession,
            Description = request.Description,
            Location = locationString,
            PriceFrom = minPrice,
            Image = request.Image,
            CategoryId = category.Id,
            IsPremium = false,
            IsAvailableToday = true,
            Rating = 0,
            ReviewsCount = 0,
            ServicesJson = JsonSerializer.Serialize(request.Services),
            FeaturesJson = JsonSerializer.Serialize(request.Features),
            CreatedAt = DateTime.UtcNow
        };

        _context.Providers.Add(provider);
        await _context.SaveChangesAsync();

        return MapToDto(provider);
    }

    public async Task<ProviderDto?> GetProviderByOwnerId(int userId)
    {
        var provider = await _context.Providers
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.OwnerId == userId);

        return provider != null ? MapToDto(provider) : null;
    }

    public async Task<ProviderDto?> UpdateProvider(int userId, UpdateProviderRequest request)
    {
        var provider = await _context.Providers
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.OwnerId == userId);

        if (provider == null)
            return null;

        if (!string.IsNullOrEmpty(request.BusinessName))
            provider.Name = request.BusinessName;
        if (!string.IsNullOrEmpty(request.Profession))
            provider.Profession = request.Profession;
        if (!string.IsNullOrEmpty(request.Description))
            provider.Description = request.Description;
        if (!string.IsNullOrEmpty(request.Location))
            provider.Location = request.Location;
        if (!string.IsNullOrEmpty(request.Image))
            provider.Image = request.Image;
        if (request.IsActive.HasValue)
            provider.IsAvailableToday = request.IsActive.Value;
        if (request.Services != null)
        {
            provider.ServicesJson = JsonSerializer.Serialize(request.Services);
            if (request.Services.Any())
                provider.PriceFrom = request.Services.Min(s => s.Price);
        }
        if (request.Features != null)
            provider.FeaturesJson = JsonSerializer.Serialize(request.Features);

        await _context.SaveChangesAsync();

        return MapToDto(provider);
    }

    public async Task<bool> DeleteProvider(int userId)
    {
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.OwnerId == userId);
        if (provider == null)
            return false;

        _context.Providers.Remove(provider);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> AddService(int userId, ServiceItemDto service)
    {
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.OwnerId == userId);
        if (provider == null)
            return false;

        var services = JsonSerializer.Deserialize<List<ServiceItemDto>>(provider.ServicesJson) 
                       ?? new List<ServiceItemDto>();
        
        service.Id = Guid.NewGuid().ToString();
        services.Add(service);
        
        provider.ServicesJson = JsonSerializer.Serialize(services);
        provider.PriceFrom = services.Min(s => s.Price);
        
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateService(int userId, string serviceId, ServiceItemDto updatedService)
    {
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.OwnerId == userId);
        if (provider == null)
            return false;

        var services = JsonSerializer.Deserialize<List<ServiceItemDto>>(provider.ServicesJson) 
                       ?? new List<ServiceItemDto>();
        
        var index = services.FindIndex(s => s.Id == serviceId);
        if (index < 0)
            return false;

        updatedService.Id = serviceId;
        services[index] = updatedService;
        
        provider.ServicesJson = JsonSerializer.Serialize(services);
        provider.PriceFrom = services.Where(s => s.IsActive).Min(s => s.Price);
        
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteService(int userId, string serviceId)
    {
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.OwnerId == userId);
        if (provider == null)
            return false;

        var services = JsonSerializer.Deserialize<List<ServiceItemDto>>(provider.ServicesJson) 
                       ?? new List<ServiceItemDto>();
        
        services.RemoveAll(s => s.Id == serviceId);
        
        provider.ServicesJson = JsonSerializer.Serialize(services);
        if (services.Any())
            provider.PriceFrom = services.Min(s => s.Price);
        
        await _context.SaveChangesAsync();
        return true;
    }

    private static ProviderDto MapToDto(Provider provider)
    {
        var services = JsonSerializer.Deserialize<List<string>>(provider.ServicesJson) ?? new List<string>();
        var features = JsonSerializer.Deserialize<List<string>>(provider.FeaturesJson) ?? new List<string>();

        return new ProviderDto
        {
            Id = provider.Id,
            Name = provider.Name,
            Profession = provider.Profession,
            Rating = provider.Rating,
            ReviewsCount = provider.ReviewsCount,
            Location = provider.Location,
            Distance = "2.5 km", // This would be calculated based on user location
            Description = provider.Description,
            Services = services,
            Features = features,
            PriceFrom = provider.PriceFrom,
            Image = provider.Image,
            IsPremium = provider.IsPremium,
            IsAvailableToday = provider.IsAvailableToday
        };
    }
}
