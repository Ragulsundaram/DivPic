# Chrome Web Store Listing Details

## Single Purpose Description
DivPic is designed specifically for capturing screenshots of individual HTML elements on webpages. Users can select any element and save or copy its screenshot, making it perfect for developers, designers, and content creators who need to capture specific parts of web pages.

## Permission Justifications

### activeTab
Required to capture the current webpage's content and allow element selection. This permission is only active when the user explicitly interacts with the extension.

### clipboardWrite
Needed to support the "Copy to Clipboard" feature, allowing users to directly copy screenshots to their clipboard instead of downloading them.

### downloads
Required to save screenshots as PNG files to the user's downloads folder when using the "Save to Downloads" option.

### Host Permissions (<all_urls>)
Needed to allow the extension to function on any webpage where the user wants to capture element screenshots. The extension only activates when explicitly triggered by the user.

### notifications
Used to provide feedback to users about successful screenshot captures and downloads, enhancing the user experience with clear status updates.

### storage
Required to save user preferences (like the default save option - download or clipboard) between sessions.

## Remote Code Usage
The extension does not execute or load any remote code. All functionality is contained within the extension package and runs locally.

## Data Collection & Privacy
- No user data is collected or transmitted
- Screenshots are processed entirely locally
- No analytics or tracking mechanisms   
- No external servers or APIs are used
- All operations are performed client-side

## Screenshots
Required screenshots for store listing:
1. Main popup interface showing save options
2. Element selection in action (highlighting)
3. Successful screenshot notification
4. Settings and preferences

## Promotional Images
1. Small tile (440x280)
2. Large tile (920x680)
3. Marquee (1400x560)