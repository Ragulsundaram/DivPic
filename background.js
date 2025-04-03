chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  if (message.action === 'captureElement') {
    chrome.tabs.captureVisibleTab(null, {
      format: 'png'
    }).then(dataUrl => {
      console.log('Screenshot captured, sending to content script');
      // Wrap the sendMessage in a try-catch to handle disconnected ports
      try {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'cropScreenshot',
          screenshot: dataUrl,
          area: message.area,
          saveOption: message.saveOption
        }).catch(error => {
          // Handle connection error
          if (error.message.includes('Receiving end does not exist')) {
            showRefreshNotification(sender.tab.id);
          }
        });
      } catch (error) {
        console.error('Error sending message:', error);
        showRefreshNotification(sender.tab.id);
      }
    });
  } else if (message.action === 'downloadScreenshot') {
    console.log('Processing screenshot with option:', message.saveOption);

    if (message.saveOption === 'clipboard') {
      console.log('Attempting to copy to clipboard');
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
  } else if (message.action === 'clipboardSuccess') {
    // Add notification for clipboard success
    chrome.notifications.create(`clipboard-${Date.now()}`, {
      type: 'basic',
      title: 'Screenshot Copied',
      message: 'Screenshot has been copied to clipboard',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      priority: 2,
      requireInteraction: false,
      silent: true
    });
  }
  
  // Return false as we're not using sendResponse
  return false;
});

// Add function to show refresh notification
function showRefreshNotification(tabId) {
  chrome.notifications.create(`refresh-${Date.now()}`, {
    type: 'basic',
    title: 'Extension Updated',
    message: 'Please refresh the page to use the updated extension.',
    iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    priority: 2,
    requireInteraction: false // Changed to false
  });
}

// Update the command listener to handle connection errors
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'start-selection') {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const { saveOption = 'download' } = await chrome.storage.local.get('saveOption');
      console.log('Using saved preference:', saveOption);
      
      await chrome.tabs.sendMessage(tab.id, { 
        action: 'startSelection',
        saveOption: saveOption 
      }).catch(error => {
        if (error.message.includes('Receiving end does not exist')) {
          showRefreshNotification(tab.id);
        }
      });
    } catch (error) {
      console.error('Error in command listener:', error);
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      showRefreshNotification(tab.id);
    }
  }
});

// Add a connection error handler
chrome.runtime.onConnect.addListener((port) => {
  port.onDisconnect.addListener(() => {
    if (chrome.runtime.lastError) {
      console.log('Port disconnected due to error:', chrome.runtime.lastError);
    }
  });
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