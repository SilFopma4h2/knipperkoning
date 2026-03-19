// ── Navbar scroll effect ──────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Mobile burger ─────────────────────────────────────────────────
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('.mm-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ── Scroll reveal ─────────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Lightbox ──────────────────────────────────────────────────────
let lbImages = [];
let lbIndex  = 0;

const lightbox     = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
  <button class="lightbox-close" id="lbClose">✕</button>
  <button class="lightbox-prev"  id="lbPrev">‹</button>
  <img id="lbImg" src="" alt="">
  <button class="lightbox-next"  id="lbNext">›</button>
`;
document.body.appendChild(lightbox);

const lbImg  = document.getElementById('lbImg');
const lbClose= document.getElementById('lbClose');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');

function openLightbox(images, index) {
  lbImages = images;
  lbIndex  = index;
  lbImg.src = lbImages[lbIndex];
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', () => {
  lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
  lbImg.src = lbImages[lbIndex];
});
lbNext.addEventListener('click', () => {
  lbIndex = (lbIndex + 1) % lbImages.length;
  lbImg.src = lbImages[lbIndex];
});
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lbPrev.click();
  if (e.key === 'ArrowRight') lbNext.click();
});

// ── Modal ─────────────────────────────────────────────────────────
const overlay   = document.getElementById('modalOverlay');
const modalInner= document.getElementById('modalInner');
const modalClose= document.getElementById('modalClose');

function openModal(product) {
  const imgs = product.images || [];

  // Gallery layout class
  let galleryClass = 'one';
  if (imgs.length === 2) galleryClass = 'two';
  if (imgs.length >= 3) galleryClass = 'many';

  const galleryHTML = imgs.length
    ? `<div class="modal-gallery ${galleryClass}">
        ${imgs.map((src, i) => `<img class="gallery-img" src="${src}" alt="${product.name} foto ${i+1}" loading="lazy" data-index="${i}">`).join('')}
       </div>`
    : '';

  const pricesHTML = product.prices
    .map(p => `<div class="price-item">
      <span class="price-label">${p.label}</span>
      <span class="price-value">${p.value}</span>
    </div>`).join('');

  const specsHTML = product.specs
    .map(s => `<div class="spec-item">
      <div class="spec-label">${s.label}</div>
      <div class="spec-value">${s.value}</div>
    </div>`).join('');

  modalInner.innerHTML = `
    ${galleryHTML}
    <p class="modal-tag">${product.tag}</p>
    <h2 class="modal-title">${product.name}</h2>
    <p class="modal-desc">${product.description}</p>
    <div class="modal-prices">${pricesHTML}</div>
    <div class="modal-spec-grid">${specsHTML}</div>
    <a href="${product.marktplaats_url}" target="_blank" class="modal-cta">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
      Bekijk op Marktplaats
    </a>
  `;

  // Bind lightbox to gallery images
  modalInner.querySelectorAll('.gallery-img').forEach(img => {
    img.addEventListener('click', () => openLightbox(imgs, parseInt(img.dataset.index)));
  });

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
});

// ── Load products from API ────────────────────────────────────────
async function loadProducts() {
  const grid = document.getElementById('productsGrid');

  try {
    const res  = await fetch('/api/products');
    const data = await res.json();

    grid.innerHTML = '';

    data.forEach((product, i) => {
      const card = document.createElement('div');
      card.className = 'product-card reveal';

      const thumb = product.thumb || '';
      const firstPrice = product.prices[0] || {};
      const secondPrice = product.prices[1] || {};

      card.innerHTML = `
        <div class="card-img-wrap">
          ${thumb
            ? `<img class="card-img" src="${thumb}" alt="${product.name}" loading="lazy">`
            : `<div class="card-img" style="background:var(--light-grey)"></div>`
          }
          <div class="card-img-overlay"></div>
          <div class="card-badge">Te huur</div>
          <div class="card-view-hint">Meer info →</div>
        </div>
        <div class="card-body">
          <p class="card-tag">${product.tag}</p>
          <h3 class="card-name">${product.name}</h3>
          <p class="card-desc">${product.short}</p>
          <div class="price-row">
            <div class="price-item">
              <span class="price-label">${firstPrice.label || ''}</span>
              <span class="price-value">${firstPrice.value || ''}</span>
            </div>
            ${secondPrice.label ? `<div class="price-item">
              <span class="price-label">${secondPrice.label}</span>
              <span class="price-value">${secondPrice.value}</span>
            </div>` : ''}
          </div>
        </div>
      `;

      card.addEventListener('click', () => openModal(product));
      grid.appendChild(card);

      // Trigger reveal observer on newly added cards
      setTimeout(() => revealObserver.observe(card), i * 120);
    });

  } catch (err) {
    grid.innerHTML = '<p style="color:var(--text-muted);padding:2rem">Kon producten niet laden. Probeer de pagina te herladen.</p>';
    console.error('API error:', err);
  }
}

loadProducts();
