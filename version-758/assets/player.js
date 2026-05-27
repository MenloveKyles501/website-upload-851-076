(function () {
  function bindMoviePlayer() {
    var video = document.querySelector('[data-movie-player]');
    var startButton = document.querySelector('[data-player-start]');
    var overlay = document.querySelector('[data-player-overlay]');
    var Hls = window.Hls;

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-source');

    if (!source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    function startPlayback() {
      var attempt = video.play();

      if (attempt && typeof attempt.then === 'function') {
        attempt.then(function () {
          if (overlay) {
            overlay.classList.add('hidden');
          }
        }).catch(function () {
          if (overlay) {
            overlay.classList.remove('hidden');
          }
        });
      } else if (overlay) {
        overlay.classList.add('hidden');
      }
    }

    if (startButton) {
      startButton.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (overlay) {
        overlay.classList.remove('hidden');
      }
    });
  }

  bindMoviePlayer();
})();
