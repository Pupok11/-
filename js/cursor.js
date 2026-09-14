/* ============================================
   CURSOR.JS — Кастомный курсор + частицы пыли
   White Luxe Edition (без mix-blend-mode)
   ============================================ */

(function() {
    'use strict';

    const cursor = document.getElementById('cursor');
    const canvas = document.getElementById('cursor-canvas');
    const isMobile = window.innerWidth <= 1000;

    // Если мобильное — вообще не запускаем
    if (!cursor || isMobile) return;

    // ===== STATE =====
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let curX = mouseX;
    let curY = mouseY;
    let isFirstMove = false;

    // ===== HOVER TARGETS =====
    const hoverSelectors = [
        'a', 'button', 'input', 'textarea', 'select', 'label',
        '.btn', '.project-card', '.service', '.tab',
        '.metric-card', '.interior', '.card', '.tag',
        '.carousel-btn', '.carousel-dot'
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

    // Re-attach for dynamically added elements
    const observer = new MutationObserver(() => attachHoverListeners());
    observer.observe(document.body, { childList: true, subtree: true });

    // ===== MOUSE EVENTS =====
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Показываем курсор после первого движения
        if (!isFirstMove) {
            isFirstMove = true;
            // Мгновенно переносим в позицию мыши без анимации
            curX = mouseX;
            curY = mouseY;
            cursor.style.left = curX + 'px';
            cursor.style.top = curY + 'px';
            cursor.classList.add('is-active');
            if (canvas) canvas.classList.add('is-active');
        }
    });

    // Click
    window.addEventListener('mousedown', () => cursor.classList.add('is-clicking'));
    window.addEventListener('mouseup', () => cursor.classList.remove('is-clicking'));

    // Mouse leave document
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        if (isFirstMove) cursor.style.opacity = '1';
    });

    // ===== ANIMATION LOOP =====
    function animateCursor() {
        curX += (mouseX - curX) * 0.22;
        curY += (mouseY - curY) * 0.22;

        cursor.style.left = curX + 'px';
        cursor.style.top = curY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // ===== DUST PARTICLES =====
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

        // Speed influence
        const mouseSpeed = Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY);
        lastMouseX = mouseX;
        lastMouseY = mouseY;

        dust.forEach(p => {
            // Base movement
            p.x += p.vx + (mouseX - p.x) * 0.00005 * mouseSpeed;
            p.y += p.vy;

            // Repel from cursor
            const dx = p.x - mouseX;
            const dy = p.y - mouseY;
            const dist = Math.hypot(dx, dy);

            if (dist < 150 && dist > 0) {
                const force = (150 - dist) / 150;
                p.x += (dx / dist) * force * 2.5;
                p.y += (dy / dist) * force * 2.5;
            }

            // Wrap
            if (p.x < -20) p.x = w + 20;
            if (p.x > w + 20) p.x = -20;
            if (p.y < -20) p.y = h + 20;
            if (p.y > h + 20) p.y = -20;

            // Draw
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(199, 160, 111, ${p.opacity})`;
            ctx.fill();
        });

        requestAnimationFrame(animateDust);
    }
    animateDust();

    // ===== RESIZE HANDLER =====
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