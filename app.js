const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const { body, param, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
app.use(express.static('public'));
const JWT_SECRET = 'tu_clave_secreta_muy_segura';
const JWT_EXPIRY = '2h';
const dotenv = require('dotenv');
dotenv.config();
const pool = mysql.createPool({
    host: 'crud-pokemon-carbajal-08b7.b.aivencloud.com',
    user: 'avnadmin',
    password: process.env.PASSWORD,
    database: 'pokemones',
    port: 13387
});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Añadir estas importaciones al principio del archivo app.js
const saltRounds = 10;
// Añade esto a tu app.js, justo antes de las demás rutas
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: './public' });
});

app.get('/index.html', (req, res) => {
    res.sendFile('index.html', { root: './public' });
});
// Middleware para verificar token JWT (añadir después de las configuraciones del app)
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    if (!token) {
        return res.status(401).json({ error: "Acceso no autorizado" });
    }

    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Sesión expirada, por favor inicie sesión nuevamente" });
        }
        return res.status(403).json({ error: "Token inválido" });
    }
};

// Registro de usuarios
app.post(
    "/register",
    [
        body("nombre")
            .trim()
            .isLength({ min: 2, max: 50 }).withMessage("El nombre debe tener entre 2 y 50 caracteres")
            .matches(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/).withMessage("El nombre solo puede contener letras y espacios")
            .escape(),
        body("correo")
            .isEmail().withMessage("Ingrese un correo electrónico válido")
            .normalizeEmail()
            .custom(async (value) => {
                // Verificar que el correo no exista ya
                const [results] = await pool.promise().query("SELECT * FROM usuarios WHERE correo = ?", [value]);
                if (results.length > 0) {
                    throw new Error("El correo ya está registrado");
                }
                return true;
            }),
        body("password")
            .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres")
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage("La contraseña debe incluir al menos una letra mayúscula, una minúscula y un número")
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: "Datos inválidos", 
                detalles: errors.array().map(err => ({ campo: err.param, mensaje: err.msg }))
            });
        }

        try {
            const { nombre, correo, password } = req.body;
            
            // Encriptar la contraseña
            const hash = await bcrypt.hash(password, saltRounds);
            
            // Usar parámetros para evitar inyección SQL
            const [result] = await pool.promise().query(
                "INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)",
                [nombre, correo, hash]
            );
            
            res.json({ success: true, message: "Usuario registrado exitosamente" });
        } catch (error) {
            console.error("Error al registrar usuario:", error);
            res.status(500).json({ error: "Error en el servidor al registrar usuario" });
        }
    }
);

// Ruta para login
app.post(
    "/login",
    [
        body("correo").isEmail().normalizeEmail(),
        body("password").isLength({ min: 1 })
    ],
    (req, res) => {
        console.log("Intento de login:", req.body.correo);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: "Datos inválidos", detalles: errors.array() });
        }

        const { correo, password } = req.body;

        // Buscar usuario por correo
        pool.query("SELECT * FROM usuarios WHERE correo = ?", [correo], (err, results) => {
            if (err) {
                console.error("Error al buscar usuario:", err);
                return res.status(500).json({ error: "Error en el servidor" });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: "Usuario no registrado. Por favor, regístrese primero." });
            }

            const usuario = results[0];

            // Verificar contraseña
            bcrypt.compare(password, usuario.password, (err, match) => {
                if (err) {
                    console.error("Error al verificar contraseña:", err);
                    return res.status(500).json({ error: "Error en el servidor" });
                }

                if (!match) {
                    return res.status(401).json({ error: "Correo o contraseña incorrectos" });
                }
                
                const token = jwt.sign(
                    { 
                        id: usuario.id_usuario, 
                        correo: usuario.correo,
                        nombre: usuario.nombre
                    }, 
                    JWT_SECRET,
                    { expiresIn: JWT_EXPIRY }
                );

                res.cookie('token', token, {
                    httpOnly: true,         // No accesible vía JavaScript
                    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
                    sameSite: 'strict',     // Protección CSRF
                    maxAge: 7200000         // 2 horas en milisegundos
                });
                // Enviar datos básicos del usuario (sin la contraseña)
                res.json({
                    id_usuario: usuario.id_usuario,
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                    token: token
                });
            });
        });
    }
);

// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
    console.log("Petición de logout recibida");
    res.clearCookie('token');
    res.json({ message: "Sesión cerrada correctamente" });
});

// Ruta para agregar pokémon (protegida)
app.post(
    "/agregarPokemon",
    authenticateJWT, // Middleware de autenticación
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
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: "Datos inválidos", detalles: errors.array() });
        }

        try {
            const { nombre, especie, tipo, nivel, habilidad, entrenador, edad, region } = req.body;
            const id_usuario = req.user.id; // Obtenido del token JWT verificado
            
            const [result] = await pool.promise().query(
                "INSERT INTO pokemon (nombre, especie, tipo, nivel, habilidad, entrenador, edad, region, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [nombre, especie, tipo, nivel, habilidad, entrenador, edad, region, id_usuario]
            );
            
            res.json({ 
                success: true, 
                message: `Pokémon ${nombre} registrado exitosamente.`,
                id: result.insertId
            });
        } catch (error) {
            console.error("Error en la inserción:", error);
            res.status(500).json({ error: "Error al registrar Pokémon." });
        }
    }
);

// Ruta para eliminar Pokémon
app.delete(
    "/eliminarPokemon/:id",
    authenticateJWT,
    [param("id").isInt({ min: 1 })],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: "ID inválido", detalles: errors.array() });
        }

        const id = parseInt(req.params.id);
        const id_usuario = req.user.id;
        const query = "DELETE FROM pokemon WHERE id = ? AND id_usuario = ?";

        pool.query(query, [id, id_usuario], (err, result) => {
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

app.get("/obtenerPokemones", authenticateJWT, (req, res) => {
    const id_usuario = req.user.id;  // Obtener el ID del usuario del token JWT
    let query = "SELECT * FROM pokemon WHERE id_usuario = ?";
    let params = [id_usuario];

    pool.query(query, params, (err, results) => {
        if (err) {
            console.error("Error al obtener Pokemones:", err);
            return res.status(500).json({ error: "Error al obtener lista de Pokemones" });
        }
        res.json(results);
    });
});

app.get('/obtenerPokemon/:id',authenticateJWT, (req, res) => {
    const id = req.params.id;
    const id_usuario = req.user.id;
    const query = "SELECT * FROM pokemon WHERE id = ? AND id_usuario = ?";

    pool.query(query, [id, id_usuario], (err, results) => {
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
    authenticateJWT,
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
        const id_usuario = req.user.id;

        const query = "UPDATE pokemon SET nombre = ?, especie = ?, tipo = ?, nivel = ?, habilidad = ?, entrenador = ?, edad = ?, region = ? WHERE id = ? AND id_usuario = ?";
        
        pool.query(query, [nombre, especie, tipo, nivel, habilidad, entrenador, edad, region, id, id_usuario], (err, result) => {
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
app.listen(PORT, '0.0.0.0',() => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
