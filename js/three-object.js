/* ============================================
   THREE-OBJECT.JS — 3D-модель товара
   ИСПРАВЛЕНО: тёмные материалы для контраста
   ============================================ */

(function() {
    'use strict';

    const container = document.getElementById('project-viewer');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(15, 12, 20);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // === LIGHTS ===
    scene.add(new THREE.AmbientLight(0xFFFFFF, 0.75));
    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.4);
    keyLight.position.set(15, 25, 10);
    keyLight.castShadow = true;
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xC7A06F, 0.6);
    fillLight.position.set(-10, 8, 10);
    scene.add(fillLight);
    const rimLight = new THREE.PointLight(0xC7A06F, 1.5, 50);
    rimLight.position.set(0, 15, -15);
    scene.add(rimLight);

    // === MATERIALS — ТЁМНЫЕ для контраста со светлым фоном ===
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2A2A2A, metalness: 0.35, roughness: 0.5 });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xF5F3EF, metalness: 0.2, roughness: 0.3 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xC7A06F, metalness: 1, roughness: 0.25 });
    const darkGlassMat = new THREE.MeshStandardMaterial({ color: 0x0A0A0A, metalness: 0.9, roughness: 0.1 });
    const screenMat = new THREE.MeshStandardMaterial({ color: 0xC7A06F, emissive: 0xC7A06F, emissiveIntensity: 1.2, metalness: 1, roughness: 0.2 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.9, roughness: 0.3 });

    // === GET PRODUCT ID FROM URL ===
    function getProductId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id') || 'fridge-x500';
    }

    const productId = getProductId();
    let productData = null;
    if (window.TECHNOPRESTIGE_DATA) {
        productData = window.TECHNOPRESTIGE_DATA.products.find(p => p.id === productId);
    }
    const modelType = productData ? productData.modelType : 'fridge';

    const building = new THREE.Group();
    scene.add(building);

    // === SHADOW PLANE ===
    const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.ShadowMaterial({ opacity: 0.2 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.receiveShadow = true;
    building.add(shadowPlane);

    // === MODEL BUILDERS ===

    function buildFridge() {
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 4.5, 1.6), bodyMat);
        body.position.y = 2.25;
        body.castShadow = true;
        body.receiveShadow = true;
        building.add(body);

        const topDoor = new THREE.Mesh(new THREE.BoxGeometry(2.15, 1.1, 0.05), doorMat);
        topDoor.position.set(0, 3.9, 0.83);
        topDoor.castShadow = true;
        building.add(topDoor);

        const bottomDoor = new THREE.Mesh(new THREE.BoxGeometry(2.15, 3.1, 0.05), doorMat);
        bottomDoor.position.set(0, 2.1, 0.83);
        bottomDoor.castShadow = true;
        building.add(bottomDoor);

        const hT = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.08), goldMat);
        hT.position.set(1.05, 3.9, 0.9);
        building.add(hT);

        const hB = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.08), goldMat);
        hB.position.set(1.05, 2.1, 0.9);
        building.add(hB);

        const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), screenMat);
        disp.position.set(-0.5, 3.9, 0.87);
        building.add(disp);

        for (let x = -0.9; x <= 0.9; x += 1.8) {
            for (let z = -0.6; z <= 0.6; z += 1.2) {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 8), steelMat);
                leg.position.set(x, 0.075, z);
                leg.castShadow = true;
                building.add(leg);
            }
        }

        camera.position.set(8, 8, 12);
    }

    function buildWasher() {
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.0), bodyMat);
        body.position.y = 1.2;
        body.castShadow = true;
        body.receiveShadow = true;
        building.add(body);

        const topPanel = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 2.0), doorMat);
        topPanel.position.y = 2.2;
        topPanel.castShadow = true;
        building.add(topPanel);

        const doorRing = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.1, 16, 32), goldMat);
        doorRing.position.set(0, 1.2, 1.02);
        building.add(doorRing);

        const doorGlass = new THREE.Mesh(new THREE.CircleGeometry(0.65, 32), darkGlassMat);
        doorGlass.position.set(0, 1.2, 1.01);
        building.add(doorGlass);

        const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.25), screenMat);
        disp.position.set(-0.5, 2.2, 1.02);
        building.add(disp);

        for (let i = 0; i < 4; i++) {
            const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), goldMat);
            btn.rotation.x = Math.PI / 2;
            btn.position.set(0.4 + i * 0.2, 2.2, 1.02);
            building.add(btn);
        }

        for (let x = -1; x <= 1; x += 2) {
            for (let z = -0.8; z <= 0.8; z += 1.6) {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8), steelMat);
                leg.position.set(x, 0.05, z);
                leg.castShadow = true;
                building.add(leg);
            }
        }

        camera.position.set(7, 7, 10);
    }

    function buildMicrowave() {
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.5, 1.6), bodyMat);
        body.position.y = 0.75;
        body.castShadow = true;
        body.receiveShadow = true;
        building.add(body);

        const door = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.3, 0.05), doorMat);
        door.position.set(-0.3, 0.75, 0.82);
        door.castShadow = true;
        building.add(door);

        const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.0), darkGlassMat);
        windowGlass.position.set(-0.3, 0.75, 0.85);
        building.add(windowGlass);

        const panel = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.3, 0.05), new THREE.MeshStandardMaterial({ color: 0x1A1A1A, metalness: 0.5, roughness: 0.5 }));
        panel.position.set(0.85, 0.75, 0.82);
        building.add(panel);

        const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), screenMat);
        disp.position.set(0.85, 1.1, 0.85);
        building.add(disp);

        for (let i = 0; i < 6; i++) {
            const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12), goldMat);
            btn.rotation.x = Math.PI / 2;
            btn.position.set(0.7 + (i % 2) * 0.25, 0.9 - Math.floor(i / 2) * 0.2, 0.85);
            building.add(btn);
        }

        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), goldMat);
        handle.position.set(0.5, 0.75, 0.85);
        building.add(handle);

        for (let x = -1; x <= 1; x += 2) {
            for (let z = -0.6; z <= 0.6; z += 1.2) {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8), steelMat);
                leg.position.set(x, 0.04, z);
                leg.castShadow = true;
                building.add(leg);
            }
        }

        camera.position.set(6, 5, 8);
    }

    function buildVacuum() {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 1.5, 16), bodyMat);
        body.position.y = 0.75;
        body.castShadow = true;
        body.receiveShadow = true;
        building.add(body);

        const top = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, 0.6, 16), doorMat);
        top.position.y = 1.8;
        top.castShadow = true;
        building.add(top);

        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 0.15), goldMat);
        handle.position.set(0.5, 2.2, 0);
        building.add(handle);

        const hose = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.1, 8, 20), goldMat);
        hose.position.set(-0.8, 1.2, 0);
        hose.rotation.x = Math.PI / 3;
        building.add(hose);

        const wheel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.2, 12), steelMat);
        wheel1.rotation.z = Math.PI / 2;
        wheel1.position.set(-0.9, 0.35, 0.6);
        wheel1.castShadow = true;
        building.add(wheel1);

        const wheel2 = wheel1.clone();
        wheel2.position.set(0.9, 0.35, 0.6);
        building.add(wheel2);

        camera.position.set(6, 6, 9);
    }

    function buildBlender() {
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.4, 16), bodyMat);
        base.position.y = 0.2;
        base.castShadow = true;
        building.add(base);

        const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.8, 16), doorMat);
        jar.position.y = 1.2;
        jar.castShadow = true;
        building.add(jar);

        const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.15, 16), goldMat);
        lid.position.y = 2.15;
        building.add(lid);

        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 0.15), goldMat);
        handle.position.set(0.7, 1.2, 0);
        building.add(handle);

        const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), goldMat);
        btn.rotation.x = Math.PI / 2;
        btn.position.set(0, 0.4, 0.75);
        building.add(btn);

        camera.position.set(6, 6, 9);
    }

    function buildMulticooker() {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 1.6, 16), bodyMat);
        body.position.y = 0.8;
        body.castShadow = true;
        body.receiveShadow = true;
        building.add(body);

        const lid = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.0, 0.3, 16), doorMat);
        lid.position.y = 1.75;
        lid.castShadow = true;
        building.add(lid);

        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.6), goldMat);
        handle.position.set(0, 2.0, 0.8);
        building.add(handle);

        const panel = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.1), doorMat);
        panel.position.set(0, 1.2, 1.0);
        building.add(panel);

        const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.2), screenMat);
        disp.position.set(0, 1.25, 1.06);
        building.add(disp);

        const btn1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), goldMat);
        btn1.rotation.x = Math.PI / 2;
        btn1.position.set(-0.25, 0.9, 1.05);
        building.add(btn1);

        const btn2 = btn1.clone();
        btn2.position.set(0.25, 0.9, 1.05);
        building.add(btn2);

        camera.position.set(6, 6, 9);
    }

    // === BUILD THE RIGHT MODEL ===
    switch (modelType) {
        case 'fridge':       buildFridge();     break;
        case 'washer':       buildWasher();     break;
        case 'microwave':    buildMicrowave();  break;
        case 'vacuum':       buildVacuum();     break;
        case 'blender':      buildBlender();    break;
        case 'multicooker':  buildMulticooker();break;
        default:             buildFridge();
    }

    // === ORBIT CONTROLS ===
    let isDragging = false;
    let prevX = 0, prevY = 0;
    let rotY = -0.3, rotX = 0.3;
    let targetRotY = -0.3, targetRotX = 0.3;
    let distance = 15, targetDistance = 15;

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

    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        targetDistance += e.deltaY * 0.02;
        targetDistance = Math.max(8, Math.min(30, targetDistance));
    }, { passive: false });

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
            targetDistance = Math.max(8, Math.min(30, targetDistance));
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

        camera.position.x = Math.sin(rotY) * Math.cos(rotX) * distance;
        camera.position.y = Math.sin(rotX) * distance + 3;
        camera.position.z = Math.cos(rotY) * Math.cos(rotX) * distance;

        let lookAtY = 1;
        if (modelType === 'fridge') lookAtY = 2.5;
        else if (modelType === 'washer') lookAtY = 1.2;
        else if (modelType === 'vacuum') lookAtY = 1.2;
        else if (modelType === 'blender') lookAtY = 1.1;
        else if (modelType === 'multicooker') lookAtY = 1.0;
        else if (modelType === 'microwave') lookAtY = 0.75;

        camera.lookAt(0, lookAtY, 0);

        building.position.y = Math.sin(t * 0.5) * 0.1;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', () => {
        if (!container.clientWidth) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
})();