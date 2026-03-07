## Top Pin  
* It is recommended to read through this document before use.  
* If this widget is accidentally embedded in a document that already contains other content, please refer to: [How to undo after accidentally inserting a widget?](https://github.com/BryceAndJuly/Whiteboard/issues/70#issuecomment-3027972161)

## 1. Current Version
### V2.0.18

Refer to the preview image at the top (the software version used for testing is: `Siyuan V3.5.8`).

- Whiteboard elements support linking to PDF annotations. (The link format is as follows: `assets/User Guide-20250501154835-226lt9b.pdf/20250304154923-lqp5jgy`)

Before use, it is recommended to add a JS code snippet in `Settings` > `Appearance` > `Code Snippets` > `Settings` > `JS` to convert copied annotations into linkable elements that can be directly pasted into the whiteboard.


```js
(() => {
    // 发送请求
    function request(url, data = null) {
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(
                    data => resolve(data.json()),
                    error => {
                        reject(error)
                    }
                )
                .catch(err => {
                    console.error('请求失败:', err)
                })
        })
    }
    // 获取PDF注释中的图片
    function getImage(url, data = null) {
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(
                    data => resolve(data.blob()),
                    error => {
                        reject(error)
                    }
                )
                .catch(err => {
                    console.error('请求失败:', err)
                })
        })
    }

    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            if (!(blob instanceof Blob)) {
                reject(new Error('传入的参数不是有效的 Blob 对象'));
                return;
            }
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(blob);
        });
    }
    // 将文本写入剪切板
    function writeText(txt) {
        let status = false
        const input = document.createElement('textarea')
        input.value = txt;
        // 设置样式避免页面闪烁
        input.style.position = 'fixed';
        input.style.top = '-9999px';
        input.style.left = '-9999px';
        document.body.appendChild(input);
        input.select()
        if (document.execCommand('copy')) {
            document.execCommand('copy')
            status = true
        } else {
            console.log("复制失败");
        }
        document.body.removeChild(input)
        return status
    }

    function getRandomStr(len) {
        let originStr =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let result = ''
        for (let i = 0; i < len; i++) {
            result += originStr.charAt(Math.floor(Math.random() * originStr.length))
        }
        return result
    }


    function showMessage(text) {
        request("/api/notification/pushMsg", { "msg": text, "timeout": 2000 })
    }
    async function annotationToElement() {
        let text = await navigator.clipboard.readText()
        if (!text) { return }
        let result = text.match(/^\<\<(assets\/.+\.pdf\/\d{14}\-\w{7}) \"(.+)\"\>\>$/);
        // 文字型标注
        if (result) {
            let str = result[2];
            // 如果标注的是代码块之类的，需要将部分字符进行转换
            str = str.replaceAll("\\", "\\\\").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&").replaceAll("&quot;", '\\"');
        
            let TextAnnotationTemplate = `{"type":"excalidraw/clipboard","elements":[{"id":"eP8wnAQNU2pZsbLysLQ8z","type":"rectangle","x":-422,"y":-738,"width":652,"height":35,"angle":0,"strokeColor":"#ced4da","backgroundColor":"transparent","fillStyle":"solid","strokeWidth":1,"strokeStyle":"dotted","roughness":0,"opacity":100,"groupIds":[],"frameId":null,"index":"a5","roundness":null,"seed":1190528293,"version":1168,"versionNonce":1136500139,"isDeleted":false,"boundElements":[{"id":"5lGwJ1Ol-USEwgyTJbtpQ","type":"text"}],"updated":1772855567196,"link":"${result[1]}","locked":false},{"id":"5lGwJ1Ol-USEwgyTJbtpQ","type":"text","x":-417.3762362353516,"y":-733.0763173558735,"width":154,"height":25,"angle":0,"strokeColor":"#1e1e1e","backgroundColor":"transparent","fillStyle":"solid","strokeWidth":2,"strokeStyle":"solid","roughness":1,"opacity":100,"groupIds":[],"frameId":null,"index":"a6","roundness":null,"seed":1990465669,"version":747,"versionNonce":1496494155,"isDeleted":false,"boundElements":[],"updated":1772855567196,"link":"${result[1]}","locked":false,"text":"${str}","fontSize":20,"fontFamily":8,"textAlign":"left","verticalAlign":"top","containerId":"eP8wnAQNU2pZsbLysLQ8z","originalText":"${str}","autoResize":true,"lineHeight":1.25}],"files":{}}`
            // 写入剪切板
            let status = writeText(TextAnnotationTemplate)
            if (status) { showMessage("👌") } else {
                showMessage("操作失败（Operation failed）")
            }
        }
        let result2 = text.match(/^\<\<((assets\/.+\.pdf)\/(\d{14}\-\w{7})) \".+\"\>\>\r\n\!\[\]\((assets\/.+\.png)\)$/);
        if (result2) {
            let link = result2[1];
            let pdfPath = result2[2]
            let id = result2[3];
            let imagePath = result2[4];
            let imageBlob = await getImage("/api/file/getFile", { "path": `/data/${imagePath}` })
            // 图片转成base64格式
            const base64Str = await blobToBase64(imageBlob);
            // 需计算图片的长宽比，保证粘贴到白板时图片的比例正常。
            let annotationData = await request("/api/asset/getFileAnnotation", { path: `${pdfPath}.sya` });
            if (annotationData.code === 0) {
                let data = JSON.parse(annotationData.data.data);
                let position = data[id].pages[0].positions[0];
                // 图片长、宽
                let width = Math.abs(position[2] - position[0]) * 1.5;
                let height = Math.abs(position[1] - position[3]) * 1.5;
                let fileID = `${Date.now()}${getRandomStr(27)}`;
                // 
                let imageAnnotationTemplate = `{"type":"excalidraw/clipboard","elements":[{"id":"-0IXg4dxa4jsF4Etw3oV_","type":"image","x":3163,"y":3095,"width":${width},"height":${height},"angle":0,"strokeColor":"transparent","backgroundColor":"transparent","fillStyle":"solid","strokeWidth":2,"strokeStyle":"solid","roughness":1,"opacity":100,"groupIds":[],"frameId":null,"index":"aM","roundness":null,"seed":684078715,"version":6,"versionNonce":1503382395,"isDeleted":false,"boundElements":null,"updated":1772601177808,"link":"${link}","locked":false,"status":"pending","fileId":"${fileID}","scale":[1,1],"crop":null}],"files":{"${fileID}":{"mimeType":"image/png","id":"${fileID}","dataURL":"${base64Str}","created":1772601161101,"lastRetrieved":1772601161101}}}`

                // 写入剪切板
                let status = writeText(imageAnnotationTemplate);
                if (status) { showMessage("👌") } else {
                    showMessage("操作失败（Operation failed）")
                }
            }
        }
    }


    // 顶栏添加一个按钮
    const barMode = document.getElementById("barMode");
    barMode.insertAdjacentHTML(
        "beforebegin",
        '<div id="convertAnnotation"  class="toolbar__item ariaLabel" aria-label="PDF" ></div>'
    );
    const convertBtn = document.getElementById("convertAnnotation");
    convertBtn.style.width = "auto";
    convertBtn.innerHTML = `<svg t="1772610251555" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1692" width="48" height="48"><path d="M905.185809 178.844158C898.576738 172.685485 891.19337 165.824412 883.21687 158.436127 860.422682 137.322863 837.434925 116.207791 815.697647 96.487895 813.243072 94.261877 813.243072 94.261877 810.786411 92.037081 781.783552 65.781062 757.590948 44.376502 739.713617 29.293612 729.254178 20.469111 721.020606 13.860686 714.970549 9.501727 710.955023 6.608611 707.690543 4.524745 704.47155 2.998714 700.417679 1.07689 696.638044-0.094029 691.307277 0.005928 677.045677 0.273349 665.6 11.769337 665.6 26.182727L665.6 77.352844 665.6 128.522961 665.6 230.863194 665.6 256.448252 691.2 256.448252 896 256.448252 870.4 230.863194 870.4 998.414942 896 972.829884 230.381436 972.829884C187.90385 972.829884 153.6 938.623723 153.6 896.20663L153.6 26.182727 128 51.767786 588.8 51.767786C602.93849 51.767786 614.4 40.312965 614.4 26.182727 614.4 12.05249 602.93849 0.597669 588.8 0.597669L128 0.597669 102.4 0.597669 102.4 26.182727 102.4 896.20663C102.4 966.91021 159.652833 1024 230.381436 1024L896 1024 921.6 1024 921.6 998.414942 921.6 230.863194 921.6 205.278135 896 205.278135 691.2 205.278135 716.8 230.863194 716.8 128.522961 716.8 77.352844 716.8 26.182727C716.8 39.813762 705.748075 50.91427 692.267725 51.167041 687.705707 51.252584 685.069822 50.435995 682.52845 49.231204 682.259458 49.103682 683.344977 49.796618 685.029451 51.010252 689.779394 54.432502 697.145822 60.34494 706.686383 68.394196 724.009052 83.009121 747.816448 104.072869 776.413589 129.961594 778.850014 132.168064 778.850014 132.168064 781.285216 134.376514 802.876774 153.964212 825.739479 174.96442 848.413564 195.966437 856.350957 203.3185 863.697005 210.144893 870.269888 216.269843 874.209847 219.941299 877.019309 222.565641 878.499674 223.951409 888.81866 233.610931 905.019017 233.081212 914.684179 222.768247 924.349344 212.455283 923.819315 196.264383 913.500326 186.604861 911.981323 185.182945 909.155025 182.542876 905.185809 178.844158ZM102.4 461.128719 0 461.128719 0 896.074709 512 896.074709 1024 896.074709 1024 461.128719 153.6 461.128719 153.6 460.531049 102.4 460.531049 102.4 461.128719ZM208.2 711 208.2 819.2 157.6 819.2 157.6 528 269 528C301.533495 528 327.366571 536.466581 346.5 553.4 365.633429 570.333419 375.2 592.733195 375.2 620.6 375.2 649.133476 365.833427 671.333254 347.1 687.2 328.366573 703.066746 302.133502 711 268.4 711L208.2 711ZM208.2 670.4 269 670.4C287.00009 670.4 300.733286 666.166709 310.2 657.7 319.666714 649.233291 324.4 637.000079 324.4 621 324.4 605.266588 319.600047 592.700047 310 583.3 300.399951 573.899953 287.200083 569.066669 270.4 568.8L208.2 568.8 208.2 670.4ZM419.4 819.2 419.4 528 505.4 528C531.133461 528 553.966566 533.733276 573.9 545.2 593.833434 556.666724 609.266611 572.933229 620.2 594 631.133389 615.066771 636.6 639.199863 636.6 666.4L636.6 681C636.6 708.600139 631.100055 732.866562 620.1 753.8 609.099945 774.733438 593.433436 790.866609 573.1 802.2 552.766564 813.533391 529.466799 819.2 503.2 819.2L419.4 819.2ZM470 568.8 470 778.8 503 778.8C529.533466 778.8 549.89993 770.500083 564.1 753.9 578.30007 737.299917 585.533331 713.466822 585.8 682.4L585.8 666.2C585.8 634.599842 578.933402 610.46675 565.2 593.8 551.466598 577.13325 531.533463 568.8 505.4 568.8L470 568.8ZM854.8 695.8 737.6 695.8 737.6 819.2 687 819.2 687 528 872 528 872 568.8 737.6 568.8 737.6 655.4 854.8 655.4 854.8 695.8Z" fill="#d4237a" p-id="1693"></path></svg>`;
    convertBtn.addEventListener(
        "click",
        (e) => {
            e.stopPropagation();
            e.preventDefault();
            annotationToElement();
        },
        true
    );
    convertBtn.addEventListener("mousedown", () => { convertBtn.style.transform = 'scale(2)' })
    convertBtn.addEventListener("mouseup", () => { convertBtn.style.transform = 'scale(1)' })
    convertBtn.addEventListener("mouseleave", () => { convertBtn.style.transform = 'scale(1)' })
})();
```




---

For the current version: **V2.0.18**

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

For V2.0.18, open `Whiteboard` -> `assets` -> `index-ZsssFvwm.js` and search for:

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

[Changelog](https://github.com/BryceAndJuly/Whiteboard/issues/98#issuecomment-4015673213)

## 8. References and Thanks

* [Excalidraw](https://github.com/excalidraw/excalidraw)
* [SiYuan](https://github.com/siyuan-note/siyuan)
* The Chinese font file in the whiteboard (prior to V2.0.0) is copied from the [superdraw](https://github.com/zuoez02/superdraw) project.
* Thanks to the author [Zuoqiu-Yingyi](https://github.com/Zuoqiu-Yingyi) of the plugin "Open API".
