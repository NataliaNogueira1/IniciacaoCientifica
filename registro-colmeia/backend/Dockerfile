FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ColmeiaApi/*.csproj ColmeiaApi/
RUN dotnet restore ColmeiaApi/ColmeiaApi.csproj
COPY ColmeiaApi/ ColmeiaApi/
RUN dotnet publish ColmeiaApi/ColmeiaApi.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "ColmeiaApi.dll"]
