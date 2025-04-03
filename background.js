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
    }).then(async (downloadId) => {
      try {
        // First show the notification
        await chrome.notifications.create(`screenshot-${downloadId}`, {
          type: 'basic',
          title: 'Screenshot Saved',
          message: `${filename} has been downloaded`,
          iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          priority: 2,
          requireInteraction: false,
          silent: true
        });

        // Then send message to content script
        await chrome.tabs.sendMessage(sender.tab.id, { action: 'screenshotTaken' });

        // Finally reopen the popup
        await chrome.action.openPopup();
      } catch (error) {
        console.error('Error in download process:', error);
      }
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

// Add this at the end of the file
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'start-selection') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'startSelection' });
  }
});