// ==UserScript==
// @name         OBK
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  
// @author       You
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Correspondance des 16 blocs reçus (16 -> 0, 13 -> 12, etc.)
    const DECRYPT_MAP = [15, 12, 7, 10, 11, 1, 14, 9, 13, 4, 0, 5, 3, 6, 2, 8];
    const GRID_SIZE = 4; // Grille 4x4

    function initUnscrambler() {
        const video = document.querySelector('video');
        if (!video || video.dataset.unscramblerActive) return;

        video.dataset.unscramblerActive = "true";

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '10';
        canvas.style.pointerEvents = 'none';

        video.parentNode.appendChild(canvas);

        function renderFrame() {
            if (!video.paused && !video.ended && video.readyState >= 2) {
                if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    tempCanvas.width = video.videoWidth;
                    tempCanvas.height = video.videoHeight;
                }

                // Découpe de la largeur et hauteur par 4
                const w = video.videoWidth / GRID_SIZE;
                const h = video.videoHeight / GRID_SIZE;

                // 1. Capture de la frame cryptée
                tempCtx.drawImage(video, 0, 0);

                // 2. Repositionnement des 16 blocs
                for (let i = 0; i < 16; i++) {
                    const srcIndex = DECRYPT_MAP[i];

                    // Coordonnées X,Y dans l'image cryptée reçue
                    const sx = (srcIndex % GRID_SIZE) * w;
                    const sy = Math.floor(srcIndex / GRID_SIZE) * h;

                    // Coordonnées X,Y cibles décryptées (position i)
                    const dx = (i % GRID_SIZE) * w;
                    const dy = Math.floor(i / GRID_SIZE) * h;

                    ctx.drawImage(tempCanvas, sx, sy, w, h, dx, dy, w, h);
                }
            }
            requestAnimationFrame(renderFrame);
        }

        requestAnimationFrame(renderFrame);
    }

    const observer = new MutationObserver(() => {
        if (document.querySelector('video')) {
            initUnscrambler();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
