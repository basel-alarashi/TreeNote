using Microsoft.Extensions.DependencyInjection;

namespace TreeNote.Application.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // AutoMapper / FluentValidation / application services registered here
        // starting Sprint 2.
        return services;
    }
}
