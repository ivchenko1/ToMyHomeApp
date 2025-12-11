using Microsoft.EntityFrameworkCore;
using ToMyHomeApi.Data;
using ToMyHomeApi.Models;

namespace ToMyHomeApi.Services;

public interface IBookingService
{
    Task<BookingDto?> CreateBooking(int userId, CreateBookingRequest request);
    Task<List<BookingDto>> GetUserBookings(int userId);
    Task<bool> CancelBooking(int userId, int bookingId);
}

public class BookingService : IBookingService
{
    private readonly ApplicationDbContext _context;

    public BookingService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BookingDto?> CreateBooking(int userId, CreateBookingRequest request)
    {
        var provider = await _context.Providers.FindAsync(request.ProviderId);
        if (provider == null)
        {
            return null;
        }

        var booking = new Booking
        {
            UserId = userId,
            ProviderId = request.ProviderId,
            BookingDate = request.BookingDate,
            BookingTime = request.BookingTime,
            Address = request.Address,
            Notes = request.Notes ?? "",
            Status = BookingStatus.Pending,
            TotalPrice = provider.PriceFrom,
            CreatedAt = DateTime.UtcNow
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return new BookingDto
        {
            Id = booking.Id,
            ProviderId = booking.ProviderId,
            ProviderName = provider.Name,
            BookingDate = booking.BookingDate,
            BookingTime = booking.BookingTime,
            Address = booking.Address,
            Status = booking.Status.ToString(),
            TotalPrice = booking.TotalPrice
        };
    }

    public async Task<List<BookingDto>> GetUserBookings(int userId)
    {
        var bookings = await _context.Bookings
            .Include(b => b.Provider)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.BookingDate)
            .ToListAsync();

        return bookings.Select(b => new BookingDto
        {
            Id = b.Id,
            ProviderId = b.ProviderId,
            ProviderName = b.Provider.Name,
            BookingDate = b.BookingDate,
            BookingTime = b.BookingTime,
            Address = b.Address,
            Status = b.Status.ToString(),
            TotalPrice = b.TotalPrice
        }).ToList();
    }

    public async Task<bool> CancelBooking(int userId, int bookingId)
    {
        var booking = await _context.Bookings
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);

        if (booking == null)
        {
            return false;
        }

        booking.Status = BookingStatus.Cancelled;
        await _context.SaveChangesAsync();

        return true;
    }
}
