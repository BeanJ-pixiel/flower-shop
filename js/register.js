const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

registerForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const fullname = document.getElementById("fullname").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const agreeTerms = document.getElementById("agreeTerms").checked;

  registerMessage.className = "message";

  if (!fullname || !email || !phone || !password || !confirmPassword) {
    showMessage("Bạn vui lòng nhập đầy đủ thông tin.", "error");
    return;
  }

  if (password.length < 6) {
    showMessage("Mật khẩu phải có ít nhất 6 ký tự.", "error");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("Mật khẩu xác nhận không trùng khớp.", "error");
    return;
  }

  if (!/^[0-9]{9,11}$/.test(phone)) {
    showMessage("Số điện thoại cần có từ 9 đến 11 chữ số.", "error");
    return;
  }

  if (!agreeTerms) {
    showMessage("Bạn cần đồng ý với điều khoản sử dụng.", "error");
    return;
  }

  showMessage(
    "Thông tin hợp lệ! Khi tích hợp back-end, hệ thống sẽ xử lý việc tạo tài khoản.",
    "success",
  );
});

function showMessage(content, type) {
  registerMessage.textContent = content;
  registerMessage.className = "message " + type;
}
