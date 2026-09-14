/* ============================================
   MAIN.JS — Точка входа
   Lenis + Scroll Progress + Sound + Reveal + Counters + Barba
   + Magnetic Buttons
   + Text Scramble
   + Confetti on Form Success
   ============================================ */

let lenis = null;

// ============================================
// SECTION: Lenis Smooth Scroll
// ============================================
function initLenis() {
    if (typeof Lenis === 'undefined') return;
    if (lenis) lenis.destroy();

    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

// ============================================
// SECTION: Scroll Progress Bar
// ============================================
function initScrollProgress() {
    let bar = document.getElementById('scroll-progress');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'scroll-progress';
        bar.className = 'scroll-progress';
        document.body.appendChild(bar);
    }

    let ticking = false;

    function updateProgress() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        bar.style.width = percent + '%';

        if (scrollTop > 20) {
            bar.classList.add('is-active');
        } else {
            bar.classList.remove('is-active');
        }

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateProgress);
            ticking = true;
        }
    }, { passive: true });

    updateProgress();
}

// ============================================
// SECTION: Sound Design (Web Audio API)
// ============================================
let audioCtx = null;
let soundEnabled = false;

function initSoundDesign() {
    function ensureCtx() {
        if (!audioCtx) {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                return false;
            }
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return true;
    }

    function playTone(freq, duration, volume) {
        if (!soundEnabled) return;
        if (!ensureCtx()) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + duration);
    }

    function playHover() { playTone(880, 0.04, 0.015); }
    function playClick() { playTone(440, 0.06, 0.03); }

    let toggle = document.getElementById('sound-toggle');
    if (!toggle) {
        toggle = document.createElement('button');
        toggle.id = 'sound-toggle';
        toggle.className = 'sound-toggle';
        toggle.setAttribute('aria-label', 'Включить звук');
        toggle.innerHTML = '🔈';
        document.body.appendChild(toggle);
    }

    toggle.addEventListener('mouseenter', () => {
        toggle.style.transform = 'scale(1.08)';
        toggle.style.borderColor = '#C7A06F';
    });
    toggle.addEventListener('mouseleave', () => {
        toggle.style.transform = 'scale(1)';
        toggle.style.borderColor = '#E8E5DF';
    });

    toggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        toggle.innerHTML = soundEnabled ? '🔊' : '🔈';
        toggle.style.background = soundEnabled ? '#C7A06F' : '#FFFFFF';
        toggle.style.color = soundEnabled ? '#FFFFFF' : '#C7A06F';

        if (soundEnabled) {
            ensureCtx();
            playClick();
        }
    });

    const hoverSelector = 'a, button, .btn, .project-card, .service, .tab, .metric-card, .carousel-btn, .interior';
    const clickSelector = '.btn, button, a[href]';

    function attachListeners(scope) {
        scope.querySelectorAll(hoverSelector).forEach(el => {
            if (el.dataset.soundBound === 'hover') return;
            el.dataset.soundBound = 'hover';
            el.addEventListener('mouseenter', playHover);
        });
        scope.querySelectorAll(clickSelector).forEach(el => {
            if (el.dataset.soundBound === 'click') return;
            el.dataset.soundBound = 'click';
            el.addEventListener('click', playClick);
        });
    }

    attachListeners(document);

    const mo = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType !== 1) return;
                attachListeners(node);
                if (node.matches && node.matches(hoverSelector)) {
                    node.addEventListener('mouseenter', playHover);
                }
                if (node.matches && node.matches(clickSelector)) {
                    node.addEventListener('click', playClick);
                }
            });
        });
    });
    mo.observe(document.body, { childList: true, subtree: true });
}

// ============================================
// SECTION: Magnetic Buttons — притягиваются к курсору
// ============================================
function initMagneticButtons() {
    if (window.innerWidth <= 1000) return;

    const magnets = document.querySelectorAll('.btn, .nav__cta, .carousel-btn');
    const MAX_OFFSET = 8;   // пикселей макс. смещение
    const RADIUS = 80;      // радиус влияния

    magnets.forEach(el => {
        if (el.dataset.magneticBound) return;
        el.dataset.magneticBound = 'true';

        let raf = null;

        function onMove(e) {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const dist = Math.hypot(dx, dy);

            if (dist < RADIUS) {
                const strength = (1 - dist / RADIUS);
                const mx = (dx / RADIUS) * MAX_OFFSET * strength;
                const my = (dy / RADIUS) * MAX_OFFSET * strength;

                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    el.style.transform = `translate(${mx}px, ${my}px)`;
                });
            } else {
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    el.style.transform = 'translate(0, 0)';
                });
            }
        }

        function onLeave() {
            if (raf) cancelAnimationFrame(raf);
            el.style.transform = 'translate(0, 0)';
        }

        el.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.willChange = 'transform';

        window.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
    });
}

// ============================================
// SECTION: Text Scramble — киберпанк-эффект
// ============================================
function initTextScramble() {
    const CHARS = '!<>-_\\/[]{}—=+*^?#________';

    function scramble(el) {
        const original = el.dataset.originalText || el.textContent;
        el.dataset.originalText = original;

        const length = original.length;
        const queue = [];

        for (let i = 0; i < length; i++) {
            const from = original[i];
            const to = original[i];
            const start = Math.floor(Math.random() * 30);
            const end = start + Math.floor(Math.random() * 30) + 20;
            queue.push({ from, to, start, end, char: original[i] });
        }

        let frame = 0;
        let interval = setInterval(() => {
            let output = '';
            let complete = 0;

            for (let i = 0; i < queue.length; i++) {
                const q = queue[i];

                if (frame >= q.end) {
                    complete++;
                    output += q.char;
                } else if (frame >= q.start) {
                    output += CHARS[Math.floor(Math.random() * CHARS.length)];
                } else {
                    output += ' ';
                }
            }

            el.textContent = output;

            if (complete === queue.length) {
                clearInterval(interval);
                el.textContent = original;
            }
            frame++;
        }, 30);
    }

    // Найти все заголовки, которые нужно "печатать"
    const targets = document.querySelectorAll(
        '.section-title, .hero__title, .cta__title, .carousel-label h3, [data-scramble]'
    );

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.scrambled) {
                entry.target.dataset.scrambled = 'true';
                scramble(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    targets.forEach(el => obs.observe(el));
}

// ============================================
// SECTION: Confetti — золотые частицы при отправке формы
// ============================================
function initConfetti() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    function spawnConfetti(x, y) {
        const COLORS = ['#C7A06F', '#B8965D', '#E0C27E', '#D4AF7A', '#FFFFFF'];
        const COUNT = 60;

        for (let i = 0; i < COUNT; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';

            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            const size = 6 + Math.random() * 8;
            const angle = (Math.PI * 2 * i) / COUNT + Math.random() * 0.5;
            const speed = 4 + Math.random() * 8;

            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - 6; // чуть вверх сначала

            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                pointer-events: none;
                z-index: 9999;
                transform: translate(-50%, -50%);
                opacity: 1;
                will-change: transform, opacity;
            `;

            document.body.appendChild(particle);

            const startTime = performance.now();
            const duration = 1200 + Math.random() * 800;

            function animate(now) {
                const elapsed = now - startTime;
                const t = elapsed / duration;

                if (t >= 1) {
                    particle.remove();
                    return;
                }

                // Физика: гравитация + затухание
                const gravity = 0.6;
                const px = vx * elapsed / 16;
                const py = vy * elapsed / 16 + gravity * (elapsed / 16) * (elapsed / 16) / 2;

                const rotation = (Math.random() - 0.5) * 720 * t;

                particle.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px)) rotate(${rotation}deg)`;
                particle.style.opacity = String(1 - t);

                requestAnimationFrame(animate);
            }

            requestAnimationFrame(animate);
        }
    }

    // Триггер: успешная отправка формы
    window.addEventListener('formSuccess', () => {
        const rect = form.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        spawnConfetti(cx, cy);
    });

    // Альтернативный триггер: клик по кнопке submit
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            const rect = submitBtn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            // Небольшой взрыв при самом клике
            setTimeout(() => spawnConfetti(cx, cy), 100);
        });
    }
}

// ============================================
// SECTION: Anchor links
// ============================================
function initAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        if (link.dataset.anchorBound) return;
        link.dataset.anchorBound = 'true';

        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target && lenis) {
                e.preventDefault();
                lenis.scrollTo(target, { offset: -72 });
            }
        });
    });
}

// ============================================
// SECTION: Reveal on Scroll
// ============================================
function initReveal() {
    const els = document.querySelectorAll('[data-reveal]:not(.is-visible)');
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('is-visible'), i * 80);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
}

// ============================================
// SECTION: Counters
// ============================================
function initCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
        if (el.dataset.counted === 'true') return;

        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    el.dataset.counted = 'true';
                    const target = parseInt(entry.target.dataset.count, 10);
                    const duration = 1600;
                    const start = performance.now();
                    const tick = (now) => {
                        const t = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - t, 4);
                        entry.target.textContent = Math.floor(eased * target);
                        if (t < 1) requestAnimationFrame(tick);
                        else entry.target.textContent = target;
                    };
                    requestAnimationFrame(tick);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        obs.observe(el);
    });
}

// ============================================
// SECTION: Render Projects Grid from data.js
// ============================================
function renderProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid || !window.MONOLIT_DATA) return;
    if (grid.dataset.rendered === 'true') return;

    const projects = window.MONOLIT_DATA.projects.slice(0, 3);
    grid.innerHTML = projects.map((p, i) => `
        <a href="${p.file}" class="project-card ${i === 0 ? 'project-card--large' : ''}" data-reveal>
            <div class="project-card__img" style="background: linear-gradient(135deg, ${p.color}, ${p.color}dd);"></div>
            <div class="project-card__info">
                <span class="project-card__tag">${p.tag}</span>
                <h3>${p.name}</h3>
                <p>${p.city} • ${p.year} • ${p.area}</p>
            </div>
        </a>
    `).join('');

    grid.dataset.rendered = 'true';
}

// ============================================
// SECTION: Render Tabs from data.js
// ============================================
function renderTabs() {
    const tabs = document.getElementById('tabs');
    if (!tabs || !window.MONOLIT_DATA) return;
    if (tabs.dataset.rendered === 'true') return;

    const projects = window.MONOLIT_DATA.projects;
    tabs.innerHTML = projects.map((p, i) => `
        <a href="${p.file}" class="tab" data-reveal>
            <span class="tab__num">${String(i + 1).padStart(2, '0')}</span>
            <div class="tab__text">
                <h4>${p.name}</h4>
                <p>${p.tag} • ${p.area}</p>
            </div>
            <span class="tab__arrow">→</span>
        </a>
    `).join('');

    tabs.dataset.rendered = 'true';
}

// ============================================
// SECTION: Перезапуск модулей (для Barba)
// ============================================
function reinitPage() {
    renderProjects();
    renderTabs();
    initReveal();
    initCounters();
    initAnchorLinks();
    initScrollProgress();
    initMagneticButtons();
    initTextScramble();
    initConfetti();
}

// ============================================
// SECTION: Barba.js page transitions
// ============================================
function initBarba() {
    if (typeof barba === 'undefined') {
        reinitPage();
        return;
    }

    barba.init({
        transitions: [{
            name: 'fade-slide',
            leave(data) {
                return gsap.to(data.current.container, {
                    opacity: 0,
                    x: -30,
                    duration: 0.4,
                    ease: 'power2.in'
                });
            },
            enter(data) {
                gsap.from(data.next.container, {
                    opacity: 0,
                    x: 30,
                    duration: 0.5,
                    ease: 'power2.out',
                    onComplete: () => {
                        reinitPage();
                        window.scrollTo(0, 0);
                    }
                });
            }
        }]
    });

    barba.hooks.after(() => {
        reinitPage();
    });
}

// ============================================
// SECTION: Init
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    initScrollProgress();
    initSoundDesign();
    initBarba();
    reinitPage();
});