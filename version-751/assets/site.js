(function () {
    var menuButton = document.querySelector('.menu-toggle');
    if (menuButton) {
        menuButton.addEventListener('click', function () {
            var expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!expanded));
            document.body.classList.toggle('menu-open', !expanded);
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                schedule();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                schedule();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                schedule();
            });
        });

        show(0);
        schedule();
    }

    document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
        var input = scope.querySelector('.movie-search');
        var filters = Array.prototype.slice.call(scope.querySelectorAll('.movie-filter'));
        var items = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-row'));
        var empty = scope.querySelector('.empty-state');

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;
            items.forEach(function (item) {
                var text = (item.getAttribute('data-text') || item.getAttribute('data-title') || '').toLowerCase();
                var matched = !keyword || text.indexOf(keyword) !== -1;
                filters.forEach(function (filter) {
                    var key = filter.getAttribute('data-filter');
                    var value = filter.value;
                    if (value && item.getAttribute('data-' + key) !== value) {
                        matched = false;
                    }
                });
                item.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        filters.forEach(function (filter) {
            filter.addEventListener('change', apply);
        });
    });

    var player = document.querySelector('.player-shell');
    if (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.player-start');
        var src = player.getAttribute('data-video');
        var started = false;
        var hls = null;

        function attachVideo() {
            if (!video || !src || started) {
                return Promise.resolve();
            }
            started = true;
            if (button) {
                button.classList.add('is-hidden');
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                return video.play();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(src);
                hls.attachMedia(video);
                return new Promise(function (resolve) {
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().then(resolve).catch(resolve);
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                        }
                    });
                });
            }
            video.src = src;
            return video.play();
        }

        if (button) {
            button.addEventListener('click', function () {
                attachVideo().catch(function () {});
            });
        }

        video.addEventListener('click', function () {
            if (!started) {
                attachVideo().catch(function () {});
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }
})();
