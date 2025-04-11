CREATE DATABASE IF NOT EXISTS pokemones;
USE pokemones;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pokemon (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    nivel INT NOT NULL CHECK (nivel BETWEEN 1 AND 100),
    habilidad VARCHAR(50) NOT NULL,
    entrenador VARCHAR(50) NOT NULL,
    edad INT NOT NULL CHECK (edad BETWEEN 1 AND 120),
    region VARCHAR(50) NOT NULL,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);