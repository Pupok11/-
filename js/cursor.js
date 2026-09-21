/* ============================================
   CURSOR.JS — Кастомный курсор + частицы пыли
   С фиксом: не пропадает над модалками и корзиной
   ============================================ */

(function() {
    'use strict';

    const cursor = document.getElementById('cursor');
    const canvas = document.getElementById('cursor-canvas');
    const isMobile = window.innerWidth <= 1000;

    if (!cursor || isMobile) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let curX = mouseX;
    let curY = mouseY;
    let isFirstMove = false;

    const hoverSelectors = [
        'a', 'button', 'input', 'textarea', 'select', 'label',
        '.btn', '.project-card', '.service', '.tab',
        '.metric-card', '.carousel-btn',
        '.cart-btn', '.cart-item__qty button', '.cart-item__remove',
        '.cart-panel__close', '.add-to-cart', '.quick-view-btn',
        '.quick-modal__close', '.search-open-btn', '.search-result-item',
        '.chat-widget__btn', '.chat-widget__head button', '.chat-widget__foot button',
        '.faq-item__q', '.star-input svg', '.compare-bar__btn',
        '.compare-bar__clear', '.compare-modal__close',
        '.theme-toggle', '.scroll-top', '.sound-toggle',
        '.breadcrumbs a', '.recently-viewed__item', '.recently-viewed__close'
    ];
    const hoverSelector = hoverSelectors.join(',');

    function attachHoverListeners() {
        document.querySelectorAll(hoverSelector).forEach(el => {
            if (el.dataset.cursorBound) return;
            el.dataset.cursorBound = 'true';
            el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
        });
    }
    attachHoverListeners();

    const observer = new MutationObserver(() => attachHoverListeners());
    observer.observe(document.body, { childList: true, subtree: true });

    // === MOUSE MOVE ===
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!isFirstMove) {
            isFirstMove = true;
            curX = mouseX;
            curY = mouseY;
            cursor.style.left = curX + 'px';
            cursor.style.top = curY + 'px';
            cursor.classList.add('is-active');
            if (canvas) canvas.classList.add('is-active');
        }

        // Восстанавливаем видимость, если она пропала
        if (cursor.style.opacity === '0' || cursor.style.opacity === '') {
            cursor.style.opacity = '1';
        }
    });

    window.addEventListener('mousedown', () => cursor.classList.add('is-clicking'));
    window.addEventListener('mouseup', () => cursor.classList.remove('is-clicking'));

    // === ФИКС: скрываем только когда мышь РЕАЛЬНО ушла за пределы окна ===
    document.addEventListener('mouseleave', (e) => {
        const y = e.clientY;
        const x = e.clientX;
        if (y <= 0 || x <= 0 || x >= window.innerWidth || y >= window.innerHeight) {
            cursor.style.opacity = '0';
        }
    });

    document.addEventListener('mouseenter', () => {
        if (isFirstMove) cursor.style.opacity = '1';
    });

    // === ФИКС: если фокус уходит в iframe (яндекс-карта) — не скрываем ===
    window.addEventListener('blur', () => {
        // Не скрываем курсор при потере фокуса окна
    });

    // === ANIMATION LOOP ===
    function animateCursor() {
        curX += (mouseX - curX) * 0.22;
        curY += (mouseY - curY) * 0.22;
        cursor.style.left = curX + 'px';
        cursor.style.top = curY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // === DUST PARTICLES ===
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;

    function resizeCanvas() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const DUST_COUNT = 30;
    const dust = [];

    function initDust() {
        dust.length = 0;
        for (let i = 0; i < DUST_COUNT; i++) {
            dust.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.3,
                vy: -Math.random() * 0.2 - 0.05,
                size: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.3 + 0.15
            });
        }
    }
    initDust();
    window.addEventListener('resize', initDust);

    let lastMouseX = mouseX;
    let lastMouseY = mouseY;

    function animateDust() {
        ctx.clearRect(0, 0, w, h);
        const mouseSpeed = Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY);
        lastMouseX = mouseX;
        lastMouseY = mouseY;

        dust.forEach(p => {
            p.x += p.vx + (mouseX - p.x) * 0.00005 * mouseSpeed;
            p.y += p.vy;
            const dx = p.x - mouseX;
            const dy = p.y - mouseY;
            const dist = Math.hypot(dx, dy);
            if (dist < 150 && dist > 0) {
                const force = (150 - dist) / 150;
                p.x += (dx / dist) * force * 2.5;
                p.y += (dy / dist) * force * 2.5;
            }
            if (p.x < -20) p.x = w + 20;
            if (p.x > w + 20) p.x = -20;
            if (p.y < -20) p.y = h + 20;
            if (p.y > h + 20) p.y = -20;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(199, 160, 111, ${p.opacity})`;
            ctx.fill();
        });

        requestAnimationFrame(animateDust);
    }
    animateDust();

    window.addEventListener('resize', () => {
        if (window.innerWidth <= 1000) {
            cursor.style.display = 'none';
            canvas.style.display = 'none';
        } else {
            cursor.style.display = 'block';
            canvas.style.display = 'block';
        }
    });
})();