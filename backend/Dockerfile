FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["TreeNote.Api/TreeNote.Api.csproj", "TreeNote.Api/"]
COPY ["TreeNote.Application/TreeNote.Application.csproj", "TreeNote.Application/"]
COPY ["TreeNote.Domain/TreeNote.Domain.csproj", "TreeNote.Domain/"]
COPY ["TreeNote.Infrastructure/TreeNote.Infrastructure.csproj", "TreeNote.Infrastructure/"]
RUN dotnet restore "TreeNote.Api/TreeNote.Api.csproj"

COPY . .
WORKDIR /src/TreeNote.Api
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TreeNote.Api.dll"]