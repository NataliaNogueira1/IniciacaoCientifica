using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ColmeiaApi.Tests.Helpers;

public static class AuthHelper
{
    /// <summary>Cria um ControllerContext com o usuário autenticado informado.</summary>
    public static ControllerContext CreateContext(Guid userId, string role = "Pesquisador")
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, role),
        };
        var identity  = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);

        return new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }
}
