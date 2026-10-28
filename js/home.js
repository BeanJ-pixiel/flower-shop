const detailButtons = document.querySelectorAll(".detail-btn");
const homeMessage = document.getElementById("homeMessage");

detailButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const productCard = button.closest(".product-card");
    const productName = productCard.querySelector("h3").textContent;

    homeMessage.textContent =
      "Bạn đang quan tâm đến: " +
      productName +
      ". Chức năng xem chi tiết sẽ được bổ sung sau.";

    homeMessage.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });
});
