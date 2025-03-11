const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const { body, param, validationResult } = require("express-validator");

const app = express();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'W.34bjywe1',
    database: 'pokemones',
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post(
    "/agregarPokemon",
    [
        body("nombre").trim().escape().isLength({ min: 1, max: 50 }),
        body("especie").trim().escape().isLength({ min: 1, max: 50 }),
        body("tipo").trim().escape().isLength({ min: 1, max: 50 }),
        body("nivel").isInt({ min: 1, max: 100 }),
        body("habilidad").trim().escape().isLength({ min: 1, max: 50 }),
        body("entrenador").trim().escape().isLength({ min: 1, max: 50 }),
        body("edad").isInt({ min: 1, max: 120 }),
        body("region").trim().escape().isLength({ min: 1, max: 50 }),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: "Datos inválidos", detalles: errors.array() });
        }

        const { nombre, especie, tipo, nivel, habilidad, entrenador, edad, region } = req.body;

        const query = "INSERT INTO pokemon (nombre, especie, tipo, nivel, habilidad, entrenador, edad, region) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        pool.query(query, [nombre, especie, tipo, nivel, habilidad, entrenador, edad, region], (err, result) => {
            if (err) {
                console.error("Error en la inserción:", err);
                return res.status(500).json({ error: "Error al registrar Pokémon." });
            }
            console.log("Pokémon insertado con éxito en la base de datos");
            res.json({ success: true, message: `Pokémon ${nombre} registrado exitosamente.` });
        });
    }
);

// Ruta para eliminar Pokémon
app.delete(
    "/eliminarPokemon/:id",
    [param("id").isInt({ min: 1 })],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: "ID inválido", detalles: errors.array() });
        }

        const id = parseInt(req.params.id);
        const query = "DELETE FROM pokemon WHERE id = ?";

        pool.query(query, [id], (err, result) => {
            if (err) {
                console.error("Error al eliminar Pokémon:", err);
                return res.status(500).json({ error: "Error al eliminar Pokémon" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Pokémon no encontrado." });
            }

            res.json({ success: true, message: "Pokémon eliminado exitosamente" });
        });
    }
);

app.get("/obtenerPokemones", (req, res) => {
    const query = "SELECT * FROM pokemon";

    pool.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener Pokemones:", err);
            return res.status(500).json({ error: "Error al obtener lista de Pokemones" });
        }
        res.json(results);
    });
});

app.get('/obtenerPokemon/:id', (req, res) => {
    const id = req.params.id;
    const query = "SELECT * FROM pokemon WHERE id = ?";

    pool.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error en la consulta SQL:", err);
            return res.status(500).json({ error: "Error al obtener el Pokémon" });
        }

        if (results.length === 0) {
            console.log("No se encontró el Pokémon con ID:", id);
            return res.status(404).json({ error: "Pokémon no encontrado" });
        }

        res.json(results[0]);
    });
});

app.put(
    "/actualizarPokemon/:id",
    [
        param("id").isInt({ min: 1 }),
        body("nombre").trim().escape().isLength({ min: 1, max: 50 }),
        body("especie").trim().escape().isLength({ min: 1, max: 50 }),
        body("tipo").trim().escape().isLength({ min: 1, max: 50 }),
        body("nivel").isInt({ min: 1, max: 100 }),
        body("habilidad").trim().escape().isLength({ min: 1, max: 50 }),
        body("entrenador").trim().escape().isLength({ min: 1, max: 50 }),
        body("edad").isInt({ min: 1, max: 120 }),
        body("region").trim().escape().isLength({ min: 1, max: 50 }),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: "Datos inválidos", detalles: errors.array() });
        }

        const id = parseInt(req.params.id);
        const { nombre, especie, tipo, nivel, habilidad, entrenador, edad, region } = req.body;

        const query = "UPDATE pokemon SET nombre = ?, especie = ?, tipo = ?, nivel = ?, habilidad = ?, entrenador = ?, edad = ?, region = ? WHERE id = ?";

        pool.query(query, [nombre, especie, tipo, nivel, habilidad, entrenador, edad, region, id], (err, result) => {
            if (err) {
                console.error("Error al actualizar Pokémon:", err);
                return res.status(500).json({ error: "Error al actualizar Pokémon." });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Pokémon no encontrado." });
            }

            res.json({ success: true, message: `Pokémon con ID ${id} actualizado exitosamente.` });
        });
    }
);



// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
