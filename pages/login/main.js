const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

const switchBtn = document.getElementById("switch-btn");
const switchLine = document.getElementById("switch-line");

const title = document.getElementById("auth-title");
const subtitle = document.getElementById("auth-subtitle");

// Default view → login
let isLogin = true;

function updateView() {
    if (isLogin) {
        // Show login
        loginForm.classList.add("form-active");
        signupForm.classList.remove("form-active");

        title.textContent = "Welcome Back";
        subtitle.textContent = "Log in to continue";

        switchLine.textContent = "Don’t have an account?";
        switchBtn.textContent = "Create One";

    } else {
        // Show signup
        signupForm.classList.add("form-active");
        loginForm.classList.remove("form-active");

        title.textContent = "Create Account";
        subtitle.textContent = "Start your Remox journey";

        switchLine.textContent = "Already have an account?";
        switchBtn.textContent = "Login";
    }
}

switchBtn.onclick = () => {
    isLogin = !isLogin;
    updateView();
};

updateView();


document.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const y = e.clientY;

    document.querySelectorAll(".shape").forEach((shape, idx) => {
        // چند لایه عمق برای پارالاکس
        const depth = (idx % 4 + 1) * 0.02;  
        const rotate = (idx % 3) * 3;

        shape.style.transform = `
            translate(${x * depth}px, ${y * depth}px)
            rotate(${rotate}deg)
            scale(1)
        `;
    });
});
