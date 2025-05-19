let statsInterval = null;

function updateStatsUI(swipeCount, duration, timeSinceLastSwipe) {
    document.getElementById('swipeCount').textContent = swipeCount;
    document.getElementById('duration').textContent = duration;
    document.getElementById('timeSinceLastSwipe').textContent = timeSinceLastSwipe || 0;
}

document.getElementById('startBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ command: "start" }, (response) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
        } else {
            document.getElementById('startBtn').disabled = true;
            document.getElementById('stopBtn').disabled = false;
            statsInterval = setInterval(() => {
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    if (!tabs || !tabs[0] || !tabs[0].id) return;
                    
                    chrome.tabs.sendMessage(tabs[0].id, {command: "getStats"}, (stats) => {
                        if (chrome.runtime.lastError) {
                            console.error("Error getting stats:", chrome.runtime.lastError);
                            return;
                        }
                        if (stats) {
                            updateStatsUI(
                                stats.swipeCount, 
                                stats.duration, 
                                stats.timeSinceLastSwipe
                            );
                        }
                    });
                });
            }, 1000);
        }
    });
});

document.getElementById('stopBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ command: "stop" }, (response) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
        } else {
            document.getElementById('startBtn').disabled = false;
            document.getElementById('stopBtn').disabled = true;
            clearInterval(statsInterval);
        }
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'updateStats') {
        updateStatsUI(
            message.stats.swipeCount,
            message.stats.duration,
            message.stats.timeSinceLastSwipe
        );
    }
});