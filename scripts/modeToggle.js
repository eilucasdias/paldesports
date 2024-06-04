document.addEventListener("DOMContentLoaded", function () {
  const body = document.getElementById("body");
  const modoClaroButton = document.getElementById("modo-claro");
  const faSun = document.querySelector(".fa-sun");
  const faMoon = document.querySelector(".fa-moon");
  faMoon.style.display = "none";
  modoClaroButton.addEventListener("click", () => {
    body.classList.toggle("modo-claro");
    faSun.style.display =
      faSun.style.display === "none" ? "inline-block" : "none";
    faMoon.style.display =
      faMoon.style.display === "none" ? "inline-block" : "none";
  });
});
