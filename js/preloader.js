/* ============================================
   PRELOADER — 3D анимация «МММ»
   ============================================ */
(function() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    const noWebGL = (() => {
        try {
            const c = document.createElement('canvas');
            return !(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
        } catch (e) { return true; }
    })();
    const isLowPerf = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (noWebGL || isLowPerf || reducedMotion) {
        preloader.classList.add('is-hidden');
        setTimeout(() => { if (preloader.parentNode) preloader.parentNode.removeChild(preloader); }, 600);
        document.querySelectorAll('.hero [data-reveal]').forEach(el => el.classList.add('is-visible'));
        return;
    }

    if (sessionStorage.getItem('preloaderShown') === 'true') {
        preloader.classList.add('is-hidden');
        setTimeout(() => {
            if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
        }, 1000);
        return;
    }

    const svgPath = preloader.querySelector('.preloader__svg path');
    const percent = document.getElementById('preloader-percent');

    if (typeof gsap !== 'undefined' && svgPath) {
        gsap.to(svgPath, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' });
    }

    // === 3D БУКВЫ «МММ» ===
    const container = document.createElement('div');
    container.id = 'preloader-mmm';
    container.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:300px;height:150px;';
    preloader.appendChild(container);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 300 / 150, 0.1, 100);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(300, 150);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(5, 5, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xB8965D, 0.5);
    fill.position.set(-5, 0, 5);
    scene.add(fill);

    const matGold = new THREE.MeshStandardMaterial({ color: 0xC7A06F, metalness: 1, roughness: 0.25 });
    const matWhite = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.2, roughness: 0.5 });

    const blocks = [];
    const blockSize = 0.5;
    const gap = 0.05;

    // Форма буквы М (5 столбцов, 4 строки)
    const mShape = [
        [1,0,0,0,1],
        [1,1,0,1,1],
        [1,0,1,0,1],
        [1,0,0,0,1]
    ];

    // Три буквы М
    for (let letter = 0; letter < 3; letter++) {
        const offsetX = (letter - 1) * 2.2;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 5; col++) {
                if (mShape[row][col] === 0) continue;
                const block = new THREE.Mesh(
                    new THREE.BoxGeometry(blockSize, blockSize, blockSize),
                    letter === 1 ? matGold : matWhite
                );
                block.position.set(
                    offsetX + (col - 2) * (blockSize + gap),
                    (1.5 - row) * (blockSize + gap),
                    0
                );
                block.userData = {
                    originalPos: block.position.clone(),
                    letter: letter,
                    row: row,
                    col: col
                };
                scene.add(block);
                blocks.push(block);
            }
        }
    }

    // Анимация сборки
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 8 + 3;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(finishPreloader, 500);
        }
        if (percent) percent.textContent = Math.floor(progress) + '%';

        // Сборка букв
        const t = progress / 100;
        blocks.forEach((block) => {
            const delay = (block.userData.letter * 0.2 + block.userData.col * 0.05 + block.userData.row * 0.03);
            const localT = Math.max(0, Math.min(1, (t - delay) / (1 - delay)));
            const eased = 1 - Math.pow(1 - localT, 3);
            block.position.x = block.userData.originalPos.x + (1 - eased) * (Math.random() - 0.5) * 15;
            block.position.y = block.userData.originalPos.y + (1 - eased) * (Math.random() - 0.5) * 15;
            block.position.z = block.userData.originalPos.z + (1 - eased) * (Math.random() - 0.5) * 10;
            block.rotation.x = (1 - eased) * Math.random() * Math.PI * 2;
            block.rotation.y = (1 - eased) * Math.random() * Math.PI * 2;
            block.rotation.z = (1 - eased) * Math.random() * Math.PI * 2;
            block.scale.setScalar(eased);
        });
    }, 100);

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    function finishPreloader() {
        // Взрыв букв
        if (typeof gsap !== 'undefined') {
            blocks.forEach((block) => {
                gsap.to(block.position, {
                    x: block.position.x + (Math.random() - 0.5) * 30,
                    y: block.position.y + (Math.random() - 0.5) * 30,
                    z: block.position.z + (Math.random() - 0.5) * 20,
                    duration: 0.8 + Math.random() * 0.4,
                    ease: 'power2.in'
                });
                gsap.to(block.rotation, {
                    x: Math.random() * Math.PI * 6,
                    y: Math.random() * Math.PI * 6,
                    z: Math.random() * Math.PI * 6,
                    duration: 1, ease: 'power2.in'
                });
                gsap.to(block.scale, {
                    x: 0, y: 0, z: 0,
                    duration: 0.6, ease: 'power2.in'
                });
            });
        }

        setTimeout(() => {
            preloader.classList.add('is-hidden');
            try {
                sessionStorage.setItem('preloaderShown', 'true');
            } catch (e) {}
            document.querySelectorAll('.hero [data-reveal]').forEach((el, i) => {
                setTimeout(() => el.classList.add('is-visible'), i * 120);
            });
        }, 800);
    }
})();