## 置顶
* 使用前建议先阅读完此文档。
* 如果在已有其他内容的文档中误嵌入该挂件，可参考：[误操作插入挂件后如何撤销?](https://github.com/BryceAndJuly/Whiteboard/issues/48)

## 一、当前版本
### V2.1.0
参考顶部预览图（测试时的软件版本为：`Siyuan V3.6.5`）
- 支持在导出的SVG文件中渲染内容块。

> 用到的依赖库：[html-to-image](https://github.com/bubkoo/html-to-image)

使用方式：

- 单击白板空白处，按`Shift `+ `1`加载所有内容块。
- 按`Alt`+ `L`将内容块依次转为图片用的`dataUrl`

  - 这个处理会有比较慢（等大概5s或者更久），完成后，笔记软件右上角会弹出提示：`已完成`
- 然后是常规的导出SVG文件的流程：`左上角菜单`——`导出图片`——`下载SVG`——`选择指定文件夹`——`保存`

---
### V2.0.21

- 修复Mermaid图表的渲染问题（嵌入的文档存在多个Mermaid图表时）

  - 单个图表的高度过低，未显示完整
  - 更新Mermaid图表后，因为图表ID的问题，导致部分图表出现渲染空白。

> 更新挂件后，由于缓存的影响，挂件可能加载的还是旧的文件，可参考[禁用缓存后刷新](https://github.com/BryceAndJuly/Whiteboard/issues/100)进行刷新
---

### V2.0.20

参考顶部预览图（测试时的软件版本为：`Siyuan V3.6.5`）

- 修复问题：嵌入块中的代码未高亮。
- 优化：

  - 代码块添加浅色模式
  - 在笔记中修改内容块后，白板中对应卡片的内容自动更新。


关于白板中内容块的自动更新，该功能是默认开启的，如果想默认关闭，可以使用VS Code之类的编辑器打开：`工作空间/data/widgets/Whiteboard/custom.js`，

搜索：

```js
window.contentSync = true;
```

改成：

```js
window.contentSync = false;
```

并有以下注意事项：

> - 该功能需要先启用插件：`开放 API`
>
>   - 因为它本质是用插件的`eventBus`来检测内容块的变更，然后实时去修改卡片的DOM。
>   - 如果只是想临时关闭白板的【内容块自动同步】功能，只需要关闭插件`开放 API`并刷新白板即可。
> - 内容块对应的白板卡片需要处于可视区域。（通过快捷键是`Shift `+ `1`，可以让所有元素都处于可视区域)
> - 如果发现白板卡片没有正常触发更新，或者更新后显示异常，可以`双击该卡片边缘区域（进入交互模式）`———`点击卡片右上角的刷新按钮`来手动刷新该卡片。

---

### V2.0.19

参考顶部预览图（测试时的软件版本为：`Siyuan V3.6.5`）

- 修复问题：数据表格的看板视图只有单列时，未能在白板中正常渲染。
- 优化：创建白板时，减少自动刷新的次数（基本只刷新一次）。
- 样式调整
  - 禅模式下，不隐藏顶栏快捷键及提示，不隐藏边框阴影，以减少白板刷新时的闪烁。
  - 数据表格中，文本不换行时，溢出的文本显示为省略号。

---
### V2.0.18

参考顶部预览图（测试时的软件版本为：`Siyuan V3.5.8`）

- 白板元素支持链接到PDF标注。（链接格式形如：`assets/User Guide-20250501154835-226lt9b.pdf/20250304154923-lqp5jgy`）

使用前，建议在`设置`——`外观`——`代码片段`——`设置`——`JS`中添加一个JS代码片段，用于将复制的标注转换成可以直接在白板中粘贴的带链接的元素。

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

对于当前版本：**V2.1.0**

如果你**不想默认开启自动保存功能**，可以使用VS Code之类的编辑器打开挂件文件夹`Whiteboard`——`custom.js`，

搜索：

```js
window._autoSave = true;
```

改成：

```js
window._autoSave = false;
```

如果你想**调整自动保存的延时时间**（默认是2000ms），可以打开挂件文件夹`Whiteboard`——`custom.js`

搜索：

```js
window._autoSaveDelay = 2000;
```

将2000 改成你想设置的数值即可，单位是毫秒。

---

## 二、简介

一个基于[Excalidraw](https://github.com/excalidraw/excalidraw)的挂件，嵌入后会自动铺满文档，将一个文档当成一个白板。融合了悬浮预览、内容块的检索和嵌入等小功能。

可通过引用文档的方式来引用白板。如果需要将画好的白板导出并分享给别人，可以使用白板所在文档的导出/导入`SiYuan .sy.zip`文件的功能（导出前建议先点击`保存块引用`按钮，导入后点击`修复块超链接`按钮）。每个白板绑定一个存储在`assets/ExcalidrawFiles/`中的文件，文档删除后白板绑定的文件也会作为【未引用的资源】来方便手动删除。

## 三、使用前的设置

### 1、添加CSS代码片段

白板创建时，会自动设置所在文档的属性——`别名`的值为：`whiteboard`，这是为了解决打开白板所在文档时页面闪现出文档标题的问题。相应的，你需要在笔记软件的`设置`——`外观`中添加对应的CSS代码片段：

```css
/* 白板挂件——隐藏当前文档的标题、面包屑 */
.protyle-title.protyle-wysiwyg--attr:has(+ .protyle-wysiwyg.protyle-wysiwyg--attr[alias="whiteboard"]){
   display: none !important;
}

/* 隐藏白板文档中的无序列表 */
.iframe[custom-data-assets^="assets/ExcalidrawFiles/"] ~ .list[data-subtype="u"] {
  display: none !important;
}
/* 在不聚焦的情况下，隐藏白板文档顶栏的面包屑 */
.protyle-breadcrumb:has(button.protyle-breadcrumb__icon.ariaLabel.fn__none):has(+ .protyle-content.protyle-content--transition > .protyle-wysiwyg.protyle-wysiwyg--attr[alias="whiteboard"]) {
    display: none !important;
}

/* 如果是新版本，比如SiYuan V3.0.16，还需要以下片段 */
.protyle-top:has(+ .protyle-wysiwyg[alias="whiteboard"]){
   display: none !important;
}

/* 挂件——去掉边框 */
.b3-typography iframe, .protyle-wysiwyg iframe {
    border: none;   
}
/* 处理在白板文档中，文档树右侧（调整页面宽度）的拖拽线被遮挡的问题 */
.layout__resize--lr {
    z-index: 3;
}
/* 白板文档作为嵌入块嵌入到其他文档时——隐藏底边可能出现的空白行 */
.protyle-wysiwyg__embed>.iframe[custom-data-assets^="assets/ExcalidrawFiles/"] ~ .p {
    display: none;
}
/* 处理问题：挂件铺满文档的过程中，左侧出现明显闪烁的输入光标。 */
.iframe ,iframe{
    -webkit-user-modify: read-only;
}
```

还有一个可选的样式，是设置悬浮窗大小的，个人感觉默认的窗口有点过于宽了才设置的，可以根据自己的需要来进行修改。

```css
/* 悬浮窗口 */
.block__popover {
    width: 735px;
    min-height: 70vh;
    max-height: 75vh !important;
}
```

### 2、添加JS代码片段

可通过拖拽的方式快速往白板中嵌入文档/块。

需要在笔记软件的`设置`——`外观`中添加对应的JS代码片段来辅助获取当前拖拽块的ID。

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

### 3、安装插件【开放 API】

* 安装这个插件是为了能在白板中悬浮预览笔记内块/文档的内容。
* 在`设置`——`集市`——`插件`页面，下载并启用插件`开放 API`即可。

‍

## 四、开始使用

### 1、插入白板

下载完挂件后，在新建的空白文档中设置好文档标题后，输入`/g`并回车，在挂件列表选择`Whiteboard`即可在当前文档中插入白板，默认铺满文档。

### 2、数据的保存

单击左上角的`保存`按钮或者使用快捷键`Ctrl`+`S`来保存白板的数据。左上角会弹出提示：`已保存`

白板的数据保存在：`assets/ExcalidrawFiles/ `文件夹中，文件路径类似于：

```css
assets/ExcalidrawFiles/20231227015401-w0olmpi.excalidraw
```

使用白板挂件块的ID作为文件名。

* 默认开启`自动保存`，一般在增、删或移动元素后约2s触发保存。如果想默认关闭自动保存或者调整延时时间，可以参考文档顶部描述的方法。
* 如果是临时手动开启/关闭自动保存，可以使用快捷键`Alt+F`（挂件V1.0.8后的版本使用该快捷键，之前的使用`Alt+S`），左上角会有提示。

**编辑完后记得点击【保存】、记得点击【保存】、记得点击【保存】**     我自己使用的是手动保存模式，而且勤按Ctrl+S，所以目前还没丢过内容。

### 3、块超链接的悬浮预览

* 在白板中插入链接的方式没有变化：先复制一个链接地址（外部链接或者某个块/文档的`块超链接`），在画板中点击选中一个元素后按`Ctrl`+`K`后弹出链接输入框，粘贴链接并回车即可。
* 值得注意的是，如果插入的是块超链接，并且想在白板中悬浮预览该块的内容，你需要先打开预览开关。先单击白板空白处，然后按快捷键`Alt`+`Q`是开启预览，按快捷键`Alt`+`W`是关闭预览。默认是关闭的，在开启状态下，鼠标悬浮在白板中某个元素的链接图标上时，能弹出悬浮窗来预览该块的内容，弹出窗口后可通过按`ESC`键（若不生效可先点击一下该悬浮窗口的顶栏后再试）或者鼠标点击右上角`X`来关闭窗口。


### 4、保存块引用、修复块超链接

左上角下拉主菜单新增两个功能：`保存块引用`、`修复块超链接`

* `保存块引用`

  * 获取白板中已嵌入的块超链接，以引用块的形式插入到白板挂件块后的无序列表中，建立白板对其他文档/块的引用关系。
  * 引用关系建立后，白板文档以 `SiYuan .sy.zip`形式导出时能自动包含已嵌入白板的文档/块，保证导出白板时数据的完整性。
* `修复块超链接`

  * 一般在白板文档以 `SiYuan .sy.zip`形式被导入后，才用到该功能。
  * 该功能生效的前提是：需要在白板文档以 `SiYuan .sy.zip`形式被**导出前**就使用`保存块引用`功能来更新白板对其他块的引用关系。
  * 在导入过程中，文档/块的ID被软件重置，这通常会导致白板上已有的块超链接失效。该功能根据引用块中新旧块ID的对应关系，更新白板中的块超链接，达到修复失效块超链接的目的。


### 5、拖拽嵌入内容块

可通过拖拽的方式快速在白板中嵌入文档/块

* 1、使用拖拽方式来嵌入文档

  * 在文档树，鼠标左键按住文档后往白板拖拽即可。
* 2、使用拖拽方式来嵌入块

  * 建议先分屏，白板在左侧，文档在右侧。（白板此时建议开启`禅模式`，以减少编辑栏弹出带来的干扰）
  * 文档处于编辑状态。
  * 鼠标悬浮在块上方时，块的左上角显示块标，鼠标左键按住块标后往白板拖拽即可。

> 当前版本：将笔记中的文档/内容块拖拽到白板中生成卡片后，首次拖拽卡片前需要先单击卡片的`边缘区域`（除了中间`点击以开始交互`那部分） 来进行重新选中。

### 6、内容块检索面板

可通过快捷键`Alt`+`P`开启/关闭【内容块检索面板】，通过此面板可快速检索和嵌入检索到的内容块。

**基本使用：**

* 鼠标单击白板空白处获得焦点后，可通过快捷键`Alt`+`P`开启/关闭【内容块检索面板】
* 该面板打开后输入框自动获得焦点，可直接输入关键词，多个关键词以空格隔开。输入关键词约0.5s后，搜索结果显示在下方列表中，自动选中第一个搜索结果。
* 此时可通过键盘的上/下方向键来切换选中的搜索结果。按下`Enter`键，可将当前选中的搜索结果以嵌入文档的形式嵌入到白板的左上角。可通过上、下方向键和`Enter`键连续嵌入多个搜索结果。
* 点击【清空】按钮后，输入框清空关键词并自动获得焦点，可继续输入新的关键词来进行检索。

**其他：**

* 在笔记软件的`设置`——`编辑器`——`[[ 仅搜索文档`，若开启此项，则白板上的【内容块检索面板】的搜索结果只保留文档块。
* 在【内容块检索面板】搜索和在文档中使用`【【+关键字`搜索引用块用的是同款API：`/api/search/searchRefBlock`，因此在笔记软件的`设置`——`搜索`——`块级类型`中的设置能直接影响【内容块检索面板】中检索结果的类型。
* 在搜索结果的列表中

  * 点击搜索结果前面的图标，可跳转到对应的内容块。
  * 点击搜索结果后面的`+`图标，可将对应的搜索结果以嵌入文档的形式嵌入到白板的左上角。


### 7、在已嵌入的内容块中进行检索

右上角新增【文本搜索面板】，专用于搜索、高亮iframe中的文本。类似于网页中的文本检索。——目前，该功能的搜索范围仅限于白板内已嵌入的文档/内容块。

**基本使用：**

* 搜索前，建议先加载白板的所有iframe元素，可使用白板【缩放以适应所有元素】功能的快捷键（Shift+1）。

  * 因为iframe是懒加载的，需要处于可视区域才会加载，而文本搜索是在已加载的iframe元素中进行的。
  * 单击白板空白处后按快捷键（Shift+1）即可让所有元素都处于可视区域。
* 单击白板空白处后按快捷键（Alt+o）即可开启/关闭右上角的【文本搜索面板】，开启后自动获得焦点，可直接输入单个关键词进行检索。
* 输入单个关键词后，如果有命中的结果，默认跳转到第一个包含关键词的iframe。此时焦点仍在输入框，按下`Enter`后可切换到下一个iframe。

> **注意事项：**
>
> * 搜索结果的数量是包含关键词的iframe卡片的数量，而不是关键词命中的数量。一个iframe中可能拥有多个该关键词，有时需要手动滚动页面来查看所有高亮部分。


## 五、注意事项

* 触发`自动保存`时，鼠标右键弹出的菜单会被关闭，如果觉得这个干扰太大，可以默认关闭或者临时关闭`自动保存`。（临时关闭自动保存的快捷键是`Alt`+`F`）。
* 【嵌入网页】框的边角建议用直角，有弧度的那个边角可能会导致文档模糊。
* 在白板中渲染数据库表格的时候虽然没有滚动条，但是可以通过shift+鼠标滚轮的方式来横向滚动查看数据表格。
* 将笔记中的内容块拖拽到白板中生成卡片后，首次拖拽卡片前需要先单击卡片的`边缘区域`（除了中间`点击以开始交互`那部分） 来进行重新选中。
* 如果在已有其他内容的文档中误嵌入该挂件，可参考：[误操作插入挂件后如何撤销?](https://github.com/BryceAndJuly/Whiteboard/issues/48)


## 六、其他可选的配置

### 1、手动更改画笔的粗细

对于版本V2.1.0，打开挂件文件夹`Whiteboard`——`assets`——`index-ZsssFvwm.js`,在该js文件中搜索：

```css
n={simulatePressure:e.simulatePressure,size:e.strokeWidth*1.2,thinning
```

那个1.2是现在设置的值（已经比较小了），最开始的默认值是4点几，你可以根据自己需要更改这个值的大小来修改画笔的粗细。


### 2、是否默认将白板中的文本写入到备注中

* 保存时默认自动将白板中的文本内容写入到所在文档的`属性`——`备注`中。

这样做的好处是：在全局搜索、引用块搜索、嵌入块搜索中，除了通过白板的文档名、别名外，现在还可以通过白板中已输入的文本来检索并命中白板文档。

当然，如果你不希望白板中的文本参与到全局搜索中，可以手动关闭此功能。

打开挂件文件夹`Whiteboard`——`custom.js`，搜索：

```js
window._allowSetMemo = true;
```

改成：

```js
window._allowSetMemo = false;
```


### 3、设置固定端口（Windows端）

如果白板的`素材库`用的比较多的话，最好设置笔记的固定端口启动，因为添加进素材库的内容都是存到LocalStorage中的，设置后已添加到素材库的内容就不会在下一次启动后不显示了。

鼠标右键笔记桌面图标——`属性`——`快捷方式`——`目标(T)`，在`目标(T)`这栏的输入框中，是思源笔记可执行文件的路径，比如：

```css
D:\Siyuan\SiYuan.exe
```

在后面指定端口即可，比如：

```css
D:\Siyuan\SiYuan.exe  --port=6806
```

## 七、更新记录

[更新记录](https://github.com/BryceAndJuly/Whiteboard/issues/98#issue-4037507371)


## 八、参考与感谢

* [Excalidraw](https://github.com/excalidraw/excalidraw)
* [SiYuan](https://github.com/siyuan-note/siyuan)
* 画板（V2.0.0之前的版本）中的中文字体文件拷贝自 [superdraw](https://github.com/zuoez02/superdraw) 项目；
* 感谢插件【开放 API】的作者[Zuoqiu-Yingyi](https://github.com/Zuoqiu-Yingyi)。
