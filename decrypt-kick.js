// ==UserScript==
// @name         OBK Kick
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description
// @author       FL9NS
// @match        https://kick.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    const DECRYPT_MAP = [10, 5, 14, 12, 9, 11, 13, 2, 15, 7, 3, 4, 1, 8, 6, 0];
    const GRID_SIZE = 4;
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
        canvas.style.objectFit = 'contain';
        if (video.parentNode) {
            const parentStyle = window.getComputedStyle(video.parentNode);
            if (parentStyle.position === 'static') {
                video.parentNode.style.position = 'relative';
            }
            video.parentNode.appendChild(canvas);
        }
        function renderFrame() {
            if (!video.paused && !video.ended && video.readyState >= 2) {
                if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    tempCanvas.width = video.videoWidth;
                    tempCanvas.height = video.videoHeight;
                }
                const w = video.videoWidth / GRID_SIZE;
                const h = video.videoHeight / GRID_SIZE;
                tempCtx.drawImage(video, 0, 0);
                for (let i = 0; i < 16; i++) {
                    const srcIndex = DECRYPT_MAP[i];
                    const sx = (srcIndex % GRID_SIZE) * w;
                    const sy = Math.floor(srcIndex / GRID_SIZE) * h;
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
        const video = document.querySelector('video');
        if (video && !video.dataset.unscramblerActive) {
            initUnscrambler();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
