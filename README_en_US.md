## Top Pin  
* It is recommended to read through this document before use.  
* If this widget is accidentally embedded in a document that already contains other content, please refer to: [How to undo after accidentally inserting a widget?](https://github.com/BryceAndJuly/Whiteboard/issues/70#issuecomment-3027972161)

## 1. Current Version
### V2.0.17

- Fix the issue: [When the database primary key uses a bound block, it cannot be displayed after being embedded into the whiteboard.](https://github.com/BryceAndJuly/Whiteboard/issues/92)

---
### V2.0.16

- Fixed Issue: The user documentation of the previous version displayed abnormally in the marketplace.
---
### V2.0.15
Fixed Issues:
- Failed to retrieve the icon when the icon of the **Callout** is set as a dynamic icon.
- Abnormal icon size when the icon of the **Callout** is set as a custom icon.
- Missing corresponding icon for the **Callout** in the content block search panel.
- When a document title contains a string similar to "\<iframe\>", it will be recognized as a tag, resulting in abnormal document rendering.
---
### V2.0.14

Test Environment: `SiYuan V3.5.0`, `Windows 11 Home Chinese Edition 24H2`

- Adjust the styles of Callout blocks and iframe blocks

---

### V2.0.13

- Optimize the usage of the whiteboard in `Publishing Mode` and `Global Read-Only Mode`.

Instructions for Use:

- After enabling the Publishing Service, when you open the publishing address in a browser to view notes, the whiteboard will open in `View Mode` by default, which is similar to the read-only mode of other documents.
- Most buttons are hidden in the whiteboard's View Mode; only the Zoom button at the bottom left corner and the Refresh button at the top right corner are retained. Please refer to the preview image at the top for reference.
- After enabling the Global Read-Only Mode via` Settings` → `Editor `→` Read-Only Mode,` the whiteboard will open in View Mode on the computer terminal; otherwise, it will open in Edit Mode by default.

> **There is currently a minor issue when opening the whiteboard in View Mode:**  the whiteboard fails to gain focus after being opened, which prevents the shortcut keys in the whiteboard (e.g., Ctrl + F) from working.
>
> The solution is as follows: After opening the whiteboard, click the Reset Zoom button, Zoom In button, or Zoom Out button at the bottom left corner with your mouse to make the whiteboard gain focus. After that, you can use the whiteboard's shortcut keys normally.

Currently, the default opening mode of the whiteboard is still Edit Mode. If you want to change it to View Mode, you can use an editor like VS Code to open the widget folder`Whiteboard`——`custom.js`

search for

```js
window.viewModeEnabled = false;
```

Then change it to:

```js
window.viewModeEnabled = true;
```


---

For the current version: **V2.0.17**

If you **do not want auto-save to be enabled by default**, open the widget folder `Whiteboard` -> `custom.js` in an editor like VS Code and search for:

```js
window._autoSave = true;
```

Then change it to:

```js
window._autoSave = false;
```

To **adjust the auto-save delay time** (default is 2000ms), open `Whiteboard` -> `custom.js` in the widget folder and search for:

```js
window._autoSaveDelay = 2000;
```

Change the last value `2000` to your preferred time (in milliseconds).

---

## 2. Overview

A widget based on [Excalidraw](https://github.com/excalidraw/excalidraw). After embedding, it will automatically fill the entire document, treating a document as a whiteboard. It integrates small functions such as floating preview, retrieval and embedding of content blocks, etc.

You can embed a whiteboard by referencing the document. To export and share a whiteboard, use the export/import `SiYuan .sy.zip` function.

> It is recommended to click the "Save Block References" button before exporting, and click the "Fix Block Hyperlinks" button after importing.

 Each whiteboard binds to a file stored in `assets/ExcalidrawFiles/`, which can be deleted manually as an unreferenced resource if the document is removed.


## 3. Pre-Usage Setup

### 1. Add CSS Snippet

When creating a whiteboard, the widget sets the document's `Alias` property to `whiteboard` to avoid flashing document titles upon opening. You'll need to add a corresponding CSS snippet in `Settings` -> `Appearance`:

```css
/* Whiteboard widget - Hide the title and breadcrumbs of the current document. */
.protyle-title.protyle-wysiwyg--attr:has(+ .protyle-wysiwyg.protyle-wysiwyg--attr[alias="whiteboard"]){
   display: none !important;
}
/* Hide the unordered list in the whiteboard document. */
.iframe[custom-data-assets^="assets/ExcalidrawFiles/"] ~ .list[data-subtype="u"] {
  display: none !important;
}

/* Hide the breadcrumbs on the top bar of the whiteboard document when it is not in focus. */
.protyle-breadcrumb:has(button.protyle-breadcrumb__icon.ariaLabel.fn__none):has(+ .protyle-content.protyle-content--transition > .protyle-wysiwyg.protyle-wysiwyg--attr[alias="whiteboard"]) {
    display: none !important;
}
/* If it is a new version, such as SiYuan V3.0.16, the following snippet is also needed. */
.protyle-top:has(+ .protyle-wysiwyg.protyle-wysiwyg--attr[alias="whiteboard"]){
   display: none !important;
}

/* Widget – Remove Border */
.b3-typography iframe, .protyle-wysiwyg iframe {
    border: none;   
}
/* Fix issue with document tree drag line on the right side in the whiteboard */
.layout__resize--lr {
    z-index: 3;
}
/* When the whiteboard document is embedded as an embedded block in other documents - hide the possible blank lines at the bottom edge. */
.protyle-wysiwyg__embed>.iframe[custom-data-assets^="assets/ExcalidrawFiles/"] ~ .p {
    display: none;
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
    min-height: 70vh;
    max-height: 75vh !important;
}
```

### 2. Add JavaScript Snippet

You can quickly embed documents/blocks into the whiteboard via drag-and-drop.

Add a JavaScript snippet in `Settings` -> `Appearance` to aid in obtaining the current dragged block ID. 

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

**Remember to click save after editing; otherwise, changes might be lost.**  Personally, I use the manual save mode and press Ctrl+S frequently, so I haven't lost any data yet.

### 3. Floating Preview of Block Hyperlinks

* To insert a link in the whiteboard, copy a link address (external or a `block hyperlink` of a block/document), click an element on the whiteboard, then press `Ctrl + K` to bring up the link input field, paste the link, and press Enter.
* To enable hovering previews for block hyperlinks, press `Alt + Q` to enable preview mode and `Alt + W` to disable it. When enabled, hovering over a link icon displays a preview window of the block content, which can be closed by pressing `ESC` (If it doesn't take effect, you can first click on the top bar of the floating window and then try again. ) or by clicking `X` in the top right corner.


### 4.SaveBlockRef and FixBrokenLinks

Two new functions have been added to the main menu in the upper left corner:`SaveBlockRef` and `FixBrokenLinks`

* `SaveBlockRef`

  * Obtain the block hyperlinks that have been embedded in the whiteboard, and insert them in the form of reference blocks into the unordered list after the whiteboard widget block to establish the reference relationship of the whiteboard to other documents/blocks.
  * After the reference relationship is established, when the whiteboard document is exported in the form of `SiYuan.sy.zip`, the documents/blocks that have been embedded in the whiteboard can be automatically included to ensure the integrity of the data when the whiteboard is exported.
* `FixBrokenLinks`

  * Generally, this function is only used after the whiteboard document is imported in the form of `SiYuan.sy.zip`.
  * The prerequisite for this function to take effect is that the "Save Block Quotation" function needs to be used to update the reference relationship of the whiteboard to other blocks before the whiteboard document is exported in the form of `SiYuan.sy.zip`.
  * During the import process, the IDs of the documents/blocks are reset by the software, which usually causes the existing block hyperlinks on the whiteboard to become invalid. This function updates the block hyperlinks in the whiteboard according to the corresponding relationship between the old and new block IDs in the reference blocks, so as to achieve the purpose of fixing the invalid block hyperlinks.


### 5. Drag and embed the content block.

* Support quickly embedding documents/blocks by dragging.

* 1、Use dragging to embed a document.

  * In the document tree, hold down the left mouse button on the document and drag it to the whiteboard.
* 2、Use dragging to embed a block.

  * It is recommended to split the screen first. The whiteboard is on the left and the document is on the right. (At this time, it is recommended to enable Zen Mode for the whiteboard to reduce the interference caused by the pop-up of the editing bar.)
  * The document is in edit state.
  * When the mouse hovers over a block, the block mark is displayed in the upper left corner of the block. Hold down the left mouse button on the block mark and drag it to the whiteboard.

> * After dragging a content block from the notes into the whiteboard to generate a card, before dragging the card for the first time, you need to click on the `edge area` of the card (the area other than the `Click to start interaction` in the middle) to re-select it.

### 6. Content Block Retrieval Panel

You can use the shortcut keys `Alt` + `P` to open/close the **Content Block Retrieval Panel**. Through this panel, you can quickly retrieve and embed the retrieved content blocks.

**Basic Usage:**

* After clicking on the blank area of the whiteboard with the mouse to gain focus, you can open or close the `Content Block Retrieval Panel` using the shortcut key `Alt` + `P`.
* Once the panel is opened, the input box automatically gets focused. You can directly input keywords, separating multiple keywords with spaces. Approximately 0.5 seconds after entering the keywords, the search results will be displayed in the list below, with the first search result automatically selected.
* At this point, you can use the up/down arrow keys on the keyboard to switch the selected search results. Pressing the `Enter` key will embed the currently selected search result in the form of an embedded document into the upper - left corner of the whiteboard. Multiple search results can be embedded in succession by using the up and down arrow keys along with the `Enter` key.
* After clicking the `Clear` button, the keywords in the input box are cleared and the input box automatically gains focus. You can then continue to enter new keywords for retrieval.

**Other tips:**

* In the note - taking software, in the `Settings` - `Editor` - `[[Search Documents Only` option, if this option is enabled, the search results of the `Content Block Search Panel` on the whiteboard will only retain document blocks.
* Searching in the `Content Block Search Panel` and searching for reference blocks in the document using `【【+keyword` utilize the same API: `/api/search/searchRefBlock`. Therefore, the settings in `Settings` - `Search` - `Block - level Types` of the note - taking software can directly affect the types of search results in the `Content Block Search Panel`.
* In the list of search results

  * Clicking on the icon in front of the search result allows you to jump to the corresponding content block.
  * When you click the `+` icon behind the search result, the corresponding search result can be embedded in the upper - left corner of the whiteboard in the form of an embedded document.


### 7. Search within Embedded Content Blocks

A  `Text Search Panel`  is added to the upper right corner, specifically for searching and highlighting text within iframes. This is similar to text search on web pages. — Currently, the search scope of this feature is limited to documents/content blocks embedded in the whiteboard.

**Basic Usage:**

* Before searching, it is recommended to load all iframe elements on the whiteboard. You can use the shortcut key (Shift+1) for the whiteboard's [Zoom to Fit All Elements] function.

  * Since iframes are lazily loaded, they need to be in the visible area to load. Text search is performed within the loaded iframe elements.
  * Click on the blank area of the whiteboard and press the shortcut key (Shift+1) to make all elements visible.
* Click on the blank area of the whiteboard and press the shortcut key (Alt+o) to open/close the [Text Search Panel] in the upper right corner. Once opened, it automatically gains focus, allowing you to directly enter a single keyword for searching.
* After entering a single keyword, if there are matching results, it will default to jumping to the first iframe containing the keyword. The focus remains in the input box; pressing `Enter` will switch to the next iframe.

> **Notes:**
>
> * The number of search results refers to the count of iframe cards containing the keyword, not the number of keyword matches. An iframe may have multiple instances of the keyword, and you may need to manually scroll the page to view all highlighted parts.


## 5. Matters needing attention.

* When `automatic save` is triggered, the right-click pop-up menu of the mouse will be closed. If you think this interference is too great, you can close `automatic save` by default or temporarily. (The shortcut key to temporarily turn off automatic save is `Alt+F`).
* The corners of the `Web Embedd` box are recommended to be right angles. The corner with a radian may cause the document to be blurred.
* When rendering database tables in the whiteboard, although there is no scroll bar, you can use Shift + mouse wheel to scroll horizontally to view the data table.
* After dragging a content block from the notes into the whiteboard to generate a card, before dragging the card for the first time, you need to click on the `edge area` of the card (excluding the part of `Click to start interaction` in the middle) to re-select it.
* If you mistakenly embed this widget in a document that already has other content, you can refer to: [How to undo after mistakenly inserting a widget?](https://github.com/BryceAndJuly/Whiteboard/issues/48) 

## 6. Other Optional Configurations

### 1. Adjust Brush Thickness Manually

For V2.0.17, open `Whiteboard` -> `assets` -> `index-ZsssFvwm.js` and search for:

```css
n={simulatePressure:e.simulatePressure,size:e.strokeWidth*1.2,thinning
```

1.2 is the current value. The initial default was over 4; adjust this value as desired.


### 2. Write the text in the whiteboard into the document's property—memo.

* When saving, it will automatically write the text content on the whiteboard by default into the `Properties` - `memo `of the document where it is located.

The advantage of doing this is that in global search, referenced block search, and embedded block search, in addition to being able to retrieve and locate whiteboard documents by the document name and alias of the whiteboard, you can now also search and find whiteboard documents through the text that has been entered in the whiteboard.

Of course, if you don't want the text in the whiteboard to be included in the global search, you can manually turn off this feature.

Open the widget folder `Whiteboard`—`custom.js` and search for:

```js
window._allowSetMemo = true;
```

Change it to:

```js
window._allowSetMemo = false;
```


### 3. Set Fixed Port (Windows)

If the `material library` of the whiteboard is used frequently, it is best to set a fixed port for starting the notebook. Because the content added to the material library is stored in LocalStorage. After setting this, the content that has been added to the material library will not disappear after the next startup.

Right-click the notebook desktop icon -> `Properties` -> `Shortcut` -> `Target (T)`. In the input box of `Target (T)`, it is the path of the executable file of SiYuan Note. For example:

```css
D:\Siyuan\SiYuan.exe
```

Just set the port at the back. For example:

```css
D:\Siyuan\SiYuan.exe  --port=6806
```

## 7. Update records

### V2.0.0

* **Excalidraw Version Update: From V0.17.0 to V0.18.0.**  For the specific update contents, please refer to: [https://github.com/excalidraw/excalidraw/releases](https://github.com/excalidraw/excalidraw/releases)

  * In this version, the official has added two features, namely "Text Search" and "Element Link". Therefore, the "Text Search" and "Element Link" functions of the old version of the widget have been deprecated.

    * Regarding [Element Link]: There is no need to worry that the previously established element link relationships will become invalid. After adaptation, the element links in the current version will continue to maintain the previous element link format, in the form of: `excalidraw://7LItP1OJtttbMuytaDgp2`. You can obtain it through the `Copy link to object` option in the right-click menu.

      > Remarks: The right-click menu of the mouse will be closed when the auto-save function is triggered. If you need to obtain element links frequently, it is recommended to temporarily turn off the auto-save function by using the shortcut keys `Alt` + `F` first.
      >
    * Regarding [Text Search], you can call it up by using the shortcut keys `Ctrl` + `F`. The default single-keyword search in the official version has been modified to support multi-keyword search. Separate the keywords with spaces, which is consistent with the previous search method.
  * Other update points that I personally find quite useful.

    * Handwritten fonts are supported by default. The font files are located in the `Whiteboard/fonts/Xiaolai` folder and are split into multiple woff2 files for lazy loading. Although the font files are slightly large, the glyphs look good, taking both readability and aesthetics into account.
    * It supports `Elbow arrows`. Elements can be quickly and neatly connected, making it more convenient to draw flowcharts.
    * Image Cropping. You can perform simple cropping on the images embedded in the whiteboard.
* Fix the loading issue of the embedded document (Web Embed)

  * Previously, right after opening or refreshing the whiteboard, you had to move the mouse randomly within the whiteboard for the embedded document to start rendering. The same was true for other embedded documents added through dragging and dropping or via the [Block Citation Retrieval Panel]. After the fix, the documents embedded in the whiteboard will be automatically loaded, eliminating the need to wait for actions like moving the mouse.



### V2.0.1
I've just discovered an issue: when multiple whiteboards are opened simultaneously, the data of the whiteboards interfere with each other due to the LocalStorage cache. 
Please stay on version V1.6.0 and do not update for now until this issue is fixed!!!


### V2.0.2
* Fix the issue: In V2.0.0, when multiple whiteboards are opened simultaneously, the whiteboard data interferes with each other due to the LocalStorage cache. 

### V2.0.3
Fix the issue: In version `2.0.2`, When the link added to an element is an external link (such as a link starting with `https://` or `http://`), clicking the link icon in the upper right corner of the element fails to perform the jump. Instead, it is necessary to click the element first and then click the link input box displayed above to make the jump.

### V2.0.4

See the preview image at the top:

* Add a refresh button to the upper right corner of the content block embedded in the whiteboard. This makes it convenient to reload the content block individually after updating the content, instead of reloading the entire whiteboard.
  * You need to click on [Click to start interaction] in the center of the card or double-click on the edge area of the card to enter the card before you can click this button.
* For the content block embedded in the whiteboard, the background color is set to transparent by default, so that the background color set for the element takes effect.
* The `Content Block Retrieval Panel` (Alt+P) has a newly added dark mode, which takes effect when the theme of the whiteboard is in dark mode (it is directly set to dark, not the System mode). 


### V2.0.5

A [Text Search Panel] is newly added in the upper right corner, specially designed for searching and highlighting text within iframes, similar to text search in web pages.  

* Before searching, it is recommended to load all iframe elements of the whiteboard. You can use the shortcut key (Shift+1) for the whiteboard's [Zoom to Fit All Elements] function.  
  * Since iframes are lazy-loaded, they need to be in the visible area to load, and text search is performed within the loaded iframe elements.  
  * Click on the blank area of the whiteboard and then press the shortcut key (Shift+1) to make all elements visible.  
* Click on the blank area of the whiteboard and then press the shortcut key (Alt+o) to open/close the [Text Search Panel] in the upper right corner. Once opened, it automatically gains focus, allowing you to directly enter a single keyword for searching.  
* After entering a single keyword, if there are matching results, it will default to jumping to the first iframe containing the keyword. At this point, the focus remains in the input box; pressing `Enter` will switch to the next iframe.  

> Notes:  
> * The number of search results refers to the number of iframe cards containing the keyword, not the number of keyword matches. An iframe may contain multiple instances of the keyword, and you may need to manually scroll the page to view all highlighted parts.

### V2.0.6

Fix the issues:  

* In V2.0.5, when the whiteboard's iframe contains external links, the text search (Alt+o) malfunctions.  
  > Note: Currently, the search scope of this feature is limited to the documents/content blocks embedded within the whiteboard.  

* In V2.0.5, after closing the text search box via the shortcut key Alt+o, the keyword highlighting in the iframe is not automatically removed.  
  > Note: In V2.0.5, the search box can still be closed and the highlighting removed via the "X" close button on the right side of the text search box.

### V2.0.7

Testing environment: SiYuan V3.2.0 preview version, Windows 11 Home Chinese version 24H2

- **Fixed Issue:**  When clicking the [Click to Start Interaction] button in the center of a card (or double-clicking the edge area of the card) to enter the card for content blocks embedded in the whiteboard, using the mouse wheel often fails to scroll the page.
- **Improvement:** Supports rendering the gallery view of databases in the whiteboard.


### V2.0.8

* Bug Fixes:

  * Some shortcuts are incompatible with MacOS. Reference: [Issue:68](https://github.com/BryceAndJuly/Whiteboard/issues/68)
  * The Mermaid diagrams embedded in the whiteboard are not adapted to dark mode.
* Improvements:

  * The whiteboard's theme mode (dark/light) is defaulted to match that of the note-taking software. If the whiteboard does not change when the software's theme mode is switched, simply refresh the whiteboard.
  * When saving the whiteboard, record the status of "Snapping to Object (Alt+S)" and the font size (currentItemFontSize) at the time of the last edit.
  * The reload button in the upper right corner of the content block embedded in the whiteboard is hidden by default and will be displayed when the mouse hovers over the card.
  * Upgrade Mermaid to the latest version V11.7.0.

### V2.0.9

- Handling compatibility: In the software` V3.2.0,` the  `Fix Block Hyperlink` function of the whiteboard is invalid.

### V2.0.10
Test environment: `SiYuan V3.2.1`, `Windows 11 Home Chinese Edition 24H2`

Fix styles:

- Delete the undefined font styles in `base.css`
- `Attribute View`: Add the two missing icons, see the preview image
- `Attribute View` - Settings - Layout - Card Preview: When set to content block, add the missing styles

### V2.0.11
Test Environment: `SiYuan V3.3.0`, `Windows 11 Home Chinese Edition 24H2`
- Handling Compatibility: Support rendering database groupings in the whiteboard. Reference: [Database grouping by field](https://github.com/siyuan-note/siyuan/issues/10964)


---
### V2.0.12
Test Environment: `SiYuan V3.4.0`, `Windows 11 Home Chinese Edition 24H2`
- Handling Compatibility: Support for rendering the kanban view of the database in the whiteboard.. Reference: [Database kanban view](https://github.com/siyuan-note/siyuan/issues/8873)


## 8. References and Thanks

* [Excalidraw](https://github.com/excalidraw/excalidraw)
* [SiYuan](https://github.com/siyuan-note/siyuan)
* The Chinese font file in the whiteboard is copied from the [superdraw](https://github.com/zuoez02/superdraw) project.
* Thanks to the author [Zuoqiu-Yingyi](https://github.com/Zuoqiu-Yingyi) of the plugin "Open API".
