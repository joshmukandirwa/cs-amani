// ============================================================
// TEMOIGNAGES.JS — comportement propre à la page Témoignages uniquement.
// Charge js/common.js AVANT ce fichier.
// ============================================================

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

  // Défilement automatique : coupé si l'utilisateur préfère moins d'animations,
  // et mis en pause au survol, au toucher ou quand un bouton a le focus.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused = false;
  ['mouseenter', 'focusin', 'touchstart'].forEach((ev) => testiCard.addEventListener(ev, () => { paused = true; }, { passive: true }));
  ['mouseleave', 'focusout'].forEach((ev) => testiCard.addEventListener(ev, () => { paused = false; }));
  if (!reduceMotion) {
    setInterval(() => { if (!paused && !document.hidden) showSlide((index + 1) % slides.length); }, 6000);
  }

  // Les points sont aussi utilisables au clavier
  dots.forEach((dot, n) => {
    dot.tabIndex = 0;
    dot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showSlide(n); }
    });
  });
}

// Formulaire "Partagez votre témoignage" — envoi simulé (page statique)
const testiForm = document.getElementById('testiForm');
const testiToast = document.getElementById('testiToast');

if (testiForm) {
  const submitBtn = testiForm.querySelector('.testi-submit');
  testiForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitBtn.classList.contains('loading')) return;
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="testi-btn-spinner"></span> Envoi en cours…';
    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
      if (testiToast) {
        testiToast.textContent = 'Merci ! Votre témoignage a bien été envoyé, il sera publié après validation.';
        testiToast.classList.add('show');
      }
      testiForm.reset();
    }, 1100);
  });
}
