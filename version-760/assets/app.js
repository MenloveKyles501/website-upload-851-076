(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !mobileNav) {
      return;
    }

    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function initFilters() {
    var search = document.querySelector('[data-search-input]');
    var region = document.querySelector('[data-region-filter]');
    var year = document.querySelector('[data-year-filter]');
    var type = document.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    if (!cards.length || (!search && !region && !year && !type)) {
      return;
    }

    function applyFilters() {
      var query = normalize(search ? search.value : '');
      var regionValue = normalize(region ? region.value : '');
      var yearValue = normalize(year ? year.value : '');
      var typeValue = normalize(type ? type.value : '');

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.genre,
          card.textContent
        ].join(' '));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchRegion = !regionValue || normalize(card.dataset.region) === regionValue;
        var matchYear = !yearValue || normalize(card.dataset.year) === yearValue;
        var matchType = !typeValue || normalize(card.dataset.type) === typeValue;
        card.classList.toggle('is-hidden-by-filter', !(matchQuery && matchRegion && matchYear && matchType));
      });
    }

    [search, region, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  }

  window.initMoviePlayer = function (videoId, url) {
    var video = document.getElementById(videoId);

    if (!video) {
      return;
    }

    var shell = video.closest('.player-shell');
    var startButton = shell ? shell.querySelector('.player-start') : null;
    var stateBox = shell ? shell.querySelector('.player-state') : null;
    var hasAttached = false;
    var hlsInstance = null;

    function setState(message) {
      if (!stateBox) {
        return;
      }

      stateBox.textContent = message || '';
      stateBox.classList.toggle('show', Boolean(message));
    }

    function attachSource() {
      if (hasAttached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        hasAttached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setState('视频暂时无法播放，请稍后再试');
          }
        });
        hasAttached = true;
        return;
      }

      setState('当前设备暂时无法播放此视频');
    }

    function playVideo() {
      attachSource();

      if (startButton) {
        startButton.classList.add('is-hidden');
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (startButton) {
            startButton.classList.remove('is-hidden');
          }
        });
      }
    }

    function toggleVideo() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    if (startButton) {
      startButton.addEventListener('click', playVideo);
    }

    video.addEventListener('click', toggleVideo);
    video.addEventListener('playing', function () {
      setState('');
    });
    video.addEventListener('error', function () {
      setState('视频暂时无法播放，请稍后再试');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
