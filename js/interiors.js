(function() {
    'use strict';
    if (typeof THREE === 'undefined') return;
    if (window.innerWidth <= 1000) return;

    function createBaseScene(container) {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xF5F3EF);
        const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.set(5, 4, 6);
        camera.lookAt(0, 1, 0);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);
        scene.add(new THREE.AmbientLight(0xFFFFFF, 0.7));
        const key = new THREE.DirectionalLight(0xFFFFFF, 0.8);
        key.position.set(5, 8, 5);
        key.castShadow = true;
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xC7A06F, 0.4);
        fill.position.set(-3, 3, 4);
        scene.add(fill);
        return { scene, camera, renderer };
    }

    function initKitchen() {
        const container = document.getElementById('interior-kitchen');
        if (!container) return;
        const { scene, camera, renderer } = createBaseScene(container);
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: 0xE8E5DF, roughness: 0.4 }));
        floor.rotation.x = -Math.PI / 2; scene.add(floor);
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(10, 4), new THREE.MeshStandardMaterial({ color: 0xF5F3EF }));
        wall.position.set(0, 2, -5); scene.add(wall);
        const cabMat = new THREE.MeshStandardMaterial({ color: 0xEDE9E3, roughness: 0.6 });
        for (let i = 0; i < 5; i++) {
            const cab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2, 1.1), cabMat);
            cab.position.set(-3 + i * 1.5, 1, -4.4); scene.add(cab);
            const light = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.05), new THREE.MeshStandardMaterial({ color: 0xC7A06F, emissive: 0xC7A06F, emissiveIntensity: 2 }));
            light.position.set(-3 + i * 1.5, 1.98, -3.83); scene.add(light);
            const pl = new THREE.PointLight(0xC7A06F, 0.4, 3);
            pl.position.set(-3 + i * 1.5, 1.85, -3.5); scene.add(pl);
        }
        const counter = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 1.2), new THREE.MeshStandardMaterial({ color: 0x3A3A3A, roughness: 0.3, metalness: 0.4 }));
        counter.position.set(0, 2.05, -4.4); scene.add(counter);
        const island = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 1.4), new THREE.MeshStandardMaterial({ color: 0xE8E5DF }));
        island.position.set(0, 0.5, 0); scene.add(island);
        const clock = new THREE.Clock();
        (function animate() {
            const t = clock.getElapsedTime();
            camera.position.x = Math.sin(t * 0.15) * 6;
            camera.position.z = Math.cos(t * 0.15) * 6;
            camera.position.y = 3 + Math.sin(t * 0.1) * 0.5;
            camera.lookAt(0, 1.5, -2);
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        })();
    }

    function initParking() {
        const container = document.getElementById('interior-parking');
        if (!container) return;
        const { scene, camera, renderer } = createBaseScene(container);
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0xD4D0C8, roughness: 0.5 }));
        floor.rotation.x = -Math.PI / 2; scene.add(floor);
        const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0xE8E5DF }));
        ceiling.rotation.x = Math.PI / 2; ceiling.position.y = 3; scene.add(ceiling);
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xE0DCD4 });
        for (let i = 0; i < 4; i++) {
            const wall = new THREE.Mesh(new THREE.PlaneGeometry(20, 3), wallMat);
            wall.position.y = 1.5;
            if (i === 0) wall.position.z = -10;
            else if (i === 1) { wall.position.z = 10; wall.rotation.y = Math.PI; }
            else if (i === 2) { wall.position.x = -10; wall.rotation.y = Math.PI / 2; }
            else { wall.position.x = 10; wall.rotation.y = -Math.PI / 2; }
            scene.add(wall);
        }
        for (let x = -8; x <= 8; x += 4) {
            const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.4), new THREE.MeshStandardMaterial({ color: 0xC7A06F, emissive: 0xC7A06F, emissiveIntensity: 1.5 }));
            lamp.position.set(x, 2.9, 0); scene.add(lamp);
            const pl = new THREE.PointLight(0xC7A06F, 0.6, 8);
            pl.position.set(x, 2.7, 0); scene.add(pl);
        }
        const carColors = [0x36455F, 0xC7A06F, 0xC77A4A, 0x2A2A2A, 0xEDE9E3];
        for (let i = 0; i < 8; i++) {
            const car = new THREE.Group();
            const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.6, 3.4), new THREE.MeshStandardMaterial({ color: carColors[i % 5], metalness: 0.7, roughness: 0.4 }));
            body.position.y = 0.5; car.add(body);
            const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.7), new THREE.MeshStandardMaterial({ color: 0x1A1A1A, metalness: 0.9, roughness: 0.1 }));
            cabin.position.set(0, 1, -0.3); car.add(cabin);
            car.position.set((i % 2 === 0 ? -6 : 6), 0, -5 + Math.floor(i / 2) * 4);
            car.rotation.y = i % 2 === 0 ? 0 : Math.PI;
            scene.add(car);
        }
        const clock = new THREE.Clock();
        (function animate() {
            const t = clock.getElapsedTime();
            camera.position.x = Math.sin(t * 0.1) * 10;
            camera.position.z = Math.cos(t * 0.1) * 10;
            camera.position.y = 2;
            camera.lookAt(0, 1, 0);
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        })();
    }

    function initLobby() {
        const container = document.getElementById('interior-lobby');
        if (!container) return;
        const { scene, camera, renderer } = createBaseScene(container);
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(15, 15), new THREE.MeshStandardMaterial({ color: 0xF0EDE6, roughness: 0.15, metalness: 0.2 }));
        floor.rotation.x = -Math.PI / 2; scene.add(floor);
        const desk = new THREE.Mesh(new THREE.BoxGeometry(4, 1.1, 0.8), new THREE.MeshStandardMaterial({ color: 0xC77A4A, metalness: 0.6, roughness: 0.4 }));
        desk.position.set(0, 0.55, -2); scene.add(desk);
        const top = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.1, 0.9), new THREE.MeshStandardMaterial({ color: 0x1A1A1A, metalness: 0.8, roughness: 0.2 }));
        top.position.set(0, 1.15, -2); scene.add(top);
        for (let i = 0; i < 3; i++) {
            const x = -4 + i * 4;
            const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.4, 12), new THREE.MeshStandardMaterial({ color: 0xD4D0C8 }));
            pot.position.set(x, 0.2, -3); scene.add(pot);
            const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.5, 8), new THREE.MeshStandardMaterial({ color: 0x4A6A3A }));
            leaves.position.set(x, 1.15, -3); scene.add(leaves);
        }
        const chandelier = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshStandardMaterial({ color: 0xC7A06F, emissive: 0xC7A06F, emissiveIntensity: 1.2, metalness: 1, roughness: 0.2 }));
        chandelier.position.y = 3.5; scene.add(chandelier);
        const chandLight = new THREE.PointLight(0xC7A06F, 1, 8);
        chandLight.position.y = 3.5; scene.add(chandLight);
        const clock = new THREE.Clock();
        (function animate() {
            const t = clock.getElapsedTime();
            camera.position.x = Math.sin(t * 0.12) * 5;
            camera.position.z = 3 + Math.cos(t * 0.12) * 5;
            camera.position.y = 2.5;
            camera.lookAt(0, 1, -1);
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        })();
    }

    function initCourtyard() {
        const container = document.getElementById('interior-courtyard');
        if (!container) return;
        const { scene, camera, renderer } = createBaseScene(container);
        const grass = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0xB8C4A8, roughness: 0.9 }));
        grass.rotation.x = -Math.PI / 2; scene.add(grass);
        const path = new THREE.Mesh(new THREE.PlaneGeometry(2, 20), new THREE.MeshStandardMaterial({ color: 0xD4D0C8 }));
        path.rotation.x = -Math.PI / 2; path.position.y = 0.01; scene.add(path);
        const slide = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 3), new THREE.MeshStandardMaterial({ color: 0xC77A4A, metalness: 0.5 }));
        slide.position.set(-3, 1.2, 2); slide.rotation.x = -Math.PI / 6; scene.add(slide);
        const tower = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 1), new THREE.MeshStandardMaterial({ color: 0xC7A06F }));
        tower.position.set(-3, 1.25, 0); scene.add(tower);
        for (let i = 0; i < 6; i++) {
            const x = -9 + i * 3.6;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1, 8), new THREE.MeshStandardMaterial({ color: 0x6A5A4A }));
            trunk.position.set(x, 0.5, -6); scene.add(trunk);
            const crown = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2, 8), new THREE.MeshStandardMaterial({ color: 0x4A6A3A }));
            crown.position.set(x, 2, -6); scene.add(crown);
        }
        const clock = new THREE.Clock();
        (function animate() {
            const t = clock.getElapsedTime();
            camera.position.x = Math.sin(t * 0.08) * 8;
            camera.position.z = Math.cos(t * 0.08) * 8;
            camera.position.y = 3;
            camera.lookAt(0, 1, 0);
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        })();
    }

    function initAll() {
        initKitchen();
        initParking();
        initLobby();
        initCourtyard();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();