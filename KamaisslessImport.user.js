// ==UserScript==
// @name         KamaisslessImport
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  One-click export from chun.missless.net to Kamaitachi
// @author       Lolergags
// @match        https://chun.missless.net/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @connect      kamai.tachi.ac
// ==/UserScript==

(function() {
    'use strict';

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

            const formData = new FormData();
            // Fastify requires text fields to come before file fields in the multipart stream
            formData.append('importType', 'file/batch-manual');
            
            // Appending as scoreData as this is the standard field Tachi expects for score files
            formData.append('scoreData', blob, `missless_logs${isV3 ? '_v3' : ''}.json`);

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


    function injectButtons() {
        // Only run on the playlog page
        if (!window.location.href.includes('/record/playlog')) return;

        let injected = false;

        // Strategy 1: Find the main modal-opening export div (provided by user HTML)
        const mainExportDiv = document.querySelector('div[onclick*="exportModal"], div[style*="btn_base_playexport.png"]');
        if (mainExportDiv && !mainExportDiv.dataset.kamaitachiInjected) {
            mainExportDiv.dataset.kamaitachiInjected = 'true';
            
            const newBtn = document.createElement('button');
            // Style it to match the layout of the original div but clearly distinct
            newBtn.style.width = '390px';
            newBtn.style.height = '40px';
            newBtn.style.marginLeft = '0px'; // Perfectly flush side-by-side
            newBtn.style.marginTop = '0px';
            newBtn.style.backgroundColor = '#8B0000'; // Deep Maroon
            newBtn.style.color = 'white';
            newBtn.style.border = 'none';
            newBtn.style.borderBottom = '4px solid #5a0000'; // 3D Shading effect on the bottom
            newBtn.style.borderRadius = '5px';
            newBtn.style.fontSize = '16px';
            newBtn.style.cursor = 'pointer';
            newBtn.style.fontWeight = 'bold';
            newBtn.style.display = 'inline-block'; // Ensure it stays side-by-side flush
            newBtn.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.4)'; // Nice drop shadow
            newBtn.innerText = 'Send to Kamaitachi';
            
            newBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                sendToKamaitachi(true); // Default to v3 as per standard
            };

            mainExportDiv.parentNode.insertBefore(newBtn, mainExportDiv.nextSibling);
            injected = true;
        }

        // Strategy 2: Find all likely clickable elements inside the modal or elsewhere
        const clickableElements = Array.from(document.querySelectorAll('button, a, [role="button"], [class*="btn"], [class*="button"]'));

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

                const newBtn = document.createElement(btn.tagName);
                if (btn.tagName === 'A') newBtn.href = '#';
                newBtn.className = btn.className;
                newBtn.style.cssText = btn.style.cssText;
                newBtn.style.marginLeft = '0px';
                newBtn.innerText = `Send to Kamaitachi${isV3 ? '' : ' (v1)'}`;
                
                newBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    sendToKamaitachi(isV3);
                };

                btn.parentNode.insertBefore(newBtn, btn.nextSibling);
                injected = true;
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
