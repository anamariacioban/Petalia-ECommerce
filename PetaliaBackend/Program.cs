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
        SELECT f.id_floare, f.nume, f.pret, f.culoare, f.stoc, f.imagine
        FROM Flori f
        JOIN Favorite fav ON f.id_floare = fav.id_floare
        WHERE fav.id_user = $userId";
    command.Parameters.AddWithValue("$userId", userId);
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync()) {
        favorite.Add(new {
            id_floare = reader.GetInt32(0),
            nume = reader.GetString(1),
            pret = reader.GetDouble(2),
            culoare = reader.GetString(3),
            stoc = reader.IsDBNull(4) ? 0 : reader.GetInt32(4),
            imagine = reader.IsDBNull(5) ? "" : reader.GetString(5)
        });
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

// Adauga la favorite
app.MapPost("/api/favorite", async (FavoriteRequest request) => {
    using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();
    var command = connection.CreateCommand();
    command.CommandText = @"
        INSERT OR IGNORE INTO Favorite (id_user, id_floare)
        VALUES ($userId, $flowareId)";
    command.Parameters.AddWithValue("$userId", request.UserId);
    command.Parameters.AddWithValue("$flowareId", request.FlowareId);
    try {
        await command.ExecuteNonQueryAsync();
        return Results.Ok(new { message = "Adăugat la favorite!" });
    } catch (Exception ex) {
        return Results.BadRequest(new { error = ex.Message });
    }
});

// Sterge din favorite
app.MapDelete("/api/favorite/{userId}/{flowareId}", async (int userId, int flowareId) => {
    using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();
    var command = connection.CreateCommand();
    command.CommandText = "DELETE FROM Favorite WHERE id_user = $userId AND id_floare = $flowareId";
    command.Parameters.AddWithValue("$userId", userId);
    command.Parameters.AddWithValue("$flowareId", flowareId);
    await command.ExecuteNonQueryAsync();
    return Results.Ok(new { message = "Șters din favorite!" });
});

// Verifica daca un produs e la favorite
app.MapGet("/api/favorite/check/{userId}/{flowareId}", async (int userId, int flowareId) => {
    using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();
    var command = connection.CreateCommand();
    command.CommandText = "SELECT COUNT(*) FROM Favorite WHERE id_user = $userId AND id_floare = $flowareId";
    command.Parameters.AddWithValue("$userId", userId);
    command.Parameters.AddWithValue("$flowareId", flowareId);
    var count = (long)(await command.ExecuteScalarAsync())!;
    return Results.Ok(new { isFavorit = count > 0 });
});

// COMENZI - Creaza o comanda noua
app.MapPost("/api/comenzi", async (ComandaRequest request) => {
    using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();
    using var transaction = connection.BeginTransaction();
    try {
        // Insereaza comanda
        var cmdComanda = connection.CreateCommand();
        cmdComanda.Transaction = transaction;
        cmdComanda.CommandText = @"
            INSERT INTO Comenzi (id_user, data_comanda, status, total)
            VALUES ($idUser, $data, 'In procesare', $total);
            SELECT last_insert_rowid();";
        cmdComanda.Parameters.AddWithValue("$idUser", request.IdUser);
        cmdComanda.Parameters.AddWithValue("$data", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
        cmdComanda.Parameters.AddWithValue("$total", request.Total);
        var idComanda = (long)(await cmdComanda.ExecuteScalarAsync())!;

        // Insereaza detaliile
        foreach (var produs in request.Produse) {
            var cmdDetaliu = connection.CreateCommand();
            cmdDetaliu.Transaction = transaction;
            cmdDetaliu.CommandText = @"
                INSERT INTO Detalii_Comanda (id_comanda, id_floare, cantitate, pret_unitar)
                VALUES ($idComanda, $idFloare, $cantitate, $pretUnitar)";
            cmdDetaliu.Parameters.AddWithValue("$idComanda", idComanda);
            cmdDetaliu.Parameters.AddWithValue("$idFloare", produs.IdFloare);
            cmdDetaliu.Parameters.AddWithValue("$cantitate", produs.Cantitate);
            cmdDetaliu.Parameters.AddWithValue("$pretUnitar", produs.PretUnitar);
            await cmdDetaliu.ExecuteNonQueryAsync();
        }

        // Insereaza plata
        if (!string.IsNullOrEmpty(request.MetodaPlata)) {
            var cmdPlata = connection.CreateCommand();
            cmdPlata.Transaction = transaction;
            cmdPlata.CommandText = @"
                INSERT INTO Plati (id_comanda, metoda, status)
                VALUES ($idComanda, $metoda, 'In asteptare')";
            cmdPlata.Parameters.AddWithValue("$idComanda", idComanda);
            cmdPlata.Parameters.AddWithValue("$metoda", request.MetodaPlata);
            await cmdPlata.ExecuteNonQueryAsync();
        }

        transaction.Commit();
        return Results.Ok(new { message = "Comanda creata cu succes!", idComanda });
    } catch (Exception ex) {
        transaction.Rollback();
        return Results.BadRequest(new { error = ex.Message });
    }
});

// COMENZI - Lista comenzilor unui utilizator cu detalii
app.MapGet("/api/comenzi/{userId}", async (int userId) => {
    var comenzi = new List<object>();
    using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();

    var cmdComenzi = connection.CreateCommand();
    cmdComenzi.CommandText = @"
        SELECT c.id_comanda, c.data_comanda, c.status, c.total,
               COALESCE(p.metoda, 'Necunoscut') as metoda_plata
        FROM Comenzi c
        LEFT JOIN Plati p ON c.id_comanda = p.id_comanda
        WHERE c.id_user = $userId
        ORDER BY c.id_comanda DESC";
    cmdComenzi.Parameters.AddWithValue("$userId", userId);

    using var reader = await cmdComenzi.ExecuteReaderAsync();
    var listaComenzi = new List<(long id, string data, string status, double total, string metoda)>();
    while (await reader.ReadAsync()) {
        listaComenzi.Add((
            reader.GetInt64(0),
            reader.GetString(1),
            reader.GetString(2),
            reader.GetDouble(3),
            reader.GetString(4)
        ));
    }
    reader.Close();

    foreach (var comanda in listaComenzi) {
        var cmdDetalii = connection.CreateCommand();
        cmdDetalii.CommandText = @"
            SELECT dc.cantitate, dc.pret_unitar, f.nume, f.imagine
            FROM Detalii_Comanda dc
            JOIN Flori f ON dc.id_floare = f.id_floare
            WHERE dc.id_comanda = $idComanda";
        cmdDetalii.Parameters.AddWithValue("$idComanda", comanda.id);

        var detalii = new List<object>();
        using var readerDetalii = await cmdDetalii.ExecuteReaderAsync();
        while (await readerDetalii.ReadAsync()) {
            detalii.Add(new {
                cantitate = readerDetalii.GetInt32(0),
                pretUnitar = readerDetalii.GetDouble(1),
                numeFloare = readerDetalii.GetString(2),
                imagine = readerDetalii.IsDBNull(3) ? "" : readerDetalii.GetString(3)
            });
        }

        comenzi.Add(new {
            idComanda = comanda.id,
            dataComanda = comanda.data,
            status = comanda.status,
            total = comanda.total,
            metodaPlata = comanda.metoda,
            detalii
        });
    }

    return Results.Ok(comenzi);
});

// Recuperare parola - trimite parola pe email
app.MapPost("/api/recover-password", async (RecoverPasswordRequest request) =>
{
    using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();
    var command = connection.CreateCommand();
    command.CommandText = "SELECT parola, nume FROM Utilizatori WHERE email = $email";
    command.Parameters.AddWithValue("$email", request.Email);
    using var reader = await command.ExecuteReaderAsync();
    if (!await reader.ReadAsync())
    {
        return Results.Json(new { error = "Nu există niciun cont asociat acestui email." }, statusCode: 404);
    }
    var parola = reader.GetString(0);
    var nume = reader.GetString(1);
    reader.Close();

    try
    {
        // ⚠️ Configurati SMTP in appsettings.json:
        // "Smtp": { "Host": "smtp.gmail.com", "Port": "587", "User": "emailul-vostru@gmail.com", "Password": "parola-aplicatie-gmail" }
        var smtpHost = builder.Configuration["Smtp:Host"] ?? "smtp.gmail.com";
        var smtpPort = int.Parse(builder.Configuration["Smtp:Port"] ?? "587");
        var smtpUser = builder.Configuration["Smtp:User"] ?? "emailul-vostru@gmail.com";
        var smtpPass = builder.Configuration["Smtp:Password"] ?? "parola-aplicatie-gmail";

        using var smtpClient = new System.Net.Mail.SmtpClient(smtpHost, smtpPort)
        {
            EnableSsl = true,
            Credentials = new System.Net.NetworkCredential(smtpUser, smtpPass)
        };

        var mail = new System.Net.Mail.MailMessage
        {
            From = new System.Net.Mail.MailAddress(smtpUser, "Petalia Florarie"),
            Subject = "Recuperare parola - Petalia",
            Body = $"Buna, {nume}!\n\nParola contului tau este: {parola}\n\nDaca nu ai solicitat aceasta recuperare, te rugam sa ignori acest mesaj.\n\nCu drag,\nEchipa Petalia 🌸",
            IsBodyHtml = false
        };
        mail.To.Add(request.Email);

        await smtpClient.SendMailAsync(mail);
        return Results.Ok(new { message = "Parola a fost trimisa pe email!" });
    }
    catch (Exception ex)
    {
        return Results.Json(new { error = $"Eroare la trimiterea emailului: {ex.Message}" }, statusCode: 500);
    }
});

app.Run("http://localhost:5000");

public record LoginRequest(string Email, string Parola);
public record UserUpdateDto(string Nume, string Email, string Parola, string Adresa, string Telefon);
public record UserRegistrationRequest(string Nume, string Email, string Parola, string Telefon, string Adresa, string Rol);
public record FloareRequest(string Nume, double Pret, string Culoare, int Stoc, string? Imagine);
public record FloareUpdateRequest(double Pret, int Stoc, string? Imagine);
public record FavoriteRequest(int UserId, int FlowareId);
public record ComandaRequest(int IdUser, double Total, string MetodaPlata, List<DetaliiProdusRequest> Produse);
public record DetaliiProdusRequest(int IdFloare, int Cantitate, double PretUnitar);
public record RecoverPasswordRequest(string Email);