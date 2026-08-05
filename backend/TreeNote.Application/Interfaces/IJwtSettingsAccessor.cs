namespace TreeNote.Application.Interfaces;

public interface IJwtSettingsAccessor
{
	int RefreshTokenExpirationDays { get; }
}