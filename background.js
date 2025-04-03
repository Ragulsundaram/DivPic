// Helper functions
async function sendMessageToTab(tabId, message) {
  try {
    await chrome.tabs.sendMessage(tabId, message);
  } catch (error) {
    if (error.message.includes('Receiving end does not exist')) {
      showRefreshNotification(tabId);
      console.log('Page needs refresh:', error.message);
    } else {
      console.error('Error sending message:', error);
    }
  }
}

function showRefreshNotification(tabId) {
  chrome.notifications.create(`refresh-${Date.now()}`, {
    type: 'basic',
    title: 'Extension Updated',
    message: 'Please refresh the page to use the updated extension.',
    iconUrl: 'images/icon128.png',
    priority: 2,
    requireInteraction: false
  });
}

// Main message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  if (message.action === 'captureElement') {
    // Handle asynchronous operation
    chrome.tabs.captureVisibleTab(null, {
      format: 'png'
    }).then(async dataUrl => {
      console.log('Screenshot captured, sending to content script');
      try {
        await sendMessageToTab(sender.tab.id, {
          action: 'cropScreenshot',
          screenshot: dataUrl,
          area: message.area,
          saveOption: message.saveOption
        });
        sendResponse({ success: true });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    }).catch(error => {
      console.error('Error capturing tab:', error);
      sendResponse({ success: false, error: error.message });
    });

    // Return true to indicate async response
    return true;
  } 
  
  else if (message.action === 'downloadScreenshot') {
    // Handle download operation asynchronously
    if (message.saveOption === 'clipboard') {
      sendMessageToTab(sender.tab.id, {
        action: 'copyToClipboard',
        dataUrl: message.dataUrl
      }).then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
    } else {
      const filename = `screenshot-${Date.now()}.png`;
      chrome.downloads.download({
        url: message.dataUrl,
        filename: filename
      }).then(downloadId => {
        chrome.notifications.create(`screenshot-${downloadId}`, {
          type: 'basic',
          title: 'Screenshot Saved',
          message: `${filename} has been downloaded`,
          iconUrl: 'images/icon128.png',
          priority: 2,
          requireInteraction: false,
          silent: true
        });
        return sendMessageToTab(sender.tab.id, { 
          action: 'screenshotTaken', 
          saveOption: 'download' 
        });
      }).then(() => sendResponse({ success: true }))
        .catch(error => {
          console.error('Error in download process:', error);
          sendResponse({ success: false, error: error.message });
        });
    }
    
    // Return true to indicate async response
    return true;
  }

  // For synchronous messages or when no response is needed
  return false;
});

// Command listener
chrome.commands.onCommand.addListener((command) => {
  if (command === 'start-selection') {
    chrome.tabs.query({ active: true, currentWindow: true })
      .then(([tab]) => {
        return chrome.storage.local.get('saveOption')
          .then(({ saveOption = 'download' }) => {
            console.log('Using saved preference:', saveOption);
            return sendMessageToTab(tab.id, { 
              action: 'startSelection',
              saveOption: saveOption 
            });
          });
      })
      .catch(error => {
        console.error('Error in command listener:', error);
      });
  }
});

// Connection error handler
chrome.runtime.onConnect.addListener((port) => {
  port.onDisconnect.addListener(() => {
    if (chrome.runtime.lastError) {
      console.log('Port disconnected due to error:', chrome.runtime.lastError);
    }
  });
});

// Button click listener
chrome.notifications.onButtonClicked.addListener((notificationId) => {
  if (notificationId.startsWith('screenshot-')) {
    chrome.downloads.showDefaultFolder();
  }
});