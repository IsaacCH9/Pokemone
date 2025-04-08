document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const correo = document.getElementById("correo").value;
        const password = document.getElementById("password").value;
        const errorMessage = document.getElementById("errorMessage");

        console.log("Enviando datos de login:", { correo, password: "***" });

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ correo, password })
            });

            const data = await response.json();
            console.log("Guardando datos en sessionStorage");
            if (response.ok) {
                // Guarda en sessionStorage
                sessionStorage.setItem("authToken", data.token);
                sessionStorage.setItem("userId", data.id_usuario);
                sessionStorage.setItem("userName", data.nombre);
                sessionStorage.setItem("isLoggedIn", "true");
                
                console.log("Login exitoso, redirigiendo...");
                window.location.href = "/";
            } else {
                errorMessage.textContent = data.error || "Credenciales incorrectas";
                setTimeout(() => {
                    errorMessage.textContent = "";
                }, 3000);
            }
            console.log("Respuesta del servidor:", data);
        } catch (error) {
            console.error("Error:", error);
            errorMessage.textContent = "Error de conexión. Intente de nuevo.";
            setTimeout(() => {
                errorMessage.textContent = "";
            }, 3000);
        }
    });
});