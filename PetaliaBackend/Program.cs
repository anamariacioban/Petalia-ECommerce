using Microsoft.Data.Sqlite;

var builder = WebApplication.CreateBuilder(args);

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

// Înregistrare
app.MapPost("/api/register", async (UserRegistrationRequest request) =>
{
    using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();
    var command = connection.CreateCommand();
    command.CommandText = @"
        INSERT INTO Utilizatori (nume, rol, email, parola, telefon, adresa)
        VALUES ($nume, $rol, $email, $parola, $telefon, $adresa)";
    command.Parameters.AddWithValue("$nume", request.Nume);
    command.Parameters.AddWithValue("$rol", "Client");
    command.Parameters.AddWithValue("$email", request.Email);
    command.Parameters.AddWithValue("$parola", request.Parola);
    command.Parameters.AddWithValue("$telefon", request.Telefon ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("$adresa", request.Adresa ?? (object)DBNull.Value);
    try
    {
        await command.ExecuteNonQueryAsync();
        return Results.Ok(new { message = "Utilizator creat cu succes!" });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});

// Login
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
        var id_user = reader.GetInt32(0);
        var nume = reader.GetString(1);
        var rol = reader.GetString(2);
        return Results.Ok(new { message = $"Bine ai revenit, {nume}!", rol = rol, nume = nume, idUser = id_user });
    }
    else
    {
        return Results.Json(new { error = "Email sau parolă incorectă!" }, statusCode: 401);
    }
});

// Favorite
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
        favorite.Add(new { nume = reader.GetString(0), pret = reader.GetDouble(1), culoare = reader.GetString(2) });
    }
    return Results.Ok(favorite);
});

// User details
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

// User update
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

// ADMIN - Lista toate florile
app.MapGet("/api/flori", async () => {
    var flori = new List<object>();
    using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();
    var command = connection.CreateCommand();
    command.CommandText = "SELECT id_floare, nume, pret, culoare, stoc, imagine FROM Flori";
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync()) {
        flori.Add(new {
            id_floare = reader.GetInt32(0),
            nume = reader.GetString(1),
            pret = reader.GetDouble(2),
            culoare = reader.GetString(3),
            stoc = reader.IsDBNull(4) ? 0 : reader.GetInt32(4),
            imagine = reader.IsDBNull(5) ? "" : reader.GetString(5)
        });
    }
    return Results.Ok(flori);
});

// ADMIN - Adauga floare
app.MapPost("/api/flori", async (FloareRequest request) => {
    using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();
    var command = connection.CreateCommand();
    command.CommandText = "INSERT INTO Flori (nume, pret, culoare, stoc, imagine) VALUES ($nume, $pret, $culoare, $stoc, $imagine)";
    command.Parameters.AddWithValue("$nume", request.Nume);
    command.Parameters.AddWithValue("$pret", request.Pret);
    command.Parameters.AddWithValue("$culoare", request.Culoare);
    command.Parameters.AddWithValue("$stoc", request.Stoc);
    command.Parameters.AddWithValue("$imagine", request.Imagine ?? "");
    try {
        await command.ExecuteNonQueryAsync();
        return Results.Ok(new { message = "Floare adăugată!" });
    } catch (Exception ex) {
        return Results.BadRequest(new { error = ex.Message });
    }
});

// ADMIN - Modifica floare
app.MapPut("/api/flori/{id}", async (int id, FloareUpdateRequest request) => {
    using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();
    var command = connection.CreateCommand();
    command.CommandText = "UPDATE Flori SET pret = $pret, stoc = $stoc, imagine = $imagine WHERE id_floare = $id";
    command.Parameters.AddWithValue("$pret", request.Pret);
    command.Parameters.AddWithValue("$stoc", request.Stoc);
    command.Parameters.AddWithValue("$imagine", request.Imagine ?? "");
    command.Parameters.AddWithValue("$id", id);
    await command.ExecuteNonQueryAsync();
    return Results.Ok(new { message = "Floare actualizată!" });
});

// ADMIN - Sterge floare
app.MapDelete("/api/flori/{id}", async (int id) => {
    using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();
    var command = connection.CreateCommand();
    command.CommandText = "DELETE FROM Flori WHERE id_floare = $id";
    command.Parameters.AddWithValue("$id", id);
    await command.ExecuteNonQueryAsync();
    return Results.Ok(new { message = "Floare ștearsă!" });
});

// ADMIN - Lista utilizatori
app.MapGet("/api/utilizatori", async () => {
    var utilizatori = new List<object>();
    using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();
    var command = connection.CreateCommand();
    command.CommandText = "SELECT id_user, nume, email, rol FROM Utilizatori";
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync()) {
        utilizatori.Add(new {
            idUser = reader.GetInt32(0),
            nume = reader.GetString(1),
            email = reader.GetString(2),
            rol = reader.GetString(3)
        });
    }
    return Results.Ok(utilizatori);
});

// ADMIN - Acorda rol de admin
app.MapPut("/api/acorda-admin/{id}", async (int id) => {
    using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();
    var command = connection.CreateCommand();
    command.CommandText = "UPDATE Utilizatori SET rol = 'Administrator' WHERE id_user = $id";
    command.Parameters.AddWithValue("$id", id);
    await command.ExecuteNonQueryAsync();
    return Results.Ok(new { message = "Rol acordat!" });
});

// ADMIN - Revoca rol de admin
app.MapPut("/api/revoca-admin/{id}", async (int id) => {
    using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();
    var command = connection.CreateCommand();
    command.CommandText = "UPDATE Utilizatori SET rol = 'Client' WHERE id_user = $id";
    command.Parameters.AddWithValue("$id", id);
    await command.ExecuteNonQueryAsync();
    return Results.Ok(new { message = "Rol revocat!" });
});

// Flori pe categorie (pentru pagina client)
app.MapGet("/api/flori/categorie/{categorie}", async (string categorie) => {
    var flori = new List<object>();
    using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();
    var command = connection.CreateCommand();
    command.CommandText = "SELECT id_floare, nume, pret, stoc, imagine FROM Flori WHERE culoare = $categorie";
    command.Parameters.AddWithValue("$categorie", categorie);
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync()) {
        flori.Add(new {
            id_floare = reader.GetInt32(0),
            nume = reader.GetString(1),
            pret = reader.GetDouble(2),
            stoc = reader.IsDBNull(3) ? 0 : reader.GetInt32(3),
            imagine = reader.IsDBNull(4) ? "" : reader.GetString(4)
        });
    }
    return Results.Ok(flori);
});

app.Run("http://localhost:5000");

public record LoginRequest(string Email, string Parola);
public record UserUpdateDto(string Nume, string Email, string Parola, string Adresa, string Telefon);
public record UserRegistrationRequest(string Nume, string Email, string Parola, string Telefon, string Adresa, string Rol);
public record FloareRequest(string Nume, double Pret, string Culoare, int Stoc, string? Imagine);
public record FloareUpdateRequest(double Pret, int Stoc, string? Imagine);