/* ============================================
   INTERIORS.JS — 4 процедурные 3D-сцены
   kitchen / parking / lobby / courtyard
   ============================================ */

(function() {
    'use strict';

    if (typeof THREE === 'undefined') return;
    if (window.innerWidth <= 1000) return;

    // === BASE SCENE HELPER ===
    function createBaseScene(container) {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xF5F3EF);

        const camera = new THREE.PerspectiveCamera(
            50,
            container.clientWidth / container.clientHeight,
            0.1,
            100
        );
        camera.position.set(5, 4, 6);
        camera.lookAt(0, 1, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        // Lights (white luxe)
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

    // ============================================
    // SECTION: Interior 3D Kitchen
    // ============================================
    function initKitchen() {
        const container = document.getElementById('interior-kitchen');
        if (!container) return;

        const { scene, camera, renderer } = createBaseScene(container);

        // Floor
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10),
            new THREE.MeshStandardMaterial({ color: 0xE8E5DF, roughness: 0.4 })
        );
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

        // Back wall
        const wall = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 4),
            new THREE.MeshStandardMaterial({ color: 0xF5F3EF })
        );
        wall.position.set(0, 2, -5);
        scene.add(wall);

        // Kitchen cabinets
        const cabMat = new THREE.MeshStandardMaterial({
            color: 0xEDE9E3,
            roughness: 0.6
        });

        for (let i = 0; i < 5; i++) {
            const cab = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 2, 1.1),
                cabMat
            );
            cab.position.set(-3 + i * 1.5, 1, -4.4);
            scene.add(cab);

            // Cabinet lighting (glowing strip)
            const light = new THREE.Mesh(
                new THREE.PlaneGeometry(1.3, 0.05),
                new THREE.MeshStandardMaterial({
                    color: 0xC7A06F,
                    emissive: 0xC7A06F,
                    emissiveIntensity: 2
                })
            );
            light.position.set(-3 + i * 1.5, 1.98, -3.83);
            scene.add(light);

            // Point light for glow
            const pl = new THREE.PointLight(0xC7A06F, 0.4, 3);
            pl.position.set(-3 + i * 1.5, 1.85, -3.5);
            scene.add(pl);
        }

        // Countertop
        const counter = new THREE.Mesh(
            new THREE.BoxGeometry(8, 0.1, 1.2),
            new THREE.MeshStandardMaterial({
                color: 0x3A3A3A,
                roughness: 0.3,
                metalness: 0.4
            })
        );
        counter.position.set(0, 2.05, -4.4);
        scene.add(counter);

        // Island
        const island = new THREE.Mesh(
            new THREE.BoxGeometry(3, 1, 1.4),
            new THREE.MeshStandardMaterial({ color: 0xE8E5DF })
        );
        island.position.set(0, 0.5, 0);
        scene.add(island);

        // Island top
        const islandTop = new THREE.Mesh(
            new THREE.BoxGeometry(3.1, 0.1, 1.5),
            new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
                roughness: 0.2
            })
        );
        islandTop.position.set(0, 1.05, 0);
        scene.add(islandTop);

        // Stools
        for (let i = -1; i <= 1; i++) {
            const stool = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.3, 0.7, 12),
                new THREE.MeshStandardMaterial({ color: 0xC7A06F })
            );
            stool.position.set(i * 1, 0.35, 1.2);
            scene.add(stool);
        }

        // Camera orbit
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

    // ============================================
    // SECTION: Interior 3D Parking
    // ============================================
    function initParking() {
        const container = document.getElementById('interior-parking');
        if (!container) return;

        const { scene, camera, renderer } = createBaseScene(container);

        // Floor
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.MeshStandardMaterial({ color: 0xD4D0C8, roughness: 0.5 })
        );
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

        // Ceiling
        const ceiling = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.MeshStandardMaterial({ color: 0xE8E5DF })
        );
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 3;
        scene.add(ceiling);

        // Walls
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xE0DCD4 });
        for (let i = 0; i < 4; i++) {
            const wall = new THREE.Mesh(new THREE.PlaneGeometry(20, 3), wallMat);
            wall.position.y = 1.5;
            if (i === 0) { wall.position.z = -10; }
            else if (i === 1) { wall.position.z = 10; wall.rotation.y = Math.PI; }
            else if (i === 2) { wall.position.x = -10; wall.rotation.y = Math.PI / 2; }
            else { wall.position.x = 10; wall.rotation.y = -Math.PI / 2; }
            scene.add(wall);
        }

        // Ceiling lights
        for (let x = -8; x <= 8; x += 4) {
            const lamp = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.08, 0.4),
                new THREE.MeshStandardMaterial({
                    color: 0xC7A06F,
                    emissive: 0xC7A06F,
                    emissiveIntensity: 1.5
                })
            );
            lamp.position.set(x, 2.9, 0);
            scene.add(lamp);

            const pl = new THREE.PointLight(0xC7A06F, 0.6, 8);
            pl.position.set(x, 2.7, 0);
            scene.add(pl);
        }

        // Cars (low-poly)
        const carColors = [0x36455F, 0xC7A06F, 0xC77A4A, 0x2A2A2A, 0xEDE9E3];

        for (let i = 0; i < 8; i++) {
            const car = new THREE.Group();

            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1.7, 0.6, 3.4),
                new THREE.MeshStandardMaterial({
                    color: carColors[i % 5],
                    metalness: 0.7,
                    roughness: 0.4
                })
            );
            body.position.y = 0.5;
            car.add(body);

            const cabin = new THREE.Mesh(
                new THREE.BoxGeometry(1.4, 0.5, 1.7),
                new THREE.MeshStandardMaterial({
                    color: 0x1A1A1A,
                    metalness: 0.9,
                    roughness: 0.1
                })
            );
            cabin.position.set(0, 1, -0.3);
            car.add(cabin);

            // Headlights
            const lightMat = new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
                emissive: 0xFFFFFF,
                emissiveIntensity: 0.6
            });
            for (let lx = -0.5; lx <= 0.5; lx += 1) {
                const light = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 0.15, 0.05),
                    lightMat
                );
                light.position.set(lx, 0.5, 1.72);
                car.add(light);
            }

            // Wheels
            for (let wx = -0.85; wx <= 0.85; wx += 1.7) {
                for (let wz = -1.1; wz <= 1.1; wz += 2.2) {
                    const wheel = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.25, 0.25, 0.2, 12),
                        new THREE.MeshStandardMaterial({ color: 0x1A1A1A })
                    );
                    wheel.rotation.z = Math.PI / 2;
                    wheel.position.set(wx, 0.25, wz);
                    car.add(wheel);
                }
            }

            car.position.set(
                (i % 2 === 0 ? -6 : 6),
                0,
                -5 + Math.floor(i / 2) * 4
            );
            car.rotation.y = i % 2 === 0 ? 0 : Math.PI;
            scene.add(car);
        }

        // Camera
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

    // ============================================
    // SECTION: Interior 3D Lobby
    // ============================================
    function initLobby() {
        const container = document.getElementById('interior-lobby');
        if (!container) return;

        const { scene, camera, renderer } = createBaseScene(container);

        // Marble floor
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(15, 15),
            new THREE.MeshStandardMaterial({
                color: 0xF0EDE6,
                roughness: 0.15,
                metalness: 0.2
            })
        );
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

        // Reception desk (corten)
        const desk = new THREE.Mesh(
            new THREE.BoxGeometry(4, 1.1, 0.8),
            new THREE.MeshStandardMaterial({
                color: 0xC77A4A,
                metalness: 0.6,
                roughness: 0.4
            })
        );
        desk.position.set(0, 0.55, -2);
        scene.add(desk);

        // Desk top (black)
        const top = new THREE.Mesh(
            new THREE.BoxGeometry(4.2, 0.1, 0.9),
            new THREE.MeshStandardMaterial({
                color: 0x1A1A1A,
                metalness: 0.8,
                roughness: 0.2
            })
        );
        top.position.set(0, 1.15, -2);
        scene.add(top);

        // Logo behind desk
        const logo = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 0.3),
            new THREE.MeshStandardMaterial({
                color: 0xC7A06F,
                emissive: 0xC7A06F,
                emissiveIntensity: 0.8,
                metalness: 1,
                roughness: 0.3
            })
        );
        logo.position.set(0, 2.5, -3.9);
        scene.add(logo);

        // Plants
        for (let i = 0; i < 3; i++) {
            const x = -4 + i * 4;

            const pot = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.25, 0.4, 12),
                new THREE.MeshStandardMaterial({ color: 0xD4D0C8 })
            );
            pot.position.set(x, 0.2, -3);
            scene.add(pot);

            const leaves = new THREE.Mesh(
                new THREE.ConeGeometry(0.6, 1.5, 8),
                new THREE.MeshStandardMaterial({ color: 0x4A6A3A })
            );
            leaves.position.set(x, 1.15, -3);
            scene.add(leaves);
        }

        // Sofa
        const sofa = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.6, 1),
            new THREE.MeshStandardMaterial({ color: 0xE8E5DF })
        );
        sofa.position.set(-5, 0.3, 2);
        scene.add(sofa);

        const sofaBack = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.6, 0.2),
            new THREE.MeshStandardMaterial({ color: 0xE8E5DF })
        );
        sofaBack.position.set(-5, 0.9, 2.4);
        scene.add(sofaBack);

        // Chandelier
        const chandelier = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 16, 16),
            new THREE.MeshStandardMaterial({
                color: 0xC7A06F,
                emissive: 0xC7A06F,
                emissiveIntensity: 1.2,
                metalness: 1,
                roughness: 0.2
            })
        );
        chandelier.position.y = 3.5;
        scene.add(chandelier);

        const chandLight = new THREE.PointLight(0xC7A06F, 1, 8);
        chandLight.position.y = 3.5;
        scene.add(chandLight);

        // Camera
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

    // ============================================
    // SECTION: Interior 3D Courtyard
    // ============================================
    function initCourtyard() {
        const container = document.getElementById('interior-courtyard');
        if (!container) return;

        const { scene, camera, renderer } = createBaseScene(container);

        // Grass
        const grass = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.MeshStandardMaterial({
                color: 0xB8C4A8,
                roughness: 0.9
            })
        );
        grass.rotation.x = -Math.PI / 2;
        scene.add(grass);

        // Path
        const path = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 20),
            new THREE.MeshStandardMaterial({ color: 0xD4D0C8 })
        );
        path.rotation.x = -Math.PI / 2;
        path.position.y = 0.01;
        scene.add(path);

        // Playground slide
        const slide = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.1, 3),
            new THREE.MeshStandardMaterial({
                color: 0xC77A4A,
                metalness: 0.5
            })
        );
        slide.position.set(-3, 1.2, 2);
        slide.rotation.x = -Math.PI / 6;
        scene.add(slide);

        // Slide tower
        const tower = new THREE.Mesh(
            new THREE.BoxGeometry(1, 2.5, 1),
            new THREE.MeshStandardMaterial({ color: 0xC7A06F })
        );
        tower.position.set(-3, 1.25, 0);
        scene.add(tower);

        // Slide roof
        const slideRoof = new THREE.Mesh(
            new THREE.ConeGeometry(0.9, 0.7, 4),
            new THREE.MeshStandardMaterial({ color: 0xC77A4A })
        );
        slideRoof.position.set(-3, 3, 0);
        slideRoof.rotation.y = Math.PI / 4;
        scene.add(slideRoof);

        // Workout bar
        const bar1 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 3, 12),
            new THREE.MeshStandardMaterial({
                color: 0xC7A06F,
                metalness: 0.9,
                roughness: 0.3
            })
        );
        bar1.position.set(4, 1.5, 3);
        bar1.rotation.z = Math.PI / 2;
        scene.add(bar1);

        for (let x = 2.5; x <= 5.5; x += 3) {
            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 1.5, 12),
                new THREE.MeshStandardMaterial({
                    color: 0xC7A06F,
                    metalness: 0.9,
                    roughness: 0.3
                })
            );
            pole.position.set(x, 0.75, 3);
            scene.add(pole);
        }

        // Trees
        for (let i = 0; i < 6; i++) {
            const x = -9 + i * 3.6;

            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.2, 1, 8),
                new THREE.MeshStandardMaterial({ color: 0x6A5A4A })
            );
            trunk.position.set(x, 0.5, -6);
            scene.add(trunk);

            const crown = new THREE.Mesh(
                new THREE.ConeGeometry(0.9, 2, 8),
                new THREE.MeshStandardMaterial({ color: 0x4A6A3A })
            );
            crown.position.set(x, 2, -6);
            scene.add(crown);

            // Second layer
            const crown2 = new THREE.Mesh(
                new THREE.ConeGeometry(0.7, 1.5, 8),
                new THREE.MeshStandardMaterial({ color: 0x5A7A4A })
            );
            crown2.position.set(x, 2.8, -6);
            scene.add(crown2);
        }

        // Benches
        for (let i = 0; i < 2; i++) {
            const bench = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.1, 0.5),
                new THREE.MeshStandardMaterial({ color: 0xC77A4A })
            );
            bench.position.set(i === 0 ? -6 : 6, 0.5, 4);
            scene.add(bench);

            // Bench legs
            for (let lx = -0.8; lx <= 0.8; lx += 1.6) {
                const leg = new THREE.Mesh(
                    new THREE.BoxGeometry(0.1, 0.5, 0.5),
                    new THREE.MeshStandardMaterial({ color: 0x1A1A1A })
                );
                leg.position.set((i === 0 ? -6 : 6) + lx, 0.25, 4);
                scene.add(leg);
            }
        }

        // Camera
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

    // === INIT ALL INTERIORS ===
    function initAll() {
        initKitchen();
        initParking();
        initLobby();
        initCourtyard();
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();