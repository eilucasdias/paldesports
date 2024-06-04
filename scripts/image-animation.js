const images = document.querySelectorAll(".fc24-img img");
let currentIndex = 0;
images.forEach((image, index) => {
  if (index !== 0) {
    image.style.display = "none";
  }
});
function animateImages() {
  images[currentIndex].style.display = "none";
  currentIndex = (currentIndex + 1) % images.length;
  images[currentIndex].style.display = "block";
  setTimeout(animateImages, 2700);
}
animateImages();
