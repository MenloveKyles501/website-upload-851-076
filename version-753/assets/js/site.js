(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        bindMenu();
        bindHero();
        bindSearchForms();
        bindFilterPage();
        bindPlayers();
    });

    function bindMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function bindHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var prev = root.querySelector(".hero-arrow.prev");
        var next = root.querySelector(".hero-arrow.next");
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        show(0);
        restart();
    }

    function bindSearchForms() {
        Array.prototype.slice.call(document.querySelectorAll(".site-search")).forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input) {
                    return;
                }
                var q = input.value.trim();
                if (!q) {
                    event.preventDefault();
                    window.location.href = "./search.html";
                }
            });
        });
    }

    function bindFilterPage() {
        var page = document.querySelector("[data-search-page]");
        if (!page) {
            return;
        }
        var input = page.querySelector("[data-filter-input]");
        var region = page.querySelector("[data-filter-region]");
        var type = page.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(page.querySelectorAll("[data-card]"));
        var empty = page.querySelector(".empty-state");
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        if (input) {
            input.value = q;
        }

        function norm(value) {
            return String(value || "").toLowerCase();
        }

        function filter() {
            var keyword = norm(input && input.value);
            var regionValue = region ? region.value : "";
            var typeValue = type ? type.value : "";
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-year")
                ].map(norm).join(" ");
                var passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var passRegion = !regionValue || card.getAttribute("data-region") === regionValue;
                var passType = !typeValue || card.getAttribute("data-genre").indexOf(typeValue) !== -1 || card.textContent.indexOf(typeValue) !== -1;
                var show = passKeyword && passRegion && passType;
                card.style.display = show ? "" : "none";
                if (show) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", shown === 0);
            }
        }

        [input, region, type].forEach(function (node) {
            if (node) {
                node.addEventListener("input", filter);
                node.addEventListener("change", filter);
            }
        });
        filter();
    }

    function bindPlayers() {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (box) {
            var video = box.querySelector("video");
            var cover = box.querySelector(".player-cover");
            var src = box.getAttribute("data-play");
            var hls;
            if (!video || !src) {
                return;
            }

            function load() {
                if (video.getAttribute("data-ready") === "1") {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls();
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
                video.setAttribute("data-ready", "1");
            }

            function play() {
                load();
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                video.setAttribute("controls", "controls");
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            }

            box.addEventListener("click", function (event) {
                if (event.target === video) {
                    return;
                }
                play();
            });
            if (cover) {
                cover.addEventListener("click", function (event) {
                    event.preventDefault();
                    play();
                });
            }
            window.addEventListener("pagehide", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    }
})();
