using System.ComponentModel.DataAnnotations;

namespace ToMyHomeApi.Models;

public class ServiceCategory
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(10)]
    public string Icon { get; set; } = string.Empty;

    [StringLength(50)]
    public string Slug { get; set; } = string.Empty;

    public decimal PriceFrom { get; set; }

    public ICollection<Provider> Providers { get; set; } = new List<Provider>();
}

public class ServiceCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public decimal PriceFrom { get; set; }
}

public class Booking
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int ProviderId { get; set; }
    public Provider Provider { get; set; } = null!;

    [Required]
    public DateTime BookingDate { get; set; }

    [Required]
    [StringLength(10)]
    public string BookingTime { get; set; } = string.Empty;

    [StringLength(300)]
    public string Address { get; set; } = string.Empty;

    [StringLength(500)]
    public string Notes { get; set; } = string.Empty;

    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    public decimal TotalPrice { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum BookingStatus
{
    Pending,
    Confirmed,
    InProgress,
    Completed,
    Cancelled
}

public class BookingDto
{
    public int Id { get; set; }
    public int ProviderId { get; set; }
    public string ProviderName { get; set; } = string.Empty;
    public DateTime BookingDate { get; set; }
    public string BookingTime { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalPrice { get; set; }
}

public class CreateBookingRequest
{
    [Required]
    public int ProviderId { get; set; }

    [Required]
    public DateTime BookingDate { get; set; }

    [Required]
    public string BookingTime { get; set; } = string.Empty;

    [Required]
    public string Address { get; set; } = string.Empty;

    public string? Notes { get; set; }
}

public class Review
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int ProviderId { get; set; }
    public Provider Provider { get; set; } = null!;

    [Range(1, 5)]
    public int Rating { get; set; }

    [StringLength(1000)]
    public string Content { get; set; } = string.Empty;

    public int HelpfulCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Favorite
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int ProviderId { get; set; }
    public Provider Provider { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// Request do tworzenia profilu usługodawcy
public class CreateProviderRequest
{
    [Required]
    [StringLength(100)]
    public string BusinessName { get; set; } = string.Empty;

    [StringLength(100)]
    public string Profession { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Category { get; set; } = string.Empty;

    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    [StringLength(500)]
    public string Experience { get; set; } = string.Empty;

    public LocationDto Location { get; set; } = new();

    public List<ServiceItemDto> Services { get; set; } = new();

    public List<string> Features { get; set; } = new();

    public string? Image { get; set; }

    public WorkingHoursDto? WorkingHours { get; set; }
}

public class LocationDto
{
    public string City { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
}

public class ServiceItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Duration { get; set; } = "30 min";
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class WorkingHoursDto
{
    public DayHoursDto Monday { get; set; } = new();
    public DayHoursDto Tuesday { get; set; } = new();
    public DayHoursDto Wednesday { get; set; } = new();
    public DayHoursDto Thursday { get; set; } = new();
    public DayHoursDto Friday { get; set; } = new();
    public DayHoursDto Saturday { get; set; } = new();
    public DayHoursDto Sunday { get; set; } = new();
}

public class DayHoursDto
{
    public string From { get; set; } = "09:00";
    public string To { get; set; } = "17:00";
    public bool Enabled { get; set; } = true;
}

public class UpdateProviderRequest
{
    public string? BusinessName { get; set; }
    public string? Profession { get; set; }
    public string? Description { get; set; }
    public string? Location { get; set; }
    public string? Image { get; set; }
    public bool? IsActive { get; set; }
    public List<ServiceItemDto>? Services { get; set; }
    public List<string>? Features { get; set; }
}
