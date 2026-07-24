using Microsoft.Extensions.DependencyInjection;
using TreeNote.Application.Services;
using TreeNote.Application.Interfaces;
using TreeNote.Application.Interfaces;
using TreeNote.Application.Services;

namespace TreeNote.Application.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IRelationshipCleanupService, RelationshipCleanupService>();
        services.AddScoped<IWorkspaceService, WorkspaceService>();
        services.AddScoped<ICanvasService, CanvasService>();
        services.AddScoped<ITopicService, TopicService>();
        services.AddScoped<IRelationshipService, RelationshipService>();
        return services;
    }
}
