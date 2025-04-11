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

        errorMessage.textContent = "";
        successMessage.textContent = "";
        
        document.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });

        if (password !== confirmPassword) {
            errorMessage.textContent = "Las contraseñas no coinciden";
            document.getElementById("confirmPassword").classList.add('is-invalid');
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
                if (data.token) {
                    sessionStorage.setItem("authToken", data.token);
                    sessionStorage.setItem("userId", data.id_usuario);
                    sessionStorage.setItem("userName", data.nombre);
                    sessionStorage.setItem("isLoggedIn", "true");
                    
                    window.location.href = "/";
                } else {
                    successMessage.textContent = "Registro exitoso. Redirigiendo al login...";
                    registerForm.reset();
                    setTimeout(() => {
                        window.location.href = "Login.html";
                    }, 2000);
                }
            } else {
                errorMessage.textContent = data.error || "Error en el registro";
                
                if (data.campo) {
                    const campoInput = document.getElementById(data.campo);
                    if (campoInput) {
                        campoInput.classList.add('is-invalid');
                        
                        const feedbackDiv = document.createElement('div');
                        feedbackDiv.className = 'invalid-feedback';
                        feedbackDiv.textContent = data.error;
                        
                        campoInput.parentNode.appendChild(feedbackDiv);
                    }
                }
            }
        } catch (error) {
            console.error("Error:", error);
            errorMessage.textContent = "Error de conexión. Intente de nuevo.";
        }
    });
});