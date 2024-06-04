function mostrarPopup() {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("popup").style.display = "block";
}
document
  .querySelector(".link-criar-uma-conta")
  .addEventListener("click", function (event) {
    event.preventDefault();
    mostrarPopup();
  });
