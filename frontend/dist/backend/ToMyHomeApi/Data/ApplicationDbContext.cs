using Microsoft.EntityFrameworkCore;
using ToMyHomeApi.Models;

namespace ToMyHomeApi.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Provider> Providers => Set<Provider>();
    public DbSet<ServiceCategory> ServiceCategories => Set<ServiceCategory>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Favorite> Favorites => Set<Favorite>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
        });

        // Provider
        modelBuilder.Entity<Provider>(entity =>
        {
            entity.HasOne(p => p.Category)
                .WithMany(c => c.Providers)
                .HasForeignKey(p => p.CategoryId);
        });

        // Booking
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId);

            entity.HasOne(b => b.Provider)
                .WithMany(p => p.Bookings)
                .HasForeignKey(b => b.ProviderId);
        });

        // Review
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasOne(r => r.Provider)
                .WithMany(p => p.Reviews)
                .HasForeignKey(r => r.ProviderId);
        });

        // Favorite
        modelBuilder.Entity<Favorite>(entity =>
        {
            entity.HasOne(f => f.User)
                .WithMany(u => u.Favorites)
                .HasForeignKey(f => f.UserId);

            entity.HasIndex(f => new { f.UserId, f.ProviderId }).IsUnique();
        });

        // Seed data
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Seed service categories
        modelBuilder.Entity<ServiceCategory>().HasData(
            new ServiceCategory { Id = 1, Name = "Fryzjer", Icon = "✂️", Slug = "fryzjer", PriceFrom = 80 },
            new ServiceCategory { Id = 2, Name = "Tatuaże", Icon = "🖊️", Slug = "tatuaze", PriceFrom = 200 },
            new ServiceCategory { Id = 3, Name = "Paznokcie", Icon = "💅", Slug = "paznokcie", PriceFrom = 60 },
            new ServiceCategory { Id = 4, Name = "Masaż", Icon = "💆", Slug = "masaz", PriceFrom = 120 },
            new ServiceCategory { Id = 5, Name = "Makijaż", Icon = "💄", Slug = "makijaz", PriceFrom = 100 },
            new ServiceCategory { Id = 6, Name = "Twarz", Icon = "💧", Slug = "twarz", PriceFrom = 120 },
            new ServiceCategory { Id = 7, Name = "Inne", Icon = "✨", Slug = "inne", PriceFrom = 50 }
        );

        // Seed providers
        modelBuilder.Entity<Provider>().HasData(
            new Provider
            {
                Id = 1,
                Name = "Anna Kowalska",
                Profession = "Mistrzyni fryzjerstwa",
                Rating = 5.0m,
                ReviewsCount = 127,
                Location = "Warszawa, Mokotów",
                Description = "Profesjonalna fryzjerka z 15-letnim doświadczeniem. Specjalizuję się w nowoczesnych technikach koloryzacji.",
                PriceFrom = 80,
                Image = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
                IsPremium = true,
                IsAvailableToday = true,
                CategoryId = 1,
                ServicesJson = "[\"Strzyżenie damskie\", \"Koloryzacja\", \"Modelowanie\", \"Keratyna\"]",
                FeaturesJson = "[\"Dojazd do klienta\", \"Produkty premium\", \"Konsultacja gratis\"]"
            },
            new Provider
            {
                Id = 2,
                Name = "Piotr Nowak",
                Profession = "Barber Master",
                Rating = 4.9m,
                ReviewsCount = 89,
                Location = "Warszawa, Centrum",
                Description = "Doświadczony barber specjalizujący się w klasycznych i nowoczesnych fryzurach męskich.",
                PriceFrom = 70,
                Image = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400",
                IsPremium = false,
                IsAvailableToday = true,
                CategoryId = 1,
                ServicesJson = "[\"Strzyżenie męskie\", \"Broda\", \"Hot towel\", \"Stylizacja\"]",
                FeaturesJson = "[\"Mobilny zestaw\", \"Produkty barberskie\", \"Dojazd 24/7\"]"
            },
            new Provider
            {
                Id = 3,
                Name = "Katarzyna Wiśniewska",
                Profession = "Kolorystka włosów",
                Rating = 4.7m,
                ReviewsCount = 156,
                Location = "Warszawa, Wola",
                Description = "Ekspert koloryzacji z certyfikatami międzynarodowych szkół.",
                PriceFrom = 120,
                Image = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400",
                IsPremium = true,
                IsAvailableToday = false,
                CategoryId = 1,
                ServicesJson = "[\"Koloryzacja\", \"Balayage\", \"Ombre\", \"Dekoloryzacja\"]",
                FeaturesJson = "[\"Farby wegańskie\", \"Test alergiczny\", \"Gwarancja koloru\"]"
            }
        );
    }
}
