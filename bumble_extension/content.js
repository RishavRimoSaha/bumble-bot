if (typeof navigator.webdriver !== 'undefined' && navigator.webdriver) {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
}
if (typeof window.chrome !== 'undefined') {
    // Attempt to make the chrome object less detectable or remove it if safe
    // This is a common fingerprinting vector. Be cautious with removal as some page features might rely on it.
    // window.chrome = undefined; // More aggressive, might break things
    try {
        Object.defineProperty(window, 'chrome', {
            get: () => undefined,
            configurable: true // Allow further changes if needed, or set to false if this is the final state
        });
    } catch (e) {
        console.warn("Could not redefine window.chrome:", e);
    }
}

if (typeof navigator.hardwareConcurrency !== 'undefined') {
    try {
        Object.defineProperty(navigator, 'hardwareConcurrency', {
            value: Math.floor(Math.random() * 6) + 2, // Simulate 2-8 cores
            configurable: false,
            writable: false
        });
    } catch (e) {
        console.warn("Could not redefine navigator.hardwareConcurrency:", e);
    }
}

// Further hide automation signatures
if (typeof (navigator.plugins) !== 'undefined' && navigator.plugins.length === 0) {
    try {
        const noPlugins = {
            length: 0,
            item: () => null,
            namedItem: () => null,
            refresh: () => {}
        };
        Object.defineProperty(navigator, 'plugins', {
            get: () => noPlugins,
            configurable: false
        });
    } catch (e) {
        console.warn("Could not redefine navigator.plugins to empty:", e);
    }
}

if (typeof (navigator.languages) !== 'undefined') {
    try {
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'], // Common language setting
            configurable: false
        });
    } catch (e) {
        console.warn("Could not redefine navigator.languages:", e);
    }
}

let swipingInterval = null;
let isSwiping = false;
let swipeCount = 0;
let startTime = null;
let lastSwipeTime = null;

// --- Helper Functions (Replicating Python Logic) ---

// Function to generate random delay
function randomDelay(minSeconds, maxSeconds) {
    return new Promise(resolve => setTimeout(resolve, (Math.random() * (maxSeconds - minSeconds) + minSeconds) * 1000));
}

// Refined Scrolling
async function randomHumanInteractions() {
    console.log("Performing random human interactions...");
    const profileScollContainer = document.querySelector('.encounters-story__inner') || document.querySelector('.profile__main') || document.body;

    const actions = [
        () => { // Scroll the profile container or body
            const amount = Math.random() * 200 - 100; // Scroll up or down
            profileScollContainer.scrollBy(0, amount);
            console.log(`Interaction: Scrolled profile container by ${amount.toFixed(0)}px`);
        },
        () => { // Simulate Arrow Key on document body (for general page interaction)
            const key = Math.random() > 0.5 ? 'ArrowDown' : 'ArrowUp';
            const keyCode = key === 'ArrowDown' ? 40 : 38;
            document.body.dispatchEvent(new KeyboardEvent('keydown', { key, keyCode, which: keyCode, bubbles: true, cancelable: true }));
            setTimeout(() => {
                document.body.dispatchEvent(new KeyboardEvent('keyup', { key, keyCode, which: keyCode, bubbles: true, cancelable: true }));
            }, Math.random() * 50 + 50);
            console.log(`Interaction: Dispatched ${key} Key on document body`);
        }
    ];

    const numActions = Math.floor(Math.random() * 2) + 1; // 1-2 actions
    for (let i = 0; i < numActions; i++) {
        if (!isSwiping) return;
        const action = actions[Math.floor(Math.random() * actions.length)];
        try {
            action();
            const delay = Math.random() * 1.5 + 1.0; // 1.0-2.5s delay
            await randomDelay(delay, delay + 0.1);
        } catch (e) {
            console.warn("Minor error during random interaction:", e);
        }
    }
}

// Helper function for human-like mouse movements (can be placed with other helpers)
async function simulateMouseMove(element, toX, toY, steps = 10) {
    const rect = element.getBoundingClientRect();
    // Start from a random position within or near the element to simulate less direct movement
    const fromX = rect.left + (Math.random() * rect.width);
    const fromY = rect.top + (Math.random() * rect.height);

    console.log(`Simulating mouse move from (${fromX.toFixed(0)}, ${fromY.toFixed(0)}) to (${toX.toFixed(0)}, ${toY.toFixed(0)})`);

    for (let i = 0; i <= steps; i++) {
        const currentX = fromX + (toX - fromX) * (i / steps);
        const currentY = fromY + (toY - fromY) * (i / steps);
        element.dispatchEvent(new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: currentX,
            clientY: currentY
        }));
        await randomDelay(0.002, 0.005); // Very short delays between micro-movements
    }
}

// Refined humanClick function
async function humanClick(element) {
    if (!element || typeof element.getBoundingClientRect !== 'function') {
        console.error("humanClick: Invalid element provided", element);
        return false;
    }
    const rect = element.getBoundingClientRect();
    const elementStyle = window.getComputedStyle(element);
    console.log(
        "humanClick: Attempting click on element:", element,
        `\n  Visible: ${elementStyle.visibility !== 'hidden' && elementStyle.display !== 'none' && rect.width > 0 && rect.height > 0}`,
        `\n  Opacity: ${elementStyle.opacity}`,
        `\n  Disabled: ${element.disabled === true || element.getAttribute('aria-disabled') === 'true'}`,
        `\n  Rect: ${JSON.stringify(rect)}`
    );

    // Click at a slightly randomized position within the element
    const clickX = rect.left + (rect.width * (0.3 + Math.random() * 0.4));
    const clickY = rect.top + (rect.height * (0.3 + Math.random() * 0.4));

    // Simulate mouse moving to the element before clicking
    console.log(`humanClick: Simulating mouse move to (${clickX.toFixed(0)}, ${clickY.toFixed(0)})`);
    await simulateMouseMove(element, clickX, clickY, Math.floor(Math.random() * 5) + 5); // 5-10 steps for mouse move
    
    console.log("humanClick: Pausing before pointer events...");
    await randomDelay(0.05, 0.15); // Pause after mouseover, before click

    console.log("humanClick: Dispatching pointerdown...");
    element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window, clientX: clickX, clientY: clickY, pointerType: 'mouse', isPrimary: true }));
    
    await randomDelay(0.02, 0.08); // Short delay between down and up

    console.log("humanClick: Dispatching pointerup...");
    element.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, view: window, clientX: clickX, clientY: clickY, pointerType: 'mouse', isPrimary: true }));
    
    // Native click is sometimes still needed for certain event listeners
    if (typeof element.click === 'function') {
        console.log("humanClick: Attempting native element.click()...");
        try {
             element.click();
             console.log("humanClick: Native element.click() executed.");
        } catch (e) {
            console.warn("humanClick: Native element.click() failed.", e);
        }
    } else {
        console.log("humanClick: element.click() is not a function, dispatching manual click event.");
        // Fallback if .click() method doesn't exist (e.g. SVG elements in some cases)
        element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window, clientX: clickX, clientY: clickY }));
        console.log("humanClick: Manual click event dispatched.");
    }
    
    console.log(`humanClick: Dispatched pointerdown, pointerup, and attempted click at (${clickX.toFixed(0)}, ${clickY.toFixed(0)})`);
    return true;
}

// --- SWIPE METHODS ---

// Method 1: Find and click the "Like" button (MODIFIED)
async function findAndClickLikeButton() {
    console.log("Attempting Method 1: Find and Click Like Button (with humanClick)");
    // UPDATED SELECTORS (June 2024 inspired)
    const selectors = [
        'button[data-qa-role="encounters-action-like"]', 
        'div.encounters-action--like button', // More specific for button within the div
        'button[aria-label*="Like" i]', 
        'div.encounters-story__controls button:nth-child(3)', // Often the like button positionally
        'button:has(svg path[d*="M22.794"])', 
        'button:has(svg path[d*="M15.53"])',
        'button:has(svg use[*|href*="#core__icon__heart"])' // For icons via <use>
    ];

    for (const selector of selectors) {
        const buttons = document.querySelectorAll(selector);
        for (const button of buttons) {
            const rect = button.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && button.offsetParent !== null && !button.disabled && window.getComputedStyle(button).visibility !== 'hidden') {
                console.log(`Found potential like button with selector: ${selector}`, button);
                const clicked = await humanClick(button);
                if (clicked) {
                    console.log("Like button successfully clicked via humanClick.");
                    return true;
                }
            }
        }
    }
    console.log("Method 1 Failed: No suitable like button found or humanClick failed.");
    return false;
}

// Method 2: Simulate Pointer Events for Card Swipe
async function simulatePointerSwipeOnCard() {
    console.log("Attempting Method 2: Simulate Pointer Swipe on Card");
    const cardSelectors = [
        '.encounters-story__card', // Primary card selector
        '.encounters-card__main',
        '.encounters-story__content',
        '[data-qa-role="encounters-story"]',
    ];

    let cardElement = null;
    for (const selector of cardSelectors) {
        const element = document.querySelector(selector);
        if (element && element.offsetParent !== null) {
            const rect = element.getBoundingClientRect();
            if (rect.width > 100 && rect.height > 100) { // Ensure it's a reasonably sized card
                 cardElement = element;
                 console.log("Found swipeable card element:", cardElement, "with selector:", selector);
                 break;
            }
        }
    }

    if (!cardElement) {
        console.log("Method 2 Failed: No suitable card element found for pointer swipe.");
        return false;
    }

    const rect = cardElement.getBoundingClientRect();
    const startX = rect.left + rect.width * 0.5; // Start in the middle
    const startY = rect.top + rect.height * 0.5;
    const endX = rect.left + rect.width * 0.9;   // Swipe to the right edge
    const endY = startY;                         // Horizontal swipe

    const pointerDownOptions = { pointerId: 1, bubbles: true, cancelable: true, view: window, clientX: startX, clientY: startY, pointerType: "mouse", isPrimary: true };
    cardElement.dispatchEvent(new PointerEvent('pointerdown', pointerDownOptions));
    console.log("Dispatched pointerdown at", startX, startY);

    await randomDelay(0.05, 0.1); // Small pause

    const steps = 5;
    for (let i = 1; i <= steps; i++) {
        const moveX = startX + (endX - startX) * (i / steps);
        const pointerMoveOptions = { pointerId: 1, bubbles: true, cancelable: true, view: window, clientX: moveX, clientY: endY, pointerType: "mouse", isPrimary: true };
        cardElement.dispatchEvent(new PointerEvent('pointermove', pointerMoveOptions));
        console.log("Dispatched pointermove at", moveX, endY);
        await randomDelay(0.01, 0.03);
    }
    
    await randomDelay(0.05, 0.1); // Small pause

    const pointerUpOptions = { pointerId: 1, bubbles: true, cancelable: true, view: window, clientX: endX, clientY: endY, pointerType: "mouse", isPrimary: true };
    cardElement.dispatchEvent(new PointerEvent('pointerup', pointerUpOptions));
    console.log("Dispatched pointerup at", endX, endY);
    
    console.log("Method 2: Pointer swipe simulation completed.");
    return true;
}

// Method 3: Keyboard ArrowRight (Focus and Dispatch)
async function useKeyboardToSwipe() {
    console.log("Attempting Method 3: Keyboard ArrowRight Swipe");
    // Try to focus a relevant element first
    const focusableElements = [
        document.querySelector('.encounters-story__card'),
        document.querySelector('[data-qa-role="encounters-story"]'),
        document.body // Fallback to body
    ];

    let focused = false;
    for (const el of focusableElements) {
        if (el && typeof el.focus === 'function') {
            try {
                el.focus({ preventScroll: true }); // preventScroll is a good hint for some browsers
                console.log("Focused element for keyboard swipe:", el);
                focused = true;
                break;
            } catch (e) {
                console.warn("Could not focus element:", el, e);
            }
        }
    }
    if (!focused) {
         console.warn("Could not focus any element for keyboard swipe, events will be dispatched on document.");
    }
    
    const target = focused ? document.activeElement : document; // Dispatch on focused element or document

    try {
        console.log("Dispatching ArrowRight keydown on:", target);
        target.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, which: 39, bubbles: true, cancelable: true, composed: true, view: window }));
        await randomDelay(0.05, 0.1);
        console.log("Dispatching ArrowRight keyup on:", target);
        target.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, which: 39, bubbles: true, cancelable: true, composed: true, view: window }));
        console.log("Method 3: Keyboard ArrowRight dispatched.");
        return true; // Assume success for keyboard, difficult to verify directly
    } catch (e) {
        console.error("Method 3 Failed: Error dispatching keyboard events:", e);
        return false;
    }
}

async function dismissPopups() {
    console.log("Checking for popups to dismiss (with humanClick)...");
    const buttonTexts = [
        /continue bumbling/i, /continue swiping/i, /got it/i, /close/i,
        /not now/i, /maybe later/i, /no thanks/i, /dismiss/i, /accept/i, /allow/i, /yes/i
    ];
    let dismissedSomething = false;
    const potentialButtons = Array.from(document.querySelectorAll('button, div[role="button"]'));

    for (const btn of potentialButtons) {
        const textContent = (btn.innerText || btn.textContent || btn.getAttribute('aria-label') || '').trim().toLowerCase();
        if (btn.offsetParent !== null && window.getComputedStyle(btn).visibility !== 'hidden' && textContent) {
            for (const regex of buttonTexts) {
                if (regex.test(textContent)) {
                    console.log(`Attempting to dismiss popup with text: "${textContent}"`, btn);
                    const clicked = await humanClick(btn);
                    if (clicked) {
                        dismissedSomething = true;
                        console.log(`Dismissed popup: "${textContent}" via humanClick.`);
                        await randomDelay(0.7, 1.2); 
                        break; 
                    }
                }
            }
        }
    }
    if (!dismissedSomething) console.log("No popups found to dismiss.");
}

async function swipeRight() {
    console.log("--- Initiating New Swipe Right Attempt (Button Click ONLY) ---");
    let success = false;

    success = await findAndClickLikeButton();

    // Temporarily disable other methods for focused debugging
    // if (!success) {
    //     console.log("Button click failed or not applicable, trying pointer swipe.");
    //     await randomDelay(0.2, 0.5); // Pause before next method
    //     success = await simulatePointerSwipeOnCard();
    // }

    // if (!success) {
    //     console.log("Pointer swipe failed or not applicable, trying keyboard.");
    //     await randomDelay(0.2, 0.5); // Pause before next method
    //     success = await useKeyboardToSwipe(); // Keyboard is harder to confirm, so it's last
    // }
    
    if (success) {
        console.log("The button click swipe method reported SUCCESS.");
    } else {
        console.warn("The button click swipe method FAILED to report explicit success for this attempt.");
    }

    swipeCount++;
    lastSwipeTime = Date.now();
    updateStats();
    console.log(`Swipe attempt ${swipeCount} completed. Reported success: ${success}`);
    return success; 
}

function updateStats() {
    const currentTime = Date.now();
    const totalDuration = startTime ? Math.floor((currentTime - startTime) / 1000) : 0;
    const timeSinceLastSwipe = lastSwipeTime ? Math.floor((currentTime - lastSwipeTime) / 1000) : 0;
    
    try {
        chrome.runtime.sendMessage({
            type: 'updateStats',
            stats: { swipeCount, duration: totalDuration, timeSinceLastSwipe }
        });
    } catch (e) {
        console.warn("Failed to send stats update to popup (popup might be closed):", e);
    }
}

async function startSwiping() {
    if (isSwiping) {
        console.log("Swiping already in progress.");
        return;
    }
    
    isSwiping = true;
    swipeCount = 0;
    startTime = Date.now();
    lastSwipeTime = Date.now(); // Initialize to current time
    
    updateStats(); // Initial stats update
    console.log("Bumble Swiper STARTED.");

    async function swipeCycle() {
        if (!isSwiping) {
            console.log("Swiping stopped during cycle check.");
            return;
        }
        
        try {
            console.log(`--- Starting Swipe Cycle #${swipeCount + 1} ---`);
            await dismissPopups();
            if (!isSwiping) return;

            await randomHumanInteractions();
            if (!isSwiping) return;
            
            await swipeRight();
            
            const nextDelay = Math.random() * 2.5 + 2.0; // 2.0-4.5 seconds
            console.log(`Next swipe in ${nextDelay.toFixed(1)} seconds.`);
            swipingInterval = setTimeout(swipeCycle, nextDelay * 1000);
            
        } catch (err) {
            console.error("Critical error in swipe cycle:", err);
            swipingInterval = setTimeout(swipeCycle, 7000); // Longer delay on critical error
        }
    }
    swipeCycle();
}

function stopSwiping() {
    console.log("Bumble Swiper STOPPED.");
    isSwiping = false;
    if (swipingInterval) {
        clearTimeout(swipingInterval);
        swipingInterval = null;
    }
    // Optionally, send a final stats update or a "stopped" message
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message received in content.js:", request);
    
    if (request.command === "start") {
        if (window.location.hostname.includes("bumble.com")) {
            startSwiping();
            sendResponse({ status: "Swiping started on Bumble" });
        } else {
            sendResponse({ status: "Error: Not on bumble.com. Please navigate to Bumble." });
        }
    } else if (request.command === "stop") {
        stopSwiping();
        sendResponse({ status: "Swiping stopped" });
    } else if (request.command === "getStats") {
        const currentTime = Date.now();
        sendResponse({
            swipeCount,
            duration: startTime ? Math.floor((currentTime - startTime) / 1000) : 0,
            timeSinceLastSwipe: lastSwipeTime ? Math.floor((currentTime - lastSwipeTime) / 1000) : 0
        });
    } else {
        console.warn("Unknown command received:", request.command);
        sendResponse({status: "Unknown command"});
    }
    return true; 
});

// Initial log to confirm script loading
console.log("Bumble Swiper content script (vAdvancedAntiDetection) loaded and ready.");
// A small delay to ensure the page is fully settled before any auto-start (if ever implemented)
randomDelay(1,2).then(() => {
    console.log("Initial page settle delay complete. Awaiting user action to start swiping via popup.");
});

// === INJECTED SCRIPT FOR PAGE CONTEXT ===
function injectScript(fn) {
    const script = document.createElement('script');
    script.textContent = '(' + fn.toString() + ')();';
    (document.head || document.documentElement).appendChild(script);
    script.parentNode.removeChild(script);
}

// This function will be injected and run in the page context
function pageContextHelper() {
    window.bumbleSwipeRight = function() {
        // Try to find and click the like button using internal React props if possible
        let found = false;
        try {
            // Try to find React root and traverse for internal methods (inspired by paid extensions)
            const reactRoot = document.querySelector('[data-qa-role="encounters-story"]');
            if (reactRoot && reactRoot._reactRootContainer) {
                // This is a placeholder: in reality, paid extensions reverse engineer the React fiber tree
                // and call internal methods. Here, we just log for debugging.
                console.log('[Injected] Found React root, but direct method call is not implemented.');
            }
            // Fallback: try to click the like button directly
            const btn = document.querySelector('button[data-qa-role="encounters-action-like"]')
                || document.querySelector('div.encounters-action--like button')
                || document.querySelector('button[aria-label*="Like" i]');
            if (btn && btn.offsetParent !== null && !btn.disabled) {
                btn.click();
                found = true;
                console.log('[Injected] Like button clicked!');
            }
        } catch (e) {
            console.error('[Injected] Error in bumbleSwipeRight:', e);
        }
        return found;
    };
    window.bumbleDismissPopup = function() {
        const buttonTexts = [
            /continue bumbling/i, /continue swiping/i, /got it/i, /close/i,
            /not now/i, /maybe later/i, /no thanks/i, /dismiss/i, /accept/i, /allow/i, /yes/i
        ];
        let dismissed = false;
        const potentialButtons = Array.from(document.querySelectorAll('button, div[role="button"]'));
        for (const btn of potentialButtons) {
            const textContent = (btn.innerText || btn.textContent || btn.getAttribute('aria-label') || '').trim().toLowerCase();
            if (btn.offsetParent !== null && window.getComputedStyle(btn).visibility !== 'hidden' && textContent) {
                for (const regex of buttonTexts) {
                    if (regex.test(textContent)) {
                        btn.click();
                        dismissed = true;
                        console.log('[Injected] Dismissed popup:', textContent);
                        break;
                    }
                }
            }
        }
        return dismissed;
    };
}

// Inject the helper script on load
injectScript(pageContextHelper);

// === MUTATION OBSERVER FOR CARDS AND POPUPS ===
let cardObserver = null;
let popupObserver = null;

function observeCardsAndPopups() {
    // Observe for new cards
    const cardContainer = document.querySelector('[data-qa-role="encounters-story"]') || document.body;
    if (cardContainer && !cardObserver) {
        cardObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    console.log('[Observer] New node(s) added, possible new card or popup.');
                }
            }
        });
        cardObserver.observe(cardContainer, { childList: true, subtree: true });
        console.log('[Observer] Card observer started.');
    }
    // Observe for popups
    if (!popupObserver) {
        popupObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    console.log('[Observer] New node(s) added, possible popup.');
                }
            }
        });
        popupObserver.observe(document.body, { childList: true, subtree: true });
        console.log('[Observer] Popup observer started.');
    }
}

observeCardsAndPopups();

// --- SWIPE METHODS ---
// Method 0: Try injected script first
async function injectedSwipeRight() {
    try {
        if (typeof window.bumbleSwipeRight === 'function') {
            const result = window.bumbleSwipeRight();
            console.log('[Injected] window.bumbleSwipeRight() result:', result);
            return result;
        } else {
            // Try to call in page context via window.postMessage
            window.postMessage({ type: 'BUMBLE_SWIPE_RIGHT' }, '*');
            console.log('[Injected] Sent BUMBLE_SWIPE_RIGHT postMessage.');
            return false;
        }
    } catch (e) {
        console.error('[Injected] Error calling injected swipe:', e);
        return false;
    }
}

// Listen for postMessage in injected context (for fallback)
window.addEventListener('message', function(event) {
    if (event.source !== window) return;
    if (event.data && event.data.type === 'BUMBLE_SWIPE_RIGHT') {
        if (typeof window.bumbleSwipeRight === 'function') {
            window.bumbleSwipeRight();
        }
    }
    if (event.data && event.data.type === 'BUMBLE_DISMISS_POPUP') {
        if (typeof window.bumbleDismissPopup === 'function') {
            window.bumbleDismissPopup();
        }
    }
});

// --- POPUP DISMISSAL ---
async function injectedDismissPopups() {
    try {
        if (typeof window.bumbleDismissPopup === 'function') {
            const result = window.bumbleDismissPopup();
            console.log('[Injected] window.bumbleDismissPopup() result:', result);
            return result;
        } else {
            window.postMessage({ type: 'BUMBLE_DISMISS_POPUP' }, '*');
            console.log('[Injected] Sent BUMBLE_DISMISS_POPUP postMessage.');
            return false;
        }
    } catch (e) {
        console.error('[Injected] Error calling injected popup dismiss:', e);
        return false;
    }
}

// --- MAIN SWIPE LOGIC OVERRIDE ---
async function swipeRight() {
    console.log('--- Initiating New Swipe Right Attempt (Injected Script First) ---');
    let success = false;
    // Try injected script first
    success = await injectedSwipeRight();
    if (!success) {
        console.log('Injected script failed, falling back to content script methods.');
        success = await findAndClickLikeButton();
    }
    swipeCount++;
    lastSwipeTime = Date.now();
    updateStats();
    console.log(`Swipe attempt ${swipeCount} completed. Reported success: ${success}`);
    return success;
}

// --- POPUP DISMISSAL OVERRIDE ---
async function dismissPopups() {
    console.log('Checking for popups to dismiss (Injected Script First)...');
    let dismissed = await injectedDismissPopups();
    if (!dismissed) {
        // Fallback to content script method
        dismissed = false;
        const buttonTexts = [
            /continue bumbling/i, /continue swiping/i, /got it/i, /close/i,
            /not now/i, /maybe later/i, /no thanks/i, /dismiss/i, /accept/i, /allow/i, /yes/i
        ];
        const potentialButtons = Array.from(document.querySelectorAll('button, div[role="button"]'));
        for (const btn of potentialButtons) {
            const textContent = (btn.innerText || btn.textContent || btn.getAttribute('aria-label') || '').trim().toLowerCase();
            if (btn.offsetParent !== null && window.getComputedStyle(btn).visibility !== 'hidden' && textContent) {
                for (const regex of buttonTexts) {
                    if (regex.test(textContent)) {
                        await humanClick(btn);
                        dismissed = true;
                        console.log(`Dismissed popup: "${textContent}" via humanClick.`);
                        await randomDelay(0.7, 1.2);
                        break;
                    }
                }
            }
        }
    }
    if (!dismissed) console.log('No popups found to dismiss.');
}
