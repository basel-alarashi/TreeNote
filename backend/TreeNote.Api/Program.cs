using Serilog;
using TreeNote.Application.Extensions;
using TreeNote.Infrastructure.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Serilog: structured logging to console + rolling file, configured from appsettings.
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();
builder.Host.UseSerilog();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseSerilogRequestLogging();
app.UseMiddleware<TreeNote.Api.Middlewares.ExceptionHandlingMiddleware>();
app.UseCors("AllowAngularDev");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    using var scope = app.Services.CreateScope();
    await TreeNote.Infrastructure.Persistence.DbSeeder.SeedMockUserAsync(scope.ServiceProvider);
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
