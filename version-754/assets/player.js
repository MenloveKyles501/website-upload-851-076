(function () {
  function initPlayer(source) {
    var shell = document.querySelector('.player-shell');
    var video = document.querySelector('.player-video');
    var overlay = document.querySelector('.player-overlay');
    if (!shell || !video || !source) {
      return;
    }
    var attached = false;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.hlsPlayer = hls;
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.hidden = true;
      }
      shell.classList.add('is-playing');
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          if (overlay) {
            overlay.hidden = false;
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  }

  window.initPlayer = initPlayer;
})();
