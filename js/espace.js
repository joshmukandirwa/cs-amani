// ============================================================
// ESPACE.JS — comportement propre à la page Espace Élève uniquement.
// Charge js/common.js AVANT ce fichier (showToast() en dépend).
// ============================================================

// Afficher / masquer le mot de passe
document.querySelectorAll('.pw-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;
    if (!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.setAttribute('aria-pressed', String(show));
    btn.setAttribute('aria-label', show ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
  });
});

// Connexion Espace Élève — fonctionnalité à venir (page statique pour l'instant)
const espaceForm = document.querySelector('.espace-form');
if (espaceForm) {
  const submitBtn = espaceForm.querySelector('.espace-submit');
  espaceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitBtn.classList.contains('loading')) return;
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="btn-spinner"></span> Connexion…';
    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
      showToast('L\'Espace Élève n\'est pas encore ouvert. Il arrive bientôt.');
    }, 1100);
  });
}
