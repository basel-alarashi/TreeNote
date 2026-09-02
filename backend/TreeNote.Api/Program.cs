using Serilog;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Text;
using Microsoft.OpenApi;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using TreeNote.Application.Extensions;
using TreeNote.Infrastructure.Persistence;
using TreeNote.Infrastructure.Identity;
using TreeNote.Infrastructure.Extensions;
using TreeNote.Infrastructure.Authentication;
using TreeNote.Application.Interfaces;
using TreeNote.Application.Services;

var builder = WebApplication.CreateBuilder(args);

// Serilog: structured logging to console + rolling file, configured from appsettings.
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();
builder.Host.UseSerilog();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .ToDictionary(
                    e => e.Key,
                    e => e.Value!.Errors.Select(x => x.ErrorMessage).ToArray());

            int errorsCount = errors.Sum(e => e.Value.Length);

            return new BadRequestObjectResult(new
            {
                status = StatusCodes.Status400BadRequest,
                title = $"{errorsCount} validation error{(errorsCount > 1 ? "s" : "")} occurred.",
                errors
            })
            {
                ContentTypes = { "application/problem+json" }
            };
        };
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    });

    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
    });
});

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
        policy.WithOrigins("https://localhost:4200")
              .WithHeaders("Authorization", "Content-Type")
              .WithMethods("GET", "POST", "PUT", "DELETE")
              .AllowCredentials());

    options.AddPolicy("Production", policy =>
        policy.WithOrigins(allowedOrigins)
              .WithHeaders("Authorization", "Content-Type")
              .WithMethods("GET", "POST", "PUT", "DELETE")
              .AllowCredentials());
});

//JWT Binding configuration
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(JwtSettings.SectionName));
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IJwtSettingsAccessor, JwtSettingsAccessor>();

builder.Services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());
builder.Services.AddScoped<IIdentityService, IdentityService>();
builder.Services.AddScoped<ISyncService, SyncService>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

var jwtSettings = builder.Configuration
    .GetSection(JwtSettings.SectionName)
    .Get<JwtSettings>()!;

if (string.IsNullOrWhiteSpace(jwtSettings.Secret) || Encoding.UTF8.GetByteCount(jwtSettings.Secret) < 32)
{
    throw new InvalidOperationException("JwtSettings:Secret is missing or shorter than 32 bytes (256 bits), required for HMAC-SHA256. Set it via `dotnet user-secrets set \"JwtSettings:Secret\" \"<random-value>\"` in development, or an environment variable (JwtSettings__Secret) / secrets manager in production.");
}

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings.Secret)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.Configure<GoogleSettings>(
    builder.Configuration.GetSection(GoogleSettings.SectionName));

builder.Services.AddScoped<IGoogleAuthService, GoogleAuthService>();
builder.Services.AddScoped<ISearchService, SearchService>();

builder.Services.AddMediatR(typeof(TreeNote.Application.Commands.Register.RegisterCommand).Assembly);

var app = builder.Build();

app.UseSerilogRequestLogging();
app.UseMiddleware<TreeNote.Api.Middlewares.ExceptionHandlingMiddleware>();
app.UseCors(app.Environment.IsDevelopment() ? "AllowAngularDev" : "Production");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    using var scope = app.Services.CreateScope();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
