
(function () {
  const video = document.getElementById('movie-video');
  const playMask = document.querySelector('.play-mask');
  const sourceElement = document.getElementById('source-data');

  if (!video || !playMask || !sourceElement) {
    return;
  }

  let sourceUrl = '';
  let hlsInstance = null;
  let started = false;

  try {
    const payload = JSON.parse(sourceElement.textContent || '{}');
    sourceUrl = payload.url || '';
  } catch (error) {
    sourceUrl = '';
  }

  function attachSource() {
    if (!sourceUrl || started) {
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  }

  function playVideo() {
    attachSource();
    playMask.classList.add('is-hidden');

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        playMask.classList.remove('is-hidden');
      });
    }
  }

  playMask.addEventListener('click', playVideo);

  video.addEventListener('click', function () {
    if (!started) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    playMask.classList.add('is-hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
