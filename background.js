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
    chrome.downloads.download({
      url: message.dataUrl,
      filename: `screenshot-${Date.now()}.png`
    }).then(() => {
      // After download completes, notify that screenshot is taken
      chrome.tabs.sendMessage(sender.tab.id, { action: 'screenshotTaken' });
      // Show the popup again
      chrome.action.openPopup();
    });
  }
});