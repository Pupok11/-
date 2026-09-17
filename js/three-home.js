/* ============================================
   THREE-HOME.JS — 3D-карусель
   ИСПРАВЛЕНО: работает на мобильных и планшетах
   ============================================ */
(function() {
    'use strict';

    const container = document.getElementById('carousel-3d');
    if (!container || typeof THREE === 'undefined') return;

    function init() {
        const isMobile = window.innerWidth <= 1000;
        const isSmall  = window.innerWidth <= 480;

        const w = container.clientWidth || 600;
        const h = container.clientHeight || 400;

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 1000);
        // На мобильных отодвигаем камеру, чтобы модель помещалась в узкий экран
        const camZ = isSmall ? 20 : (isMobile ? 17 : 12);
        const camY = isSmall ? 5  : (isMobile ? 4.5 : 4);
        camera.position.set(0, camY, camZ);
        camera.lookAt(0, 1.5, 0);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: !isMobile,           // экономия на мобильных
            powerPreference: 'high-performance'
        });
        renderer.setSize(w, h);
        // На мобильных снижаем pixelRatio — это главный убийца FPS
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));

        // Тени на мобильных отключаем — дорого
        renderer.shadowMap.enabled = !isMobile;
        if (!isMobile) renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        renderer.setClearColor(0x000000, 0);
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        container.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xFFFFFF, 0.8));

        const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.4);
        keyLight.position.set(8, 12, 8);
        if (!isMobile) {
            keyLight.castShadow = true;
            keyLight.shadow.mapSize.width = 1024;
            keyLight.shadow.mapSize.height = 1024;
            keyLight.shadow.camera.near = 0.5;
            keyLight.shadow.camera.far = 30;
            keyLight.shadow.camera.left = -15;
            keyLight.shadow.camera.right = 15;
            keyLight.shadow.camera.top = 15;
            keyLight.shadow.camera.bottom = -15;
        }
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xC7A06F, 0.6);
        fillLight.position.set(-8, 4, 6);
        scene.add(fillLight);

        const rimLight = new THREE.PointLight(0xC7A06F, 1.2, 25);
        rimLight.position.set(0, 6, -8);
        scene.add(rimLight);

        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2A2A2A, metalness: 0.35, roughness: 0.5 });
        const doorMat = new THREE.MeshStandardMaterial({ color: 0xF5F3EF, metalness: 0.2, roughness: 0.3 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xC7A06F, metalness: 1, roughness: 0.25 });
        const darkGlassMat = new THREE.MeshStandardMaterial({ color: 0x0A0A0A, metalness: 0.9, roughness: 0.1 });
        const screenMat = new THREE.MeshStandardMaterial({ color: 0xC7A06F, emissive: 0xC7A06F, emissiveIntensity: 1.2, metalness: 1, roughness: 0.2 });
        const steelMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.9, roughness: 0.3 });

        function createFridge() {
            const g = new THREE.Group();
            const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 4.5, 1.6), bodyMat);
            body.position.y = 2.25; body.castShadow = true; body.receiveShadow = true; g.add(body);
            const topDoor = new THREE.Mesh(new THREE.BoxGeometry(2.15, 1.1, 0.05), doorMat);
            topDoor.position.set(0, 3.9, 0.83); g.add(topDoor);
            const bottomDoor = new THREE.Mesh(new THREE.BoxGeometry(2.15, 3.1, 0.05), doorMat);
            bottomDoor.position.set(0, 2.1, 0.83); g.add(bottomDoor);
            const hT = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.08), goldMat);
            hT.position.set(1.05, 3.9, 0.9); g.add(hT);
            const hB = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.08), goldMat);
            hB.position.set(1.05, 2.1, 0.9); g.add(hB);
            const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), screenMat);
            disp.position.set(-0.5, 3.9, 0.87); g.add(disp);
            for (let x = -0.9; x <= 0.9; x += 1.8) for (let z = -0.6; z <= 0.6; z += 1.2) {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 8), steelMat);
                leg.position.set(x, 0.075, z); g.add(leg);
            }
            return g;
        }

        function createWasher() {
            const g = new THREE.Group();
            const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.0), bodyMat);
            body.position.y = 1.2; body.castShadow = true; g.add(body);
            const topPanel = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 2.0), doorMat);
            topPanel.position.y = 2.2; g.add(topPanel);
            const doorRing = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.1, 16, 32), goldMat);
            doorRing.position.set(0, 1.2, 1.02); g.add(doorRing);
            const doorGlass = new THREE.Mesh(new THREE.CircleGeometry(0.65, 32), darkGlassMat);
            doorGlass.position.set(0, 1.2, 1.01); g.add(doorGlass);
            const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.25), screenMat);
            disp.position.set(-0.5, 2.2, 1.02); g.add(disp);
            for (let i = 0; i < 4; i++) {
                const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), goldMat);
                btn.rotation.x = Math.PI / 2; btn.position.set(0.4 + i * 0.2, 2.2, 1.02); g.add(btn);
            }
            for (let x = -1; x <= 1; x += 2) for (let z = -0.8; z <= 0.8; z += 1.6) {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8), steelMat);
                leg.position.set(x, 0.05, z); g.add(leg);
            }
            return g;
        }

        function createMicrowave() {
            const g = new THREE.Group();
            const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.5, 1.6), bodyMat);
            body.position.y = 0.75; body.castShadow = true; g.add(body);
            const door = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.3, 0.05), doorMat);
            door.position.set(-0.3, 0.75, 0.82); g.add(door);
            const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.0), darkGlassMat);
            windowGlass.position.set(-0.3, 0.75, 0.85); g.add(windowGlass);
            const panel = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.3, 0.05), new THREE.MeshStandardMaterial({ color: 0x1A1A1A, metalness: 0.5, roughness: 0.5 }));
            panel.position.set(0.85, 0.75, 0.82); g.add(panel);
            const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), screenMat);
            disp.position.set(0.85, 1.1, 0.85); g.add(disp);
            for (let i = 0; i < 6; i++) {
                const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12), goldMat);
                btn.rotation.x = Math.PI / 2;
                btn.position.set(0.7 + (i % 2) * 0.25, 0.9 - Math.floor(i / 2) * 0.2, 0.85); g.add(btn);
            }
            const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), goldMat);
            handle.position.set(0.5, 0.75, 0.85); g.add(handle);
            return g;
        }

        const shadowPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(80, 20),
            new THREE.ShadowMaterial({ opacity: 0.2 })
        );
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.y = 0;
        shadowPlane.receiveShadow = true;

        const models = [createFridge(), createWasher(), createMicrowave()];
        const group = new THREE.Group();
        scene.add(group);
        if (!isMobile) scene.add(shadowPlane);

        models.forEach((model, i) => {
            model.position.x = i * 30;
            group.add(model);
        });

        const info = [
            { tag: 'ХОЛОДИЛЬНИК', name: 'ТехноПрестиж X500' },
            { tag: 'СТИРАЛЬНАЯ МАШИНА', name: 'ТехноПрестиж W300' },
            { tag: 'МИКРОВОЛНОВКА', name: 'ТехноПрестиж M200' }
        ];

        let currentIndex = 0;
        let autoRotation = 0;
        let mouseRotY = 0;
        let isDragging = false;
        let prevMouseX = 0;

        document.addEventListener('mousemove', (e) => {
            const nx = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseRotY = nx * 0.25;
        });

        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            prevMouseX = e.clientX;
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            autoRotation += (e.clientX - prevMouseX) * 0.005;
            prevMouseX = e.clientX;
        });
        document.addEventListener('mouseup', () => { isDragging = false; });

        let touchStartX = 0;
        container.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
        container.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(diff) > 50) goTo(diff > 0 ? currentIndex - 1 : currentIndex + 1);
        });

        const dotsContainer = document.getElementById('carousel-dots');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        const tagEl = document.getElementById('carousel-tag');
        const nameEl = document.getElementById('carousel-name');

        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            models.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
                dot.addEventListener('click', () => goTo(i));
                dotsContainer.appendChild(dot);
            });
        }

        function goTo(index) {
            currentIndex = (index + models.length) % models.length;
            if (typeof gsap !== 'undefined') {
                gsap.to(group.position, { x: -currentIndex * 30, duration: 1.2, ease: 'power3.inOut' });
            } else {
                group.position.x = -currentIndex * 30;
            }
            if (tagEl) tagEl.textContent = info[currentIndex].tag;
            if (nameEl) nameEl.textContent = info[currentIndex].name;
            if (dotsContainer) {
                dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
                    d.classList.toggle('is-active', i === currentIndex);
                });
            }
        }

        if (prevBtn) prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
            if (e.key === 'ArrowRight') goTo(currentIndex + 1);
        });

        function resize() {
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (w < 10 || h < 10) return;
            camera.aspect = w / h;
            // Подстраиваем дистанцию при ресайзе: если контейнер стал узким — отодвигаем камеру
            const newIsSmall = window.innerWidth <= 480;
            const newIsMobile = window.innerWidth <= 1000;
            const z = newIsSmall ? 20 : (newIsMobile ? 17 : 12);
            const y = newIsSmall ? 5  : (newIsMobile ? 4.5 : 4);
            camera.position.z = z;
            camera.position.y = y;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
            renderer.domElement.style.width = '100%';
            renderer.domElement.style.height = '100%';
        }

        if ('ResizeObserver' in window) {
            const ro = new ResizeObserver(() => resize());
            ro.observe(container);
        }
        window.addEventListener('resize', resize);
        window.addEventListener('orientationchange', () => setTimeout(resize, 200));

        const clock = new THREE.Clock();
        function animate() {
            const t = clock.getElapsedTime();
            if (!isDragging) autoRotation += 0.003;
            const targetRotY = autoRotation + mouseRotY;
            group.rotation.y += (targetRotY - group.rotation.y) * 0.06;
            group.children.forEach((m) => {
                m.position.y = Math.sin(t * 0.6 + m.position.x * 0.1) * 0.15;
            });
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }
        animate();
    }

    // Ждём, пока контейнер получит размеры (бывает при загрузке из кэша)
    let attempts = 0;
    const maxAttempts = 120;
    function tryInit() {
        attempts++;
        if (container.clientWidth > 0 && container.clientHeight > 0) {
            init();
        } else if (attempts < maxAttempts) {
            requestAnimationFrame(tryInit);
        }
    }
    tryInit();
})();