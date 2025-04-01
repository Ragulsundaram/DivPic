document.getElementById('captureBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  const status = document.getElementById('status');
  status.textContent = 'Select an element on the page...';
  
  // Close the popup
  window.close();
  
  chrome.tabs.sendMessage(tab.id, { action: 'startSelection' });
});

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'screenshotTaken') {
    const status = document.getElementById('status');
    status.textContent = 'Screenshot saved!';
    setTimeout(() => {
      status.textContent = '';
    }, 2000);
  } else if (message.action === 'reopenPopup') {
    // Reopen the popup
    chrome.action.openPopup();
  }
});