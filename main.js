import { language } from './config.js';

; let myMessage = document.getElementById("myMessage");
let saveBtn = document.getElementById('saveBtn');
saveBtn.innerText = language["saveBtn"]
let refreshBtn = document.getElementById('refreshBtn');
refreshBtn.innerText = language["refreshBtn"]


refreshBtn.addEventListener('click', () => { window.location.reload(); })
// 弹出消息弹窗
window.showMessage = function (msg, duration = 2000) {
    let dom = document.createElement('div')
    dom.innerText = msg + `（${new Date().toLocaleString()}）`;
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
// 默认关闭悬浮预览
window._allowPreview = !1;
// 是否默认开启自动保存
window._autoSave = true;
// 调试——初始渲染时触发的那次自动保存没有必要，去掉，减少性能消耗
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
        showMessage('复制失败')
    }
    document.body.removeChild(input)
    return status
}
async function getElementIDFromClipboadr() {
    let str = await navigator.clipboard.readText()
    if (!str.startsWith(`{"type":"excalidraw/clipboard"`)) {
        showMessage(language["msgClipboard"])
        return null
    }
    let result = str.match(/\"id\"\:\"(.+?)\"/);
    let id;
    if (result && result[1]) {
        id = result[1]
    } else {
        showMessage(language["msgIDFailed"])
        return null
    }
    let status = patseIntoClipboard(`excalidraw://${id}`);
    showMessage(language['msgCopied'])
}
// 快捷键
document.addEventListener("keydown", (e => {
    if (e.altKey && "q" === e.key) {
        window._allowPreview = !0;
        showMessage(language["msgPreviewMode"]);
    }
    if (e.altKey && "w" === e.key) {
        window._allowPreview = !1;
        showMessage("关闭预览");
    }
    if (e.altKey && "f" === e.key) {
        window._autoSave = !window._autoSave;
        if (!window._autoSave) {
            showMessage(language["msgAutoSaveOff"])
        } else {
            showMessage(language["msgAutosave"])
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
// 调试——手动保存
saveBtn.addEventListener('click', (e) => {
    showMessage("Lang : " + window.top.siyuan.config.lang);
    if (window._isDarwin) {
        // macOS上的保存
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "S", metaKey: true, bubbles: true }));
    } else {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "S", ctrlKey: true, bubbles: true }));
    }
}, false);
// 调试——搜素关键字
(async () => {
    function request(url, data = null) { return new Promise((resolve, reject) => { fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), }).then((data) => resolve(data.json()), (error) => { reject(error); }).catch((err) => { console.error("请求失败:", err); }); }); }
    ; const searchPanel = document.getElementById("searchPanel"),
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
        } else targetArrContainer.innerHTML = language["msgNoRelevantResults"], currentIndex = -1; else targetArrContainer.innerHTML = language["msgNoRelevantResults"], currentIndex = -1
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