require("dotenv").config();
const mysql = require("mysql2");

// Configuración de la base de datos con variables de entorno
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
});

// Función para ejecutar consultas
const Conexion = {
    query: (sql, params, callback) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error("❌ Error al conectar con MySQL:", err);
                callback(err, null);
                return;
            }
            connection.query(sql, params, (err, results) => {
                connection.release();
                callback(err, results);
            });
        });
    }
};

module.exports = Conexion;
