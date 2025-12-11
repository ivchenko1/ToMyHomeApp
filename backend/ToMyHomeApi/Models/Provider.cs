using System.ComponentModel.DataAnnotations;

namespace ToMyHomeApi.Models;

public class Provider
{
    public int Id { get; set; }

    // Właściciel profilu (użytkownik)
    public int? OwnerId { get; set; }
    public User? Owner { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(100)]
    public string Profession { get; set; } = string.Empty;

    public decimal Rating { get; set; } = 0;
    
    public int ReviewsCount { get; set; } = 0;

    [StringLength(200)]
    public string Location { get; set; } = string.Empty;

    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    public decimal PriceFrom { get; set; }

    public string? Image { get; set; }

    public bool IsPremium { get; set; } = false;

    public bool IsAvailableToday { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // JSON stored as string
    public string ServicesJson { get; set; } = "[]";
    public string FeaturesJson { get; set; } = "[]";

    // Navigation properties
    public int CategoryId { get; set; }
    public ServiceCategory Category { get; set; } = null!;
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}

public class ProviderDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Profession { get; set; } = string.Empty;
    public decimal Rating { get; set; }
    public int ReviewsCount { get; set; }
    public string Location { get; set; } = string.Empty;
    public string Distance { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Services { get; set; } = new();
    public List<string> Features { get; set; } = new();
    public decimal PriceFrom { get; set; }
    public string? Image { get; set; }
    public bool IsPremium { get; set; }
    public bool IsAvailableToday { get; set; }
}
