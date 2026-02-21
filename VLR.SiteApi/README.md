# VLR.SiteApi

Minimal ASP.NET Core (.NET 8) API for persisting `data/site.json` used by the static website.

## Endpoints
- `GET /api/site` returns the JSON.
- `POST /api/site` overwrites the JSON (requires `x-api-key`).

## Configuration
Edit `appsettings.json`:
```
{
  "SiteData": {
    "JsonPath": "C:\\inetpub\\wwwroot\\vlr\\data\\site.json"
  },
  "Security": {
    "ApiKey": "vlr-dev-key-2026"
  },
  "Cors": {
    "AllowedOrigins": [
      "https://your-site-domain.com"
    ]
  }
}
```

`Cors:AllowedOrigins` is optional. If empty, CORS is not enabled (same-origin only).

## IIS Publish Notes
1. Publish the API:
   ```
   dotnet publish -c Release -o C:\inetpub\wwwroot\vlr-siteapi
   ```
2. Create an IIS Application (e.g., `/siteapi`) pointing to the publish folder.
3. Use an Application Pool with `.NET CLR Version: No Managed Code` and enable **In-Process** hosting.
4. Ensure the API has permission to read/write the JSON file at:
   `C:\inetpub\wwwroot\vlr\data\site.json`
5. If the website is hosted at a different origin, set `Cors:AllowedOrigins` to that URL.

## Local Run
```
dotnet run --project VLR.SiteApi/VLR.SiteApi.csproj
```

Then call:
```
GET  http://localhost:5205/api/site
POST http://localhost:5205/api/site  (x-api-key: vlr-dev-key-2026)
```
