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
    command.CommandText = "SELECT id_user, nume, rol FROM Utilizatori WHERE email=$email AND parola=$parola";
    command.Parameters.AddWithValue("$email", request.Email);
    command.Parameters.AddWithValue("$parola", request.Parola);

    using var reader = await command.ExecuteReaderAsync();
    if (await reader.ReadAsync())
    {
        var id_user = reader.GetInt32(0); // id_user e pe poziția 0
        var nume = reader.GetString(1);   // nume e pe poziția 1
        var rol = reader.GetString(2);    // rol e pe poziția 2
    
        return Results.Ok(new {
            message = $"Bine ai revenit, {nume}!",
            rol = rol,
            nume = nume,
            idUser = id_user 
    });
    }
    else
    {
        return Results.Json(new { error = "Email sau parolă incorectă!" }, statusCode: 401);
    }
});

app.MapGet("/api/favorite/{userId}", async (int userId) => {
    var favorite = new List<object>();
    using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = @"
        SELECT f.nume, f.pret, f.culoare 
        FROM Flori f
        JOIN Favorite fav ON f.id_floare = fav.id_floare
        WHERE fav.id_user = $userId";
    command.Parameters.AddWithValue("$userId", userId);

    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync()) {
        favorite.Add(new { 
            nume = reader.GetString(0), 
            pret = reader.GetDouble(1),
            culoare = reader.GetString(2)
        });
    }
    return Results.Ok(favorite);
});

// Endpoint pentru a lua TOATE datele utilizatorului
app.MapGet("/api/user-details/{id}", async (int id) => {
    using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();
    var command = connection.CreateCommand();
    command.CommandText = "SELECT nume, email, parola, adresa, telefon FROM Utilizatori WHERE id_user = $id";
    command.Parameters.AddWithValue("$id", id);

    using var reader = await command.ExecuteReaderAsync();
    if (await reader.ReadAsync()) {
        return Results.Ok(new {
            nume = reader.GetString(0),
            email = reader.GetString(1),
            parola = reader.GetString(2),
            adresa = reader.IsDBNull(3) ? "" : reader.GetString(3),
            telefon = reader.IsDBNull(4) ? "" : reader.GetString(4)
        });
    }
    return Results.NotFound();
});

// Endpoint pentru a SALVA modificările
app.MapPut("/api/user-update/{id}", async (int id, UserUpdateDto updatedUser) => {
    using var connection = new SqliteConnection("Data Source=florarie.db");
    await connection.OpenAsync();
    var command = connection.CreateCommand();
    command.CommandText = @"
        UPDATE Utilizatori 
        SET nume = $nume, email = $email, parola = $parola, adresa = $adresa, telefon = $telefon 
        WHERE id_user = $id";
    
    command.Parameters.AddWithValue("$nume", updatedUser.Nume);
    command.Parameters.AddWithValue("$email", updatedUser.Email);
    command.Parameters.AddWithValue("$parola", updatedUser.Parola);
    command.Parameters.AddWithValue("$adresa", updatedUser.Adresa);
    command.Parameters.AddWithValue("$telefon", updatedUser.Telefon);
    command.Parameters.AddWithValue("$id", id);

    await command.ExecuteNonQueryAsync();
    return Results.Ok(new { message = "Date actualizate cu succes!" });
});

app.Run("http://localhost:5000");

public record LoginRequest(string Email, string Parola);
public record UserUpdateDto(string Nume, string Email, string Parola, string Adresa, string Telefon);

// Definim structura datelor primite de la React
public record UserRegistrationRequest(
    string Nume, 
    string Email, 
    string Parola, 
    string Telefon, 
    string Adresa, 
    string Rol
);