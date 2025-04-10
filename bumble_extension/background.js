// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message received in background:", request);
    if (request.command === "start" || request.command === "stop") {
        // Find the active tab that is likely Bumble
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) {
                console.error("No active tab found.");
                sendResponse({ status: "Error: No active tab" });
                return;
            }
            const activeTab = tabs[0];

            // Check if the tab is on Bumble before sending the message
            if (activeTab.url && activeTab.url.includes("bumble.com")) {
                console.log(`Sending command '${request.command}' to tab ID: ${activeTab.id}`);
                chrome.tabs.sendMessage(activeTab.id, { command: request.command }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error sending message to content script:", chrome.runtime.lastError.message);
                        // Check if it's the "Could not establish connection" error, which might mean the content script isn't loaded yet
                        if (chrome.runtime.lastError.message.includes("Receiving end does not exist")) {
                            console.warn("Content script might not be injected or ready yet.");
                            // Optionally, you could try injecting the script programmatically here if needed,
                            // but the manifest should handle injection on bumble.com pages.
                            sendResponse({ status: "Error: Content script not ready. Reload the Bumble page or try again." });
                        } else {
                            sendResponse({ status: `Error: ${chrome.runtime.lastError.message}` });
                        }
                    } else {
                        console.log("Response from content script:", response);
                        sendResponse(response); // Forward the response back to the popup
                    }
                });
            } else {
                console.log("Active tab is not Bumble.");
                sendResponse({ status: "Error: Not on bumble.com" });
            }
        });
        return true; // Indicates that the response will be sent asynchronously
    }
});

console.log("Background service worker started.");