// Función para verificar autenticación
function verificarAutenticacion() {
    const token = sessionStorage.getItem("authToken");
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    
    if (!token || !isLoggedIn || isLoggedIn !== "true") {
        window.location.href = "Login.html";
        return false;
    }
    return true;
}

// Función para incluir el token en todas las peticiones fetch
async function fetchWithAuth(url, options = {}) {
    const token = sessionStorage.getItem("authToken");
    
    if (!token) {
        window.location.href = "Login.html";
        return;
    }
    
    // Añadir headers por defecto si no hay
    if (!options.headers) {
        options.headers = {};
    }
    
    // Añadir token de autorización y tipo de contenido
    options.headers.Authorization = `Bearer ${token}`;
    if (!options.headers["Content-Type"] && options.method && options.method !== "GET") {
        options.headers["Content-Type"] = "application/json";
    }
    
    try {
        const response = await fetch(url, options);
        
        // Si el token expira o es inválido, redirigir al login
        if (response.status === 401 || response.status === 403) {
            sessionStorage.removeItem("authToken");
            sessionStorage.removeItem("isLoggedIn");
            window.location.href = "Login.html";
            return;
        }
        
        return response;
    } catch (error) {
        console.error("Error en la petición:", error);
        throw error;
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    fetch("/logout", { 
        method: "POST",
        credentials: 'include' // Asegúrate de incluir las cookies
    })
    .then(response => {
        console.log("Respuesta de logout:", response.status);
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("userName");
        sessionStorage.removeItem("isLoggedIn");
        window.location.href = "Login.html";
    })
    .catch(error => {
        console.error("Error en logout:", error);
        // Aún así, limpia el sessionStorage y redirige
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("userName");
        sessionStorage.removeItem("isLoggedIn");
        window.location.href = "Login.html";
    });
}