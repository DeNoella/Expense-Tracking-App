using System.Security.Claims;
using BackEnd.Models.Auth;
using BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;

namespace BackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController>? _logger;
        private readonly IWebHostEnvironment? _environment;

        public AuthController(IAuthService authService, ILogger<AuthController>? logger = null, IWebHostEnvironment? environment = null)
        {
            _authService = authService;
            _logger = logger;
            _environment = environment;
        }
    }
}
