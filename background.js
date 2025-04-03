// Helper functions
function showNotification(type, downloadId = '') {
  const notifications = {
    refresh: {
      title: 'Extension Updated',
      message: 'Please refresh the page to use the updated extension.'
    },
    download: {
      title: 'Screenshot Saved',
      message: `Screenshot has been downloaded`
    },
    clipboard: {
      title: 'Screenshot Copied',
      message: 'Screenshot has been copied to clipboard'
    }
  };

  const notifId = `${type}-${downloadId || Date.now()}`;
  try {
    chrome.notifications.create(notifId, {
      type: 'basic',
      iconUrl: 'images/icon128.png',
      title: notifications[type].title,
      message: notifications[type].message,
      priority: 2,
      requireInteraction: false,
      silent: false
    });
  } catch (error) {
    console.error('Notification creation failed:', error);
  }
}

async function sendMessageToTab(tabId, message) {
  try {
    await chrome.tabs.sendMessage(tabId, message);
  } catch (error) {
    if (error.message.includes('Receiving end does not exist')) {
      showNotification('refresh');
      console.log('Page needs refresh:', error.message);
    } else {
      console.error('Error sending message:', error);
    }
  }
}

// Main message listener
chrome.runtime.onMessage.addListener((message, sender) => {
  console.log('Background received message:', message);

  if (message.action === 'captureElement') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' })
      .then(dataUrl => {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'cropScreenshot',
          screenshot: dataUrl,
          area: message.area,
          saveOption: message.saveOption
        });
      })
      .catch(error => {
        console.error('Error capturing tab:', error);
        showNotification('refresh');
      });
    return false;
  } 
  
  else if (message.action === 'downloadScreenshot') {
    if (message.saveOption === 'clipboard') {
      chrome.tabs.sendMessage(sender.tab.id, {
        action: 'copyToClipboard',
        dataUrl: message.dataUrl
      });
    } else {
      const filename = `screenshot-${Date.now()}.png`;
      chrome.downloads.download({
        url: message.dataUrl,
        filename: filename
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error('Download error:', chrome.runtime.lastError);
          return;
        }
        showNotification('download', downloadId);
        chrome.tabs.sendMessage(sender.tab.id, { 
          action: 'screenshotTaken', 
          saveOption: 'download' 
        });
      });
    }
    return false;
  }

  else if (message.action === 'clipboardSuccess') {
    showNotification('clipboard');
    return false;
  }

  return false;
});

// Command listener
chrome.commands.onCommand.addListener((command) => {
  if (command === 'start-selection') {
    chrome.tabs.query({ active: true, currentWindow: true })
      .then(([tab]) => {
        if (!tab) return;
        
        chrome.storage.local.get('saveOption')
          .then(({ saveOption = 'download' }) => {
            chrome.tabs.sendMessage(tab.id, { 
              action: 'startSelection',
              saveOption: saveOption 
            }).catch(error => {
              if (error.message.includes('Receiving end does not exist')) {
                showNotification('refresh');
              }
            });
          });
      });
  }
});

// Keep the connection and button click handlers unchanged...