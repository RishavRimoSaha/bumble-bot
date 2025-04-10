document.getElementById('startBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ command: "start" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
      // Handle error, maybe show a message to the user
    } else {
      console.log(response.status);
      window.close(); // Close popup after starting
    }
  });
});

document.getElementById('stopBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ command: "stop" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    } else {
      console.log(response.status);
      window.close(); // Close popup after stopping
    }
  });
});