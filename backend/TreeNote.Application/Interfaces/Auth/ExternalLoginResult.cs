using TreeNote.Application.DTOs;

namespace TreeNote.Application.Interfaces;

public record ExternalLoginResult(UserDto User, bool IsNewUser, bool WasLinkedToExistingAccount);
