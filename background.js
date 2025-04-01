chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'captureElement') {
    chrome.tabs.captureVisibleTab(null, {
      format: 'png'
    }).then(dataUrl => {
      chrome.tabs.sendMessage(sender.tab.id, {
        action: 'cropScreenshot',
        screenshot: dataUrl,
        area: message.area
      });
    });
  } else if (message.action === 'downloadScreenshot') {
    const filename = `screenshot-${Date.now()}.png`;
    chrome.downloads.download({
      url: message.dataUrl,
      filename: filename
    }).then((downloadId) => {
      // Use a simple text-based notification
      chrome.notifications.create(`screenshot-${downloadId}`, {
        type: 'basic',
        title: 'Screenshot Saved',
        message: `${filename} has been downloaded to your Downloads folder`,
        iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // 1x1 transparent PNG
        priority: 2,
        requireInteraction: false,
        silent: true
      });

      chrome.tabs.sendMessage(sender.tab.id, { action: 'screenshotTaken' });
    }).catch(error => {
      console.error('Download failed:', error);
    });
  }
});

// Remove the button click listener since we removed the buttons
chrome.notifications.onButtonClicked.addListener((notificationId) => {
  if (notificationId.startsWith('screenshot-')) {
    chrome.downloads.showDefaultFolder();
  }
});