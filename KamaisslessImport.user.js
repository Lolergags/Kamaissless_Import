// ==UserScript==
// @name         KamaisslessImport
// @namespace    http://tampermonkey.net/
// @version      1.2.2
// @description  One-click export from Missless (Chunithm, Ongeki, Maimai) to Kamaitachi
// @author       Lolergags
// @match        https://chun.missless.net/*
// @match        https://geki.missless.net/*
// @match        https://mai.missless.net/*
// @updateURL    https://raw.githubusercontent.com/Lolergags/Kamaissless_Import/main/KamaisslessImport.user.js
// @downloadURL  https://raw.githubusercontent.com/Lolergags/Kamaissless_Import/main/KamaisslessImport.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @connect      kamai.tachi.ac
// ==/UserScript==

(function() {
    'use strict';

    // Game-specific visual themes matching Chunithm, Ongeki, and Maimai site aesthetics
    const GAME_THEMES = {
        'chun.missless.net': {
            gameName: 'Chunithm',
            bgColor: '#8B0000',      // Deep Maroon (Chunithm)
            borderColor: '#5a0000',  // 3D Shading Dark Maroon
            hoverColor: '#a30000',
            activeColor: '#700000'
        },
        'geki.missless.net': {
            gameName: 'Ongeki',
            bgColor: '#E6007E',      // Ongeki Pink / Magenta
            borderColor: '#990050',  // Dark Magenta Shading
            hoverColor: '#FF1493',
            activeColor: '#C2006A'
        },
        'mai.missless.net': {
            gameName: 'Maimai',
            bgColor: '#FF6600',      // Maimai DX Orange
            borderColor: '#BF360C',  // Dark Orange Shading
            hoverColor: '#FF7A00',
            activeColor: '#D95700'
        }
    };

    function getCurrentTheme() {
        const hostname = window.location.hostname;
        return GAME_THEMES[hostname] || {
            gameName: 'Kamaitachi',
            bgColor: '#8B0000',
            borderColor: '#5a0000',
            hoverColor: '#a30000',
            activeColor: '#700000'
        };
    }

    function getKamaitachiToken() {
        let token = GM_getValue("kamaitachi_token");
        if (!token) {
            token = prompt("Please enter your Kamaitachi API Token:");
            if (token) GM_setValue("kamaitachi_token", token);
        }
        return token;
    }

    GM_registerMenuCommand("Update Kamaitachi API Token", () => {
        const newToken = prompt("Enter new Kamaitachi API Token:", GM_getValue("kamaitachi_token", ""));
        if (newToken) GM_setValue("kamaitachi_token", newToken);
    });

    async function sendToKamaitachi(isV3 = true) {
        const token = getKamaitachiToken();
        if (!token) return;

        try {
            // Fetch export data using the internal API
            const response = await fetch(`/rest/playlog/export?v3=${isV3}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const jsonStr = JSON.stringify(data);
            const blob = new Blob([jsonStr], { type: 'application/json' });

            const hostname = window.location.hostname;
            const gameKey = hostname.split('.')[0] || 'missless';

            const formData = new FormData();
            // Fastify requires text fields to come before file fields in the multipart stream
            formData.append('importType', 'file/batch-manual');
            
            // Appending as scoreData as this is the standard field Tachi expects for score files
            formData.append('scoreData', blob, `missless_${gameKey}_logs${isV3 ? '_v3' : ''}.json`);

            const uploadResponse = await fetch("https://kamai.tachi.ac/api/v1/import/file", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token
                },
                body: formData
            });

            const resultText = await uploadResponse.text();
            if (uploadResponse.ok) {
                alert("Successfully imported to Kamaitachi!");
            } else {
                alert("Import failed: " + resultText);
            }
        } catch (error) {
            console.error('Error in sendToKamaitachi:', error);
            alert("Error: " + error.message);
        }
    }

    function styleButton(btn, theme) {
        btn.style.backgroundColor = theme.bgColor;
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderBottom = `4px solid ${theme.borderColor}`;
        btn.style.borderRadius = '5px';
        btn.style.fontSize = '16px';
        btn.style.cursor = 'pointer';
        btn.style.fontWeight = 'bold';
        btn.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.4)';
        btn.style.transition = 'background-color 0.2s, transform 0.1s';
        btn.style.textDecoration = 'none';
        btn.style.outline = 'none';
        btn.style.textAlign = 'center';
        btn.style.whiteSpace = 'nowrap'; // Ensure button text is strictly single-line

        btn.onmouseenter = () => {
            if (!btn.disabled) btn.style.backgroundColor = theme.hoverColor;
        };
        btn.onmouseleave = () => {
            if (!btn.disabled) btn.style.backgroundColor = theme.bgColor;
        };
        btn.onmousedown = () => {
            if (!btn.disabled) btn.style.backgroundColor = theme.activeColor;
        };
        btn.onmouseup = () => {
            if (!btn.disabled) btn.style.backgroundColor = theme.hoverColor;
        };
    }

    function injectButtons() {
        // Only run on the playlog page
        if (!window.location.href.includes('/record/playlog')) return;

        const theme = getCurrentTheme();

        // Strategy 1: Find the main modal-opening export div (provided by user HTML)
        const mainExportDiv = document.querySelector('div[onclick*="exportModal"], div[style*="btn_base_playexport.png"], div[style*="playexport"], div[class*="playexport"], div[onclick*="exportPlays"]');
        if (mainExportDiv && !mainExportDiv.dataset.kamaitachiInjected) {
            mainExportDiv.dataset.kamaitachiInjected = 'true';
            
            const newBtn = document.createElement('button');
            
            // Standard 390px width across all sites matching Chunithm / Ongeki buttons
            newBtn.style.width = '390px';
            newBtn.style.maxWidth = '100%';
            newBtn.style.height = '40px';
            newBtn.style.boxSizing = 'border-box';
            
            // Center element horizontally with auto block margins
            newBtn.style.marginTop = '10px';
            newBtn.style.marginBottom = '10px';
            newBtn.style.marginLeft = 'auto';
            newBtn.style.marginRight = 'auto';
            newBtn.style.display = 'block';
            newBtn.style.clear = 'both';
            newBtn.style.alignSelf = 'center';
            
            styleButton(newBtn, theme);

            newBtn.innerText = 'Send to Kamaitachi';
            
            newBtn.onclick = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const origText = newBtn.innerText;
                newBtn.disabled = true;
                newBtn.innerText = 'Importing to Kamaitachi...';
                try {
                    await sendToKamaitachi(true); // Default to v3 as per standard
                } finally {
                    newBtn.disabled = false;
                    newBtn.innerText = origText;
                }
            };

            mainExportDiv.parentNode.insertBefore(newBtn, mainExportDiv.nextSibling);
        }

        // Strategy 2: Find all likely clickable elements inside the modal or elsewhere
        const clickableElements = Array.from(document.querySelectorAll('button, a, [role="button"], [class*="btn"], [class*="button"], div[onclick]'));

        clickableElements.forEach(btn => {
            if (btn.dataset.kamaitachiInjected) return;

            const text = (btn.innerText || btn.textContent || '').toLowerCase().trim();
            const onclick = btn.getAttribute('onclick') || '';

            // Check if this element looks like the target export button inside the modal
            if (onclick.includes('exportPlays') || text === 'export plays' || text === 'export' || text.includes('export plays')) {
                btn.dataset.kamaitachiInjected = 'true';

                let isV3 = true; 
                if (onclick.includes('false') || text.includes('v1') || text.includes('v2')) {
                    isV3 = false;
                }

                const newBtn = document.createElement(btn.tagName === 'DIV' ? 'button' : btn.tagName);
                if (newBtn.tagName === 'A') newBtn.href = '#';
                newBtn.className = btn.className;
                newBtn.style.cssText = btn.style.cssText;
                
                newBtn.style.width = '390px';
                newBtn.style.maxWidth = '100%';
                newBtn.style.height = '40px';
                newBtn.style.boxSizing = 'border-box';
                newBtn.style.marginTop = '10px';
                newBtn.style.marginBottom = '10px';
                newBtn.style.marginLeft = 'auto';
                newBtn.style.marginRight = 'auto';
                newBtn.style.display = 'block';
                newBtn.style.clear = 'both';
                newBtn.style.alignSelf = 'center';
                
                styleButton(newBtn, theme);

                newBtn.innerText = `Send to Kamaitachi${isV3 ? '' : ' (v1)'}`;
                
                newBtn.onclick = async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const origText = newBtn.innerText;
                    newBtn.disabled = true;
                    newBtn.innerText = 'Importing...';
                    try {
                        await sendToKamaitachi(isV3);
                    } finally {
                        newBtn.disabled = false;
                        newBtn.innerText = origText;
                    }
                };

                btn.parentNode.insertBefore(newBtn, btn.nextSibling);
            }
        });

    }

    // Run injection logic repeatedly to handle dynamic content (e.g. React/Vue apps)
    function observeAndInject() {
        const observer = new MutationObserver(() => {
            injectButtons();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        injectButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeAndInject);
    } else {
        observeAndInject();
    }

    // Also observe URL changes for Single Page Applications
    let lastUrl = location.href; 
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            injectButtons();
        }
    }).observe(document, {subtree: true, childList: true});

})();
