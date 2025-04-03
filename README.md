# DivPic Chrome Extension

A Chrome extension that allows users to capture screenshots of specific HTML elements on any webpage with ease.

## Features

- Select and capture specific HTML elements
- Instant download of screenshots in PNG format
- Visual highlight of selected elements
- Notification system for download confirmation
- Clean and intuitive user interface

## Installation

1. Clone this repository:
```bash
git clone https://github.com/Ragulsundaram/DivPic.git
```
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Click on "Load unpacked" and select the cloned repository folder.
## Usage
1. Click the extension icon in your Chrome toolbar
2. Click the "Select Element" button
3. Hover over any element on the webpage
4. Click to capture the selected element
5. The screenshot will be automatically downloaded to your default Downloads folder

## Development
### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
### Setup
```
# Install dependencies
npm install

# Build the extension
npm run build

# Watch for changes during development
npm run watch
```
### Project Structure
```
element-screenshot/
├── src/
│   ├── content.js      # Content script for element selection
│   └── popup/          # Vue.js popup components
├── background.js       # Background service worker
├── manifest.json       # Extension manifest
├── popup.html         # Popup HTML
└── styles.css         # Global styles
```
## Contributing
- Fork the repository
- Create your feature branch ( git checkout -b feature/AmazingFeature )
- Commit your changes ( git commit -m 'Add some AmazingFeature' )
- Push to the branch ( git push origin feature/AmazingFeature )
- Open a Pull Request

