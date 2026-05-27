(function () {
    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector('script[data-hls-library="1"]');
        if (existing) {
            existing.addEventListener('load', callback);
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
        script.setAttribute('data-hls-library', '1');
        script.onload = callback;
        document.head.appendChild(script);
    }

    function playVideo(video) {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {});
        }
    }

    function attachStream(video, url, done) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            done();
            return;
        }
        loadHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    done();
                });
            } else {
                video.src = url;
                done();
            }
        });
    }

    window.initMoviePlayer = function (config) {
        var video = document.getElementById('movieVideo');
        var overlay = document.getElementById('playerOverlay');
        if (!video || !overlay || !config || !config.url) {
            return;
        }
        var attached = false;
        function start() {
            overlay.classList.add('hidden');
            if (attached) {
                playVideo(video);
                return;
            }
            attached = true;
            attachStream(video, config.url, function () {
                playVideo(video);
            });
        }
        overlay.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!attached) {
                start();
            }
        });
    };
})();
