let swipingInterval = null;
let isSwiping = false;

// --- Helper Functions (Replicating Python Logic) ---

// Function to generate random delay
function randomDelay(minSeconds, maxSeconds) {
    return new Promise(resolve => setTimeout(resolve, (Math.random() * (maxSeconds - minSeconds) + minSeconds) * 1000));
}

// Function to simulate random human-like interactions (Updated)
async function randomHumanInteractions() {
    // Define actions possible within content script limitations
    const actions = [
        // Simulate scrolling
        () => { console.log("Interaction: Scroll Down"); window.scrollBy(0, Math.random() * 150 + 50); }, // Scroll down a bit
        () => { console.log("Interaction: Scroll Up"); window.scrollBy(0, -(Math.random() * 150 + 50)); }, // Scroll up a bit
        // Simulate Arrow Keys (non-navigation)
        () => {
            console.log("Interaction: ArrowDown Key");
            // Use keydown/keyup for more realistic simulation
            document.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'ArrowDown', 'keyCode': 40, 'which': 40, 'bubbles': true, 'cancelable': true }));
            setTimeout(() => { // Add small delay before keyup
               document.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'ArrowDown', 'keyCode': 40, 'which': 40, 'bubbles': true, 'cancelable': true }));
            }, Math.random() * 50 + 50); // 50-100ms delay
        },
        () => {
            console.log("Interaction: ArrowUp Key");
            document.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'ArrowUp', 'keyCode': 38, 'which': 38, 'bubbles': true, 'cancelable': true }));
             setTimeout(() => {
                 document.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'ArrowUp', 'keyCode': 38, 'which': 38, 'bubbles': true, 'cancelable': true }));
            }, Math.random() * 50 + 50); // 50-100ms delay
        }
        // Direct mouse move/click simulation is not reliably possible here
    ];

    // Mimic random.randint(2, 5) -> 2, 3, 4, or 5 actions
    const numActions = Math.floor(Math.random() * 4) + 2;
    console.log(`Performing ${numActions} random actions`);

    for (let i = 0; i < numActions; i++) {
        if (!isSwiping) return; // Stop if swiping is cancelled

        // Choose and perform a random action
        const action = actions[Math.floor(Math.random() * actions.length)];
        action();

        // Mimic random.uniform(2.5, 6.5) delay AFTER action
        const delay = Math.random() * 4.0 + 2.5; // Random float between 2.5 and 6.5
        console.log(`Delay after action: ${delay.toFixed(2)} seconds`);
        // Use await with randomDelay helper function
        await randomDelay(delay, delay + 0.1); // Add slight variance to delay
    }
}


// Function to simulate the 'Like' action (ArrowRight key press)
async function swipeRight() {
    console.log("Simulating ArrowRight key press");
    // Dispatching a KeyboardEvent is more reliable than trying to find and click the button
    document.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'ArrowRight', 'keyCode': 39, 'which': 39, 'bubbles': true, 'cancelable': true }));
    await randomDelay(0.05, 0.1); // Short delay after keydown
    document.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'ArrowRight', 'keyCode': 39, 'which': 39, 'bubbles': true, 'cancelable': true }));
}

// --- Main Swiping Logic ---
async function startSwiping() {
    if (isSwiping) {
        console.log("Swiping already in progress.");
        return;
    }
    isSwiping = true;
    console.log("Starting Bumble Swiper...");

    // Clear any existing interval before starting a new one
    if (swipingInterval) {
        clearInterval(swipingInterval);
    }

    // Use a variable for the interval duration, mirroring the 2-5 second swipe delay
    let intervalDelay = (Math.random() * 3 + 2) * 1000; // Initial 2-5 seconds delay

    async function swipeCycle() {
        if (!isSwiping) {
            clearInterval(swipingInterval);
            swipingInterval = null;
            console.log("Swiping stopped.");
            return;
        }

        // Removed popup check here

        console.log("Performing random human interactions...");
        await randomHumanInteractions();

        if (!isSwiping) return; // Check again if stopped during interactions

        console.log("Attempting to swipe right...");
        await swipeRight();

        // Calculate the *next* delay (2-5 seconds) before the next cycle
        const nextSwipeDelay = Math.random() * 3 + 2; // 2-5 seconds
        console.log(`Waiting ${nextSwipeDelay.toFixed(2)} seconds for next swipe...`);

        // Clear previous timeout if exists and set the next one
        if (swipingInterval) clearTimeout(swipingInterval); // Use timeout instead of interval for variable delays
        swipingInterval = setTimeout(swipeCycle, nextSwipeDelay * 1000);
    }

    // Start the first cycle immediately or after a short initial delay
    // Using setTimeout instead of setInterval allows for variable delays between swipes
    console.log("Starting first swipe cycle.");
    swipingInterval = setTimeout(swipeCycle, intervalDelay); // Start after initial delay
}

function stopSwiping() {
    if (!isSwiping) {
        console.log("Swiping is not active.");
        return;
    }
    isSwiping = false;
    console.log("Stopping Bumble Swiper...");
    // Use clearTimeout because we switched from setInterval to setTimeout
    if (swipingInterval) {
        clearTimeout(swipingInterval);
        swipingInterval = null;
    }
}

// --- Message Listener (from popup or background) ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message received in content script:", request);
    if (request.command === "start") {
        if (window.location.hostname.includes("bumble.com")) {
            startSwiping();
            sendResponse({ status: "Swiping started on Bumble" });
        } else {
            sendResponse({ status: "Not on bumble.com" });
        }
    } else if (request.command === "stop") {
        stopSwiping();
        sendResponse({ status: "Swiping stopped" });
    }
    return true; // Indicates intent to send a response asynchronously
});

console.log("Bumble Swiper content script loaded.");
