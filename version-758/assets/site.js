(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
      image.removeAttribute('src');
    });
  });

  var filterInput = document.querySelector('[data-card-filter]');
  var genreSelect = document.querySelector('[data-genre-filter]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function cardMatches(card) {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var genre = genreSelect ? genreSelect.value : '';
    var year = yearSelect ? yearSelect.value : '';
    var title = card.getAttribute('data-title') || '';
    var cardGenre = card.getAttribute('data-genre') || '';
    var cardYear = card.getAttribute('data-year') || '';

    if (keyword && title.indexOf(keyword) === -1) {
      return false;
    }

    if (genre && cardGenre.indexOf(genre) === -1) {
      return false;
    }

    if (year && cardYear !== year) {
      return false;
    }

    return true;
  }

  function applyFilters() {
    var visible = 0;

    cards.forEach(function (card) {
      var matched = cardMatches(card);
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? 'none' : '';
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);
  }

  if (genreSelect) {
    genreSelect.addEventListener('change', applyFilters);
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilters);
  }

  applyFilters();
})();
