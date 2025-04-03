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
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const saveOption = document.querySelector('input[name="saveOption"]:checked').value;
  
  const status = document.getElementById('status');
  status.textContent = 'Select an element on the page...';
  
  // Close the popup
  window.close();
  
  chrome.tabs.sendMessage(tab.id, { 
    action: 'startSelection',
    saveOption: saveOption 
  });
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