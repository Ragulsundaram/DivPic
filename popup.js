// Add at the beginning of the file
document.addEventListener('DOMContentLoaded', async () => {
  const { saveOption = 'download' } = await chrome.storage.local.get('saveOption');
  document.querySelector(`input[name="saveOption"][value="${saveOption}"]`).checked = true;
});

// Update radio button change handler
document.querySelectorAll('input[name="saveOption"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    chrome.storage.local.set({ saveOption: e.target.value });
  });
});

document.getElementById('captureBtn').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const saveOption = document.querySelector('input[name="saveOption"]:checked').value;
    
    const status = document.getElementById('status');
    status.textContent = 'Select an element on the page...';
    
    // Close the popup
    window.close();
    
    await chrome.tabs.sendMessage(tab.id, { 
      action: 'startSelection',
      saveOption: saveOption 
    }).catch(error => {
      if (error.message.includes('Receiving end does not exist')) {
        // In the catch block of captureBtn click handler
        chrome.notifications.create(`refresh-${Date.now()}`, {
          type: 'basic',
          title: 'Extension Updated',
          message: 'Please refresh the page to use the updated extension.',
          iconUrl: 'images/icon128.png', // Replace base64 icon with actual icon
          priority: 2,
          requireInteraction: false
        });
      }
    });
  } catch (error) {
    console.error('Error in capture button click:', error);
  }
});

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'screenshotTaken') {
    const status = document.getElementById('status');
    status.textContent = message.saveOption === 'clipboard' ? 
      'Screenshot copied to clipboard!' : 
      'Screenshot saved!';
    setTimeout(() => {
      status.textContent = '';
    }, 2000);
  }
});

window.addEventListener('unload', () => {
  // Cleanup listeners
  document.querySelectorAll('input[name="saveOption"]')
    .forEach(radio => radio.removeEventListener('change'));
});