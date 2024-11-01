## 1. Current Version

### V1.3.3

See preview image at the top.

* Adjusted some glyphs (letters and commonly used symbols) in the Chinese handwritten font `Whiteboard/Virgil.woff2`.
* Fixed a style issue: in the latest version of the note-taking software (V3.1.8), code sections in documents embedded in the whiteboard were not wrapping properly.

The font adjustment is subjective; if you don't prefer the updated version, you can revert to the previous font file.

Regarding code block style, I found no issues in V3.0.3, but it may be impacted by updates, so adaptation is needed.

---

For the current version: **V1.3.3**

If you **do not want auto-save to be enabled by default**, open the widget folder `Whiteboard` -> `index.js` in an editor like VS Code and search for:

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
/* Whiteboard widget - Hide the title and breadcrumbs of the current document. */
.protyle-title.protyle-wysiwyg--attr:has(+ .protyle-wysiwyg.protyle-wysiwyg--attr[alias="whiteboard"]){
   display: none !important;
}

.protyle-breadcrumb:has(+ .protyle-content.protyle-content--transition > .protyle-wysiwyg.protyle-wysiwyg--attr[alias="whiteboard"]) {
   display: none !important;
}

/* If it is a new version, such as SiYuan V3.0.16, the following snippet is also needed. */
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

**Remember to click save after editing; otherwise, changes might be lost.** Personally, I press Ctrl+S often, so I haven't lost any data yet.

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

* For example: Jumping from element A to element B within the whiteboard. (At this time, the whiteboard zoom ratio is: 100%).
* First select element B and press ​`Ctrl`​​​​+​`C`​​​ to copy this element. Then click to select element A. After holding down `Ctrl`, press ​`J`​​​​,​`K`​​​​,​`V` in sequence and then press Enter to generate a link.

  * In this process, ​`Ctrl`​​​​+​`J` is to obtain the element ID from the just copied element and generate a link like: `excalidraw://nFrmqWgyT-lXdsS15Yswu`​​​ and copy it to the clipboard. At this time, a prompt will appear in the upper left corner: The link has been copied to the clipboard.
  * The subsequent `Ctrl`​​​​+​`K` pops up the link input box, and ​`Ctrl`​​​​+`V` pasting is the regular way to insert a link.
* Click the link icon on element A to jump to the position of element B. (Only applicable within the whiteboard. Using this link outside the whiteboard cannot perform the jump.)
* If the jump fails, you can click the【Save】button first and then try again.



## 5. Other Optional Configurations

### 1. Adjust Brush Thickness Manually

For V1.3.3, open `Whiteboard` -> `assets` -> `index-c894b550.js` and search for:

```css
simulatePressure:e.simulatePressure,size:e.strokeWidth*1.2,thinning
```

1.2 is the current value (already reduced). The initial default was over 4; adjust this value as desired.

### 2. Set Fixed Port (Windows)

If the `material library` of the whiteboard is used frequently, it is best to set a fixed port for starting the notebook. Because the content added to the material library is stored in LocalStorage. After setting this, the content that has been added to the material library will not disappear after the next startup.
Right-click the notebook desktop icon -> `Properties` -> `Shortcut` -> `Target (T)`. In the input box of `Target (T)`, it is the path of the executable file of SiYuan Note. For example:

```css
D:\Siyuan\SiYuan.exe
```

Just set the port at the back. For example:

```css
D:\Siyuan\SiYuan.exe  --port=6806
```

## 6. Update records

### V1.0.8

* Excalidraw version upgrade,0.15.0——>0.17.0
* Support embedding documents within notes (in preview form, not editable). See the preview image at the top for the effect.

  > Basic usage:
  >
  > * There is a function of "Embed Web Page" in the top toolbar of the whiteboard. After clicking, drag out a Web-Embed box by holding the mouse. Then paste the block hyperlink within the note [in the form of: siyuan://blocks/20200812220555-lj3enxa] into the link box and press Enter. Then move the mouse casually and the rendering of that block/document will start.
  > * To scroll through the page to view the content in the Web-Embed box, you need to move the mouse to the center of the box and click the button "Click to start interaction". Block references and hyperlinks in the box can be clicked to jump.
  > * Some blocks in the previewed document are not processed yet, such as formulas, HTML blocks, Mermaid, embedded blocks, etc. 
  > * If you just open the whiteboard or see that the Web-Embed box is blank after refreshing, just move the mouse casually in the whiteboard and the rendering will start.
  > * The corners of the Web-Embed box are recommended to be right angles. The corner with a radian may cause the document to be blurry.
  > * The theme style used by the previewed document is in the widget folde`Whiteboard\theme\theme.css`​
  >

* The delay time for auto-save is changed to 2 seconds. Auto-save will also prompt with a pop-up window (without a prompt, you wouldn't know if it has been saved). At the same time, in order to reduce interference, the color of the pop-up window has been adjusted very lightly.
* The shortcut key for turning on/off auto-save is changed to `Alt`​+`F`. Mainly because the shortcut key `Alt`​+`S` in the new version is occupied by the function "Adsorb to object".

---

### V1.0.9

* Fixed a style issue: On mobile devices, the "Save" and "Refresh" buttons cannot automatically adjust their positions and are blocked.
* Regarding the issue of the full-screen shortcut being removed in Excalidraw V0.17.0. A new full-screen shortcut Alt+Y is added. This shortcut is consistent with the full-screen shortcuts of other documents in the note. After clicking on a blank area of the whiteboard, pressing this shortcut can enter/exit full-screen mode.

**Web-Embed related**

* If a block hyperlink of a document is embedded, the document title is automatically inserted.
* In the Web-Embed document, rendering of Katex  and Mermaid is supported.
* For embedded blocks in the Web-Embed document, further query and rendering are not performed. Instead, the corresponding SQL text is directly displayed.

---

### V1.1.0

* Style adjustment: For the documents embedded in`Web-Embed`​, the basic font size is adjusted from 14px to 16px.
* Support quickly embedding documents/blocks by dragging.

  > * It is necessary to add a JS code snippet first to assist in obtaining the ID of the currently dragged block. (See the code block below). Add it in the <kbd>Settings</kbd> - <kbd>Appearance</kbd> - <kbd>Code Snippet</kbd> - <kbd>JS</kbd> of the note-taking software.
  > * 1、Use dragging to embed a document.
  >
  >   * In the document tree, hold down the left mouse button on the document and drag it to the whiteboard.
  > * 2、Use dragging to embed a block.
  >
  >   * It is recommended to split the screen first. The whiteboard is on the left and the document is on the right. (At this time, it is recommended to enable Zen Mode for the whiteboard to reduce the interference caused by the pop-up of the editing bar.)
  >   * The document is in edit state.
  >   * When the mouse hovers over a block, the block mark is displayed in the upper left corner of the block. Hold down the left mouse button on the block mark and drag it to the whiteboard.
  >

```js
document.addEventListener("dragstart", (event) => {
    if (event.target.tagName === "SPAN" && event.target.parentElement.getAttribute('data-node-id')) {
        window._currentBlockID = event.target.parentElement.getAttribute('data-node-id');  
    } else if (event.target.tagName === "LI" && event.target.getAttribute("data-node-id")) {
        window._currentBlockID = event.target.getAttribute("data-node-id");  
    } else {
        window._currentBlockID = null;
    }
}
);
```

---

### V1.2.0

* Delete the sourcemap file to reduce the size of the widget package.
* Support rendering embedded blocks in Web-Embed documents.
* Support rendering database table views in Web-Embed documents.
* Optimize the message pop-up window, add a timestamp and reduce interference in style, and retain the last notification.
* Style adjustment for Web-Embed documents in the whiteboard: Reduce the document padding (edge whitespace), and introduce hyperlink icons in theme.css.

Tips:

1. If the Web-Embed document appears blurry during page turning or mouse scrolling, you can move the mouse out of the `Web-Embed` box to restore clarity.
2. If there is a Mermaid chart in the Web-Embed document, it is recommended to keep the corresponding document within the visible area of the whiteboard when saving (by zooming out the whiteboard, etc.), so that it can be guaranteed to render normally next time it is opened.
3. When rendering a database table view in the whiteboard, although there is no scroll bar, you can use `shift` + mouse wheel to scroll horizontally to view the data table.

---

### V1.2.1

Fix data table rendering issues in Web-Embed documents:

* When custom icons (non-default icons) are used for table headers, it will cause the table rendering to fail.
* Links in the "Hyperlink" column cannot be jumped to after clicking.
* The cell content in the "Association" column cannot be rendered normally.
* The "Creation Time" and "Update Time" columns will cause the table rendering to fail.

Style modifications:

* Reduce the font size of the "Save" and "Refresh" buttons to be consistent with the adjacent "Material Library" for a more coordinated look.
* For embedded documents dragged into the whiteboard: Lighten the color of the document border (changed from #1e1e1e to #c0c0c0).
* For embedded documents dragged into the whiteboard: By default, use right angles for the corners and no longer follow the current state to avoid the problem of document blurriness.

### V1.3.0

* Embedded documents in the whiteboard support code highlighting. See the preview image at the top.
* Deal with the issue of the CSS code snippet for hiding the document title where the whiteboard is located being ineffective in the current version (SiYuan V3.0.16).

The previous CSS snippet for hiding the document title where the whiteboard is located was:

```css
/* Whiteboard widget - Hide the title and breadcrumbs of the current document */
.protyle-title.protyle-wysiwyg--attr:has(+ .protyle-wysiwyg.protyle-wysiwyg--attr[alias="whiteboard"]){
 display: none !important;
}

.protyle-breadcrumb:has(+ .protyle-content.protyle-content--transition > .protyle-wysiwyg.protyle-wysiwyg--attr[alias="whiteboard"]) {
  display: none !important;
}
```

Due to the changes in the new version of the note-taking software, the following needs to be added:

```css
.protyle-top:has(+ .protyle-wysiwyg.protyle-wysiwyg--attr[alias="whiteboard"]){
 display: none !important;
}
```


### V1.3.1

This version, on the basis of the previous version (V1.3.0), only updates the CSS snippet to adapt to the current latest version of SiYuan Note (V3.1.5). There are no other upgrades. If you have already downloaded V1.3.0, then you only need to fine-tune the CSS snippet and there is no need to download and update.

1、Deal with the problem: During the process of the widget covering the document, a clearly flickering input cursor appears on the left side.

A CSS snippet needs to be added. In the <kbd>Settings （Alt+P）</kbd>——<kbd>Appearance</kbd>——<kbd>Code Snippet</kbd>——<kbd>CSS</kbd>interface, add the following CSS:

```css
.iframe ,iframe{
    -webkit-user-modify: read-only;
}
```

### V1.3.2
* When saving, automatically write the text content in the whiteboard into the `Properties` - `memo` of the document it is in.

The benefit of this is that in global search, reference block search, and embedded block search, in addition to searching by the document name and alias of the whiteboard, now you can also retrieve and hit the whiteboard document through the text already entered in the whiteboard.

Of course, if you don't want the text in the whiteboard to participate in global search, you can manually turn off this function.

Open the widget folder `Whiteboard` - `index.js`, search for:
```js
 window._allowSetMemo = true;
```

Change it to:

```js
 window._allowSetMemo = false;
```



## 7. References and Thanks

* [Excalidraw](https://github.com/excalidraw/excalidraw)
* [SiYuan](https://github.com/siyuan-note/siyuan)
* The Chinese font file in the whiteboard is copied from the [superdraw](https://github.com/zuoez02/superdraw) project.
* Thanks to the author [Zuoqiu-Yingyi](https://github.com/Zuoqiu-Yingyi) of the plugin "Open API".
