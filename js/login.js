const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const message = document.getElementById("message");
const forgotPassword = document.getElementById("forgotPassword");

// Hiện hoặc ẩn mật khẩu
togglePassword.addEventListener("click", function () {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.textContent = "Ẩn";
    } else {
        passwordInput.type = "password";
        togglePassword.textContent = "Hiện";
    }
});

// Kiểm tra dữ liệu giao diện đăng nhập
loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;

    message.className = "message";

    if (!email || !password) {
        message.textContent = "Bạn vui lòng nhập đầy đủ email và mật khẩu.";
        message.classList.add("error");
        return;
    }

    if (password.length < 6) {
        message.textContent = "Mật khẩu cần có ít nhất 6 ký tự.";
        message.classList.add("error");
        return;
    }

    message.textContent =
        "Giao diện đã kiểm tra dữ liệu. Chức năng đăng nhập thật cần kết nối back-end.";
    message.classList.add("success");
});

// Minh họa chức năng quên mật khẩu
forgotPassword.addEventListener("click", function (event) {
    event.preventDefault();

    message.className = "message";
    message.textContent =
        "Chức năng đặt lại mật khẩu sẽ được hoàn thiện khi kết nối back-end.";
    message.classList.add("success");
});