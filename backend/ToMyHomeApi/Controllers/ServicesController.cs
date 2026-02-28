using Microsoft.AspNetCore.Mvc;
using ToMyHomeApi.Models;
using ToMyHomeApi.Services;

namespace ToMyHomeApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly IProviderService _providerService;

    public ServicesController(IProviderService providerService)
    {
        _providerService = providerService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ServiceCategoryDto>>> GetCategories()
    {
        var categories = await _providerService.GetCategories();
        return Ok(categories);
    }
}
