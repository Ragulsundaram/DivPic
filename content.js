let isSelecting = false;
let highlightElement = null;  // Keep this consistent throughout the file

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'startSelection') {
    isSelecting = true;
    document.body.style.cursor = 'crosshair';
    
    if (!highlightElement) {
      highlightElement = document.createElement('div');
      highlightElement.style.position = 'fixed';
      highlightElement.style.border = '2px solid #2563eb';
      highlightElement.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
      highlightElement.style.pointerEvents = 'none';
      highlightElement.style.zIndex = '10000';
      document.body.appendChild(highlightElement);
    }
  } else if (message.action === 'screenshotTaken') {
    isSelecting = false;
    if (highlightElement) {
      highlightElement.style.display = 'none';
    }
  }
});

document.addEventListener('mousemove', (e) => {
  if (!isSelecting) return;
  
  const element = document.elementFromPoint(e.clientX, e.clientY);
  if (element) {
    const rect = element.getBoundingClientRect();
    highlightElement.style.top = `${rect.top + window.scrollY}px`;
    highlightElement.style.left = `${rect.left + window.scrollX}px`;
    highlightElement.style.width = `${rect.width}px`;
    highlightElement.style.height = `${rect.height}px`;
    highlightElement.style.display = 'block';
  }
});

document.addEventListener('click', async (e) => {
  if (!isSelecting) return;
  
  e.preventDefault();
  isSelecting = false;
  document.body.style.cursor = 'default';
  highlightElement.style.display = 'none';
  
  const element = document.elementFromPoint(e.clientX, e.clientY);
  if (element) {
    const rect = element.getBoundingClientRect();
    chrome.runtime.sendMessage({
      action: 'captureElement',
      area: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        scale: window.devicePixelRatio
      },
      saveOption: window.screenshotSaveOption // Add this line
    });
  }
});

// Add message listener for saveOption
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'startSelection') {
    window.screenshotSaveOption = message.saveOption;
    isSelecting = true;
    document.body.style.cursor = 'crosshair';
    
    if (!highlightElement) {
      highlightElement = document.createElement('div');
      highlightElement.style.position = 'fixed';
      highlightElement.style.border = '2px solid #2563eb';
      highlightElement.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
      highlightElement.style.pointerEvents = 'none';
      highlightElement.style.zIndex = '10000';
      document.body.appendChild(highlightElement);
    }
  } else if (message.action === 'screenshotTaken') {
    isSelecting = false;
    if (highlightElement) {
      highlightElement.style.display = 'none';
    }
  }
});

// Add new message listener for cropping
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'cropScreenshot') {
    const img = new Image();
    img.src = message.screenshot;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio;
      
      canvas.width = message.area.width * dpr;
      canvas.height = message.area.height * dpr;
      
      ctx.drawImage(img,
        message.area.x * dpr,
        message.area.y * dpr,
        message.area.width * dpr,
        message.area.height * dpr,
        0, 0,
        message.area.width * dpr,
        message.area.height * dpr
      );
      
      const croppedDataUrl = canvas.toDataURL('image/png');
      chrome.runtime.sendMessage({
        action: 'downloadScreenshot',
        dataUrl: croppedDataUrl,
        saveOption: message.saveOption  // Add this line to pass the saveOption
      });
    };
    img.src = message.screenshot;
  }
});

// Update the screenshotTaken handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'screenshotTaken') {
    isSelecting = false;
    if (highlightOverlay) {
      highlightOverlay.style.display = 'none';
    }
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'copyToClipboard') {
    // Create a temporary canvas to handle the clipboard copy
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      try {
        // Convert canvas to blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        // Create clipboard item and write to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        console.log('Successfully copied to clipboard');
        chrome.runtime.sendMessage({ 
          action: 'screenshotTaken', 
          saveOption: 'clipboard' 
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    };
    img.src = message.dataUrl;
  }
});