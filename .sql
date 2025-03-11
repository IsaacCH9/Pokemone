--codigo de la base de datos con valores para probar

CREATE DATABASE pokemones;
USE pokemones;

CREATE TABLE pokemon (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    nivel INT CHECK(nivel BETWEEN 1 AND 100) NOT NULL,
    habilidad VARCHAR(50) NOT NULL,
    entrenador VARCHAR(50) NOT NULL,
    edad INT CHECK(edad BETWEEN 1 AND 120) NOT NULL,
    region VARCHAR(50) NOT NULL
);

INSERT INTO pokemon (nombre, especie, tipo, nivel, habilidad, entrenador, edad, region) VALUES 
('Pikachu', 'Ratón', 'Eléctrico', 35, 'Electricidad estática', 'Ash', 10, 'Kanto'),
('Charmander', 'Lagarto', 'Fuego', 25, 'Mar de llamas', 'Red', 12, 'Kanto'),
('Squirtle', 'Tortuga', 'Agua', 20, 'Torrente', 'Gary', 11, 'Kanto'),
('Bulbasaur', 'Semilla', 'Planta/Veneno', 30, 'Espesura', 'Misty', 9, 'Kanto');
