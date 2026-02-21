using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
if (allowedOrigins is { Length: > 0 })
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("SiteCors", policy =>
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
    });
}

var app = builder.Build();

if (allowedOrigins is { Length: > 0 })
{
    app.UseCors("SiteCors");
}

string jsonPath = ResolveJsonPath(app.Configuration, app.Environment.ContentRootPath);

app.MapGet("/api/site", async () =>
{
    if (!File.Exists(jsonPath))
    {
        return Results.NotFound(new { message = "Site data not found." });
    }

    var json = await File.ReadAllTextAsync(jsonPath);
    return Results.Text(json, "application/json");
});

app.MapPost("/api/site", async (HttpRequest request) =>
{
    var apiKey = request.Headers["x-api-key"].ToString();
    var requiredKey = app.Configuration["Security:ApiKey"] ?? string.Empty;

    if (string.IsNullOrWhiteSpace(requiredKey) || apiKey != requiredKey)
    {
        return Results.Unauthorized();
    }

    string body;
    using (var reader = new StreamReader(request.Body))
    {
        body = await reader.ReadToEndAsync();
    }

    if (string.IsNullOrWhiteSpace(body))
    {
        return Results.BadRequest(new { message = "Empty request body." });
    }

    try
    {
        using var doc = JsonDocument.Parse(body);
        var root = doc.RootElement;
        if (root.ValueKind != JsonValueKind.Object)
        {
            return Results.BadRequest(new { message = "Invalid JSON format." });
        }

        if (!HasRequiredFields(root, out var error))
        {
            return Results.BadRequest(new { message = error });
        }
    }
    catch (JsonException)
    {
        return Results.BadRequest(new { message = "Invalid JSON payload." });
    }

    var directory = Path.GetDirectoryName(jsonPath);
    if (!string.IsNullOrWhiteSpace(directory))
    {
        Directory.CreateDirectory(directory);
    }

    var tempFile = Path.Combine(directory ?? "", $"site.json.{Guid.NewGuid():N}.tmp");
    await File.WriteAllTextAsync(tempFile, body);
    File.Move(tempFile, jsonPath, true);

    return Results.Ok(new { ok = true });
});

app.Run();

static string ResolveJsonPath(IConfiguration configuration, string contentRoot)
{
    var configured = configuration["SiteData:JsonPath"] ?? string.Empty;
    if (string.IsNullOrWhiteSpace(configured))
    {
        return Path.GetFullPath(Path.Combine(contentRoot, "..", "data", "site.json"));
    }

    return Path.IsPathRooted(configured)
        ? configured
        : Path.GetFullPath(Path.Combine(contentRoot, configured));
}

static bool HasRequiredFields(JsonElement root, out string error)
{
    if (!root.TryGetProperty("brand", out var brand) || !HasString(brand, "name"))
    {
        error = "Missing required field: brand.name.";
        return false;
    }

    if (!root.TryGetProperty("contact", out var contact))
    {
        error = "Missing required field: contact.";
        return false;
    }

    if (!HasString(contact, "phone"))
    {
        error = "Missing required field: contact.phone.";
        return false;
    }

    if (!HasString(contact, "email"))
    {
        error = "Missing required field: contact.email.";
        return false;
    }

    if (!HasString(contact, "address"))
    {
        error = "Missing required field: contact.address.";
        return false;
    }

    error = string.Empty;
    return true;
}

static bool HasString(JsonElement element, string name)
{
    return element.TryGetProperty(name, out var value)
        && value.ValueKind == JsonValueKind.String
        && !string.IsNullOrWhiteSpace(value.GetString());
}
