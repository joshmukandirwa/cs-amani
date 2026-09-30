// ============================================================
// CONTACT.JS — comportement propre à la page Contact uniquement.
// Charge js/common.js AVANT ce fichier.
// ============================================================

const contactForm = document.getElementById('contactForm');
const contactToast = document.getElementById('contactToast');

if (contactForm) {
  const submitBtn = contactForm.querySelector('.contact-submit');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitBtn.classList.contains('loading')) return;
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="btn-spinner"></span> Envoi en cours…';
    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
      if (contactToast) {
        contactToast.textContent = 'Merci ! Votre message a bien été envoyé, nous vous répondrons rapidement.';
        contactToast.classList.add('show');
      }
      contactForm.reset();
    }, 1100);
  });
}
