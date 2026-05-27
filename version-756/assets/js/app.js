(function () {
    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');

        if (!button || !nav) {
            return;
        }

        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');

        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        restart();
    }

    function setupCardFilter() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));

        inputs.forEach(function (input) {
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

            input.addEventListener('input', function () {
                var keyword = input.value.trim().toLowerCase();

                cards.forEach(function (card) {
                    var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
                    card.classList.toggle('is-hidden-by-filter', keyword && haystack.indexOf(keyword) === -1);
                });
            });
        });
    }

    function setupPlayer() {
        var video = document.querySelector('[data-player]');
        var trigger = document.querySelector('[data-play-trigger]');
        var scrollPlay = document.querySelector('[data-scroll-play]');

        if (!video) {
            return;
        }

        var source = video.getAttribute('data-src');
        var initialized = false;
        var hlsInstance = null;

        function initializePlayer(shouldPlay) {
            if (!source) {
                return;
            }

            if (!initialized) {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });

                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                }

                initialized = true;
            }

            if (trigger) {
                trigger.classList.add('is-hidden');
            }

            if (shouldPlay) {
                var promise = video.play();

                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        video.controls = true;
                    });
                }
            }
        }

        if (trigger) {
            trigger.addEventListener('click', function () {
                initializePlayer(true);
            });
        }

        if (scrollPlay) {
            scrollPlay.addEventListener('click', function () {
                window.setTimeout(function () {
                    initializePlayer(true);
                }, 120);
            });
        }

        video.addEventListener('play', function () {
            initializePlayer(false);
        }, { once: true });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    }

    function createSearchCard(movie) {
        return [
            '<a class="movie-card" href="' + movie.url + '">',
            '    <span class="poster-frame">',
            '        <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" />',
            '        <span class="card-category">' + escapeHtml(movie.category) + '</span>',
            '        <span class="card-score">' + escapeHtml(String(movie.score)) + '</span>',
            '        <span class="play-hover">▶</span>',
            '    </span>',
            '    <span class="movie-card-body">',
            '        <strong>' + escapeHtml(movie.title) + '</strong>',
            '        <span class="movie-card-line">' + escapeHtml(movie.oneLine || '') + '</span>',
            '        <span class="movie-meta">',
            '            <span>' + escapeHtml(movie.year || '') + '</span>',
            '            <span>' + escapeHtml(movie.region || '') + '</span>',
            '            <span>' + escapeHtml(movie.genre || '') + '</span>',
            '        </span>',
            '    </span>',
            '</a>'
        ].join('\n');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupSearchPage() {
        var results = document.querySelector('[data-search-results]');

        if (!results || !window.MOVIE_SEARCH_INDEX) {
            return;
        }

        var input = document.querySelector('[data-search-input-main]');
        var count = document.querySelector('[data-search-count]');
        var title = document.querySelector('[data-search-title]');
        var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
        var params = new URLSearchParams(window.location.search);
        var currentKeyword = params.get('q') || '';
        var currentFilter = '';

        if (input) {
            input.value = currentKeyword;
        }

        function normalize(value) {
            return String(value || '').toLowerCase();
        }

        function render() {
            var keyword = normalize(currentKeyword.trim());
            var filter = normalize(currentFilter.trim());
            var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.category,
                    movie.oneLine
                ].join(' '));

                return (!keyword || haystack.indexOf(keyword) !== -1) && (!filter || haystack.indexOf(filter) !== -1);
            });

            results.innerHTML = matched.slice(0, 240).map(createSearchCard).join('\n');

            if (title) {
                title.textContent = keyword || filter ? '搜索结果' : '推荐内容';
            }

            if (count) {
                count.textContent = '共找到 ' + matched.length + ' 条，当前展示前 ' + Math.min(matched.length, 240) + ' 条。';
            }
        }

        if (input) {
            input.addEventListener('input', function () {
                currentKeyword = input.value;
                render();
            });
        }

        filters.forEach(function (button) {
            button.addEventListener('click', function () {
                currentFilter = button.getAttribute('data-filter') || '';
                filters.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                render();
            });
        });

        render();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupCardFilter();
        setupPlayer();
        setupSearchPage();
    });
})();
