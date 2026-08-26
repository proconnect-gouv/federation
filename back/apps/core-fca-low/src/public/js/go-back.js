document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".go-back-link").forEach((el) => {
    el.addEventListener("click", () => {
      history.back();
    });
  });
});
