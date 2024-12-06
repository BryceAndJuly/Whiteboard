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
refreshBtn.addEventListener('click', () => { window.location.reload(); })
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
// 保存时默认将白板中的文本内容写入到文档——备注中，方便全局检索
window._allowSetMemo = true;
// 当前使用的主题，深色/浅色
window._currentThemePath = localStorage?.getItem("excalidraw-theme") === "dark" ? "./theme/dark.css" : "./theme/theme.css";
// 默认关闭悬浮预览
window._allowPreview = !1;
// 是否默认开启自动保存
window._autoSave = true;
// 初始渲染时触发的那次自动保存没有必要，去掉，减少性能消耗
window._state = false;
if (window._autoSave) {
  window._state = true;
  window._autoSave = !window._autoSave;
}
// 复制内容到剪切板
function patseIntoClipboard(txt) {
  let status = false
  const input = document.createElement('textarea')
  document.body.appendChild(input)
  input.innerHTML = txt
  input.select()
  if (document.execCommand('copy')) {
    document.execCommand('copy')
    status = true
  } else {
    showMessage(window._languages["msgCopyFailed"])
  }
  document.body.removeChild(input)
  return status
}
async function getElementIDFromClipboadr() {
  let str = await navigator.clipboard.readText()
  if (!str.startsWith(`{"type":"excalidraw/clipboard"`)) {
    showMessage(window._languages["msgNotElement"])
    return null
  }
  let result = str.match(/\"id\"\:\"(.+?)\"/);
  let id;
  if (result && result[1]) {
    id = result[1]
  } else {
    showMessage(window._languages["msgIDFailed"])
    return null
  }
  let status = patseIntoClipboard(`excalidraw://${id}`);
  showMessage(window._languages["msgCopied"])
}
// 快捷键
document.addEventListener("keydown", (e => {
  if (e.altKey && "q" === e.key) {
    window._allowPreview = !0;
    showMessage(window._languages["msgPreviewMode"])
  }
  if (e.altKey && "w" === e.key) {
    window._allowPreview = !1;
    showMessage(window._languages["msgPreviewModeOff"]);
  }
  if (e.altKey && "f" === e.key) {
    window._autoSave = !window._autoSave;
    if (!window._autoSave) {
      showMessage(window._languages["msgAutoSaveOff"])
    } else {
      showMessage(window._languages["msgAutoSaveOn"])
    }
  }
  if (e.ctrlKey && e.key === "j") {
    getElementIDFromClipboadr();
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
// 手动保存
saveBtn.addEventListener('click', (e) => {
  if (window._isDarwin) {
    // macOS上的保存
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "S", metaKey: true, bubbles: true }));
  } else {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "S", ctrlKey: true, bubbles: true }));
  }
}, false);

function request(url, data = null) { return new Promise((resolve, reject) => { fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), }).then((data) => resolve(data.json()), (error) => { reject(error); }).catch((err) => { console.error("请求失败:", err); }); }); };
// 搜素关键字
(async () => {
  const searchPanel = document.getElementById("searchPanel"),
    keywordInput = document.getElementById("keywordInput"),
    targetArrContainer = document.getElementById("targetArrContainer");
  async function itemsContainsKeyword(e) {
    let t = []; e = e.trim();
    let widgetID = window.frameElement.parentElement.parentElement.getAttribute('data-node-id');
    let memoPath = `assets/ExcalidrawFiles/${widgetID}.excalidraw`
    let memoData = await request("/api/attr/getBlockAttrs", { id: widgetID });
    if (memoData?.data["custom-data-assets"]) {
      memoPath = memoData.data["custom-data-assets"];
    }
    let res = await request("/api/file/getFile", { path: `/data/${memoPath}` })
    let r = res.elements;
    if (r && e.length > 0) {
      let keywordArr = e.split(' ');
      keywordArr = keywordArr.filter((item) => item.trim());
      keywordArr = Array.from(new Set(keywordArr));
      for (let n of r) if ("text" === n.type && keywordArr.every((item) => new RegExp(`${item}`, "i").test(n.text))) {
        n.text = n.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        keywordArr.forEach((item) => {
          let r = new RegExp(`${item}`, "ig");
          n.text = n.text.replace(r, (function (e) { return ` ${e} ` }));
        });
        keywordArr.forEach((item) => {
          let r = new RegExp(` ${item} `, "ig");
          n.text = n.text.replace(r, (function (e) { return `<span style="background-color:#ffe955;color:black;">${e.trim()}</span>` }));
        });
        t.push([n.text, n.id, n.x, n.y]);
      }
    }
    return t
  }
  function debounce(e, t = 500) { let r = null; return function (...n) { clearTimeout(r), r = setTimeout((() => { e.apply(this, n) }), t) } }
  let itemsArr = [], currentIndex = -1;
  async function handleKeywordSubmit() {
    const e = keywordInput.value.trim();
    if (itemsArr = [], e.length > 0) if (targetArrContainer.innerHTML = "", itemsArr = await itemsContainsKeyword(e), itemsArr.length > 0) {
      const e = document.createDocumentFragment(); itemsArr.forEach((t => { const r = document.createElement("div"); r.className = "ExcalidrawItem", r.style.marginTop = "6px", r.style.color = "black", r.style.backgroundColor = "#ffffff", r.style.borderRadius = "4px", r.style.padding = "3px", r.setAttribute("data-x", t[2]), r.setAttribute("data-y", t[3]), r.innerHTML = `${t[0]}`, e.appendChild(r) })), targetArrContainer.appendChild(e)
    } else targetArrContainer.innerHTML = window._languages["msgNoRelevantResults"], currentIndex = -1; else targetArrContainer.innerHTML = window._languages["msgNoRelevantResults"], currentIndex = -1
  }
  keywordInput.addEventListener("input", debounce(handleKeywordSubmit), !1),
    targetArrContainer.addEventListener("click", (e => {
      e.stopPropagation(); let t = targetArrContainer.querySelectorAll("div.ExcalidrawItem");
      if (e.target.classList.contains("ExcalidrawItem")) { const r = parseInt(e.target.getAttribute("data-x")), n = parseInt(e.target.getAttribute("data-y")); window.dispatchEvent(new CustomEvent("searchKeyword", { detail: { x: r, y: n } })); for (let r = 0; r < t.length; r++)e.target !== t[r] || t[r].classList.contains("active") ? t[r].classList.remove("active") : (t[r].classList.add("active"), currentIndex = r) }
      else if ("SPAN" === e.target.tagName && e.target.parentElement.classList.contains("ExcalidrawItem")) {
        const r = parseInt(e.target.parentElement.getAttribute("data-x")), n = parseInt(e.target.parentElement.getAttribute("data-y"));
        window.dispatchEvent(new CustomEvent("searchKeyword", { detail: { x: r, y: n } }));
        for (let r = 0; r < t.length; r++)e.target.parentElement !== t[r] || t[r].classList.contains("active") ? t[r].classList.remove("active") : t[r].classList.add("active")
      }
    }), !1),
    searchPanel.addEventListener("click", (e => { e.stopPropagation() }), !1), document.addEventListener("keydown", (e => { e.altKey && "t" === e.key && (searchPanel.style.visibility = "hidden" === searchPanel.style.visibility ? "visible" : "hidden", keywordInput.focus(), currentIndex = -1) }), !1), document.addEventListener("click", (e => { "visible" === searchPanel.style.visibility && (searchPanel.style.visibility = "hidden") }), !1), keywordInput.addEventListener("keydown", (e => { if (itemsArr.length > 0 && ("ArrowDown" === e.key || "ArrowUp" === e.key)) { "ArrowDown" === e.key ? currentIndex++ : "ArrowUp" === e.key && (e.preventDefault(), currentIndex--), currentIndex > itemsArr.length - 1 && (currentIndex = 0), currentIndex < 0 && (currentIndex = itemsArr.length - 1); let t = targetArrContainer.querySelectorAll("div.ExcalidrawItem"); for (let e = 0; e < t.length; e++)e !== currentIndex || t[e].classList.contains("active") ? t[e].classList.remove("active") : t[e].classList.add("active"); const r = parseInt(itemsArr[currentIndex][2]), n = parseInt(itemsArr[currentIndex][3]); window.dispatchEvent(new CustomEvent("searchKeyword", { detail: { x: r, y: n } })) } }), !1);
})()


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

