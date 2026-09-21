/* ============================================
   MAIN.JS — точка входа
   ИСПРАВЛЕНО: 3D-модели теперь работают на мобильных
   ============================================ */

function initThreeFallback() {
    if (typeof THREE !== 'undefined') return;
    document.querySelectorAll('.carousel-3d, .project-viewer, .mini-3d').forEach(el => {
        if (el.querySelector('.three-fallback')) return;
        el.innerHTML = '<div class="three-fallback">3D-модель недоступна<br>Обновите браузер</div>';
    });
}

setTimeout(initThreeFallback, 3000);

let lenis = null;

function initLenis() {
    if (typeof Lenis === 'undefined') return;
    if (lenis) lenis.destroy();
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
}

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
        if (scrollTop > 20) bar.classList.add('is-active');
        else bar.classList.remove('is-active');
        ticking = false;
    }
    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; }
    }, { passive: true });
    updateProgress();
}

function initSoundDesign() {
    let audioCtx = null;
    let soundEnabled = false;
    function ensureCtx() {
        if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return false; } }
        if (audioCtx.state === 'suspended') audioCtx.resume();
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
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + duration);
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
    toggle.addEventListener('mouseenter', () => { toggle.style.transform = 'scale(1.08)'; toggle.style.borderColor = '#C7A06F'; });
    toggle.addEventListener('mouseleave', () => { toggle.style.transform = 'scale(1)'; toggle.style.borderColor = '#E8E5DF'; });
    toggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        toggle.innerHTML = soundEnabled ? '🔊' : '🔈';
        toggle.style.background = soundEnabled ? '#C7A06F' : '#FFFFFF';
        toggle.style.color = soundEnabled ? '#FFFFFF' : '#C7A06F';
        if (soundEnabled) { ensureCtx(); playClick(); }
    });
    const hoverSelector = 'a, button, .btn, .project-card, .service, .tab, .metric-card, .carousel-btn';
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
            });
        });
    });
    mo.observe(document.body, { childList: true, subtree: true });
}

function initMagneticButtons() {
    if (window.innerWidth <= 1000) return;
    const magnets = document.querySelectorAll('.btn, .nav__cta, .carousel-btn');
    const MAX_OFFSET = 8, RADIUS = 80;
    magnets.forEach(el => {
        if (el.dataset.magneticBound) return;
        el.dataset.magneticBound = 'true';
        let raf = null;
        function onMove(e) {
            const rect = el.getBoundingClientRect();
            const dx = e.clientX - (rect.left + rect.width / 2);
            const dy = e.clientY - (rect.top + rect.height / 2);
            const dist = Math.hypot(dx, dy);
            if (dist < RADIUS) {
                const s = (1 - dist / RADIUS);
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => { el.style.transform = `translate(${(dx/RADIUS)*MAX_OFFSET*s}px, ${(dy/RADIUS)*MAX_OFFSET*s}px)`; });
            } else {
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => { el.style.transform = 'translate(0,0)'; });
            }
        }
        function onLeave() { if (raf) cancelAnimationFrame(raf); el.style.transform = 'translate(0,0)'; }
        el.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.willChange = 'transform';
        window.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
    });
}

function initTextScramble() {
    if (window.innerWidth <= 1000) return;
    const CHARS = '!<>-_\\/[]{}—=+*^?#________';
    function scramble(el) {
        const original = el.dataset.originalText || el.textContent;
        el.dataset.originalText = original;
        const queue = [];
        for (let i = 0; i < original.length; i++) {
            const start = Math.floor(Math.random() * 30);
            const end = start + Math.floor(Math.random() * 30) + 20;
            queue.push({ start, end, char: original[i] });
        }
        let frame = 0;
        const interval = setInterval(() => {
            let output = '', complete = 0;
            for (let i = 0; i < queue.length; i++) {
                const q = queue[i];
                if (frame >= q.end) { complete++; output += q.char; }
                else if (frame >= q.start) output += CHARS[Math.floor(Math.random() * CHARS.length)];
                else output += ' ';
            }
            el.textContent = output;
            if (complete === queue.length) { clearInterval(interval); el.textContent = original; }
            frame++;
        }, 30);
    }
    const targets = document.querySelectorAll('.section-title, .hero__title, .cta__title, .carousel-label h3, [data-scramble]');
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

function initConfetti() {
    const form = document.getElementById('contact-form');
    if (!form || form.dataset.confettiBound) return;
    form.dataset.confettiBound = 'true';
    function spawnConfetti(x, y) {
        const COLORS = ['#C7A06F', '#B8965D', '#E0C27E', '#D4AF7A', '#FFFFFF'];
        for (let i = 0; i < 60; i++) {
            const p = document.createElement('div');
            p.className = 'confetti-particle';
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            const size = 6 + Math.random() * 8;
            const angle = (Math.PI * 2 * i) / 60 + Math.random() * 0.5;
            const speed = 4 + Math.random() * 8;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - 6;
            p.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${color};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};pointer-events:none;z-index:9999;transform:translate(-50%,-50%);opacity:1;`;
            document.body.appendChild(p);
            const startTime = performance.now();
            const duration = 1200 + Math.random() * 800;
            function animate(now) {
                const t = (now - startTime) / duration;
                if (t >= 1) { p.remove(); return; }
                const g = 0.6;
                const px = vx * (now - startTime) / 16;
                const py = vy * (now - startTime) / 16 + g * ((now - startTime) / 16) * ((now - startTime) / 16) / 2;
                const rot = (Math.random() - 0.5) * 720 * t;
                p.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px)) rotate(${rot}deg)`;
                p.style.opacity = String(1 - t);
                requestAnimationFrame(animate);
            }
            requestAnimationFrame(animate);
        }
    }
    window.addEventListener('formSuccess', () => {
        const rect = form.getBoundingClientRect();
        spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
}

function initAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        if (link.dataset.anchorBound) return;
        link.dataset.anchorBound = 'true';
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target && lenis) { e.preventDefault(); lenis.scrollTo(target, { offset: -72 }); }
        });
    });
}

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

function initCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
        if (el.dataset.counted === 'true') return;
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    el.dataset.counted = 'true';
                    const target = parseInt(entry.target.dataset.count, 10);
                    const start = performance.now();
                    const tick = (now) => {
                        const t = Math.min((now - start) / 1600, 1);
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

/* ============================================
   MINI 3D MODELS — все 6 товаров
   ИСПРАВЛЕНО: работает на мобильных
   ============================================ */

const MINI_MATS = {
    body: null, door: null, gold: null, dark: null, screen: null, steel: null
};

function initMiniMats() {
    if (MINI_MATS.body) return;
    MINI_MATS.body = new THREE.MeshStandardMaterial({ color: 0x2A2A2A, metalness: 0.3, roughness: 0.5 });
    MINI_MATS.door = new THREE.MeshStandardMaterial({ color: 0xF5F3EF, metalness: 0.2, roughness: 0.3 });
    MINI_MATS.gold = new THREE.MeshStandardMaterial({ color: 0xC7A06F, metalness: 1, roughness: 0.25 });
    MINI_MATS.dark = new THREE.MeshStandardMaterial({ color: 0x0A0A0A, metalness: 0.9, roughness: 0.1 });
    MINI_MATS.screen = new THREE.MeshStandardMaterial({ color: 0xC7A06F, emissive: 0xC7A06F, emissiveIntensity: 1.2, metalness: 1, roughness: 0.2 });
    MINI_MATS.steel = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.9, roughness: 0.3 });
}

function buildMiniFridge() {
    initMiniMats();
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 4.5, 1.6), MINI_MATS.body);
    body.position.y = 2.25; g.add(body);
    const tD = new THREE.Mesh(new THREE.BoxGeometry(2.15, 1.1, 0.05), MINI_MATS.door);
    tD.position.set(0, 3.9, 0.83); g.add(tD);
    const bD = new THREE.Mesh(new THREE.BoxGeometry(2.15, 3.1, 0.05), MINI_MATS.door);
    bD.position.set(0, 2.1, 0.83); g.add(bD);
    const hT = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.08), MINI_MATS.gold);
    hT.position.set(1.05, 3.9, 0.9); g.add(hT);
    const hB = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.08), MINI_MATS.gold);
    hB.position.set(1.05, 2.1, 0.9); g.add(hB);
    const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), MINI_MATS.screen);
    disp.position.set(-0.5, 3.9, 0.87); g.add(disp);
    for (let x = -0.9; x <= 0.9; x += 1.8) for (let z = -0.6; z <= 0.6; z += 1.2) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 8), MINI_MATS.steel);
        leg.position.set(x, 0.075, z); g.add(leg);
    }
    return g;
}

function buildMiniWasher() {
    initMiniMats();
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.0), MINI_MATS.body);
    body.position.y = 1.2; g.add(body);
    const tP = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 2.0), MINI_MATS.door);
    tP.position.y = 2.2; g.add(tP);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.1, 16, 32), MINI_MATS.gold);
    ring.position.set(0, 1.2, 1.02); g.add(ring);
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.65, 32), MINI_MATS.dark);
    glass.position.set(0, 1.2, 1.01); g.add(glass);
    const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.25), MINI_MATS.screen);
    disp.position.set(-0.5, 2.2, 1.02); g.add(disp);
    for (let i = 0; i < 4; i++) {
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), MINI_MATS.gold);
        b.rotation.x = Math.PI / 2; b.position.set(0.4 + i * 0.2, 2.2, 1.02); g.add(b);
    }
    for (let x = -1; x <= 1; x += 2) for (let z = -0.8; z <= 0.8; z += 1.6) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8), MINI_MATS.steel);
        leg.position.set(x, 0.05, z); g.add(leg);
    }
    return g;
}

function buildMiniMicrowave() {
    initMiniMats();
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.5, 1.6), MINI_MATS.body);
    body.position.y = 0.75; g.add(body);
    const d = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.3, 0.05), MINI_MATS.door);
    d.position.set(-0.3, 0.75, 0.82); g.add(d);
    const w = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.0), MINI_MATS.dark);
    w.position.set(-0.3, 0.75, 0.85); g.add(w);
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.3, 0.05), new THREE.MeshStandardMaterial({ color: 0x1A1A1A, metalness: 0.5, roughness: 0.5 }));
    p.position.set(0.85, 0.75, 0.82); g.add(p);
    const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), MINI_MATS.screen);
    disp.position.set(0.85, 1.1, 0.85); g.add(disp);
    for (let i = 0; i < 6; i++) {
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12), MINI_MATS.gold);
        b.rotation.x = Math.PI / 2;
        b.position.set(0.7 + (i % 2) * 0.25, 0.9 - Math.floor(i / 2) * 0.2, 0.85); g.add(b);
    }
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), MINI_MATS.gold);
    h.position.set(0.5, 0.75, 0.85); g.add(h);
    for (let x = -1; x <= 1; x += 2) for (let z = -0.6; z <= 0.6; z += 1.2) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8), MINI_MATS.steel);
        leg.position.set(x, 0.04, z); g.add(leg);
    }
    return g;
}

function buildMiniVacuum() {
    initMiniMats();
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 1.5, 16), MINI_MATS.body);
    body.position.y = 0.75; g.add(body);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, 0.6, 16), MINI_MATS.door);
    top.position.y = 1.8; g.add(top);
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 0.15), MINI_MATS.gold);
    h.position.set(0.5, 2.2, 0); g.add(h);
    const hose = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.1, 8, 20), MINI_MATS.gold);
    hose.position.set(-0.8, 1.2, 0); hose.rotation.x = Math.PI / 3; g.add(hose);
    const wheel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.2, 12), MINI_MATS.steel);
    wheel1.rotation.z = Math.PI / 2; wheel1.position.set(-0.9, 0.35, 0.6); g.add(wheel1);
    const wheel2 = wheel1.clone(); wheel2.position.set(0.9, 0.35, 0.6); g.add(wheel2);
    return g;
}

function buildMiniBlender() {
    initMiniMats();
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.4, 16), MINI_MATS.body);
    base.position.y = 0.2; g.add(base);
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.8, 16), MINI_MATS.door);
    jar.position.y = 1.2; g.add(jar);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.15, 16), MINI_MATS.gold);
    lid.position.y = 2.15; g.add(lid);
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 0.15), MINI_MATS.gold);
    h.position.set(0.7, 1.2, 0); g.add(h);
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), MINI_MATS.gold);
    btn.position.set(0, 0.4, 0.75); g.add(btn);
    return g;
}

function buildMiniMulticooker() {
    initMiniMats();
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 1.6, 16), MINI_MATS.body);
    body.position.y = 0.8; g.add(body);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.0, 0.3, 16), MINI_MATS.door);
    lid.position.y = 1.75; g.add(lid);
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.6), MINI_MATS.gold);
    h.position.set(0, 2.0, 0.8); g.add(h);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.1), MINI_MATS.door);
    panel.position.set(0, 1.2, 1.0); g.add(panel);
    const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.2), MINI_MATS.screen);
    disp.position.set(0, 1.25, 1.06); g.add(disp);
    const btn1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), MINI_MATS.gold);
    btn1.rotation.x = Math.PI / 2; btn1.position.set(-0.25, 0.9, 1.05); g.add(btn1);
    const btn2 = btn1.clone(); btn2.position.set(0.25, 0.9, 1.05); g.add(btn2);
    return g;
}

const MINI_BUILDERS = {
    'fridge-x500':      { create: buildMiniFridge,     distance: 9, camY: 2.5, lookAtY: 2.2 },
    'washer-w300':      { create: buildMiniWasher,     distance: 7, camY: 1.5, lookAtY: 1.2 },
    'microwave-m200':   { create: buildMiniMicrowave,  distance: 5, camY: 0.9, lookAtY: 0.75 },
    'vacuum-v100':      { create: buildMiniVacuum,     distance: 7, camY: 1.5, lookAtY: 1.2 },
    'blender-b50':      { create: buildMiniBlender,    distance: 6, camY: 1.3, lookAtY: 1.1 },
    'multicooker-c400': { create: buildMiniMulticooker,distance: 6, camY: 1.3, lookAtY: 1.0 }
};

function initMiniProducts() {
    if (typeof THREE === 'undefined') return;

    const isMobile = window.innerWidth <= 1000;
    const isSmall  = window.innerWidth <= 480;

    document.querySelectorAll('.mini-3d').forEach(container => {
        if (container.dataset.initialized === 'true') return;
        const id = container.dataset.product;
        const config = MINI_BUILDERS[id];
        if (!config) return;

        const rect = container.getBoundingClientRect();
        if (rect.width < 10 || rect.height < 10) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, rect.width / rect.height, 0.1, 100);

        // На мобильных отодвигаем камеру, чтобы модель не обрезалась
        const distanceMul = isSmall ? 1.35 : (isMobile ? 1.2 : 1);
        camera.position.set(
            config.distance * 0.5 * distanceMul,
            config.camY + 1.5,
            config.distance * distanceMul
        );
        camera.lookAt(0, config.lookAtY, 0);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: !isMobile,
            powerPreference: 'high-performance'
        });
        renderer.setSize(rect.width, rect.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));

        renderer.shadowMap.enabled = !isMobile;

        renderer.setClearColor(0x000000, 0);
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        container.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xFFFFFF, 0.8));
        const key = new THREE.DirectionalLight(0xFFFFFF, 1.4);
        key.position.set(5, 8, 6);
        if (!isMobile) key.castShadow = true;
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xC7A06F, 0.5);
        fill.position.set(-4, 3, 4); scene.add(fill);
        const rim = new THREE.PointLight(0xC7A06F, 0.8, 20);
        rim.position.set(0, 4, -5); scene.add(rim);

        const model = config.create();
        scene.add(model);
        model.rotation.y = -0.4;

        if (!isMobile) {
            const shadowPlane = new THREE.Mesh(
                new THREE.PlaneGeometry(15, 15),
                new THREE.ShadowMaterial({ opacity: 0.2 })
            );
            shadowPlane.rotation.x = -Math.PI / 2;
            shadowPlane.receiveShadow = true;
            scene.add(shadowPlane);
        }

        container.dataset.initialized = 'true';

        function resize() {
            const r = container.getBoundingClientRect();
            if (r.width < 10 || r.height < 10) return;
            camera.aspect = r.width / r.height;
            camera.updateProjectionMatrix();
            renderer.setSize(r.width, r.height, false);
            renderer.domElement.style.width = '100%';
            renderer.domElement.style.height = '100%';
        }

        if ('ResizeObserver' in window) {
            const ro = new ResizeObserver(() => resize());
            ro.observe(container);
        }

        const clock = new THREE.Clock();
        function animate() {
            if (!container.isConnected) return;
            const t = clock.getElapsedTime();
            model.rotation.y = -0.4 + Math.sin(t * 0.4) * 0.25;
            model.position.y = Math.sin(t * 0.8) * 0.1;
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }
        animate();
    });
}

/* ============================================
   RENDER — карточки товаров
   ============================================ */

function productCardHTML(p, i, layout) {
    const large = layout === 'home' && i === 0 ? 'project-card--large' : '';
    return `
        <a href="${p.file}" class="project-card ${large}" data-reveal>
            <div class="project-card__img mini-3d" data-product="${p.id}" style="background: linear-gradient(135deg, ${p.color}, ${p.color}dd);"></div>
            <div class="project-card__info">
                <span class="project-card__tag">${p.tag}</span>
                <h3>${p.name}</h3>
                <p>${p.short} • ${p.price}</p>
            </div>
        </a>
    `;
}

function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid || !window.TECHNOPRESTIGE_DATA) return;
    if (grid.dataset.rendered === 'true') return;

    const products = window.TECHNOPRESTIGE_DATA.products.slice(0, 3);
    grid.innerHTML = products.map((p, i) => productCardHTML(p, i, 'home')).join('');
    grid.dataset.rendered = 'true';

    setTimeout(() => {
        initMiniProducts();
        document.dispatchEvent(new Event('contentRendered'));
    }, 100);
}

function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    if (!grid || !window.TECHNOPRESTIGE_DATA) return;

    const allProducts = window.TECHNOPRESTIGE_DATA.products;

    let controls = document.querySelector('.catalog-controls');
    if (!controls) {
        const categories = ['Все', ...new Set(allProducts.map(p => p.tag))];
        controls = document.createElement('div');
        controls.className = 'catalog-controls';
        controls.innerHTML = `
            <div class="catalog-search">
                <input type="search" placeholder="Поиск..." id="catalog-search-input" aria-label="Поиск по каталогу">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
            <div class="catalog-filters">
                ${categories.map((c, i) => `<button class="filter-btn ${i === 0 ? 'is-active' : ''}" data-cat="${c}">${c}</button>`).join('')}
            </div>
            <select class="catalog-sort" id="catalog-sort" aria-label="Сортировка">
                <option value="default">По умолчанию</option>
                <option value="price-asc">Цена ↑</option>
                <option value="price-desc">Цена ↓</option>
                <option value="name">По названию</option>
            </select>
        `;
        grid.parentNode.insertBefore(controls, grid);
    }

    let activeCat = 'Все';
    let searchQuery = '';
    let sortType = 'default';

    function render() {
        let list = [...allProducts];
        if (activeCat !== 'Все') list = list.filter(p => p.tag === activeCat);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.short.toLowerCase().includes(q) ||
                p.tag.toLowerCase().includes(q)
            );
        }
        if (sortType === 'price-asc') list.sort((a, b) => a.priceNum - b.priceNum);
        else if (sortType === 'price-desc') list.sort((a, b) => b.priceNum - a.priceNum);
        else if (sortType === 'name') list.sort((a, b) => a.name.localeCompare(b.name));

        if (!list.length) {
            grid.innerHTML = '<div class="catalog-empty">Ничего не найдено</div>';
            return;
        }

        grid.innerHTML = list.map((p) => productCardHTML(p, 0, 'catalog')).join('');

        requestAnimationFrame(() => {
            initMiniProducts();
            document.dispatchEvent(new Event('contentRendered'));
        });
    }

    controls.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.bound === 'true') return;
        btn.dataset.bound = 'true';
        btn.addEventListener('click', () => {
            controls.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            activeCat = btn.dataset.cat;
            render();
        });
    });

    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput && searchInput.dataset.bound !== 'true') {
        searchInput.dataset.bound = 'true';
        let timeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                searchQuery = searchInput.value.trim();
                render();
            }, 200);
        });
    }

    const sortSel = document.getElementById('catalog-sort');
    if (sortSel && sortSel.dataset.bound !== 'true') {
        sortSel.dataset.bound = 'true';
        sortSel.addEventListener('change', (e) => {
            sortType = e.target.value;
            render();
        });
    }

    render();
}

function renderTabs() {
    const tabs = document.getElementById('tabs');
    if (!tabs || !window.TECHNOPRESTIGE_DATA) return;
    if (tabs.dataset.rendered === 'true') return;

    const products = window.TECHNOPRESTIGE_DATA.products.slice(0, 3);
    tabs.innerHTML = products.map((p, i) => `
        <a href="${p.file}" class="tab" data-reveal>
            <span class="tab__num">${String(i + 1).padStart(2, '0')}</span>
            <div class="tab__text">
                <h4>${p.name}</h4>
                <p>${p.tag} • ${p.price}</p>
            </div>
            <span class="tab__arrow">→</span>
        </a>
    `).join('');
    tabs.dataset.rendered = 'true';
}

function reinitPage() {
    renderProducts();
    renderCatalog();
    renderTabs();
    initReveal();
    initCounters();
    initAnchorLinks();
    initScrollProgress();
    initMagneticButtons();
    initTextScramble();
    initConfetti();
    initMiniProducts();
    document.dispatchEvent(new Event('contentRendered'));
}

function initBarba() {
    if (typeof barba === 'undefined') { reinitPage(); return; }
    barba.init({
        transitions: [{
            name: 'fade-slide',
            leave(data) { return gsap.to(data.current.container, { opacity: 0, x: -30, duration: 0.4, ease: 'power2.in' }); },
            enter(data) {
                gsap.from(data.next.container, {
                    opacity: 0, x: 30, duration: 0.5, ease: 'power2.out',
                    onComplete: () => { reinitPage(); window.scrollTo(0, 0); }
                });
            }
        }]
    });
    barba.hooks.after(() => { reinitPage(); });
}

document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    initScrollProgress();
    initSoundDesign();
    initBarba();
    reinitPage();
});