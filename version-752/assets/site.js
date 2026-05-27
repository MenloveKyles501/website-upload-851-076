
(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let currentSlide = 0;
  let heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    heroTimer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      window.clearInterval(heroTimer);
      showSlide(index);
      startHero();
    });
  });

  startHero();

  const searchInput = document.querySelector('.movie-search');
  const filterSelect = document.querySelector('.movie-filter');
  const searchableItems = Array.from(document.querySelectorAll('.movie-card, .horizontal-card, .ranking-row'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function itemText(item) {
    return [
      item.dataset.title,
      item.dataset.region,
      item.dataset.type,
      item.dataset.year,
      item.dataset.tags,
      item.textContent
    ].map(normalize).join(' ');
  }

  function applyFilters() {
    const query = normalize(searchInput ? searchInput.value : '');
    const filter = normalize(filterSelect ? filterSelect.value : '全部');

    searchableItems.forEach(function (item) {
      const text = itemText(item);
      const matchesQuery = !query || text.includes(query);
      const matchesFilter = filter === '全部' || text.includes(filter);
      item.classList.toggle('is-filtered-out', !(matchesQuery && matchesFilter));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilters);
  }
})();
