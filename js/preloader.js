/* ============================================
   PRELOADER — Разрушающийся дом
   0% → целый дом. 100% → всё разлетелось.
   Показывается ТОЛЬКО ОДИН РАЗ за сессию.
   ============================================ */
(function() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    // === ПРОВЕРКА: показывали ли уже прелоадер? ===
    if (sessionStorage.getItem('preloaderShown') === 'true') {
        // Уже показывали — мгновенно скрываем и выходим
        preloader.classList.add('is-hidden');
        // На всякий случай убираем из DOM через секунду
        setTimeout(() => {
            if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
        }, 1000);
        return;
    }

    const dot = preloader.querySelector('.preloader__dot');
    const svgPath = preloader.querySelector('.preloader__svg path');
    const percent = document.getElementById('preloader-percent');
    const mini = document.getElementById('preloader-mini');

    // === SVG-логотип рисуется пером ===
    if (typeof gsap !== 'undefined' && svgPath) {
        gsap.to(svgPath, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' });
    }

    // === 3D ДОМ, КОТОРЫЙ РАЗРУШАЕТСЯ ===
    let scene, camera, renderer, houseBlocks = [];
    let progress = 0;

    if (mini && typeof THREE !== 'undefined') {
        try {
            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
            camera.position.set(4, 3, 6);
            camera.lookAt(0, 0.5, 0);

            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(120, 120);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            mini.appendChild(renderer.domElement);

            // Свет
            scene.add(new THREE.AmbientLight(0xffffff, 0.6));
            const key = new THREE.DirectionalLight(0xffffff, 1.2);
            key.position.set(5, 8, 5);
            scene.add(key);
            const fill = new THREE.DirectionalLight(0xB8965D, 0.5);
            fill.position.set(-5, 3, 3);
            scene.add(fill);

            // Материалы
            const wallMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.2, roughness: 0.6 });
            const roofMat = new THREE.MeshStandardMaterial({ color: 0xB8965D, metalness: 0.8, roughness: 0.3 });
            const doorMat = new THREE.MeshStandardMaterial({ color: 0x1A1A1A, metalness: 0.4, roughness: 0.7 });
            const windowMat = new THREE.MeshStandardMaterial({ color: 0xC7A06F, metalness: 0.9, roughness: 0.15, emissive: 0xB8965D, emissiveIntensity: 0.4 });

            const house = new THREE.Group();
            scene.add(house);

            // === СТЕНЫ: сетка кубиков ===
            const blockSize = 0.35;
            const gap = 0.01;

            // Слой 1 (нижний)
            for (let x = -1; x <= 1; x++) {
                for (let z = -1; z <= 1; z++) {
                    if (z === 1 && x === 0) continue; // место под дверь
                    const block = new THREE.Mesh(
                        new THREE.BoxGeometry(blockSize, blockSize, blockSize),
                        wallMat
                    );
                    block.position.set(x * (blockSize + gap), blockSize / 2, z * (blockSize + gap));
                    block.userData = { originalPos: block.position.clone(), seed: Math.random() };
                    house.add(block);
                    houseBlocks.push(block);
                }
            }

            // Слой 2 (средний, с окнами)
            for (let x = -1; x <= 1; x++) {
                for (let z = -1; z <= 1; z++) {
                    let mat = wallMat;
                    if ((x === -1 || x === 1) && z === 0) mat = windowMat;
                    if (z === -1 && (x === -1 || x === 1)) mat = windowMat;

                    const block = new THREE.Mesh(
                        new THREE.BoxGeometry(blockSize, blockSize, blockSize),
                        mat
                    );
                    block.position.set(x * (blockSize + gap), blockSize * 1.5 + gap, z * (blockSize + gap));
                    block.userData = { originalPos: block.position.clone(), seed: Math.random() };
                    house.add(block);
                    houseBlocks.push(block);
                }
            }

            // Слой 3 (верхний)
            for (let x = -1; x <= 1; x++) {
                for (let z = -1; z <= 1; z++) {
                    const block = new THREE.Mesh(
                        new THREE.BoxGeometry(blockSize, blockSize, blockSize),
                        wallMat
                    );
                    block.position.set(x * (blockSize + gap), blockSize * 2.5 + gap * 2, z * (blockSize + gap));
                    block.userData = { originalPos: block.position.clone(), seed: Math.random() };
                    house.add(block);
                    houseBlocks.push(block);
                }
            }

            // === КРЫША ===
            const roofPositions = [
                [0, blockSize * 3.3 + gap * 3, 0],
                [-0.35, blockSize * 3.3 + gap * 3, 0],
                [0.35, blockSize * 3.3 + gap * 3, 0],
                [0, blockSize * 3.3 + gap * 3, -0.35],
                [0, blockSize * 3.3 + gap * 3, 0.35],
                [0, blockSize * 3.7 + gap * 3, 0]
            ];

            roofPositions.forEach(pos => {
                const roofBlock = new THREE.Mesh(
                    new THREE.BoxGeometry(blockSize * 1.1, blockSize * 0.6, blockSize * 1.1),
                    roofMat
                );
                roofBlock.position.set(pos[0], pos[1], pos[2]);
                roofBlock.userData = { originalPos: roofBlock.position.clone(), seed: Math.random() };
                house.add(roofBlock);
                houseBlocks.push(roofBlock);
            });

            // === ДВЕРЬ ===
            const door = new THREE.Mesh(
                new THREE.BoxGeometry(blockSize * 0.7, blockSize * 0.9, 0.05),
                doorMat
            );
            door.position.set(0, blockSize * 0.45, blockSize * 1.5 + gap * 2);
            door.userData = { originalPos: door.position.clone(), seed: Math.random() };
            house.add(door);
            houseBlocks.push(door);

            house.rotation.y = -0.5;

            // === ПАРАМЕТРЫ РАЗРУШЕНИЯ ===
            houseBlocks.forEach((block) => {
                const dir = block.position.clone().normalize();
                block.userData.fallSpeed = 0.02 + Math.random() * 0.03;
                block.userData.rotateSpeed = (Math.random() - 0.5) * 0.15;
                block.userData.throwDirection = new THREE.Vector3(
                    dir.x * (0.5 + Math.random() * 0.8),
                    0.3 + Math.random() * 0.6,
                    dir.z * (0.5 + Math.random() * 0.8)
                );
            });

        } catch (err) {
            console.warn('Preloader 3D недоступен:', err);
        }
    }

    // === ПРОГРЕСС И РАЗРУШЕНИЕ ===
    const interval = setInterval(() => {
        progress += Math.random() * 6 + 2;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(finishPreloader, 350);
        }
        if (percent) percent.textContent = Math.floor(progress) + '%';

        updateHouseDestruction(progress / 100);
    }, 130);

    function updateHouseDestruction(t) {
        if (!houseBlocks.length) return;

        houseBlocks.forEach((block, i) => {
            const threshold = (i / houseBlocks.length) * 0.7;
            const localT = Math.max(0, (t - threshold) / (1 - threshold));

            if (localT > 0) {
                const td = localT * localT;
                block.position.x = block.userData.originalPos.x + block.userData.throwDirection.x * td * 3;
                block.position.y = block.userData.originalPos.y - td * 2.5 - block.userData.fallSpeed * td * 20;
                block.position.z = block.userData.originalPos.z + block.userData.throwDirection.z * td * 3;
                block.rotation.x += block.userData.rotateSpeed * localT * 0.5;
                block.rotation.y += block.userData.rotateSpeed * localT * 0.5;
                block.rotation.z += block.userData.rotateSpeed * localT * 0.3;
            }
        });
    }

    // === RENDER LOOP ===
    let clock = null;
    if (renderer) {
        clock = new THREE.Clock();
        (function loop() {
            const t = clock.getElapsedTime();
            if (renderer && scene && camera) {
                camera.position.y = 3 + (progress / 100) * 0.5;
                camera.position.x = 4 + Math.sin(t * 0.5) * 0.3;
                camera.position.z = 6 + Math.cos(t * 0.5) * 0.3;
                camera.lookAt(0, 0.8 - (progress / 100) * 0.5, 0);

                if (houseBlocks.length) {
                    const house = houseBlocks[0].parent;
                    house.rotation.y += 0.003;
                }

                renderer.render(scene, camera);
            }
            requestAnimationFrame(loop);
        })();
    }

    // === ФИНАЛЬНЫЙ ВЗРЫВ + Переход ===
    function finishPreloader() {
        if (houseBlocks.length && typeof gsap !== 'undefined') {
            houseBlocks.forEach((block) => {
                gsap.to(block.position, {
                    x: block.position.x + (Math.random() - 0.5) * 20,
                    y: block.position.y - Math.random() * 15 - 5,
                    z: block.position.z + (Math.random() - 0.5) * 20,
                    duration: 0.9 + Math.random() * 0.4,
                    ease: 'power2.in'
                });
                gsap.to(block.rotation, {
                    x: Math.random() * Math.PI * 6,
                    y: Math.random() * Math.PI * 6,
                    z: Math.random() * Math.PI * 6,
                    duration: 1,
                    ease: 'power2.in'
                });
            });
        }

        setTimeout(() => {
            preloader.classList.add('is-hidden');

            // === СТАВИМ ФЛАГ: прелоадер показан ===
            try {
                sessionStorage.setItem('preloaderShown', 'true');
            } catch (e) {
                console.warn('sessionStorage недоступен:', e);
            }

            // Показываем hero-элементы
            document.querySelectorAll('.hero [data-reveal]').forEach((el, i) => {
                setTimeout(() => el.classList.add('is-visible'), i * 120);
            });
        }, 700);
    }
})();