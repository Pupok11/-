/* ============================================
   PRELOADER — всегда показывается минимум 2.5 сек
   Работает offline, с CSS-fallback
   ============================================ */
(function() {
    'use strict';

    var preloader = document.getElementById('preloader');
    if (!preloader) { console.warn('[preloader] нет #preloader'); return; }

    console.log('[preloader] старт');

    var percentEl = document.getElementById('preloader-percent');
    var svgPath = preloader.querySelector('.preloader__svg path');
    var heroReveal = document.querySelectorAll('.hero [data-reveal]');

    var MIN_SHOW_TIME = 2500; // минимум 2.5 секунды
    var startTime = Date.now();

    /* ВАЖНО: reduce-motion игнорируем, иначе прелоадер не виден */
    // var prefersReduced = ...; — намеренно убрано для курсовой

    var hasWebGL = (function() {
        try {
            var c = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
        } catch (e) { return false; }
    })();
    var hasThree = (typeof THREE !== 'undefined');
    console.log('[preloader] WebGL:', hasWebGL, 'Three.js:', hasThree);

    /* ---- Прогресс ---- */
    var progress = 0;
    var progressInterval = setInterval(function() {
        progress += Math.random() * 5 + 1.5;
        if (progress >= 100) progress = 100;
        if (percentEl) percentEl.textContent = Math.floor(progress) + '%';
    }, 90);

    /* ---- SVG-линия (с gsap или без) ---- */
    if (typeof gsap !== 'undefined' && svgPath) {
        try {
            gsap.to(svgPath, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' });
        } catch (e) {}
    } else if (svgPath) {
        svgPath.style.strokeDashoffset = '0';
        svgPath.style.transition = 'stroke-dashoffset 1.6s ease';
    }

    /* ---- 3D-буквы «ТП» ---- */
    var renderer3d = null;
    if (hasWebGL && hasThree) {
        try {
            renderer3d = init3DLetters(preloader);
            console.log('[preloader] 3D запущен');
        } catch (e) {
            console.warn('[preloader] 3D упал:', e);
            renderer3d = null;
        }
    }

    if (!renderer3d) {
        var dot = preloader.querySelector('.preloader__dot');
        if (dot) {
            dot.style.transform = 'scale(1)';
            dot.style.animation = 'preloaderPulse 1.2s ease-in-out infinite';
        }
        if (!document.getElementById('preloaderPulseStyle')) {
            var style = document.createElement('style');
            style.id = 'preloaderPulseStyle';
            style.textContent = '@keyframes preloaderPulse{0%,100%{opacity:.4;transform:scale(.6)}50%{opacity:1;transform:scale(1.4)}}';
            document.head.appendChild(style);
        }
        console.log('[preloader] CSS fallback');
    }

    /* ---- Гарантированный стоп: 8 секунд максимум ---- */
    var safetyTimer = setTimeout(function() {
        console.warn('[preloader] сработал safety timer');
        finishPreloader();
    }, 8000);

    /* ---- Ждём минимум MIN_SHOW_TIME + загрузку страницы ---- */
    var pageLoaded = false;
    window.addEventListener('load', function() {
        pageLoaded = true;
        console.log('[preloader] window.load');
    });

    var checkInterval = setInterval(function() {
        var elapsed = Date.now() - startTime;
        if (elapsed >= MIN_SHOW_TIME && pageLoaded) {
            clearInterval(checkInterval);
            progress = 100;
            if (percentEl) percentEl.textContent = '100%';
            clearInterval(progressInterval);
            setTimeout(finishPreloader, 200);
        }
    }, 100);

    /* На случай, если страница не догрузилась */
    setTimeout(function() {
        if (!pageLoaded) {
            console.warn('[preloader] страница не догрузилась, закрываю принудительно');
            finishPreloader();
        }
    }, MIN_SHOW_TIME + 5000);

    /* ---- Функции ---- */
    function finishPreloader() {
        clearTimeout(safetyTimer);
        clearInterval(progressInterval);
        clearInterval(checkInterval);
        hidePreloader();
    }

    function hidePreloader() {
        console.log('[preloader] скрываю');
        progress = 100;
        if (percentEl) percentEl.textContent = '100%';
        preloader.classList.add('is-hidden');
        setTimeout(function() {
            if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
        }, 900);

        heroReveal.forEach(function(el, i) {
            setTimeout(function() { el.classList.add('is-visible'); }, i * 100);
        });
    }

    /* ---- 3D-буквы ТП ---- */
    function init3DLetters(root) {
        var container = document.createElement('div');
        container.id = 'preloader-mmm';
        container.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:300px;height:150px;pointer-events:none;';
        root.appendChild(container);

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
        camera.position.set(0, 0, 8);
        camera.lookAt(0, 0, 0);

        var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(300, 150);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        var key = new THREE.DirectionalLight(0xffffff, 1.2);
        key.position.set(5, 5, 5);
        scene.add(key);
        var fill = new THREE.DirectionalLight(0xC7A06F, 0.5);
        fill.position.set(-5, 0, 5);
        scene.add(fill);

        var matGold = new THREE.MeshStandardMaterial({ color: 0xC7A06F, metalness: 1, roughness: 0.25 });
        var matWhite = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.2, roughness: 0.5 });

        var group = new THREE.Group();
        scene.add(group);

        var blockSize = 0.55, gap = 0.06;
        var tShape = [
            [1,1,1,1,1],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0]
        ];
        var pShape = [
            [1,1,1,1,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,0,0,0,1]
        ];

        function addLetter(shape, offsetX, mat) {
            for (var row = 0; row < 5; row++) {
                for (var col = 0; col < 5; col++) {
                    if (!shape[row][col]) continue;
                    var block = new THREE.Mesh(
                        new THREE.BoxGeometry(blockSize, blockSize, blockSize),
                        mat
                    );
                    block.position.set(
                        offsetX + (col - 2) * (blockSize + gap),
                        (2 - row) * (blockSize + gap),
                        0
                    );
                    group.add(block);
                }
            }
        }
        addLetter(tShape, -1.6, matWhite);
        addLetter(pShape,  1.6, matGold);

        var clock = new THREE.Clock();
        var rafId = null;

        function animate() {
            if (!container.isConnected) {
                if (rafId) cancelAnimationFrame(rafId);
                return;
            }
            var t = clock.getElapsedTime();
            group.rotation.y = Math.sin(t * 0.6) * 0.25;
            group.position.y = Math.sin(t * 0.8) * 0.05;
            renderer.render(scene, camera);
            rafId = requestAnimationFrame(animate);
        }
        animate();
        return renderer;
    }
})();