namespace TreeNote.Application.Topics.DTOs;

public record TopicDto(Guid Id, Guid CanvasId, string Title, double X, double Y, string? Emoji, DateTime CreatedAt);
