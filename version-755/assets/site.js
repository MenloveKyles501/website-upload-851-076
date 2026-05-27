import { H as Hls } from './hls-dru42stk.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMobileNav() {
    const button = $('[data-menu-button]');
    const nav = $('[data-mobile-nav]');
    if (!button || !nav) return;
    button.addEventListener('click', () => {
        nav.classList.toggle('is-open');
    });
}

function setupHero() {
    const root = $('[data-hero]');
    if (!root) return;
    const slides = $$('[data-hero-slide]', root);
    const dots = $$('[data-hero-dot]', root);
    if (slides.length <= 1) return;

    let index = 0;
    let timer = null;

    const show = (next) => {
        index = (next + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };

    const play = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => show(index + 1), 5200);
    };

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            show(i);
            play();
        });
    });

    root.addEventListener('mouseenter', () => window.clearInterval(timer));
    root.addEventListener('mouseleave', play);
    play();
}

function setupFilters() {
    const cards = $$('[data-movie-card]');
    if (!cards.length) return;

    const input = $('[data-search-input]');
    const typeSelect = $('[data-filter-type]');
    const regionSelect = $('[data-filter-region]');
    const counter = $('[data-result-count]');
    const empty = $('[data-empty-state]');

    const apply = () => {
        const q = (input?.value || '').trim().toLowerCase();
        const type = typeSelect?.value || '';
        const region = regionSelect?.value || '';
        let visible = 0;

        cards.forEach((card) => {
            const text = (card.dataset.search || '').toLowerCase();
            const passQuery = !q || text.includes(q);
            const passType = !type || card.dataset.type === type;
            const passRegion = !region || card.dataset.region === region;
            const ok = passQuery && passType && passRegion;
            card.hidden = !ok;
            if (ok) visible += 1;
        });

        if (counter) counter.textContent = `共 ${visible} 部影片`;
        if (empty) empty.hidden = visible !== 0;
    };

    [input, typeSelect, regionSelect].forEach((control) => {
        if (control) control.addEventListener('input', apply);
        if (control) control.addEventListener('change', apply);
    });
}

function setupPlayers() {
    $$('[data-player]').forEach((shell) => {
        const video = $('video', shell);
        const button = $('[data-play-button]', shell);
        const message = $('[data-player-message]', shell);
        const source = shell.dataset.src;
        let loaded = false;
        let hlsInstance = null;

        const setMessage = (text) => {
            if (message) message.textContent = text || '';
        };

        const load = () => {
            if (!video || loaded) return;
            if (!source) {
                setMessage('当前播放源不可用');
                return;
            }

            loaded = true;
            setMessage('正在加载播放源...');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (Hls && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                    setMessage('播放源已就绪');
                });
                hlsInstance.on(Hls.Events.ERROR, (_, data) => {
                    if (data && data.fatal) {
                        setMessage('播放加载异常，请刷新重试');
                    }
                });
            } else {
                video.src = source;
            }
        };

        const play = async () => {
            load();
            if (!video) return;
            try {
                await video.play();
                if (button) button.classList.add('is-hidden');
                setMessage('');
            } catch (error) {
                setMessage('浏览器已阻止自动播放，请再次点击视频播放');
            }
        };

        if (button) button.addEventListener('click', play);
        if (video) {
            video.addEventListener('play', () => {
                if (button) button.classList.add('is-hidden');
                setMessage('');
            });
            video.addEventListener('pause', () => {
                if (button && video.currentTime === 0) button.classList.remove('is-hidden');
            });
        }

        window.addEventListener('beforeunload', () => {
            if (hlsInstance) hlsInstance.destroy();
        });
    });
}

setupMobileNav();
setupHero();
setupFilters();
setupPlayers();
