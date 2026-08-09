using MediatR;

namespace TreeNote.Application.Commands;

public record ChangePasswordCommand(string CurrentPassword, string NewPassword) : IRequest;
