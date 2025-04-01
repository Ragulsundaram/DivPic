let isSelecting = false;
let highlightElement = null;

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
      }
    });
  }
});

// Add new message listener for cropping
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'cropScreenshot') {
    const img = new Image();
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
        dataUrl: croppedDataUrl
      });
    };
    img.src = message.screenshot;
  }
});