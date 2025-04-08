document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nombre = document.getElementById("nombre").value;
        const correo = document.getElementById("correo").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const errorMessage = document.getElementById("errorMessage");
        const successMessage = document.getElementById("successMessage");

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            errorMessage.textContent = "Las contraseñas no coinciden";
            setTimeout(() => {
                errorMessage.textContent = "";
            }, 3000);
            return;
        }

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ nombre, correo, password })
            });

            const data = await response.json();

            if (response.ok) {
                successMessage.textContent = "Registro exitoso. Redirigiendo al login...";
                registerForm.reset();
                setTimeout(() => {
                    window.location.href = "Login.html";
                }, 2000);
            } else {
                errorMessage.textContent = data.error || "Error en el registro";
                setTimeout(() => {
                    errorMessage.textContent = "";
                }, 3000);
            }
        } catch (error) {
            console.error("Error:", error);
            errorMessage.textContent = "Error de conexión. Intente de nuevo.";
            setTimeout(() => {
                errorMessage.textContent = "";
            }, 3000);
        }
    });
});