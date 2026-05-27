(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function initFilters() {
        var input = document.querySelector('.page-filter-input');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-results [data-title]'));
        var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chips .chip'));
        if (!cards.length) {
            return;
        }
        var chipValue = 'all';
        function cardText(card) {
            return [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-category') || '',
                card.getAttribute('data-type') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-keywords') || ''
            ].join(' ').toLowerCase();
        }
        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var text = cardText(card);
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesChip = chipValue === 'all' || text.indexOf(chipValue.toLowerCase()) !== -1;
                card.classList.toggle('is-hidden', !(matchesQuery && matchesChip));
            });
        }
        if (input) {
            input.addEventListener('input', apply);
        }
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('active');
                });
                chip.classList.add('active');
                chipValue = chip.getAttribute('data-filter') || 'all';
                apply();
            });
        });
    }

    function escapeHtml(text) {
        return String(text || '').replace(/[&<>"']/g, function (ch) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[ch];
        });
    }

    function initSearchPage() {
        var box = document.getElementById('searchResults');
        var input = document.getElementById('searchInput');
        var summary = document.getElementById('searchSummary');
        if (!box || !input || !window.MOVIE_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        input.value = q;
        function render(query) {
            var term = query.trim().toLowerCase();
            var list = window.MOVIE_INDEX.filter(function (item) {
                return !term || item.search.indexOf(term) !== -1;
            }).slice(0, 96);
            summary.textContent = term ? '搜索结果：' + query : '热门推荐';
            if (!list.length) {
                box.innerHTML = '<div class="content-card"><h2>未找到匹配影片</h2><p>可以尝试更换片名、题材或年份继续搜索。</p></div>';
                return;
            }
            box.innerHTML = list.map(function (item) {
                var tags = item.tags.slice(0, 3).map(function (tag) {
                    return '<span>' + escapeHtml(tag) + '</span>';
                }).join('');
                return '<article class="movie-card grid">' +
                    '<a class="poster-link" href="' + item.url + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="poster-badge">' + escapeHtml(item.type) + '</span></a>' +
                    '<div class="card-body"><div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.category) + '</span></div>' +
                    '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
                    '<p>' + escapeHtml(item.line) + '</p><div class="tag-row">' + tags + '</div></div></article>';
            }).join('');
        }
        render(q);
        input.addEventListener('input', function () {
            render(input.value);
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initSearchPage();
    });
})();
