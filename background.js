chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  if (message.action === 'captureElement') {
    chrome.tabs.captureVisibleTab(null, {
      format: 'png'
    }).then(dataUrl => {
      console.log('Screenshot captured, sending to content script');
      chrome.tabs.sendMessage(sender.tab.id, {
        action: 'cropScreenshot',
        screenshot: dataUrl,
        area: message.area,
        saveOption: message.saveOption
      });
    });
  } else if (message.action === 'downloadScreenshot') {
    console.log('Processing screenshot with option:', message.saveOption);

    if (message.saveOption === 'clipboard') {
      console.log('Attempting to copy to clipboard');
      // Send the data back to content script to handle clipboard operations
      chrome.tabs.sendMessage(sender.tab.id, {
        action: 'copyToClipboard',
        dataUrl: message.dataUrl
      });
    } else {
      // Original download logic
      console.log('Downloading screenshot');
      const filename = `screenshot-${Date.now()}.png`;
      chrome.downloads.download({
        url: message.dataUrl,
        filename: filename
      }).then(async (downloadId) => {
        try {
          await chrome.notifications.create(`screenshot-${downloadId}`, {
            type: 'basic',
            title: 'Screenshot Saved',
            message: `${filename} has been downloaded`,
            iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            priority: 2,
            requireInteraction: false,
            silent: true
          });
          await chrome.tabs.sendMessage(sender.tab.id, { action: 'screenshotTaken', saveOption: 'download' });
        } catch (error) {
          console.error('Error in download process:', error);
        }
      });
    }
  }
});

// Remove the button click listener since we removed the buttons
chrome.notifications.onButtonClicked.addListener((notificationId) => {
  if (notificationId.startsWith('screenshot-')) {
    chrome.downloads.showDefaultFolder();
  }
});

// Add this at the end of the file
// Update the command listener
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'start-selection') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    // Get the saved preference
    const { saveOption = 'download' } = await chrome.storage.local.get('saveOption');
    console.log('Using saved preference:', saveOption);
    chrome.tabs.sendMessage(tab.id, { 
      action: 'startSelection',
      saveOption: saveOption 
    });
  }
});