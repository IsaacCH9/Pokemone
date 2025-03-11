const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'W.34bjywe1',
    database: 'pokemones',
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ruta para agregar Pokémon
app.post("/agregarPokemon", (req, res) => {
    const { nombre, especie, tipo, nivel, habilidad, entrenador, edad, region } = req.body;

    console.log("📥 Datos recibidos en el backend:", req.body);

    const query = "INSERT INTO pokemon (nombre, especie, tipo, nivel, habilidad, entrenador, edad, region) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    pool.query(query, [nombre, especie, tipo, nivel, habilidad, entrenador, edad, region], (err, result) => {
        if (err) {
            console.error("❌ Error en la inserción:", err);
            return res.status(500).json({ error: "Error al registrar Pokémon" });
        }
        console.log("✅ Pokémon insertado con éxito en la base de datos");
        res.json({ success: true, message: `Pokémon ${nombre} registrado exitosamente` });
    });
});

// Ruta para eliminar Pokémon
app.delete('/eliminarPokemon/:id', (req, res) => {
    const id = req.params.id;
    const query = "DELETE FROM pokemon WHERE id = ?";

    pool.query(query, [id], (err, result) => {
        if (err) {
            console.error("❌ Error al eliminar Pokémon:", err);
            return res.status(500).json({ error: "Error al eliminar Pokémon" });
        }
        res.json({ success: true, message: "Pokémon eliminado exitosamente" });
    });
});

// Ruta para obtener todos los Pokemones
app.get("/obtenerPokemones", (req, res) => {
    const query = "SELECT * FROM pokemon";

    pool.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener Pokemones:", err);
            return res.status(500).json({ error: "Error al obtener lista de Pokemones" });
        }
        res.json(results);
    });
});

// Ruta para obtener un Pokémon por ID
app.get('/editarPokemon/:id', (req, res) => {
    const id = req.params.id;
    const query = "SELECT * FROM pokemon WHERE id = ?";

    pool.query(query, [id], (err, results) => {
        if (err) {
            console.error("❌ Error en la consulta SQL:", err);
            return res.status(500).json({ error: "Error al obtener el Pokémon" });
        }

        if (results.length === 0) {
            console.log("⚠️ No se encontró el Pokémon con ID:", id);
            return res.status(404).json({ error: "Pokémon no encontrado" });
        }

        res.json(results[0]); // Devuelve solo el primer resultado
    });
});

// Ruta para actualizar Pokémon
app.put('/actualizarPokemon/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, especie, tipo, nivel, habilidad, entrenador, edad, region } = req.body;

    // Validar que los datos no estén vacíos
    if (!nombre || !especie || !tipo || !nivel || !habilidad || !entrenador || !edad || !region) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    const query = "UPDATE pokemon SET nombre = ?, especie = ?, tipo = ?, nivel = ?, habilidad = ?, entrenador = ?, edad = ?, region = ? WHERE id = ?";

    pool.query(query, [nombre, especie, tipo, nivel, habilidad, entrenador, edad, region, id], (err, result) => {
        if (err) {
            console.error("❌ Error al actualizar Pokémon:", err);
            return res.status(500).json({ error: "Error al actualizar Pokémon." });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Pokémon no encontrado." });
        }

        res.json({ success: true, message: `Pokémon con ID ${id} actualizado exitosamente.` });
    });
});


// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor escuchando en el puerto ${PORT}`);
});
