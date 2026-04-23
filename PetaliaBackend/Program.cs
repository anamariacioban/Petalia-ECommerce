using Microsoft.Data.Sqlite;

var builder = WebApplication.CreateBuilder(args);

// Permitem React-ului (port 3000) să acceseze acest backend
builder.Services.AddCors(options =>
{
    options.AddPolicy("PetaliaPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseCors("PetaliaPolicy");

string connectionString = "Data Source=florarie.db";

// Ruta pentru Înregistrare (Sign-In)
app.MapPost("/api/register", async (UserRegistrationRequest request) =>
{
    using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = @"
        INSERT INTO Utilizatori (nume, rol, email, parola, telefon, adresa)
        VALUES ($nume, $rol, $email, $parola, $telefon, $adresa)";

    command.Parameters.AddWithValue("$nume", request.Nume);
    command.Parameters.AddWithValue("$rol", request.Rol);
    command.Parameters.AddWithValue("$email", request.Email);
    command.Parameters.AddWithValue("$parola", request.Parola);
    command.Parameters.AddWithValue("$telefon", request.Telefon ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("$adresa", request.Adresa ?? (object)DBNull.Value);

    try
    {
        await command.ExecuteNonQueryAsync();
        return Results.Ok(new { message = "Utilizator creat cu succes în C#!" });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});
// Ruta pentru Login
app.MapPost("/api/login", async (LoginRequest request) =>
{
    using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = "SELECT nume, rol FROM Utilizatori WHERE email = $email AND parola = $parola";
    command.Parameters.AddWithValue("$email", request.Email);
    command.Parameters.AddWithValue("$parola", request.Parola);

    using var reader = await command.ExecuteReaderAsync();
    if (await reader.ReadAsync())
    {
        var nume = reader.GetString(0);
        var rol = reader.GetString(1);
        return Results.Ok(new { message = $"Bine ai revenit, {nume}!", rol = rol });
    }
    else
    {
        return Results.Json(new { error = "Email sau parolă incorectă!" }, statusCode: 401);
    }
});

app.Run("http://localhost:5000");

public record LoginRequest(string Email, string Parola);

// Definim structura datelor primite de la React
public record UserRegistrationRequest(
    string Nume, 
    string Email, 
    string Parola, 
    string Telefon, 
    string Adresa, 
    string Rol
);