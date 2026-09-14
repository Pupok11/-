/* ============================================
   THREE-OBJECT.JS — 3D-модель объекта
   Использует data.js для выбора типа модели
   ============================================ */

(function() {
    'use strict';

    const container = document.getElementById('project-viewer');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        40,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(15, 12, 20);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // === LIGHTS ===
    scene.add(new THREE.AmbientLight(0xFFFFFF, 0.55));

    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.1);
    keyLight.position.set(15, 25, 10);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xC7A06F, 0.5);
    fillLight.position.set(-10, 8, 10);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xC7A06F, 1.5, 50);
    rimLight.position.set(0, 15, -15);
    scene.add(rimLight);

    // === MATERIALS ===
    const concreteMat = new THREE.MeshStandardMaterial({
        color: 0xE8E5DF,
        metalness: 0.15,
        roughness: 0.85
    });

    const goldMat = new THREE.MeshStandardMaterial({
        color: 0xC7A06F,
        metalness: 1,
        roughness: 0.25
    });

    const glassMat = new THREE.MeshStandardMaterial({
        color: 0xD4D0C8,
        metalness: 0.7,
        roughness: 0.1,
        transparent: true,
        opacity: 0.82
    });

    const darkMat = new THREE.MeshStandardMaterial({
        color: 0x1A1A1A,
        metalness: 0.5,
        roughness: 0.5
    });

    // === BUILDING GROUP ===
    const building = new THREE.Group();
    scene.add(building);

    // Detect project from URL
    function getProjectId() {
        const path = window.location.pathname;
        const match = path.match(/object-(\d+)-/);
        return match ? `object-${match[1]}` : null;
    }

    const projectId = getProjectId();

    // Find project in data
    let projectData = null;
    if (window.MONOLIT_DATA) {
        projectData = window.MONOLIT_DATA.projects.find(p => p.id.startsWith(projectId || 'object-01'));
    }

    const modelType = projectData ? projectData.modelType : 'towers';

    // === MODEL FACTORY ===
    function buildTowers() {
        const positions = [
            [-8, 0, 0], [-4, 0, -2], [0, 0, 0], [4, 0, 2], [8, 0, 0],
            [-6, 0, 4], [-2, 0, 5], [2, 0, 4], [6, 0, 5],
            [-8, 0, 8], [0, 0, 8], [8, 0, 8]
        ];
        const heights = [10, 13, 16, 13, 10, 12, 14, 12, 14, 10, 13, 10];

        positions.forEach((pos, i) => {
            const h = heights[i];
            const tower = new THREE.Mesh(
                new THREE.BoxGeometry(2, h, 2),
                concreteMat
            );
            tower.position.set(pos[0], h / 2, pos[2]);
            building.add(tower);

            // Roof
            const roof = new THREE.Mesh(
                new THREE.BoxGeometry(2.15, 0.15, 2.15),
                goldMat
            );
            roof.position.set(pos[0], h + 0.07, pos[2]);
            building.add(roof);

            // Windows
            const floors = Math.floor(h / 1.5);
            for (let j = 0; j < floors; j++) {
                const y = j * 1.5 + 0.75;
                [0, Math.PI, -Math.PI / 2, Math.PI / 2].forEach((rot, k) => {
                    const win = new THREE.Mesh(
                        new THREE.PlaneGeometry(1.6, 0.5),
                        glassMat
                    );
                    if (k === 0) win.position.set(pos[0], y, pos[2] + 1.01);
                    else if (k === 1) win.position.set(pos[0], y, pos[2] - 1.01);
                    else if (k === 2) win.position.set(pos[0] - 1.01, y, pos[2]);
                    else win.position.set(pos[0] + 1.01, y, pos[2]);
                    win.rotation.y = rot;
                    building.add(win);
                });
            }
        });

        // Ground
        const ground = new THREE.Mesh(
            new THREE.BoxGeometry(26, 0.2, 20),
            concreteMat
        );
        ground.position.set(0, -0.1, 4);
        building.add(ground);
    }

    function buildHouse() {
        // Main volume
        const main = new THREE.Mesh(
            new THREE.BoxGeometry(8, 3.5, 6),
            concreteMat
        );
        main.position.set(0, 1.75, 0);
        building.add(main);

        // Second floor
        const second = new THREE.Mesh(
            new THREE.BoxGeometry(6, 3, 5),
            concreteMat
        );
        second.position.set(0, 5, -0.5);
        building.add(second);

        // Panoramic windows
        const winFront = new THREE.Mesh(
            new THREE.PlaneGeometry(7.5, 3),
            glassMat
        );
        winFront.position.set(0, 1.75, 3.01);
        building.add(winFront);

        const winSecond = new THREE.Mesh(
            new THREE.PlaneGeometry(5.5, 2.5),
            glassMat
        );
        winSecond.position.set(0, 5, 2.01);
        building.add(winSecond);

        // Terrace
        const terrace = new THREE.Mesh(
            new THREE.BoxGeometry(6, 0.2, 3),
            goldMat
        );
        terrace.position.set(0, 3.4, 4.5);
        building.add(terrace);

        // Roof
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(6.2, 0.2, 5.2),
            goldMat
        );
        roof.position.set(0, 6.6, -0.5);
        building.add(roof);

        // Ground
        const ground = new THREE.Mesh(
            new THREE.BoxGeometry(14, 0.15, 12),
            new THREE.MeshStandardMaterial({ color: 0xB8C4A8, roughness: 0.9 })
        );
        ground.position.set(0, -0.07, 0);
        building.add(ground);
    }

    function buildBlade() {
        // Tall tower
        const tower = new THREE.Mesh(
            new THREE.BoxGeometry(3.5, 18, 6),
            glassMat
        );
        tower.position.y = 9;
        building.add(tower);

        // Gold rims
        for (let y = 0.5; y < 18; y += 1) {
            const rim = new THREE.Mesh(
                new THREE.BoxGeometry(3.6, 0.06, 6.1),
                goldMat
            );
            rim.position.y = y;
            building.add(rim);
        }

        // Spire
        const spire = new THREE.Mesh(
            new THREE.ConeGeometry(2.5, 3, 4),
            goldMat
        );
        spire.position.y = 19.5;
        spire.rotation.y = Math.PI / 4;
        building.add(spire);

        // Base
        const base = new THREE.Mesh(
            new THREE.BoxGeometry(7, 0.6, 8),
            concreteMat
        );
        base.position.y = 0.3;
        building.add(base);

        // Ground
        const ground = new THREE.Mesh(
            new THREE.BoxGeometry(14, 0.15, 14),
            concreteMat
        );
        ground.position.y = -0.07;
        building.add(ground);
    }

    function buildIndustrial() {
        // Main hall
        const hall = new THREE.Mesh(
            new THREE.BoxGeometry(14, 5, 8),
            concreteMat
        );
        hall.position.set(0, 2.5, 0);
        building.add(hall);

        // Metal roof
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(14.2, 0.3, 8.2),
            goldMat
        );
        roof.position.set(0, 5.15, 0);
        building.add(roof);

        // Columns
        for (let x = -6; x <= 6; x += 3) {
            for (let z = -3; z <= 3; z += 3) {
                const col = new THREE.Mesh(
                    new THREE.BoxGeometry(0.4, 5, 0.4),
                    darkMat
                );
                col.position.set(x, 2.5, z);
                building.add(col);
            }
        }

        // АБК (administrative)
        const abk = new THREE.Mesh(
            new THREE.BoxGeometry(5, 6, 4),
            concreteMat
        );
        abk.position.set(10, 3, 0);
        building.add(abk);

        // ABK windows
        for (let y = 1; y < 6; y += 1.5) {
            const win = new THREE.Mesh(
                new THREE.PlaneGeometry(4.5, 0.8),
                glassMat
            );
            win.position.set(10, y, 2.01);
            building.add(win);
        }

        // Ground
        const ground = new THREE.Mesh(
            new THREE.BoxGeometry(28, 0.2, 16),
            new THREE.MeshStandardMaterial({ color: 0xD4D0C8, roughness: 0.9 })
        );
        ground.position.set(2, -0.1, 0);
        building.add(ground);
    }

    // Build the right model
    switch (modelType) {
        case 'house':
            buildHouse();
            camera.position.set(12, 8, 14);
            break;
        case 'blade':
            buildBlade();
            camera.position.set(12, 12, 16);
            break;
        case 'industrial':
            buildIndustrial();
            camera.position.set(18, 14, 20);
            break;
        case 'towers':
        default:
            buildTowers();
            camera.position.set(15, 12, 20);
            break;
    }

    // === ORBIT CONTROLS (minimal) ===
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let rotY = -0.3;
    let rotX = 0.3;
    let targetRotY = -0.3;
    let targetRotX = 0.3;
    let distance = 28;
    let targetDistance = 28;

    container.style.cursor = 'grab';

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        prevX = e.clientX;
        prevY = e.clientY;
        container.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        targetRotY += dx * 0.008;
        targetRotX += dy * 0.008;
        targetRotX = Math.max(-0.4, Math.min(1.2, targetRotX));
        prevX = e.clientX;
        prevY = e.clientY;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });

    // Zoom
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        targetDistance += e.deltaY * 0.02;
        targetDistance = Math.max(12, Math.min(50, targetDistance));
    }, { passive: false });

    // Touch
    let touchStartDist = 0;
    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            prevX = e.touches[0].clientX;
            prevY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            touchStartDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        }
    });

    container.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && isDragging) {
            const dx = e.touches[0].clientX - prevX;
            const dy = e.touches[0].clientY - prevY;
            targetRotY += dx * 0.01;
            targetRotX += dy * 0.01;
            targetRotX = Math.max(-0.4, Math.min(1.2, targetRotX));
            prevX = e.touches[0].clientX;
            prevY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const delta = touchStartDist - dist;
            targetDistance += delta * 0.05;
            targetDistance = Math.max(12, Math.min(50, targetDistance));
            touchStartDist = dist;
        }
    }, { passive: false });

    container.addEventListener('touchend', () => {
        isDragging = false;
    });

    // === ANIMATION LOOP ===
    const clock = new THREE.Clock();

    function animate() {
        const t = clock.getElapsedTime();

        rotY += (targetRotY - rotY) * 0.08;
        rotX += (targetRotX - rotX) * 0.08;
        distance += (targetDistance - distance) * 0.08;

        // Smooth orbit
        camera.position.x = Math.sin(rotY) * Math.cos(rotX) * distance;
        camera.position.y = Math.sin(rotX) * distance + 5;
        camera.position.z = Math.cos(rotY) * Math.cos(rotX) * distance;

        camera.lookAt(0, modelType === 'blade' ? 8 : 4, 0);

        // Gentle bob
        building.position.y = Math.sin(t * 0.5) * 0.1;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    // === RESIZE ===
    window.addEventListener('resize', () => {
        if (!container.clientWidth) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
})();