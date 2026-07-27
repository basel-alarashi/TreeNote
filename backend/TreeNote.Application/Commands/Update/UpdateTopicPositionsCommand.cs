using System.ComponentModel.DataAnnotations;

namespace TreeNote.Application.Commands;

public record TopicPositionUpdate(Guid Id, double X, double Y, byte[] RowVersion);

public record UpdateTopicPositionsCommand([Required, MinLength(1)] List<TopicPositionUpdate> Positions);
