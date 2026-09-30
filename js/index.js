// ============================================================
// INDEX.JS — comportement propre à la page d'accueil uniquement.
// Charge js/common.js AVANT ce fichier.
// ============================================================

// Carousel de fonds du hero
const heroSlides = document.querySelectorAll('.hero-slide');
if (heroSlides.length > 1) {
  let heroIndex = 0;
  setInterval(() => {
    heroSlides[heroIndex].classList.remove('active');
    heroIndex = (heroIndex + 1) % heroSlides.length;
    heroSlides[heroIndex].classList.add('active');
  }, 5000);
}

// Carrousel des témoignages
const testiCard = document.querySelector('.testi-card');
if (testiCard) {
  const slides = testiCard.querySelectorAll('.testi-slide');
  const dots = testiCard.querySelectorAll('.dot');
  const prevBtn = testiCard.querySelector('.testi-prev');
  const nextBtn = testiCard.querySelector('.testi-next');
  let index = 0;

  function showSlide(i) {
    slides.forEach((s, n) => s.classList.toggle('active', n === i));
    dots.forEach((d, n) => d.classList.toggle('active', n === i));
    index = i;
  }

  if (nextBtn) nextBtn.addEventListener('click', () => showSlide((index + 1) % slides.length));
  if (prevBtn) prevBtn.addEventListener('click', () => showSlide((index - 1 + slides.length) % slides.length));
  dots.forEach((dot, n) => dot.addEventListener('click', () => showSlide(n)));

  setInterval(() => showSlide((index + 1) % slides.length), 6000);
}
