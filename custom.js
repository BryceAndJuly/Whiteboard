// 左上角的消息弹窗
let zh_CN = {
  "msgSaved": "已保存",
  "msgCopyFailed": "操作失败，未能复制元素链接",
  "msgNotElement": "刚刚复制的不是画板元素！",
  "msgIDFailed": "未能获取到画板元素的ID",
  "msgCopied": "已将链接复制到剪切板",
  "msgPreviewMode": "预览模式",
  "msgPreviewModeOff": "已关闭预览模式",
  "msgAutoSaveOff": "已关闭自动保存！",
  "msgAutoSaveOn": "编辑结束约2s后自动保存",
  "msgNoRelevantResults": "未查找到相关结果！",
  "msgNeedPlugin": "悬浮预览失败，建议先安装插件【开放API】",
  "msgSaveFailed": "保存失败，请查看控制台报错信息！",
  "msgGetFileFailed": "画板文件获取失败，手动刷新后将新建空的白板",
  "msgSetAliasFailed": "设置文档别名失败",
  "msgReadFilePathFailed": "未能读取到块属性中白板文件的路径，将自动刷新",
  "msgSetMemoFailed": "操作失败！未能将白板中的文本存入文档备注",
  "BtnSaveBlockRef": "保存块引用",
  "TipSaveBlockRef": "保存白板对其他文档/块的引用关系",
  "BtnFixBrokenLinks": "修复块超链接",
  "TipFixBrokenLinks": "根据白板的对其他文档/块的引用关系，尝试修复失效的块超链接",

  "msgNotEmbeddedBlock": "嵌入块中不支持该操作",
  "msgInsertList": "已成功嵌入引用块列表",
  "msgListUpdated": "已更新引用块列表",
  "msgNoLink": "当前白板未检测到块超链接",
  "msgNoList": "未检测到引用块列表",
  "msgFixLink": "已尝试修复失效的块超链接",
  "msgFixLinkFailed": "操作失败！未能修复失效的块超链接"
}
let en_US = {
  "msgSaved": "Saved",
  "msgCopyFailed": "Operation failed, unable to copy the element link.",
  "msgNotElement": "The copied item is not a canvas element!",
  "msgIDFailed": "Failed to get the ID of the canvas element.",
  "msgCopied": "The link has been copied to the clipboard.",
  "msgPreviewMode": "Preview mode",
  "msgPreviewModeOff": "Preview mode has been turned off.",
  "msgAutoSaveOff": "Auto-save has been turned off!",
  "msgAutoSaveOn": "Automatically save about 2 seconds after editing ends.",
  "msgNoRelevantResults": "No relevant results found!",
  "msgNeedPlugin": "Hover preview failed, it is recommended to install the plugin [Open API] first.",
  "msgSaveFailed": "Save failed, please check the console for error messages!",
  "msgGetFileFailed": "Failed to get the canvas file, a new blank whiteboard will be created after manual refresh.",
  "msgSetAliasFailed": "Failed to set document alias.",
  "msgReadFilePathFailed": "Failed to read the path of the whiteboard file in the block attributes, will automatically refresh.",
  "msgSetMemoFailed": "Operation failed! The text in the whiteboard cannot be saved in the document notes.",
  "BtnSaveBlockRef": "SaveBlockRef",
  "TipSaveBlockRef": "Save the reference relationships of the whiteboard to other documents/blocks.",
  "BtnFixBrokenLinks": "FixBrokenLinks",
  "TipFixBrokenLinks": "According to the reference relationships of the whiteboard to other documents/blocks, try to repair the invalid block hyperlinks.",

  "msgNotEmbeddedBlock": "This operation is not supported in embedded blocks.",
  "msgInsertList": "The list of reference blocks has been successfully embedded.",
  "msgListUpdated": "The list of reference blocks has been updated.",
  "msgNoLink": "No block hyperlinks have been detected in the current whiteboard.",
  "msgNoList": "The list of reference blocks has not been detected.",
  "msgFixLink": "An attempt has been made to repair the invalid block hyperlinks.",
  "msgFixLinkFailed": "Operation failed! The invalid block hyperlinks could not be repaired."
}

// 笔记软件设置语言为简体中文、繁体中文时，左上角弹出中文提示，否者弹出英文提示
window._languages = zh_CN;
let lang = window.top.siyuan.config.lang;
if (lang === "zh_CN" || lang === "zh_CHT") {
  window._languages = zh_CN;
} else {
  window._languages = en_US;
}


let myMessage = document.getElementById("myMessage");
let saveBtn = document.getElementById('saveBtn');
let refreshBtn = document.getElementById('refreshBtn');

// 请求函数
function request(url, data = null) { return new Promise((resolve, reject) => { fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), }).then((data) => resolve(data.json()), (error) => { reject(error); }).catch((err) => { console.error("请求失败:", err); }); }); };
// 防抖
function debounce(e, t = 500) { let r = null; return function (...n) { clearTimeout(r), r = setTimeout((() => { e.apply(this, n) }), t) } }

// 手动刷新
refreshBtn.addEventListener('click', () => { window.location.reload(); });
// 手动保存
saveBtn.addEventListener('click', (e) => {
  if (window._isDarwin) {
    // macOS上的保存
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "S", metaKey: true, bubbles: true }));
  } else {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "S", ctrlKey: true, bubbles: true }));
  }
}, false);


// 弹出消息弹窗
window.showMessage = function (msg, duration = 2000) {
  let dom = document.createElement('div')
  dom.innerText = msg + ` (${new Date().toLocaleString()})`;
  dom.className = 'message'
  myMessage.appendChild(dom);
  setTimeout(() => {
    if (dom.previousElementSibling) {
      myMessage.removeChild(dom.previousElementSibling)
    }
  }, duration);
}


// 在笔记软件V3.1.20中，悬浮预览API的参数已修改，需要适配
function checkVersion() {
  window._isNewVersion = false;
  let version = window?.top?.siyuan?.config?.system?.kernelVersion;
  if (version) {
    try {
      let arr = version.split(".");
      arr[1] = arr[1].padStart(2, '0');
      arr[2] = arr[2].padStart(2, '0');
      version = parseInt(arr.join(""));
      if (version >= 30120) {
        window._isNewVersion = true;
      }
    } catch (err) {
      console.error(err)
    }
  }
}
checkVersion();

// 默认关闭悬浮预览
window._allowPreview = !1;
// 当前使用的主题，深色/浅色
window._currentThemePath = localStorage?.getItem("excalidraw-theme") === "dark" ? "./theme/dark.css" : "./theme/theme.css";
// 保存时默认将白板中的文本内容写入到文档——备注中，方便全局检索
window._allowSetMemo = true;
// 是否默认开启自动保存
window._autoSave = true;
// 自动保存延时时间，单位：ms
window._autoSaveDelay = 2000;





// 初始渲染时触发的那次自动保存没有必要，去掉，减少性能消耗
window._state = false;
if (window._autoSave) {
  window._state = true;
  window._autoSave = !window._autoSave;
}


// 保存块引用
async function SaveBlockRef() {
  // 嵌入块中不生效
  if (window?.frameElement?.parentElement?.parentElement?.parentElement?.classList?.contains("protyle-wysiwyg__embed")) {
    showMessage(window._languages["msgNotEmbeddedBlock"]);
    return
  }
  // 获取白板文件的路径
  let widgetID = window.frameElement.parentElement.parentElement.getAttribute('data-node-id');
  let memoPath = `assets/ExcalidrawFiles/${widgetID}.excalidraw`
  let memoData = await request("/api/attr/getBlockAttrs", { id: widgetID });
  if (memoData?.data["custom-data-assets"]) {
    memoPath = memoData.data["custom-data-assets"];
  }
  // 获取白板中的块超链接
  let res = await request("/api/file/getFile", { path: `/data/${memoPath}` })
  let r = res.elements;
  let str = "";
  if (r && r.length > 0) {
    r.forEach(item => {
      if (item.link && item.link.match(/siyuan\:\/\/blocks\/\d{14}-\w{7}/)) {
        let id = item.link.split("siyuan://blocks/")[1];
        str += `* ((${id} '${id}'))` + "\n"
      }
    })
  }
  // 白板中没有块超链接时，需要清空块引用列表
  if (!str.trim()) {
    str = `* `;
  }
  // 将块超链接保存到当前文档，以引用块的形式
  let nextBlock = window.frameElement.parentElement.parentElement.nextSibling;
  if (!nextBlock || nextBlock?.getAttribute('data-subtype') !== "u") {
    let response = await request("/api/block/insertBlock", {
      "dataType": "markdown",
      "data": str,
      "previousID": widgetID,
    })
    if (response.code === 0) {
      showMessage(window._languages["msgInsertList"]);
    }
  } else {
    let targetBlockID = nextBlock.getAttribute("data-node-id");
    if (targetBlockID) {
      let res = await request("/api/block/updateBlock", {
        "dataType": "markdown",
        "data": str,
        "id": targetBlockID
      })
      if (res.code === 0) {
        showMessage(window._languages["msgListUpdated"]);
      }
    }
  }
}
window.addEventListener("SaveBlockRef", () => {
  SaveBlockRef().catch(err => { console.error(err) })
})


// 修复块超链接
async function FixBrokenLinks() {
  // 嵌入块中不生效
  if (window?.frameElement?.parentElement?.parentElement?.parentElement?.classList?.contains("protyle-wysiwyg__embed")) {
    showMessage(window._languages["msgNotEmbeddedBlock"]);
    return
  }
  let newIndex = {};
  let nextBlock = window?.frameElement?.parentElement?.parentElement?.nextSibling;
  let blockType = nextBlock?.getAttribute("data-subtype");
  if (!nextBlock || blockType !== "u") {
    showMessage(window._languages["msgNoList"])
  } else {
    let nextID = nextBlock?.getAttribute("data-node-id");
    let res = await request("/api/block/getChildBlocks", {
      id: nextID
    })
    if (res?.data?.length > 0) {
      res.data.forEach((item) => {
        const result = item.markdown.match(/\* \(\((\d{14}-\w{7}) \'(\d{14}-\w{7})\'\)\)/);
        if (result) {
          newIndex[result[2]] = result[1]
        }
      })
    }
    // 导入Siyuan .sy.zip时，块ID被软件重置，导致块超链接失效。需要修正块超链接
    let widgetID = window.frameElement.parentElement.parentElement.getAttribute('data-node-id');
    let memoPath = `assets/ExcalidrawFiles/${widgetID}.excalidraw`
    let memoData = await request("/api/attr/getBlockAttrs", { id: widgetID });
    if (memoData?.data["custom-data-assets"]) {
      memoPath = memoData.data["custom-data-assets"];
    }
    // 获取白板中的块超链接
    let res2 = await request("/api/file/getFile", { path: `/data/${memoPath}` })
    let r = res2.elements;
    if (r && r.length > 0) {
      r.forEach(item => {
        if (item.link && item.link.match(/siyuan\:\/\/blocks\/\d{14}-\w{7}/)) {
          let id = item.link.split("siyuan://blocks/")[1];
          if (newIndex[id]) {
            item.link = "siyuan://blocks/" + newIndex[id]
          }
        }
      })
      res2.elements = r;

      let DataBlob = new Blob([JSON.stringify(res2)], {
        type: "application/json",
      });
      let tempArr = memoPath.split("/");
      let fileName = tempArr[tempArr.length - 1];
      let DataFile = new File([DataBlob], fileName);
      let reqBody = new FormData();
      reqBody.append("path", `/data/${memoPath}`);
      reqBody.append("file", DataFile);
      fetch("/api/file/putFile", {
        body: reqBody,
        method: "POST",
        headers: {},
      })
        .then(function () {
          if (window?.top?.openAPI?.siyuan?.showMessage) {
            window.top.openAPI.siyuan.showMessage(window._languages["msgFixLink"]);
          }
          window.location.reload();
        })
        .catch((err) => {
          showMessage(window._languages["msgFixLinkFailed"]);
          console.error(err);
        });
    } else {
      showMessage(window._languages["msgNoLink"])
    }
  }
}

window.addEventListener("FixBrokenLinks", () => {
  FixBrokenLinks().catch(err => { console.error(err) })
})





// 检索面板
const searchBlocksPanel = document.getElementById('searchBlocksPanel');
const deleteBtn = document.getElementById('delete');
const keywordBtn = document.getElementById('keyword');
const resultList = document.getElementById('result');
const closeBtn = document.getElementById('close')


// 快捷键——显示/隐藏检索面板
document.addEventListener("keydown", (e => {
  if (e.altKey && "p" === e.key) {
    if (searchBlocksPanel.style.visibility === "hidden") {
      searchBlocksPanel.style.visibility = "visible";
      keywordBtn.focus();
    } else {
      searchBlocksPanel.style.visibility = "hidden";
    }
  }
}), !1)

// 关闭按钮
closeBtn.addEventListener("click", () => {
  searchBlocksPanel.style.visibility = "hidden";
})


// 清空输入框
deleteBtn.addEventListener('click', () => {
  keywordBtn.value = "";
  resultList.innerHTML = "";
  keywordBtn.focus();
})

let itemsArr = [], currentIndex = 0;
// 检索文档、标题
async function handleInput() {
  resultList.innerHTML = "";
  if (keywordBtn.value.trim()) {
    let keyword = keywordBtn.value;
    let res = await request("/api/search/searchRefBlock", {
      "k": keyword,
      "id": "10000000000000-buciyqd",
      "beforeLen": 24,
      "rootID": "10000000000000-buciyqd",
      "isDatabase": false,
      "isSquareBrackets": true,
      "reqId": Date.now()
    })
    if (res.code === 0 && res?.data?.blocks?.length > 0) {
      let docList = res.data.blocks;
      let f = document.createDocumentFragment();
      docList.forEach(item => {
        let name = "";
        let alias = "";
        let memo = "";
        let icon = ""
        if (item.name) {
          name = `<span class="alias"><svg class="icon"><use xlink:href="#iconN"></use></svg>${item.name}</span>`
        }
        if (item.alias) {
          alias = `<span class="alias"><svg class="icon"><use xlink:href="#iconA"></use></svg>${item.alias}</span>`
        }
        if (item.memo) {
          memo = `<span class="memo"><svg class="icon"><use xlink:href="#iconM"></use></svg>${item.memo}</span>`
        }
        if (item.type === "NodeHeading") {
          switch (item.subType) {
            case "h1":
              icon = `<svg class="icon"><use xlink:href="#iconHeadings"></use></svg>`
              break;
            case "h2":
              icon = `<svg class="icon"><use xlink:href="#iconH2"></use></svg>`
              break;
            case "h3":
              icon = `<svg class="icon"><use xlink:href="#iconH3"></use></svg>`
              break;
            case "h4":
              icon = `<svg class="icon"><use xlink:href="#iconH4"></use></svg>`
              break;
            case "h5":
              icon = `<svg class="icon"><use xlink:href="#iconH5"></use></svg>`
              break;
            case "h6":
              icon = `<svg class="icon"><use xlink:href="#iconH6"></use></svg>`
              break;
            default:
              icon = `<svg class="icon"><use xlink:href="#iconHeadings"></use></svg>`
          }
        } else {
          switch (item.type) {
            case "NodeDocument":
              icon = `📄`
              break;
            case "NodeParagraph":
              icon = `<svg class="icon"><use xlink:href="#iconParagraph"></use></svg>`
              break;
            case "NodeMathBlock":
              icon = `<svg class="icon"><use xlink:href="#iconMath"></use></svg>`
              break;
            case "NodeTable":
              icon = `<svg class="icon"><use xlink:href="#iconTable"></use></svg>`
              break;
            case "NodeCodeBlock":
              icon = `<svg class="icon"><use xlink:href="#iconCode"></use></svg>`
              break;
            case "NodeHTMLBlock":
              icon = `<svg class="icon"><use xlink:href="#iconHTML5"></use></svg>`
              break;
            case "NodeAttributeView":
              icon = `<svg class="icon"><use xlink:href="#iconDatabase"></use></svg>`
              break;
            case "NodeBlockQueryEmbed":
              icon = `<svg class="icon"><use xlink:href="#iconSQL"></use></svg>`
              break;
            case "NodeVideo":
              icon = `<svg class="icon"><use xlink:href="#iconVideo"></use></svg>`
              break;
            case "NodeAudio":
              icon = `<svg class="icon"><use xlink:href="#iconRecord"></use></svg>`
              break;
            case "NodeIFrame":
              icon = `<svg class="icon"><use xlink:href="#iconLanguage"></use></svg>`
              break;
            case "NodeWidget":
              icon = `<svg class="icon"><use xlink:href="#iconBoth"></use></svg>`
              break;
            case "NodeBlockquote":
              icon = `<svg class="icon"><use xlink:href="#iconQuote"></use></svg>`
              break;
            case "NodeSuperBlock":
              icon = `<svg class="icon"><use xlink:href="#iconSuper"></use></svg>`
              break;
            case "NodeList":
              icon = `<svg class="icon"><use xlink:href="#iconList"></use></svg>`
              break;
            case "NodeListItem":
              icon = `<svg class="icon"><use xlink:href="#iconListItem"></use></svg>`
              break;
          }
        }
        let dom = document.createElement('div');
        dom.className = "searchItem";
        dom.innerHTML = `${name}${alias}${memo}<div class="path">${item.hPath}</div>
                <div class="title"><span class="link" data-href="siyuan://blocks/${item.id}" >${icon}</span> ${item.content}</div> <div class="insertDoc" data-href="siyuan://blocks/${item.id}" >➕</div>`;
        f.append(dom);

      });
      resultList.append(f);
      // 更新搜索结果
      itemsArr = resultList.querySelectorAll("div.searchItem");
      currentIndex = 0;
      itemsArr[currentIndex].classList.add("active");
    } else {
      resultList.innerHTML = "未查询到相关结果";
    }
  }

}

keywordBtn.addEventListener('input', debounce(handleInput));

// 文档名、标题名前的图标，点击跳转到对应的块
resultList.addEventListener("click", (e) => {
  if (e.target.tagName === "SPAN" && e.target.className === "link") {
    e.stopPropagation();
    let url = e.target.getAttribute("data-href");
    window.top.openFileByURL(url);
  } else if (e.target.tagName === "svg") {
    e.stopPropagation();
    let url = e.target.parentElement.getAttribute("data-href");
    window.top.openFileByURL(url);

  } else if (e.target.tagName === "use") {
    e.stopPropagation();
    let url = e.target.parentElement.parentElement.getAttribute("data-href");
    window.top.openFileByURL(url);
  } else if (e.target.tagName === "DIV" && e.target.className === "insertDoc") {
    e.stopPropagation();
    let url = e.target.getAttribute("data-href");
    window.dispatchEvent(new CustomEvent("createEmbedElement", { detail: { link: url } }));
  }
}, false)




// 上、下箭头切换搜索结果
keywordBtn.addEventListener("keydown", (e => {
  if ("ArrowDown" === e.key) {
    itemsArr[currentIndex].classList.remove("active");
    if (currentIndex + 1 < itemsArr.length) {
      currentIndex += 1;
      itemsArr[currentIndex].classList.add('active');
    } else {
      currentIndex = 0;
      itemsArr[currentIndex].classList.add('active');
    }
    let offsetTop = itemsArr[currentIndex].offsetTop;
    let gap = resultList.offsetHeight - 100;
    resultList.scrollTo(0, offsetTop < gap ? 0 : offsetTop - gap);
  }

  if ("ArrowUp" === e.key) {
    e.stopPropagation();
    e.preventDefault();
    itemsArr[currentIndex].classList.remove("active");
    if (currentIndex > 0) {
      currentIndex -= 1;
      itemsArr[currentIndex].classList.add('active');
    } else {
      currentIndex = itemsArr.length - 1;
      itemsArr[currentIndex].classList.add('active');
    }
    let offsetTop = itemsArr[currentIndex].offsetTop;
    let gap = resultList.offsetHeight - 100;
    resultList.scrollTo(0, offsetTop < gap ? 0 : offsetTop - gap);

  }
  //  按Enter嵌入当前已选中的文档块或标题块
  if ("Enter" === e.key) {
    let selectedResult = resultList.querySelector("div.searchItem.active");
    if (selectedResult) {
      let url = selectedResult.querySelector("span.link")?.getAttribute("data-href");
      if (url) { window.dispatchEvent(new CustomEvent("createEmbedElement", { detail: { link: url } })); }
    }

  }
}), false);

// 【Mermaid至图表】界面的超链接
document.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    e.preventDefault();
    e.stopPropagation();
    try {
      let url = e.target.getAttribute("href");
      window.top.open(url);
    } catch (err) { console.error(err) }
  }
}, false)

// 快捷键
document.addEventListener("keydown", (e => {
  // 开启预览
  if (e.altKey && "q" === e.key) {
    window._allowPreview = !0;
    showMessage(window._languages["msgPreviewMode"])
  }
  // 关闭预览
  if (e.altKey && "w" === e.key) {
    window._allowPreview = !1;
    showMessage(window._languages["msgPreviewModeOff"]);
  }
  // 临时开启/关闭【自动保存】
  if (e.altKey && "f" === e.key) {
    window._autoSave = !window._autoSave;
    if (!window._autoSave) {
      showMessage(window._languages["msgAutoSaveOff"])
    } else {
      showMessage(window._languages["msgAutoSaveOn"])
    }
  }
  // 全屏
  if (e.altKey && "y" === e.key) {
    if (window?.frameElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.classList?.contains("protyle")) {
      if (window?.frameElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.classList?.contains("fullscreen")) {
        window.frameElement.parentElement.parentElement.parentElement.parentElement.parentElement.classList.remove("fullscreen");
      } else {
        window.frameElement.parentElement.parentElement.parentElement.parentElement.parentElement.classList.add("fullscreen");
      }
    }
  }
}), !0);


// 检索面板使用深色主题
function setColor() {
  if (localStorage?.getItem("excalidraw-theme") === "dark") {
    try {
      let pannel = document.getElementById("searchBlocksPanel");
      pannel.classList.add("dark");
    } catch (err) {
      console.error(err);
    }
  }
}
setColor();