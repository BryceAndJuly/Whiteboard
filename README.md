## 一、当前版本

### V1.5.0

见顶部预览图

左上角主菜单新增两个功能：`保存块引用`、`修复块超链接`

* `保存块引用`

  * 获取白板中已嵌入的块超链接，以引用块的形式插入到白板挂件块后的无序列表中，建立白板对其他文档/块的引用关系。
  * 引用关系建立后，白板文档以 `SiYuan .sy.zip`形式导出时能自动包含已嵌入白板的文档/块，保证导出白板时数据的完整性。
* `修复块超链接`

  * 一般在白板文档以 `SiYuan .sy.zip`形式被导入后，才用到该功能。
  * 该功能生效的前提是：需要在白板文档以 `SiYuan .sy.zip`形式被**导出前**就使用`保存块引用`功能来更新白板对其他块的引用关系。
  * 在导入过程中，文档/块的ID被软件重置，这通常会导致白板上已有的块超链接失效。该功能根据引用块中新旧块ID的对应关系，更新白板中的块超链接，达到修复失效块超链接的目的。


白板文档中新增了引用块组成的无序列表，需要更新CSS片段来调整外观。

其中第一个样式是新增的，后两个样式是在原CSS片段上稍作修改。完整的CSS片段已更新到下文的：`三、使用前的设置`——`1、添加CSS代码片段`

```js
/* 隐藏白板文档中的无序列表 */
.iframe[custom-data-assets^="assets/ExcalidrawFiles/"] ~ .list[data-subtype="u"] {
  display: none !important;
}
/* 在不聚焦的情况下，隐藏白板文档顶栏的面包屑 */
.protyle-breadcrumb:has(button.protyle-breadcrumb__icon.ariaLabel.fn__none):has(+ .protyle-content.protyle-content--transition > .protyle-wysiwyg.protyle-wysiwyg--attr[alias="whiteboard"]) {
    display: none !important;
}
/* 白板文档作为嵌入块嵌入到其他文档时——隐藏底边可能出现的空白行 */
.protyle-wysiwyg__embed>.iframe[custom-data-assets^="assets/ExcalidrawFiles/"] ~ .p {
    display: none;
}
```


---

对于当前版本：**V1.5.0**

如果你**不想默认开启自动保存功能**，可以使用VS Code之类的编辑器打开挂件文件夹`Whiteboard`​——`index.js`​，

搜索：

```js
window._autoSave = true;
```

改成：

```js
window._autoSave = false;
```

如果你想**调整自动保存的延时时间**（默认是2000ms），可以打开挂件文件夹`Whiteboard`​——`assets`​——`index-0e2f08e2.js`​

搜索：

```js
window._isDarwin?document.dispatchEvent(new KeyboardEvent("keydown",{key:"S",metaKey:!0,bubbles:!1})):document.dispatchEvent(new KeyboardEvent("keydown",{key:"S",ctrlKey:!0,bubbles:!1}))},2000));
```

将最后那个数值：2000 改成你想设置的数值即可，单位是毫秒。

---

## 二、简介

一个基于[Excalidraw](https://github.com/excalidraw/excalidraw)的挂件，嵌入后会自动铺满文档，将一个文档当成一个白板。融合了块悬浮预览、关键词搜索定位、画板内不同元素之间的跳转等小功能。

可通过引用文档的方式来引用白板。如果需要将画好的白板导出并分享给别人，可以使用白板所在文档的导出/导入`SiYuan .sy.zip`​文件的功能。每个白板绑定一个存储在`assets/ExcalidrawFiles/`中的文件，文档删除后白板绑定的文件也会作为【未引用的资源】来方便手动删除。

## 三、使用前的设置

### 1、添加CSS代码片段

白板创建时，会自动设置所在文档的属性——`别名`​​的值为：`whiteboard`​​，这是为了解决打开白板所在文档时页面闪现出文档标题的问题。相应的，你需要在笔记软件的`设置`​​——`外观`​​中添加对应的CSS代码片段：

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
.protyle-top:has(+ .protyle-wysiwyg.protyle-wysiwyg--attr[alias="whiteboard"]){
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

还有一个可选的样式，是设置悬浮窗大小的，个人感觉默认的窗口有点过于宽了才设置的，这个不重要，你可以根据自己的需要来决定是否添加。

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

需要在笔记软件的`设置`​——`外观`​中添加对应的JS代码片段来辅助获取当前拖拽块的ID——详情见文档底部`更新记录`​中关于挂件`V1.1.0`​的更新说明。

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
* 在`设置`​​​——`集市`​​​——​`插件`​​​页面，下载并启用插件`开放 API`​​​即可。

‍

## 四、开始使用

### 1、插入白板

下载完挂件后，在新建的空白文档中设置好文档标题后，输入`/g`​并回车，在挂件列表选择`Whiteboard`​即可在当前文档中插入白板，默认铺满文档。

### 2、数据的保存

单击左上角的`保存`​​​按钮或者使用快捷键`Ctrl`​​​+`S`​​​来保存白板的数据。左上角会弹出提示：`已保存`​​​​​​​

白板的数据保存在：`assets/ExcalidrawFiles/ `​​​​​文件夹中，文件路径类似于：

```css
assets/ExcalidrawFiles/20231227015401-w0olmpi.excalidraw
```

使用白板挂件块的ID作为文件名。

* 默认开启`自动保存`​，一般在增、删或移动元素后约2s触发保存。如果想默认关闭自动保存或者调整延时时间，可以参考文档顶部描述的方法。
* 如果是临时手动开启/关闭自动保存，可以使用快捷键`Alt+F`​（挂件V1.0.8后的版本使用该快捷键，之前的使用`Alt+S`​），左上角会有提示。

**编辑完后记得【点击保存】、记得【点击保存】、记得【点击保存】，不然什么都没了。**    我自己使用的是手动保存模式，而且勤按Ctrl+S，所以目前还没丢过内容。

### 3、块超链接的悬浮预览

* 在白板中插入链接的方式没有变化：先复制一个链接地址（外部链接或者某个块/文档的`块超链接`​​​​​），在画板中点击选中一个元素后按`Ctrl`​​​​​+`K`​​​​​后弹出链接输入框，粘贴链接并回车即可。
* 值得注意的是，如果插入的是块超链接，并且想在白板中悬浮预览该块的内容，你需要先打开预览开关。先单击白板空白处，然后按快捷键`Alt`​+`Q`​是开启预览，按快捷键`Alt`​+`W`​是关闭预览。默认是关闭的，在开启状态下，鼠标悬浮在白板中某个元素的链接图标上时，能弹出悬浮窗来预览该块的内容，弹出窗口后可通过按`ESC`​键（若不生效可先点击一下预览的文档）或者鼠标点击右上角`X`​来关闭窗口。

### 4、关键字的搜索、定位

* 可通过搜索框来搜索、定位白板内的文字，支持多个关键字（以空格隔开）。想要定位准的话需要画板重置缩放比例为：100%，在左下角设置。
* 搜索前建议先确认内容已经保存，因为搜索的内容是从保存的白板文件中读取的，如果你新增了内容且没保存，那么搜索到的结果可能是不全的。
* 先单击白板空白处获得焦点，然后按快捷键​`Alt`​​+`T`​​​​就可以唤出/关闭搜索框。唤出后点击白板空白处也可以关闭搜索框。
* 唤出的搜索框自动获取焦点，此时可以直接输入要查询的关键字，关键字之间以空格隔开，匹配到的结果会在约0.5s后显示在下方列表中。
* 弹出匹配的结果后，搜索框仍获得焦点，此时通过键盘的上、下方向键可以切换并定位匹配结果的位置。当然， 你还可以直接鼠标单击某个匹配的结果来定位它的位置。

### 5、白板内元素之间的跳转

* 比如：画板内要从元素A跳转到元素B。（此时画板缩放比例为：100%）
* 先选中元素B，按​`Ctrl`​​​​+​`C`​​​​来复制该元素，然后单击选中元素A，按住​`Ctrl`​​​​后，依次按​`J`​​​​、​`K`​​​​、​`V`​​​​后回车，即可生成链接。

  * 这个过程中，​`Ctrl`​​​​+​`J`​​​​是从刚刚复制的元素中获取元素ID，生成类似：`excalidraw://nFrmqWgyT-lXdsS15Yswu`​​​​这样的链接并复制到剪切板，此时左上角会提示：已将链接复制到剪切板。
  * 后面的​`Ctrl`​​​​+​`K`​​​​弹出链接输入框，​`Ctrl`​​​​+`V`​​​​粘贴就是常规的插入链接的方式了。
* 单击元素A上的链接图标，即可跳转到元素B的位置。（只适用于画板内，在画板外使用该链接并不能跳转）
* 如果跳转失败，可以先点击下【保存】按钮后再试试。


## 五、注意事项

* 触发`自动保存`时，鼠标右键弹出的菜单会被关闭，如果觉得这个干扰太大，可以默认关闭或者临时关闭`自动保存`。（临时关闭自动保存的快捷键是`Alt`+`F`）。
* 刚打开白板或者刷新白板后，在白板中随便挪动一下鼠标就会开始渲染已嵌入的文档。
* 【嵌入网页】框的边角建议用直角，有弧度的那个边角可能会导致文档模糊。
* 【嵌入网页】框中渲染的文档如果在翻页或者鼠标滚动过程中出现模糊，可以先把鼠标移到框外来恢复清晰度。
* 如果嵌入的文档中有`Mermaid`图表，建议保存的时候让对应的文档处于白板可视区域内（通过缩小等方式），这样下次打开的时候能保证图表正常渲染。
* 在白板中渲染数据库表格的时候虽然没有滚动条，但是可以通过shift+鼠标滚轮的方式来横向滚动查看数据表格。


## 六、其他可选的配置

### 1、手动更改画笔的粗细

对于版本V1.5.0，打开挂件文件夹`Whiteboard`​——`assets`​——`index-0e2f08e2.js`​,在该js文件中搜索：

```css
simulatePressure:e.simulatePressure,size:e.strokeWidth*1.2,thinning
```

那个1.2是现在设置的值（已经比较小了），最开始的默认值是4点几，你可以根据自己需要更改这个值的大小来修改画笔的粗细。

### 2、设置固定端口（Windows端）

如果白板的`素材库`​​​​用的比较多的话，最好设置笔记的固定端口启动，因为添加进素材库的内容都是存到LocalStorage中的，设置后已添加到素材库的内容就不会在下一次启动后不显示了。

鼠标右键笔记桌面图标——`属性`​​​​——`快捷方式`​​​​——`目标(T)`​​​​，在`目标(T)`​​​​这栏的输入框中，是思源笔记可执行文件的路径，比如：

```css
D:\Siyuan\SiYuan.exe
```

在后面指定端口即可，比如：

```css
D:\Siyuan\SiYuan.exe  --port=6806
```




## 七、更新记录


### V1.0.8

* Excalidraw版本升级，0.15.0——>0.17.0
* 支持嵌入笔记内文档（预览的形式，不可编辑），效果见顶部那个预览图。

  > 基本用法：
  >
  > * 白板顶部工具栏有个【嵌入网页】的功能，点击后按住鼠标拖拽出一个Web-Embed的框，然后把笔记内的块超链接【形如：siyuan://blocks/20200812220555-lj3enxa】粘贴进链接框并回车，然后**随便挪动一下鼠标**就开始渲染那个块/文档了。
  > * 在Web-Embed框里要滚动页面查看内容的话，需要先把鼠标挪到框中央并点击按钮【点击开始交互】，框里的块引用、超链接点击能跳转。
  > * 预览的文档里有些块还没处理，像公式、HTML块、Mermaid、嵌入块等，但目前用来看个大概还是可以的。
  > * 如果刚打开白板或者刷新后看到那个Web-Embed框是空白的，只需要在白板里随便挪一下鼠标就开始渲染了。
  > * Web-Embed框的边角建议用直角，有弧度的那个边角可能会导致文档模糊。
  > * 预览的文档所用的主题样式就在挂件文件夹`Whiteboard\theme\theme.css`​里。
  >
* 去掉【清除文字之间的空格】功能；
* 自动保存延时改为2s，自动保存也会弹窗提醒（不提醒一下都不知道有没有保存），同时为了减少干扰，已将弹窗的颜色调的很淡。
* 自动保存开启/关闭的快捷键改为`Alt`​+`F`​，主要是因为新版的`Alt`​+`S`​快捷键被功能【吸附至对象】占用了。
* 白板文档作为嵌入块出现在其他文档时，底部可能有空行，让白板看起来不好看，可用CSS片段来隐藏掉：

```js
   /* 白板嵌入块——隐藏底边的空白行 */
   .protyle-wysiwyg__embed > .iframe[custom-data-assets^="assets/ExcalidrawFiles/"] + .p{
     display:none;
   }
```

---

### V1.0.9

* 修复样式问题：在移动端，【保存】、【刷新】按钮无法自动调整位置导致被遮挡。
* 关于全屏快捷键在Excalidraw V0.17.0被移除的问题 。新增全屏快捷键`Alt`​+`Y`​，这个快捷键跟笔记里其他文档的全屏快捷键保持一致，点击白板空白处后，按该快捷键可进入/退出全屏模式。

**Web-Embed相关**：

* 如果嵌入的是文档的块超链接，则自动插入文档标题。
* 预览文档中支持渲染katex公式、Mermaid。
* 对于预览文档中的嵌入块，就不继续查询渲染了，处理为直接显示对应的SQL 文本。

---

### V1.1.0

* 样式调整：对`Web-Embed`​中嵌入的文档，基础字体大小从14px调整为16px。
* 支持通过拖拽的方式快速嵌入文档/块。

  > * 需要先添加一个JS代码片段来辅助获取当前拖拽块的ID。（见下方的代码块），在笔记软件的<kbd>设置</kbd>​——<kbd>外观</kbd>​——<kbd>代码片段</kbd>​——<kbd>JS</kbd>​中添加。
  > * 1、使用拖拽方式来嵌入文档
  >
  >   * 在文档树，鼠标左键按住文档后往白板拖拽即可。
  > * 2、使用拖拽方式来嵌入块
  >
  >   * 建议先分屏，白板在左侧，文档在右侧。（白板此时建议开启`禅模式`​，以减少编辑栏弹出带来的干扰）
  >   * 文档处于编辑状态。
  >   * 鼠标悬浮在块上方时，块的左上角显示块标，鼠标左键按住块标后往白板拖拽即可。
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

* 删掉sourcemap文件，减小挂件包的体积。
* 预览文档中支持渲染嵌入块。
* 预览文档中支持渲染数据库表格视图（Database table view）。
* 优化消息弹窗，加上时间戳并在样式上减少干扰，保留最后一个通知。
* 白板中预览文档的样式调整：减少文档内边距（边缘空白），theme.css中引入了超链接图标。

Tips:

1. 预览文档如果在翻页或者鼠标滚动过程中出现模糊，可以先把鼠标移出`Web-Embed`​框来恢复清晰度。
2. 如果预览文档中有Mermaid图表，建议保存的时候让对应的文档处于白板可视区域内（通过白板的缩小等方式），这样下次打开的时候能保证正常渲染。
3. 在白板中渲染数据库表格视图的时候虽然没有滚动条，但是可以通过`shift`​+鼠标滚轮的方式来横向滚动查看数据表格。

---

### V1.2.1

调试时对应的笔记版本：`V3.0.3`​

修复预览文档中的数据表格渲染问题：

* 表头使用自定义图标（非默认图标）时会导致该表格渲染失败。
* 【超链接】列的链接点击后无法跳转。
* 【关联】列单元格内容未能正常渲染
* 【创建时间】、【更新时间】列会导致该表格渲染失败。

样式修改：

* 【保存】、【刷新】按钮字号调小，跟旁边的【素材库】保持一致，看起来协调一点。
* 拖拽进白板的嵌入文档：文档边框颜色调淡一点（由`#1e1e1e`​调为`#c0c0c0`​）
* 拖拽进白板的嵌入文档：边角默认用直角，不再跟随当前状态，避免出现文档模糊的问题。


### V1.3.0

* 白板中的嵌入文档支持代码高亮，见顶部预览图。
* 处理在当前版本（SiYuan V3.0.16）中，隐藏白板所在文档标题的CSS代码片段失效的问题。

之前隐藏白板所在文档标题的CSS片段是：

```css
/* 白板挂件——隐藏当前文档的标题、面包屑 */
.protyle-title.protyle-wysiwyg--attr:has(+ .protyle-wysiwyg.protyle-wysiwyg--attr[alias="whiteboard"]){
 display: none !important;
}

.protyle-breadcrumb:has(+ .protyle-content.protyle-content--transition > .protyle-wysiwyg.protyle-wysiwyg--attr[alias="whiteboard"]) {
  display: none !important;
}
```

由于新版笔记软件的改动，需要再加上：

```css
.protyle-top:has(+ .protyle-wysiwyg.protyle-wysiwyg--attr[alias="whiteboard"]){
 display: none !important;
}
```

### V1.3.1

这版在上一版本(V1.3.0)的基础上，只更新了CSS片段来适配思源笔记当前最新版本（V3.1.5），其他并无升级。如果你已经下载了V1.3.0，那么只需要微调CSS片段即可，**无需下载更新**。

1、处理问题：挂件铺满文档的过程中，左侧出现明显闪烁的输入光标。

需要添加一个CSS片段。在<kbd>设置（Alt+P）</kbd>——<kbd>外观</kbd>——<kbd>代码片段</kbd>——<kbd>CSS</kbd>界面，添加以下CSS：

```css
.iframe ,iframe{
    -webkit-user-modify: read-only;
}
```


2、微调隐藏面包屑和文档标题的CSS片段（将` visibility: hidden;`改为`display: none !important;`）以减少挂件所在文档中面包屑的闪烁。见上文中：`三、使用前的设置`——`1、添加CSS代码片段`章节。


### V1.3.2
* 保存时自动将白板中的文本内容写入到所在文档的`属性`——`备注`中。

这样做的好处是：在全局搜索、引用块搜索、嵌入块搜索中，除了通过白板的文档名、别名外，现在还可以通过白板中已输入的文本来检索并命中白板文档。

当然，如果你不希望白板中的文本参与到全局搜索中，可以手动关闭此功能。

打开挂件文件夹`Whiteboard`——`index.js`，搜索：

```js
 window._allowSetMemo = true;
```

改成：

```js
 window._allowSetMemo = false;
```


### V1.3.3

见顶部预览图。

* 调整中文手写字体`Whiteboard/Virgil.woff2`中的部分字形（字母和部分常用符号）。
* 处理样式问题：在当前最新版笔记软件(V3.1.8)，将文档嵌入白板时，文档中的代码部分未正常换行。

字形这个比较主观，如果不适应替换后的版本，可以替换回之前的字体文件。

至于代码块样式，在V3.0.3其实没有这个问题，可能是受到版本改动的影响，所以需要适配一下。



### V1.4.0

见顶部预览图，具体改动如下：

1. 优化容器中的文本换行。
2. 根据白板当前模式（深色/浅色），嵌入白板的文档自动切换深色/浅色主题。
3. 新增英文版说明文档`README_en_US.md`，左上角的提示信息可根据笔记当前设置的语言来切换中文/英文。
4. 【嵌入网页】功能解除默认的域名限制，支持`https://`或者`http://`开头的链接。
5. 【保存】、【刷新】按钮换成图标。


对应的说明：

1. 这个改动迁移自`Excalidraw`原仓库，解决了往方框等文字容器中粘贴文本时换行异常的问题。 具体改动可参考大佬提交的`Pull request` [https://github.com/excalidraw/excalidraw/pull/8715/files](https://github.com/excalidraw/excalidraw/pull/8715/files)
2. 注意：白板深色/浅色模式切换后，需要刷新白板或者重新打开白板才能生效。深色主题对应文件：`Whiteboard/theme/dark.css`，浅色主题对应文件：`Whiteboard/theme/theme.css`
3. 在笔记软件的`设置`——`外观`——`语言`，当设置的语言是简体或者繁体时，白板左上角的提示为中文。设置成其他语言时，白板左上角的提示为英文。
4. 如果网站本身限制嵌入，可能会导致加载失败。




## 八、参考与感谢

* [Excalidraw项目](https://github.com/excalidraw/excalidraw)
* [SiYuan](https://github.com/siyuan-note/siyuan)
* 画板中的中文字体文件拷贝自 [superdraw](https://github.com/zuoez02/superdraw) 项目；
* 感谢插件【开放 API】的作者[Zuoqiu-Yingyi](https://github.com/Zuoqiu-Yingyi)。
