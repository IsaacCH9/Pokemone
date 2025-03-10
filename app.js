const express = require("express");
const mysql = require("mysql2");
require("dotenv").config();

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

con.connect((err) => {
    if (err) {
        console.error("Error al conectar a la base de datos:", err);
        return;
    }
    console.log("Conectado a Railway MySQL");
});


app.use(express.json());
app.use(bodyParser.json());



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Ruta para agregar Pokémon
app.post("/agregarPokemon", (req, res) => {
    const { nombre, especie, tipo, nivel, habilidad, entrenador, edad, region } = req.body;

    // Log para depuración
    console.log("Datos recibidos en el backend:", req.body);

    const query = "INSERT INTO pokemon (nombre, especie, tipo, nivel, habilidad, entrenador, edad, region) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    con.query(query, [nombre, especie, tipo, nivel, habilidad, entrenador, edad, region], (err, result) => {
        if (err) {
            console.error("Error en la inserción:", err);
            return res.status(500).json({ error: "Error al registrar Pokémon" });
        }
        console.log("Pokémon insertado con éxito en la base de datos");
        res.json({ success: true, message: `Pokémon ${nombre} registrado exitosamente` });
    });
});

app.delete('/eliminarPokemon/:id', (req, res) => {
    const id = req.params.id;
    const query = "DELETE FROM pokemon WHERE id = ?";
    con.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error al eliminar Pokémon:", err);
            return res.status(500).json({ error: "Error al eliminar Pokémon" });
        }
        res.json({ success: true, message: "Pokémon eliminado exitosamente" });
    });
});



// Ruta para obtener todos los Pokemones
// Add this route to get all Pokemon
app.get("/obtenerPokemones", (req, res) => {
    const query = "SELECT * FROM pokemon";
    con.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener Pokemones:", err);
            return res.status(500).json({ error: "Error al obtener lista de Pokemones" });
        }
        res.json(results);
    });
});



app.put('/actualizarPokemon/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, especie, tipo, nivel, habilidad, entrenador, edad, region } = req.body;

    // Verificación de datos recibidos
    if (!nombre || !especie || !tipo || !nivel || !habilidad || !entrenador || !edad || !region) {
        return res.status(400).json({ error: "Todos los campos son obligatorios para actualizar el Pokémon." });
    }

    const query = "UPDATE pokemon SET nombre = ?, especie = ?, tipo = ?, nivel = ?, habilidad = ?, entrenador = ?, edad = ?, region = ? WHERE id = ?";
    con.query(query, [nombre, especie, tipo, nivel, habilidad, entrenador, edad, region, id], (err, result) => {
        if (err) {
            console.error("Error al actualizar Pokémon:", err);
            return res.status(500).json({ error: "Error al actualizar Pokémon" });
        }
        res.json({ success: true, message: "Pokémon actualizado exitosamente" });
    });
});

// Iniciar servidor
app.listen(3000, () => {
    console.log("Servidor escuchando en el puerto 3000");
});
