(Readme translation using AI.)

## 1. Current Version

### V1.3.3

See preview image at the top.

* Adjusted some glyphs (letters and commonly used symbols) in the Chinese handwritten font `Whiteboard/Virgil.woff2`.
* Fixed a style issue: in the latest version of the note-taking software (V3.1.8), code sections in documents embedded in the whiteboard were not wrapping properly.

The font adjustment is subjective; if you don't prefer the updated version, you can revert to the previous font file.

Regarding code block style, I found no issues in V3.0.3, but it may be impacted by updates, so adaptation is needed.

---

For the current version: **V1.3.3**

If you **do not want auto-save to be enabled by default**, open the widget folder `Whiteboard` -> `index.html` in an editor like VS Code and search for:

```js
window._autoSave = true;
```

Then change it to:

```js
window._autoSave = false;
```

To **adjust the auto-save delay time** (default is 2000ms), open `Whiteboard` -> `assets` -> `index-c894b550.js` in the widget folder and search for:

```js
window._isDarwin?document.dispatchEvent(new KeyboardEvent("keydown",{key:"S",metaKey:!0,bubbles:!1})):document.dispatchEvent(new KeyboardEvent("keydown",{key:"S",ctrlKey:!0,bubbles:!1}))},2000));
```

Change the last value `2000` to your preferred time (in milliseconds).

---

## 2. Overview

A widget based on [Excalidraw](https://github.com/excalidraw/excalidraw) that, once embedded, fills the document space, treating a document as a whiteboard. It includes minor features like block hover preview, keyword search and location, and element jumping within the board.

You can embed a whiteboard by referencing the document. To export and share a whiteboard, use the export/import `SiYuan .sy.zip` function. Each whiteboard binds to a file stored in `assets/ExcalidrawFiles/`, which can be deleted manually as an unreferenced resource if the document is removed.

## 3. Pre-Usage Setup

### 1. Add CSS Snippet

When creating a whiteboard, the widget sets the document's `Alias` property to `whiteboard` to avoid flashing document titles upon opening. You'll need to add a corresponding CSS snippet in `Settings` -> `Appearance`:

```css
/* Whiteboard Widget – Hide title, breadcrumb */
.protyle-title.protyle-wysiwyg--attr:has(+ .protyle-wysiwyg.protyle-wysiwyg--attr[alias="whiteboard"]){
   display: none !important;
}

.protyle-breadcrumb:has(+ .protyle-content.protyle-content--transition > .protyle-wysiwyg.protyle-wysiwyg--attr[alias="whiteboard"]) {
   display: none !important;
}

/* For newer versions, e.g., SiYuan V3.0.16, add the following snippet */
.protyle-top:has(+ .protyle-wysiwyg.protyle-wysiwyg--attr[alias="whiteboard"]){
   display: none !important;
}
```

For better visuals, remove the default border and handle the dragging line as follows:

```css
/* Widget – Remove Border */
.b3-typography iframe, .protyle-wysiwyg iframe {
    border: none;   
}
/* Fix issue with document tree drag line on the right side in the whiteboard */
.layout__resize--lr {
    z-index: 3;
}
/* Hide possible blank line when embedding a whiteboard in other documents */
.protyle-wysiwyg__embed > .iframe[custom-data-assets^="assets/ExcalidrawFiles/"] + .p{
     display:none;
}
/* Fix input cursor flicker when filling the document */
.iframe ,iframe{
    -webkit-user-modify: read-only;
}
```

Another optional style adjustment controls the floating window size if you feel the default window width is too wide:

```css
/* Floating Window */
.block__popover {
    width: 735px;
    border: 1px solid #94949482;
    min-height: 70vh;
    max-height: 75vh !important;
}
```

### 2. Add JavaScript Snippet

You can quickly embed documents/blocks into the whiteboard via drag-and-drop.

Add a JavaScript snippet in `Settings` -> `Appearance` to aid in obtaining the current dragged block ID. See the update notes at the bottom under `V1.1.0` for details.

```js
document.addEventListener("dragstart", (event) => {
    if (event.target.tagName === "SPAN" && event.target.parentElement.getAttribute('data-node-id')) {
        window._currentBlockID = event.target.parentElement.getAttribute('data-node-id');    
    } else if (event.target.tagName === "LI" && event.target.getAttribute("data-node-id")) {
        window._currentBlockID = event.target.getAttribute("data-node-id");  
    } else {
        window._currentBlockID = null;
    }
});
```

### 3. Install the "Open API" Plugin

* This plugin enables hover previews of note blocks/documents in the whiteboard.
* Go to `Settings` -> `Market` -> `Plugins` to download and enable the `Open API` plugin.

‍  

## 4. Getting Started

### 1. Inserting a Whiteboard

After downloading the widget, set up a document title in a new blank document, then type `/g` and press Enter. Select `Whiteboard` from the widget list to insert a whiteboard into the document, which fills the entire document by default.

### 2. Data Saving

Click the `Save` button in the top left corner or use the shortcut `Ctrl + S` to save the whiteboard data. A "Saved" message will pop up in the top left corner.

Whiteboard data is saved in the `assets/ExcalidrawFiles/` folder, with file paths resembling:

```css
assets/ExcalidrawFiles/20231227015401-w0olmpi.excalidraw
```

The widget uses the block ID as the filename.

* `Auto-save` is enabled by default, typically saving approximately 2 seconds after adding, deleting, or moving elements. To turn off auto-save by default or adjust the delay time, see the instructions at the top of this document.
* For temporarily toggling auto-save, use `Alt+F` (versions after V1.0.8 use this shortcut; earlier versions used `Alt+S`). A message will appear in the top left corner.

**Remember to click save after editing; otherwise, changes will be lost.** Personally, I press Ctrl+S often, so I haven't lost any data yet.

### 3. Floating Preview of Block Hyperlinks

* To insert a link in the whiteboard, copy a link address (external or a `block hyperlink` of a block/document), click an element on the whiteboard, then press `Ctrl + K` to bring up the link input field, paste the link, and press Enter.
* To enable hovering previews for block hyperlinks, press `Alt + Q` to enable preview mode and `Alt + W` to disable it. When enabled, hovering over a link icon displays a preview window of the block content, which can be closed by pressing `ESC` (click inside the preview if it doesn’t work) or by clicking `X` in the top right corner.

### 4. Keyword Search and Navigation

* Use the search box to locate text on the whiteboard, supporting multiple keywords (separated by spaces). Reset the whiteboard zoom to 100% for precise positioning, which can be set in the bottom left corner.
* Before searching, ensure content is saved, as searches pull from the saved whiteboard file.
* Press `Alt + T` to open/close the search box after clicking on a blank spot on the whiteboard. Clicking on the whiteboard closes the search box as well.
* The search box focuses automatically; type keywords (separated by spaces), and matching results display in about 0.5s.
* Use the up and down arrow keys to navigate matching results or click a result directly for navigation.

### 5. Jumping Between Elements Within the Whiteboard

* For example, to jump from element A to element B (with the board zoomed to 100%):
* Select element B, press `Ctrl + C` to copy it, then select element A, hold `Ctrl` and press `J`, `K`, and `V` in sequence, then press Enter to generate a link.

---

## 5. Other Optional Configurations

### 1. Adjust Brush Thickness Manually

For V1.3.3, open `Whiteboard` -> `assets` -> `index-c894b550.js` and search for:

```css
simulatePressure:e.simulatePressure,size:e.strokeWidth*1.2,thinning
```

1.2 is the current value (already reduced). The initial default was over 4; adjust this value as desired.

### 2. Set Fixed Port (Windows)

If you use the `asset library` frequently, set a fixed port for note startup. Right-click the desktop icon, choose `Properties` -> `Shortcut` -> `Target`, and append `--port=6806` at the