namespace TreeNote.Application.Exceptions;

/// <summary>Thrown when a request is well-formed but violates a domain rule (e.g. cycle).</summary>
public class BusinessRuleException : Exception
{
    public BusinessRuleException(string message) : base(message) { }
}
