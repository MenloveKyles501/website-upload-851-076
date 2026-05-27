(function () {
  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById("moviePlayer");
    var cover = document.getElementById("playMask");
    var attached = false;
    var hlsInstance = null;

    if (!video || !cover || !streamUrl) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attachStream();
      cover.classList.add("is-hidden");
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          cover.classList.remove("is-hidden");
        });
      }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  };
})();
