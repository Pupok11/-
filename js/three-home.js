/* ============================================
   THREE-HOME.JS — 3D-карусель на главной
   3 уникальные модели: куб, клинок, каскад
   ============================================ */

(function() {
    'use strict';

    const container = document.getElementById('carousel-3d');
    if (!container || typeof THREE === 'undefined') return;
    if (window.innerWidth <= 1000) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        40,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 5, 18);
    camera.lookAt(0, 3, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // === LIGHTS (White Luxe) ===
    scene.add(new THREE.AmbientLight(0xFFFFFF, 0.55));

    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.2);
    keyLight.position.set(10, 20, 10);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xC7A06F, 0.5);
    fillLight.position.set(-10, 5, 5);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xC7A06F, 1.2, 30);
    rimLight.position.set(0, 8, -8);
    scene.add(rimLight);

    // === MATERIALS ===
    const concreteMat = new THREE.MeshStandardMaterial({
        color: 0xE8E5DF,
        metalness: 0.15,
        roughness: 0.85
    });

    const lightConcreteMat = new THREE.MeshStandardMaterial({
        color: 0xF0EDE6,
        metalness: 0.1,
        roughness: 0.9
    });

    const goldMat = new THREE.MeshStandardMaterial({
        color: 0xC7A06F,
        metalness: 1,
        roughness: 0.25
    });

    const glassMat = new THREE.MeshStandardMaterial({
        color: 0xE0DCD4,
        metalness: 0.7,
        roughness: 0.1,
        transparent: true,
        opacity: 0.85
    });

    const darkGlassMat = new THREE.MeshStandardMaterial({
        color: 0x1A1A1A,
        metalness: 0.8,
        roughness: 0.15
    });

    const cortenMat = new THREE.MeshStandardMaterial({
        color: 0xC77A4A,
        metalness: 0.5,
        roughness: 0.6
    });

    // === MODEL 1: Brutalist Cube ===
    function createBrutalist() {
        const group = new THREE.Group();

        // Main cube
        const cube = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), concreteMat);
        cube.position.y = 2.5;
        group.add(cube);

        // Deep window cuts on all 4 sides
        const windowMat = new THREE.MeshStandardMaterial({
            color: 0x1A1A1A,
            metalness: 0.3,
            roughness: 0.9
        });

        const positions = [
            { x: -1.5, y: 1 }, { x: 0, y: 1 }, { x: 1.5, y: 1 },
            { x: -1.5, y: 2.5 }, { x: 0, y: 2.5 }, { x: 1.5, y: 2.5 },
            { x: -1.5, y: 4 }, { x: 0, y: 4 }, { x: 1.5, y: 4 }
        ];

        positions.forEach(pos => {
            [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((rot, k) => {
                const win = new THREE.Mesh(
                    new THREE.BoxGeometry(0.8, 0.8, 0.2),
                    windowMat
                );

                if (k === 0) win.position.set(pos.x, pos.y, 2.51);
                else if (k === 1) {
                    win.position.set(2.51, pos.y, pos.x);
                    win.rotation.y = Math.PI / 2;
                } else if (k === 2) {
                    win.position.set(pos.x, pos.y, -2.51);
                    win.rotation.y = Math.PI;
                } else {
                    win.position.set(-2.51, pos.y, pos.x);
                    win.rotation.y = -Math.PI / 2;
                }
                group.add(win);
            });
        });

        // Parapet
        const parapet = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.3, 5.3), concreteMat);
        parapet.position.y = 5.15;
        group.add(parapet);

        return group;
    }

    // === MODEL 2: Glass Blade ===
    function createGlassBlade() {
        const group = new THREE.Group();

        // Main tower
        const tower = new THREE.Mesh(new THREE.BoxGeometry(2.8, 12, 4.5), glassMat);
        tower.position.y = 6;
        group.add(tower);

        // Horizontal steel rims
        for (let y = 0.5; y < 12; y += 1) {
            const rim = new THREE.Mesh(
                new THREE.BoxGeometry(2.9, 0.06, 4.6),
                goldMat
            );
            rim.position.y = y;
            group.add(rim);
        }

        // Glowing gold core (visible through glass)
        const core = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 12, 0.6),
            new THREE.MeshStandardMaterial({
                color: 0xC7A06F,
                emissive: 0xC7A06F,
                emissiveIntensity: 0.8,
                metalness: 1,
                roughness: 0.3
            })
        );
        core.position.y = 6;
        group.add(core);

        // Spire
        const spire = new THREE.Mesh(
            new THREE.ConeGeometry(2, 2.5, 4),
            goldMat
        );
        spire.position.y = 13.25;
        spire.rotation.y = Math.PI / 4;
        group.add(spire);

        // Base
        const base = new THREE.Mesh(
            new THREE.BoxGeometry(5, 0.5, 6),
            lightConcreteMat
        );
        base.position.y = 0.25;
        group.add(base);

        return group;
    }

    // === MODEL 3: Cascade Terraces ===
    function createCascade() {
        const group = new THREE.Group();

        for (let i = 0; i < 5; i++) {
            const w = 7 - i * 1.1;
            const h = 1.4;
            const d = 4.5 - i * 0.6;

            const block = new THREE.Mesh(
                new THREE.BoxGeometry(w, h, d),
                i % 2 === 0 ? concreteMat : cortenMat
            );
            block.position.y = i * 1.5 + 0.7;
            block.position.x = i * 0.5;
            group.add(block);

            // Windows on front
            for (let k = -1; k <= 1; k++) {
                const win = new THREE.Mesh(
                    new THREE.BoxGeometry(0.8, 0.7, 0.1),
                    darkGlassMat
                );
                win.position.set(
                    i * 0.5 + k * 1.1,
                    i * 1.5 + 0.8,
                    d / 2 + 0.01
                );
                group.add(win);
            }

            // Side windows
            for (let k = -1; k <= 1; k += 2) {
                const win = new THREE.Mesh(
                    new THREE.BoxGeometry(0.1, 0.7, 0.6),
                    darkGlassMat
                );
                win.position.set(
                    i * 0.5 + w / 2 + 0.01,
                    i * 1.5 + 0.8,
                    k * 1.2
                );
                group.add(win);
            }
        }

        // Penthouse on top
        const penthouse = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 1.3, 2.2),
            goldMat
        );
        penthouse.position.set(4.8, 8.6, 0);
        group.add(penthouse);

        // Small spire
        const spire = new THREE.Mesh(
            new THREE.ConeGeometry(1.5, 1, 4),
            goldMat
        );
        spire.position.set(4.8, 9.75, 0);
        spire.rotation.y = Math.PI / 4;
        group.add(spire);

        return group;
    }

    // === ASSEMBLE CAROUSEL ===
    const models = [
        createBrutalist(),
        createGlassBlade(),
        createCascade()
    ];

    const group = new THREE.Group();
    scene.add(group);

    models.forEach((model, i) => {
        model.position.x = i * 30;
        group.add(model);
    });

    // === INFO DATA ===
    const info = [
        { tag: 'ЖИЛОЙ КОМПЛЕКС', name: 'ЖК «Северный»' },
        { tag: 'БИЗНЕС-ЦЕНТР', name: 'БЦ «Кортен»' },
        { tag: 'ПРОМЫШЛЕННОСТЬ', name: 'Завод «Технос»' }
    ];

    // === STATE ===
    let currentIndex = 0;
    let autoRotation = 0;
    let mouseRotY = 0;
    let targetRotY = 0;
    let isDragging = false;
    let prevMouseX = 0;

    // === MOUSE PARALLAX ===
    document.addEventListener('mousemove', (e) => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseRotY = nx * 0.25;
    });

    // === DRAG TO ROTATE ===
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        prevMouseX = e.clientX;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - prevMouseX;
        autoRotation += dx * 0.005;
        prevMouseX = e.clientX;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // === TOUCH SWIPE ===
    let touchStartX = 0;
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });

    container.addEventListener('touchend', (e) => {
        const diff = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(diff) > 50) {
            goTo(diff > 0 ? currentIndex - 1 : currentIndex + 1);
        }
    });

    // === NAVIGATION ===
    const dotsContainer = document.getElementById('carousel-dots');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const tagEl = document.getElementById('carousel-tag');
    const nameEl = document.getElementById('carousel-name');
    const indexEl = document.getElementById('carousel-idx');

    // Build dots
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        models.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
            dot.dataset.index = i;
            dot.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(dot);
        });
    }

    function goTo(index) {
        currentIndex = (index + models.length) % models.length;

        // Move group
        if (typeof gsap !== 'undefined') {
            gsap.to(group.position, {
                x: -currentIndex * 30,
                duration: 1.2,
                ease: 'power3.inOut'
            });
        } else {
            group.position.x = -currentIndex * 30;
        }

        // Update UI
        if (tagEl) tagEl.textContent = info[currentIndex].tag;
        if (nameEl) nameEl.textContent = info[currentIndex].name;
        if (indexEl) indexEl.textContent = String(currentIndex + 1).padStart(2, '0');

        // Update dots
        if (dotsContainer) {
            dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
                d.classList.toggle('is-active', i === currentIndex);
            });
        }
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
        if (e.key === 'ArrowRight') goTo(currentIndex + 1);
    });

    // === ANIMATION LOOP ===
    const clock = new THREE.Clock();

    function animate() {
        const t = clock.getElapsedTime();

        // Auto rotation
        if (!isDragging) {
            autoRotation += 0.003;
        }

        targetRotY = autoRotation + mouseRotY;
        group.rotation.y += (targetRotY - group.rotation.y) * 0.06;

        // Gentle floating
        group.children.forEach((model) => {
            model.position.y = Math.sin(t * 0.6 + model.position.x * 0.1) * 0.2;
        });

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    // === RESIZE ===
    window.addEventListener('resize', () => {
        if (!container.clientWidth) return;

        if (window.innerWidth <= 1000) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // === HOVER PAUSE ===
    container.addEventListener('mouseenter', () => {
        if (typeof gsap !== 'undefined') {
            gsap.to(group, { duration: 0.5 });
        }
    });
})();