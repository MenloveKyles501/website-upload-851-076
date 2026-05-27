(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupSearchForms() {
    document.querySelectorAll('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var url = './search.html';
        if (value) {
          url += '?q=' + encodeURIComponent(value);
        }
        window.location.href = url;
      });
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        move(1);
        restart();
      });
    }
    show(0);
    restart();
  }

  function setupFilters() {
    document.querySelectorAll('.page-filter').forEach(function (panel) {
      var input = panel.querySelector('.filter-input');
      var select = panel.querySelector('.filter-type');
      var scope = panel.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.filter-card'));
      var empty = scope.querySelector('.empty-state');
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      if (input && query) {
        input.value = query;
      }

      function apply() {
        var text = input ? input.value.trim().toLowerCase() : '';
        var type = select ? select.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = card.getAttribute('data-search') || '';
          var cardType = card.getAttribute('data-type') || '';
          var matchText = !text || haystack.indexOf(text) !== -1;
          var matchType = !type || cardType === type;
          var show = matchText && matchType;
          card.classList.toggle('is-hidden', !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (select) {
        select.addEventListener('change', apply);
      }
      apply();
    });
  }

  ready(function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
  });
})();
