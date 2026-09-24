// ==UserScript==
// @name         OBK
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  On Baise Kick
// @author       FL9NS
// @match        https://kick.com/*
// @grant        none
// ==/UserScript==
(function () {
    'use strict';
    const DECRYPT_MAP = [10, 5, 14, 12, 9, 11, 13, 2, 15, 7, 3, 4, 1, 8, 6, 0];
    const GRID_SIZE = 4;
    let isUnscrambleEnabled = false;
    function createToggleSlider(container) {
        if (document.getElementById('kick-unscramble-toggle')) return;
        const style = document.createElement('style');
        style.textContent = `
            .kick-switch-wrapper {
                position: absolute;
                top: 15px;
                right: 15px;
                z-index: 100;
                cursor: pointer;
            }
            .kick-switch {
                position: relative;
                display: inline-block;
                width: 44px;
                height: 24px;
            }
            .kick-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            .kick-slider {
                position: absolute;
                cursor: pointer;
                top: 0; left: 0; right: 0; bottom: 0;
                background-color: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(4px);
                transition: .3s;
                border-radius: 24px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .kick-slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 2px;
                background-color: #ffffff;
                transition: .3s;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.4);
            }
            input:checked + .kick-slider {
                background-color: #53fc18;
            }
            input:checked + .kick-slider:before {
                transform: translateX(18px);
                background-color: #000000;
            }
        `;
        document.head.appendChild(style);
        const wrapper = document.createElement('label');
        wrapper.id = 'kick-unscramble-toggle';
        wrapper.className = 'kick-switch-wrapper';
        const switchLabel = document.createElement('label');
        switchLabel.className = 'kick-switch';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = isUnscrambleEnabled;
        const slider = document.createElement('span');
        slider.className = 'kick-slider';
        switchLabel.appendChild(input);
        switchLabel.appendChild(slider);
        wrapper.appendChild(switchLabel);
        wrapper.addEventListener('click', (e) => e.stopPropagation());
        input.addEventListener('change', () => {
            isUnscrambleEnabled = input.checked;
        });
        container.appendChild(wrapper);
    }
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
            createToggleSlider(video.parentNode);
        }
        function renderFrame() {
            if (isUnscrambleEnabled && !video.paused && !video.ended && video.readyState >= 2) {
                canvas.style.display = 'block';
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
            } else if (!isUnscrambleEnabled) {
                canvas.style.display = 'none';
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
