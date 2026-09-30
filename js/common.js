// ============================================================
// COMMON.JS — chargé sur TOUTES les pages du site Amani.
// Comportement du navbar, footer, recherche, toast, animation reveal.
// Le comportement propre à une page (carrousel, formulaire...) va
// dans le fichier JS de cette page, pas ici.
// ============================================================

// Apparition progressive des blocs au défilement
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Message flottant réutilisable
function showToast(message) {
  let toast = document.querySelector('.global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'global-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 3500);
}

// Liens externes (réseaux sociaux, etc.) : pas encore de destination réelle
document.querySelectorAll('a.ext-link').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Ce lien externe sera bientôt disponible.');
  });
});

// Liens vers des pages internes pas encore construites : neutralisés en attendant
document.querySelectorAll('a.page-link').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
  });
});

// Menu mobile (la mise en forme est gérée par la classe .open dans common.css)
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

function closeMenu() {
  if (!toggle || !nav) return;
  toggle.classList.remove('open');
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}

if (toggle && nav) {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('open');
    nav.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  // Ferme le menu après un clic sur un lien, sur Échap, ou si l'écran s'agrandit
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 1030) closeMenu(); });
}

// Mise en surbrillance du lien actif selon la section visible
// (ne fait rien sur une page qui n'a pas de <section id="..."> correspondante)
const sections = document.querySelectorAll('section[id]');
const links = document.querySelectorAll('nav.main-nav a');

if (sections.length) {
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 90) current = section.id;
    });
    // Ne change l'état actif que si un lien du menu pointe vers cette section
    const match = Array.from(links).find((l) => l.getAttribute('href') === '#' + current);
    if (!match) return;
    links.forEach((link) => link.classList.toggle('active', link === match));
  });
}

// Barre de recherche
const searchToggle = document.getElementById('searchToggle');
const searchPanel = document.getElementById('searchPanel');
const searchClose = document.getElementById('searchClose');
const searchInput = searchPanel ? searchPanel.querySelector('input') : null;
const searchMsg = document.getElementById('searchMsg');

if (searchToggle && searchPanel) {
  searchToggle.addEventListener('click', () => {
    searchPanel.classList.toggle('open');
    if (searchPanel.classList.contains('open') && searchInput) searchInput.focus();
  });
}
if (searchClose && searchPanel) {
  searchClose.addEventListener('click', () => {
    searchPanel.classList.remove('open');
    if (searchMsg) searchMsg.textContent = '';
  });
}

function runSiteSearch(query) {
  if (!searchMsg) return;
  const q = query.trim().toLowerCase();
  if (!q) { searchMsg.textContent = ''; return; }
  const candidates = document.querySelectorAll('h1, h2, h3, h4, .actu-item p, .gal-cap, .testi-slide, .service-card h4, .why-card h3');
  let found = null;
  candidates.forEach((el) => {
    if (!found && el.textContent.toLowerCase().includes(q)) found = el;
  });
  if (found) {
    searchMsg.textContent = '';
    searchPanel.classList.remove('open');
    const target = found.closest('section') || found;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    found.classList.add('search-hit');
    setTimeout(() => found.classList.remove('search-hit'), 1800);
  } else {
    searchMsg.textContent = `Aucun résultat pour « ${query.trim()} ».`;
  }
}

if (searchInput) {
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') runSiteSearch(searchInput.value);
  });
}
