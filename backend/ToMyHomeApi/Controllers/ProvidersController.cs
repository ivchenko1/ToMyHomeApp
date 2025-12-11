using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ToMyHomeApi.Models;
using ToMyHomeApi.Services;

namespace ToMyHomeApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProvidersController : ControllerBase
{
    private readonly IProviderService _providerService;

    public ProvidersController(IProviderService providerService)
    {
        _providerService = providerService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProviderDto>>> GetProviders(
        [FromQuery] string? category = null,
        [FromQuery] string? location = null,
        [FromQuery] decimal? minRating = null)
    {
        var providers = await _providerService.GetProviders(category, location, minRating);
        return Ok(providers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProviderDto>> GetProvider(int id)
    {
        var provider = await _providerService.GetProviderById(id);

        if (provider == null)
        {
            return NotFound();
        }

        return Ok(provider);
    }

    /// <summary>
    /// Utwórz profil usługodawcy
    /// </summary>
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ProviderDto>> CreateProvider([FromBody] CreateProviderRequest request)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var provider = await _providerService.CreateProvider(userId.Value, request);

        if (provider == null)
        {
            return Conflict(new { message = "Masz już utworzony profil usługodawcy" });
        }

        return CreatedAtAction(nameof(GetProvider), new { id = provider.Id }, provider);
    }

    /// <summary>
    /// Pobierz swój profil usługodawcy
    /// </summary>
    [Authorize]
    [HttpGet("my")]
    public async Task<ActionResult<ProviderDto>> GetMyProvider()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var provider = await _providerService.GetProviderByOwnerId(userId.Value);

        if (provider == null)
        {
            return NotFound(new { message = "Nie masz jeszcze profilu usługodawcy" });
        }

        return Ok(provider);
    }

    /// <summary>
    /// Aktualizuj swój profil usługodawcy
    /// </summary>
    [Authorize]
    [HttpPut("my")]
    public async Task<ActionResult<ProviderDto>> UpdateMyProvider([FromBody] UpdateProviderRequest request)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var provider = await _providerService.UpdateProvider(userId.Value, request);

        if (provider == null)
        {
            return NotFound(new { message = "Nie masz profilu usługodawcy" });
        }

        return Ok(provider);
    }

    /// <summary>
    /// Usuń swój profil usługodawcy
    /// </summary>
    [Authorize]
    [HttpDelete("my")]
    public async Task<IActionResult> DeleteMyProvider()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var result = await _providerService.DeleteProvider(userId.Value);

        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }

    /// <summary>
    /// Dodaj usługę do swojego profilu
    /// </summary>
    [Authorize]
    [HttpPost("my/services")]
    public async Task<IActionResult> AddService([FromBody] ServiceItemDto service)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var result = await _providerService.AddService(userId.Value, service);

        if (!result)
        {
            return NotFound(new { message = "Nie masz profilu usługodawcy" });
        }

        return Ok(new { message = "Usługa dodana" });
    }

    /// <summary>
    /// Aktualizuj usługę
    /// </summary>
    [Authorize]
    [HttpPut("my/services/{serviceId}")]
    public async Task<IActionResult> UpdateService(string serviceId, [FromBody] ServiceItemDto service)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var result = await _providerService.UpdateService(userId.Value, serviceId, service);

        if (!result)
        {
            return NotFound(new { message = "Usługa nie znaleziona" });
        }

        return Ok(new { message = "Usługa zaktualizowana" });
    }

    /// <summary>
    /// Usuń usługę
    /// </summary>
    [Authorize]
    [HttpDelete("my/services/{serviceId}")]
    public async Task<IActionResult> DeleteService(string serviceId)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var result = await _providerService.DeleteService(userId.Value, serviceId);

        if (!result)
        {
            return NotFound(new { message = "Usługa nie znaleziona" });
        }

        return NoContent();
    }

    private int? GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return null;
        }
        return userId;
    }
}
