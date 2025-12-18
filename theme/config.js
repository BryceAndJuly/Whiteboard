// 请求函数
function request(url, data = null) { return new Promise((resolve, reject) => { fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), }).then((data) => resolve(data.json()), (error) => { reject(error); }).catch((err) => { console.error("请求失败:", err); }); }); }

async function renderBody() {
  let blockLnk = document.getElementById("link").getAttribute("content");
  let id = blockLnk.trim().split('siyuan://blocks/')[1];
  let doc = "";
  let htmlStr = "";
  let res = await request("/api/filetree/getDoc", { id });
  if (res?.code === 0 && res?.data?.content) {
    // 判断是否是文档块，是的话要另外获取标题
    if (res?.data?.type === "NodeDocument") {
      // 修复问题：callout icon 设置为动态图标时，获取图标失败
      htmlStr = res.data.content.replaceAll(`"assets/`, `"${window.top.location.origin}/assets/`).replaceAll(`contenteditable="true"`, `contenteditable="false"`).replaceAll(`src="api/icon/getDynamicIcon`, `src="${window.top.location.origin}/api/icon/getDynamicIcon`);
      let response = await request("/api/block/getDocInfo", { id });
      // 读取标题成功,添加文档标题
      if (response?.code === 0 && response?.data?.name && htmlStr) {
        // 修复问题：当文档标题中包含类似“<iframe>”的字符串时，会被识别成标签，导致文档渲染异常
        let title = response.data.name.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
        doc = `<h1>${title}</h1>` + htmlStr;
      }
    } else {
      // 修复问题：callout icon 设置为动态图标时，获取图标失败
      doc = res.data.content.replaceAll(`"assets/`, `"${window.top.location.origin}/assets/`).replaceAll(`contenteditable="true"`, `contenteditable="false"`).replaceAll(`src="api/icon/getDynamicIcon`, `src="${window.top.location.origin}/api/icon/getDynamicIcon`);
    }
  } else {
    doc = "<h2>加载失败，未找到该内容块！</h2><h2>Failed to load. The content block was not found!</h2>"
  }
  document.body.insertAdjacentHTML("afterbegin", doc);
}

// 内嵌块中的超链接跳转
function handleIframeInternalLink() {
  document.addEventListener('click', (e) => {
    // 文档中的超链接
    if (
      e.target.tagName === 'SPAN' &&
      e.target.getAttribute('data-type') === 'a'
    ) {
      let url = e.target.getAttribute('data-href')
      if (url) {
        e.stopPropagation();
        try {
          if (url.startsWith("siyuan://blocks/")) {
            window.top.openFileByURL(url)
          } else {
            window.top.open(url);
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
    // 数据表格中的超链接
    if (
      e.target.tagName === 'SPAN' &&
      e.target.getAttribute('data-type') === 'url'
    ) {
      let url = e.target.getAttribute('data-href')
      if (url) {
        e.stopPropagation();
        try {
          if (url.startsWith("siyuan://blocks/")) {
            window.top.openFileByURL(url)
          } else {
            window.top.open(url);
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
    // V3.3.0，数据表格中的超链接
    if (
      e.target.tagName === 'SPAN' &&
      e.target.parentElement.getAttribute('data-type') === 'url'
    ) {
      let url = e.target.parentElement.getAttribute('data-href')
      if (url) {
        e.stopPropagation();
        try {
          if (url.startsWith("siyuan://blocks/")) {
            window.top.openFileByURL(url)
          } else {
            window.top.open(url);
          }
        } catch (err) {
          console.error(err);
        }
      }
    }

    //   引用块
    if (
      e.target.tagName === 'SPAN' &&
      e.target.getAttribute('data-type') === 'block-ref'

    ) {
      let id = e.target.getAttribute('data-id')
      if (id) {
        e.stopPropagation()
        try {
          window.top.openFileByURL(`siyuan://blocks/${id}`)
        } catch (err) {
          window.top.open(`siyuan://blocks/${id}`);
        }
      }
    }
  }, true);
}

// 加载渲染所需的依赖库
function addScript(path) {
  return new Promise((resolve) => {
    const scriptElement = document.createElement("script");
    scriptElement.src = path;
    scriptElement.async = true;
    document.head.appendChild(scriptElement);
    scriptElement.onload = () => {
      resolve(true);
    };
  });
};

// 加载css文件
function addStyle(url) {
  const styleElement = document.createElement("link");
  styleElement.rel = "stylesheet";
  styleElement.type = "text/css";
  styleElement.href = url;
  document.head.appendChild(styleElement);
};

// 渲染嵌入块
async function renderEmbedBlock() {
  let QueryEmbedElements = Array.from(document.querySelectorAll('.render-node[data-type="NodeBlockQueryEmbed"]'));
  if (QueryEmbedElements.length > 0) {
    for (let element of QueryEmbedElements) {
      let SQL = element.getAttribute("data-content");
      let blockID = element.getAttribute("data-node-id");
      let blockContent = await request("/api/filetree/getDoc", {
        id: blockID
      })
      let currentDocID = blockContent.data.rootID;
      let response = await request("/api/search/searchEmbedBlock", {
        "embedBlockID": blockID,
        "stmt": SQL,
        "headingMode": 0,
        "excludeIDs": [blockID, currentDocID],
        "breadcrumb": false
      });
      let blocks = response.data.blocks;
      let html = "";
      blocks.forEach((blocksItem) => {
        let breadcrumbHTML = "";
        // 需要修正嵌入块中图片的路径，否则会导致加载失败
        let contentStr = blocksItem.block.content.replaceAll(`"assets/`, `"${window.top.location.origin}/assets/`).replaceAll(`contenteditable="true"`, `contenteditable="false"`);
        // 
        html += `<div class="protyle-wysiwyg__embed" data-id="${blocksItem.block.id}">${breadcrumbHTML}${contentStr}</div>`;
      });
      if (blocks.length > 0) {
        element.lastElementChild.insertAdjacentHTML("beforebegin", html);
      } else {
        element.lastElementChild.insertAdjacentHTML("beforebegin", `<div class="ft__smaller ft__secondary b3-form__space--small" contenteditable="false">不存在符合条件的内容块</div><div style="position: absolute;">"\u200b"</div>`);
      }
    }
  }
}
// 渲染Katex公式
async function renderKatex() {
  let inlineMathElements = Array.from(document.querySelectorAll('span[data-type="inline-math"]'));
  let MathBlockElements = Array.from(document.querySelectorAll('.render-node[data-type="NodeMathBlock"]'));
  if (inlineMathElements.length > 0 || MathBlockElements.length > 0) {
    addStyle("./theme/katex.min.css");
    await addScript("./theme/katex.min.js");
    if (inlineMathElements.length > 0) {
      for (let element of inlineMathElements) {
        let katexHTML = katex.renderToString(window.top.Lute.UnEscapeHTMLStr(element.getAttribute("data-content")), {
          displayMode: false,
          output: "html",
          macros: {},
          trust: true,
          strict: "ignore"
        });
        element.insertAdjacentHTML("afterbegin", katexHTML);
      }
    }
    if (MathBlockElements.length > 0) {
      for (let element of MathBlockElements) {
        let katexHTML = katex.renderToString(
          window.top.Lute.UnEscapeHTMLStr(element.getAttribute("data-content")), {
          displayMode: true,
          output: "html",
          macros: {},
          trust: true,
          strict: "ignore"
        });
        element.insertAdjacentHTML("afterbegin", '<div spin="1">' + katexHTML + '</div>');
      }
    }
  }
}
// 渲染Mermaid图表
async function renderMermaid() {
  const mermaidElements = Array.from(document.querySelectorAll('.render-node[data-subtype="mermaid"]'));
  if (mermaidElements.length > 0) {
    await addScript("./theme/mermaid.min.js")
    let graphObj = new Object();
    // 适配深色模式
    let mermaidTheme = window?.top?.siyuan?.config?.appearance?.mode === 1 ? "dark" : "light"
    mermaid.initialize({
      startOnLoad: false,
      theme: mermaidTheme
    });
    for (let element of mermaidElements) {
      const content = window.top.Lute.UnEscapeHTMLStr(element.getAttribute("data-content"));
      const dataID = element.getAttribute('data-node-id');
      const {
        svg
      } = await mermaid.render('graphDiv', content);
      graphObj[dataID] = svg;
    }
    // 全部渲染出图表再一起嵌入文档
    setTimeout(() => {
      if (Object.keys(graphObj).length > 0) {
        for (let element of mermaidElements) {
          let id = element.getAttribute("data-node-id");
          element.firstElementChild.insertAdjacentHTML("afterbegin", graphObj[id]);
        }
      }
    }, 0)
  }
}

function getColIconByType(type) {
  switch (type) {
    case "text":
      return "iconAlignLeft";
    case "block":
      return "iconKey";
    case "number":
      return "iconNumber";
    case "select":
      return "iconListItem";
    case "mSelect":
      return "iconList";
    case "relation":
      return "iconOpen";
    case "rollup":
      return "iconSearch";
    case "date":
      return "iconCalendar";
    case "updated":
    case "created":
      return "iconClock";
    case "url":
      return "iconLink";
    case "mAsset":
      return "iconImage";
    case "email":
      return "iconEmail";
    case "phone":
      return "iconPhone";
    case "template":
      return "iconMath";
    case "checkbox":
      return "iconCheck";
  }
};

function getCalcValue(column) {
  if (!column.calc || !column.calc.result) {
    return "";
  }
  let resultCalc = column.calc.result.number;
  if (column.calc.operator === "Earliest" || column.calc.operator === "Latest" ||
    (column.calc.operator === "Range" && ["date", "created", "updated"].includes(column.type))) {
    resultCalc = column.calc.result[column.type];
  }
  let value = "";
  switch (column.calc.operator) {
    case "Count all":
      value = `${window.top.siyuan.languages.calcResultCountAll}:<span>${resultCalc.formattedContent}</span>`;
      break;
    case "Count values":
      value = `${window.top.siyuan.languages.calcResultCountValues}:<span>${resultCalc.formattedContent}</span>`;
      break;
    case "Count unique values":
      value = `${window.top.siyuan.languages.calcResultCountUniqueValues}:<span>${resultCalc.formattedContent}</span>`;
      break;
    case "Count empty":
      value = `${window.top.siyuan.languages.calcResultCountEmpty}:<span>${resultCalc.formattedContent}</span>`;
      break;
    case "Count not empty":
      value = `${window.top.siyuan.languages.calcResultCountNotEmpty}:<span>${resultCalc.formattedContent}</span>`;
      break;
    case "Percent empty":
      value = `${window.top.siyuan.languages.calcResultPercentEmpty}:<span>${resultCalc.formattedContent}</span>`;
      break;
    case "Percent not empty":
      value = `${window.top.siyuan.languages.calcResultPercentNotEmpty}:<span>${resultCalc.formattedContent}</span>`;
      break;
    case "Sum":
      value = `${window.top.siyuan.languages.calcResultSum}:<span>${resultCalc.formattedContent}</span>`;
      break;
    case "Average":
      value = `${window.top.siyuan.languages.calcResultAverage}:<span>${resultCalc.formattedContent}</span>`;
      break;
    case "Median":
      value = `${window.top.siyuan.languages.calcResultMedian}:<span>${resultCalc.formattedContent}</span>`;
      break;
    case "Min":
      value = `${window.top.siyuan.languages.calcResultMin}:<span>${resultCalc.formattedContent}</span>`;
      break;
    case "Max":
      value = `${window.top.siyuan.languages.calcResultMax}<span>${resultCalc.formattedContent}</span>`;
      break;
    case "Range":
      value = `${window.top.siyuan.languages.calcResultRange}:<span>${resultCalc.formattedContent}</span>`;
      break;
    case "Earliest":
      value = `${window.top.siyuan.languages.calcOperatorEarliest}:<span>${resultCalc.formattedContent}</span>`;
      break;
    case "Latest":
      value = `${window.top.siyuan.languages.calcOperatorLatest}:<span>${resultCalc.formattedContent}</span>`;
      break;
    case "Checked":
      value = `${window.top.siyuan.languages.checked}:<span>${resultCalc.formattedContent}</span>`;
      break;
    case "Unchecked":
      value = `${window.top.siyuan.languages.unchecked}:<span>${resultCalc.formattedContent}</span>`;
      break;
    case "Percent checked":
      value = `${window.top.siyuan.languages.percentChecked}:<span>${resultCalc.formattedContent}</span>`;
      break;
    case "Percent unchecked":
      value = `${window.top.siyuan.languages.percentUnchecked}:<span>${resultCalc.formattedContent}</span>`;
      break;
    case "Percent unique values":
      value = `${window.top.siyuan.languages.calcOperatorPercentUniqueValues}:<span>${resultCalc.formattedContent}</span>`;
      break;
  }
  return value;
};

function getCompressURL(url) {
  if (url.startsWith("assets/") &&
    (url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".jpeg"))) {
    return url + "?style=thumb";
  }
  return url;
};

function escapeAttr(html) {
  if (!html) {
    return html;
  }
  return html.replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function renderCellURL(urlContent) {
  let host = urlContent;
  let suffix = "";
  try {
    const urlObj = new URL(urlContent);
    if (urlObj.protocol.startsWith("http")) {
      host = urlObj.host;
      suffix = urlObj.href.replace(urlObj.origin, "");
      if (suffix.length > 12) {
        suffix = suffix.substring(0, 4) + "..." + suffix.substring(suffix.length - 6);
      }
    }
  } catch (e) {
    host = window.top.Lute.EscapeHTMLStr(urlContent);
  }
  return `<span class="av__celltext av__celltext--url" data-type="url" data-href="${escapeAttr(urlContent)}"><span>${host}</span><span class="ft__on-surface">${suffix}</span></span>`;
};

function renderRollup(cellValue) {
  let text = "";
  if (["text"].includes(cellValue.type)) {
    text = cellValue ? (cellValue[cellValue.type].content || "") : "";
  } else if (["url", "email", "phone"].includes(cellValue.type)) {
    const urlContent = cellValue ? cellValue[cellValue.type].content : "";
    if (urlContent) {
      let urlAttr = "";
      if (cellValue.type === "url") {
        urlAttr = ` data-href="${urlContent}"`;
      }
      text = `<span class="av__celltext av__celltext--url" data-type="${cellValue.type}"${urlAttr}>${urlContent}</span>`;
    }
  } else if (cellValue.type === "block") {
    if (cellValue?.isDetached) {
      text = `<span class="av__celltext">${cellValue.block?.content || ""}</span>`;
    } else {
      text = `<span data-type="block-ref" data-id="${cellValue.block?.id}" data-subtype="s" class="av__celltext av__celltext--ref">${cellValue.block?.content || "Untitled"}</span>`;
    }
  } else if (cellValue.type === "number") {
    text = cellValue?.number.formattedContent || cellValue?.number.content.toString() || "";
  } else if (cellValue.type === "date") {
    const dataValue = cellValue ? cellValue.date : null;
    if (dataValue && dataValue.isNotEmpty) {
      text += dayjs(dataValue.content).format(dataValue.isNotTime ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm");
    }
    if (dataValue && dataValue.hasEndDate && dataValue.isNotEmpty && dataValue.isNotEmpty2) {
      text += `<svg class="av__cellicon"><use xlink:href="#iconForward"></use></svg>${dayjs(dataValue.content2).format(dataValue.isNotTime ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm")}`;
    }
    if (text) {
      text = `<span class="av__celltext">${text}</span>`;
    }
  }
  return text;
};

function unicode2Emoji(unicode, className = "", needSpan = false, lazy = false) {
  if (!unicode) {
    return "";
  }
  let emoji = "";
  if (unicode.startsWith("api/icon/getDynamicIcon")) {
    emoji = `<img class="${className}" ${lazy ? "data-" : ""}src="${window.top.location.origin}/${unicode}"/>`;
  } else if (unicode.indexOf(".") > -1) {
    emoji = `<img class="${className}" ${lazy ? "data-" : ""}src="/emojis/${unicode}"/>`;
  } else {
    try {
      unicode.split("-").forEach(item => {
        if (item.length < 5) {
          emoji += String.fromCodePoint(parseInt("0" + item, 16));
        } else {
          emoji += String.fromCodePoint(parseInt(item, 16));
        }
      });
      if (needSpan) {
        emoji = `<span class="${className}">${emoji}</span>`;
      }
    } catch (e) {}
  }
  return emoji;
};

function escapeHtml(html) {
  if (!html) {
    return html;
  }
  return html.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}


function renderCell(cellValue, rowIndex = 0, showIcon = true, type = "table") {
  let text = "";
  if ("template" === cellValue.type) {
    text = `<span class="av__celltext">${cellValue ? (cellValue.template.content || "") : ""}</span>`;
  } else if ("text" === cellValue.type) {
    text = `<span class="av__celltext">${cellValue ? window.top.Lute.EscapeHTMLStr(cellValue.text.content || "") : ""}</span>`;
  } else if (["email", "phone"].includes(cellValue.type)) {
    text = `<span class="av__celltext av__celltext--url" data-type="${cellValue.type}">${cellValue ? window.top.Lute.EscapeHTMLStr(cellValue[cellValue.type].content || "") : ""}</span>`;
  } else if ("url" === cellValue.type) {
    text = renderCellURL(cellValue?.url?.content || "");
  } else if (cellValue.type === "block") {
    if (cellValue?.isDetached) {
      text = `<span class="av__celltext">${window.top.Lute.EscapeHTMLStr(cellValue.block.content || "")}</span><span class="b3-chip b3-chip--info b3-chip--small" data-type="block-more">${window.top.siyuan.languages.more}</span>`;
    } else {
      text = `<span class="b3-menu__avemoji${showIcon ? "" : " fn__none"}" data-unicode="${cellValue.block.icon || ""}">${unicode2Emoji(cellValue.block.icon || window.top.siyuan.storage["local-images"].file)}</span><span data-type="block-ref" data-id="${cellValue.block.id}" data-subtype="s" class="av__celltext av__celltext--ref">${window.top.Lute.EscapeHTMLStr(cellValue.block.content)}</span><span class="b3-chip b3-chip--info b3-chip--small" data-type="block-more">${window.top.siyuan.languages.update}</span>`;
    }
  } else if (cellValue.type === "number") {
    text = `<span class="av__celltext" data-content="${cellValue?.number.isNotEmpty ? cellValue?.number.content : ""}">${cellValue?.number.formattedContent || cellValue?.number.content || ""}</span>`;
  } else if (cellValue.type === "mSelect" || cellValue.type === "select") {
    cellValue?.mSelect?.forEach((item, index) => {
      if (cellValue.type === "select" && index > 0) {
        return;
      }
      text += `<span class="b3-chip" style="background-color:var(--b3-font-background${item.color});color:var(--b3-font-color${item.color})">${escapeHtml(item.content)}</span>`;
    });
  } else if (cellValue.type === "date") {
    const dataValue = cellValue ? cellValue.date : null;
    text = `<span class="av__celltext" data-value='${JSON.stringify(dataValue)}'>`;
    if (dataValue && dataValue.isNotEmpty) {
      text += dayjs(dataValue.content).format(dataValue.isNotTime ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm");
    }
    if (dataValue && dataValue.hasEndDate && dataValue.isNotEmpty && dataValue.isNotEmpty2) {
      text += `<svg class="av__cellicon"><use xlink:href="#iconForward"></use></svg>${dayjs(dataValue.content2).format(dataValue.isNotTime ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm")}`;
    }
    text += "</span>";
  } else if (["created", "updated"].includes(cellValue.type)) {
    const dataValue = cellValue ? cellValue[cellValue.type] : null;
    text = `<span class="av__celltext" data-value='${JSON.stringify(dataValue)}'>`;
    if (dataValue && dataValue.isNotEmpty) {
      text += dayjs(dataValue.content).format("YYYY-MM-DD HH:mm");
    }
    text += "</span>";
  } else if (["lineNumber"].includes(cellValue.type)) {
    // 渲染行号
    text = `<span class="av__celltext" data-value='${rowIndex + 1}'>${rowIndex + 1}</span>`;
  } else if (cellValue.type === "mAsset") {
    cellValue?.mAsset?.forEach((item) => {
      if (item.type === "image") {
        text += `<img loading="lazy" class="av__cellassetimg ariaLabel" aria-label="${item.content}" src="${getCompressURL(item.content)}">`;
      } else {
        text += `<span class="b3-chip av__celltext--url ariaLabel" aria-label="${escapeAttr(item.content)}" data-name="${escapeAttr(item.name)}" data-url="${escapeAttr(item.content)}">${item.name || item.content}</span>`;
      }
    });
  } else if (cellValue.type === "checkbox") {
    text += `<div class="fn__flex"><svg class="av__checkbox"><use xlink:href="#icon${cellValue?.checkbox?.checked ? "Check" : "Uncheck"}"></use></svg>`;
    if (type === "gallery" && cellValue?.checkbox?.content) {
      text += `<span class="fn__space"></span>${cellValue?.checkbox?.content}`;
    }
    text += "</div>";
  } else if (cellValue.type === "rollup") {
    cellValue?.rollup?.contents?.forEach((item) => {
      const rollupText = ["template", "select", "mSelect", "mAsset", "checkbox", "relation"].includes(item.type) ? renderCell(item, rowIndex, showIcon, type) : renderRollup(item);
      if (rollupText) {
        text += rollupText + ", ";
      }
    });
    if (text && text.endsWith(", ")) {
      text = text.substring(0, text.length - 2);
    }
  } else if (cellValue.type === "relation") {
    cellValue?.relation?.contents?.forEach((item, index) => {
      if (item && item.block) {
        const rowID = cellValue.relation.blockIDs[index];
        if (item?.isDetached) {
          text += `<span data-row-id="${rowID}" class="av__cell--relation"><span class="b3-menu__avemoji${showIcon ? "" : " fn__none"}">➖</span><span class="av__celltext">${window.top.Lute.EscapeHTMLStr(item.block.content || window.top.siyuan.languages.untitled)}</span></span>`;
        } else {
          // data-block-id 用于更新 emoji
          text += `<span data-row-id="${rowID}" class="av__cell--relation" data-block-id="${item.block.id}"><span class="b3-menu__avemoji${showIcon ? "" : " fn__none"}" data-unicode="${item.block.icon || ""}">${unicode2Emoji(item.block.icon || window.top.siyuan.storage["local-images"].file)}</span><span data-type="block-ref" data-id="${item.block.id}" data-subtype="s" class="av__celltext av__celltext--ref">${window.top.Lute.EscapeHTMLStr(item.block.content || window.top.siyuan.languages.untitled)}</span></span>`;
        }
      }
    });
    if (text && text.endsWith(", ")) {
      text = text.substring(0, text.length - 2);
    }
  }

  if ((["text", "template", "url", "email", "phone", "date", "created", "updated"].includes(cellValue.type) && cellValue[cellValue.type]?.content) ||
    cellValue.type === "lineNumber" ||
    (cellValue.type === "number" && cellValue.number?.isNotEmpty) ||
    (cellValue.type === "block" && cellValue.block?.content)) {
    text += `<span ${cellValue.type !== "number" ? "" : 'style="right:auto;left:5px"'} data-type="copy" class="block__icon"><svg><use xlink:href="#iconCopy"></use></svg></span>`;
  }
  return text;
};


function cellValueIsEmpty(value) {
  if (value.type === "checkbox") {
    return false;
  }
  if (["text", "block", "url", "phone", "email", "template"].includes(value.type)) {
    return !value[value.type]?.content;
  }
  if (value.type === "number") {
    return !value.number?.isNotEmpty;
  }
  if (["mSelect", "mAsset", "select"].includes(value.type)) {
    if (value[(value.type === "select" ? "mSelect" : value.type)]?.length > 0) {
      return false;
    }
    return true;
  }
  if (["date", "created", "updated"].includes(value.type)) {
    return !value[value.type]?.isNotEmpty &&
      !value[value.type]?.isNotEmpty2;
  }
  if (value.type === "relation") {
    if (value.relation?.blockIDs && value.relation.blockIDs.length > 0) {
      return false;
    }
    return true;
  }
  if (value.type === "rollup") {
    if (value.rollup?.contents && value.rollup.contents.length > 0) {
      return false;
    }
    return true;
  }

}


function escapeAriaLabel(html) {
  if (!html) {
    return html;
  }
  return html.replace(/"/g, "&quot;").replace(/'/g, "&apos;")
    .replace(/</g, "&amp;lt;").replace(/&lt;/g, "&amp;lt;");
}

function getViewIcon(type) {
  switch (type) {
    case "table":
      return "iconTable";
    case "gallery":
      return "iconGallery";
    case "kanban":
      return "iconBoard";
  }
}

function getColNameByType(type) {
  switch (type) {
    case "text":
    case "number":
    case "select":
    case "date":
    case "phone":
    case "email":
    case "template":
      return window.top.siyuan.languages[type];
    case "mSelect":
      return window.top.siyuan.languages.multiSelect;
    case "relation":
      return window.top.siyuan.languages.relation;
    case "rollup":
      return window.top.siyuan.languages.rollup;
    case "updated":
      return window.top.siyuan.languages.updatedTime;
    case "created":
      return window.top.siyuan.languages.createdTime;
    case "url":
      return window.top.siyuan.languages.link;
    case "mAsset":
      return window.top.siyuan.languages.assets;
    case "checkbox":
      return window.top.siyuan.languages.checkbox;
    case "block":
      return window.top.siyuan.languages["_attrView"].key;
    case "lineNumber":
      return window.top.siyuan.languages.lineNumber;
  }
};

// 添加icon
function addAttributeViewIcon() {
  const icon = `<svg style="position: absolute; width: 0; height: 0; overflow: hidden;" xmlns="http://www.w3.org/2000/svg">
<defs>
<symbol id="iconTable" viewBox="0 0 32 32">
  <path d="M22.801 2.286h-22.801v27.429h32v-27.429h-9.199zM19.372 5.714v4.571h-6.801v-4.571h6.801zM19.372 13.714v4.571h-6.801v-4.571h6.801zM3.429 5.714h5.714v4.571h-5.714v-4.571zM3.429 13.714h5.714v4.571h-5.714v-4.571zM3.429 26.286v-4.571h5.714v4.571h-5.714zM12.571 26.286v-4.571h6.801v4.571h-6.801zM28.571 26.286h-5.77v-4.571h5.77v4.571zM28.571 18.286h-5.77v-4.571h5.77v4.571zM22.801 10.286v-4.571h5.77v4.571h-5.77z"></path>
</symbol>
<symbol id="iconGallery" viewBox="0 0 32 32">
  <path d="M1 13v-12h12v12h-12zM4 10h6v-6h-6v6zM1 31v-12h12v12h-12zM4 28h6v-6h-6v6zM19 13v-12h12v12h-12zM22 10h6v-6h-6v6zM19 31v-12h12v12h-12zM22 28h6v-6h-6v6z"></path>
</symbol>
 <symbol id="iconKey" viewBox="0 0 32 32">
    <path d="M9.561 23.727q-3.22 0-5.473-2.254t-2.254-5.474 2.254-5.473 5.473-2.254q2.125 0 3.896 1.063t2.801 2.801h13.909v7.727h-2.576v3.864h-7.727v-3.864h-3.606q-1.030 1.739-2.801 2.801t-3.896 1.063zM9.561 21.151q2.125 0 3.413-1.304t1.545-2.56h7.92v3.864h2.576v-3.864h2.576v-2.576h-13.072q-0.258-1.256-1.545-2.56t-3.413-1.304-3.638 1.513-1.513 3.638 1.513 3.638 3.638 1.513zM9.561 18.576q1.063 0 1.819-0.757t0.757-1.819-0.757-1.819-1.819-0.757-1.819 0.757-0.757 1.819 0.757 1.819 1.819 0.757z"></path>
 </symbol>
 <symbol id="iconListItem" viewBox="0 0 32 32">
    <path d="M7.778 17.683v-3.403h24.222v3.403h-24.222z"></path>
    <path d="M5.4 16c0 1.49-1.209 2.7-2.7 2.7-1.49 0-2.7-1.21-2.7-2.7s1.21-2.7 2.7-2.7c1.491 0 2.7 1.21 2.7 2.7z"></path>
</symbol>
<symbol id="iconAlignLeft" viewBox="0 0 32 32">
    <path d="M0 0h32v3.583h-32v-3.583zM0 32v-3.583h32v3.583h-32zM0 17.75v-3.5h32v3.5h-32zM21.333 7.083v3.583h-21.333v-3.583h21.333zM21.333 21.333v3.583h-21.333v-3.583h21.333z"></path>
</symbol>
<symbol id="iconNumber" viewBox="0 0 32 32">
    <path d="M31 12.25v-3.75h-7.5v-7.5h-3.75v7.5h-7.5v-7.5h-3.75v7.5h-7.5v3.75h7.5v7.5h-7.5v3.75h7.5v7.5h3.75v-7.5h7.5v7.5h3.75v-7.5h7.5v-3.75h-7.5v-7.5h7.5zM19.75 19.75h-7.5v-7.5h7.5v7.5z"></path>
  </symbol>
  <symbol id="iconList" viewBox="0 0 32 32">
    <path d="M7.777 3.929h24.223v3.403h-24.223v-3.403zM7.777 17.701v-3.403h24.223v3.403h-24.223zM7.777 28.071v-3.403h24.223v3.403h-24.223zM2.592 23.777q1.053 0 1.823 0.77t0.77 1.823-0.77 1.823-1.823 0.77-1.823-0.77-0.77-1.823 0.77-1.823 1.823-0.77zM2.592 3.038q1.053 0 1.823 0.729t0.77 1.863-0.77 1.863-1.823 0.729-1.823-0.729-0.77-1.863 0.77-1.863 1.823-0.729zM2.592 13.408q1.053 0 1.823 0.729t0.77 1.863-0.77 1.863-1.823 0.729-1.823-0.729-0.77-1.863 0.77-1.863 1.823-0.729z"></path>
  </symbol>
  <symbol id="iconCalendar" viewBox="0 0 32 32">
    <path d="M26.5 4h-1.5v-3h-3v3h-12v-3h-3v3h-1.5c-1.665 0-2.985 1.35-2.985 3l-0.015 21c0 1.65 1.335 3 3 3h21c1.65 0 3-1.35 3-3v-21c0-1.65-1.35-3-3-3zM26.5 28h-21v-15h21v15zM26.5 10h-21v-3h21v3zM11.5 19h-3v-3h3v3zM17.5 19h-3v-3h3v3zM23.5 19h-3v-3h3v3zM11.5 25h-3v-3h3v3zM17.5 25h-3v-3h3v3zM23.5 25h-3v-3h3v3z"></path>
  </symbol>
  <symbol id="iconImage" viewBox="0 0 32 32">
    <path d="M29.091 2.909h-26.182c-1.455 0-2.909 1.455-2.909 2.909v20.364c0 1.6 1.309 2.909 2.909 2.909h26.182c1.455 0 2.909-1.455 2.909-2.909v-20.364c0-1.455-1.455-2.909-2.909-2.909zM29.091 26.065c-0.029 0.044-0.087 0.087-0.116 0.116h-26.065v-20.247l0.116-0.116h25.935c0.044 0.029 0.087 0.087 0.116 0.116v20.131zM14.545 21.105l-3.636-4.378-5.091 6.545h20.364l-6.545-8.727z"></path>
  </symbol>
  <symbol id="iconLink" viewBox="0 0 32 32">
    <path d="M24.038 7.962q3.305 0 5.634 2.366t2.329 5.671-2.329 5.671-5.634 2.366h-6.46v-3.080h6.46q2.028 0 3.493-1.465t1.465-3.493-1.465-3.493-3.493-1.465h-6.46v-3.080h6.46zM9.615 17.577v-3.155h12.77v3.155h-12.77zM3.005 16q0 2.028 1.465 3.493t3.493 1.465h6.46v3.080h-6.46q-3.305 0-5.634-2.366t-2.329-5.671 2.329-5.671 5.634-2.366h6.46v3.080h-6.46q-2.028 0-3.493 1.465t-1.465 3.493z"></path>
  </symbol>
  <symbol id="iconEmail" viewBox="0 0 32 32">
    <path d="M16 0.925c-8.28 0-15 6.72-15 15s6.72 15 15 15h7.5v-3h-7.5c-6.51 0-12-5.49-12-12s5.49-12 12-12 12 5.49 12 12v2.145c0 1.185-1.065 2.355-2.25 2.355s-2.25-1.17-2.25-2.355v-2.145c0-4.14-3.36-7.5-7.5-7.5s-7.5 3.36-7.5 7.5 3.36 7.5 7.5 7.5c2.070 0 3.96-0.84 5.31-2.205 0.975 1.335 2.655 2.205 4.44 2.205 2.955 0 5.25-2.4 5.25-5.355v-2.145c0-8.28-6.72-15-15-15zM16 20.425c-2.49 0-4.5-2.010-4.5-4.5s2.010-4.5 4.5-4.5 4.5 2.010 4.5 4.5-2.010 4.5-4.5 4.5z"></path>
  </symbol>
  <symbol id="iconPhone" viewBox="0 0 32 32">
    <path d="M6.9 4.333c0.1 1.483 0.35 2.933 0.75 4.317l-2 2c-0.683-2-1.117-4.117-1.267-6.317h2.517zM23.333 24.367c1.417 0.4 2.867 0.65 4.333 0.75v2.483c-2.2-0.15-4.317-0.583-6.333-1.25l2-1.983zM8.5 1h-5.833c-0.917 0-1.667 0.75-1.667 1.667 0 15.65 12.683 28.333 28.333 28.333 0.917 0 1.667-0.75 1.667-1.667v-5.817c0-0.917-0.75-1.667-1.667-1.667-2.067 0-4.083-0.333-5.95-0.95-0.167-0.067-0.35-0.083-0.517-0.083-0.433 0-0.85 0.167-1.183 0.483l-3.667 3.667c-4.717-2.417-8.583-6.267-10.983-10.983l3.667-3.667c0.467-0.467 0.6-1.117 0.417-1.7-0.617-1.867-0.95-3.867-0.95-5.95 0-0.917-0.75-1.667-1.667-1.667z"></path>
  </symbol>
  <symbol id="iconMath" viewBox="0 0 32 32">
    <path d="M26.343 32c1.668 0 2.748-1.032 2.748-2.602s-1.080-2.625-2.725-2.625h-15.402v-0.282l5.636-8.018c0.891-1.266 1.173-1.945 1.173-2.766 0-0.843-0.327-1.593-1.339-2.977l-5.236-7.243v-0.259h15.098c1.575 0 2.677-1.055 2.677-2.602 0-1.545-1.102-2.625-2.677-2.625h-19.864c-2.114 0-3.359 1.077-3.359 2.932 0 0.936 0.423 1.85 1.455 3.257l7.023 9.727-7.068 10.011c-1.361 1.97-1.573 2.439-1.573 3.352 0 1.689 1.291 2.72 3.43 2.72h20.005z"></path>
  </symbol>
  <symbol id="iconOpen" viewBox="0 0 32 32">
    <path d="M1 27.979l22.693-22.693h-14.121v-4.286h21.429v21.429h-4.286v-14.121l-22.693 22.693-3.021-3.021z"></path>
  </symbol>
  <symbol id="iconSearch" viewBox="0 0 32 32">
    <path d="M11.925 20.161q3.432 0 5.834-2.402t2.402-5.834-2.402-5.834-5.834-2.402-5.834 2.402-2.402 5.834 2.402 5.834 5.834 2.402zM22.906 20.161l9.094 9.094-2.745 2.745-9.094-9.094v-1.458l-0.515-0.515q-3.26 2.831-7.721 2.831-4.976 0-8.45-3.432t-3.475-8.408 3.475-8.45 8.45-3.475 8.407 3.475 3.432 8.45q0 1.802-0.858 4.075t-1.973 3.646l0.515 0.515h1.458z"></path>
  </symbol>
  <symbol id="iconOrderedList" viewBox="0 0 32 32">
    <path d="M8.375 17.659v-3.319h23.625v3.319h-23.625zM8.375 27.773v-3.319h23.625v3.319h-23.625zM8.375 4.227h23.625v3.319h-23.625v-3.319zM0 14.341v-1.738h5.057v1.58l-3.081 3.477h3.081v1.738h-5.057v-1.58l3.002-3.477h-3.002zM1.659 9.284v-5.057h-1.659v-1.738h3.319v6.795h-1.659zM0 24.454v-1.738h5.057v6.795h-5.057v-1.738h3.319v-0.79h-1.659v-1.738h1.659v-0.79h-3.319z"></path>
  </symbol>
  <symbol id="iconClock" viewBox="0 0 32 32">
    <path d="M20.95 23.050l2.1-2.1-5.55-5.55v-6.9h-3v8.1l6.45 6.45zM16 31q-3.113 0-5.85-1.181t-4.763-3.206-3.206-4.762-1.181-5.85 1.181-5.85 3.206-4.763 4.763-3.206 5.85-1.181 5.85 1.181 4.762 3.206 3.206 4.763 1.181 5.85-1.181 5.85-3.206 4.762-4.762 3.206-5.85 1.181zM16 28q4.988 0 8.494-3.506t3.506-8.494-3.506-8.494-8.494-3.506-8.494 3.506-3.506 8.494 3.506 8.494 8.494 3.506z"></path>
  </symbol>
  <symbol id="iconForward" viewBox="0 0 32 32">
    <path d="M16 30.5l-1.903-1.948 11.192-11.192h-23.789v-2.719h23.789l-11.192-11.192 1.903-1.948 14.5 14.5z"></path>
  </symbol> 
  <symbol id="iconBoard" viewBox="0 0 32 32">
    <path d="M27.8 4.2h-23.6c-1.623 0-2.95 1.327-2.95 2.95v17.7c0 1.622 1.327 2.95 2.95 2.95h23.6c1.622 0 2.95-1.328 2.95-2.95v-17.7c0-1.623-1.328-2.95-2.95-2.95zM10.1 24.85h-5.9v-17.7h5.9v17.7zM18.95 24.85h-5.9v-17.7h5.9v17.7zM27.8 24.85h-5.9v-17.7h5.9v17.7z"></path>
  </symbol>
</defs></svg>`
  const svg = document.getElementById("svg");
  svg.insertAdjacentHTML("afterend", icon)

}

function getFieldsByData(data) {
  return data.viewType === "table" ? (data.view).columns : (data.view).fields;
};

function genTabHeaderHTML(data, showSearch = false, editable = false) {
  let tabHTML = "";
  let viewData;
  let hasFilter = false;
  getFieldsByData(data).forEach((item) => {
    if (!hasFilter) {
      data.view.filters.find(filterItem => {
        if (filterItem.value.type === item.type && item.id === filterItem.column) {
          hasFilter = true;
          return true;
        }
      });
    }
  });
  data.views.forEach((item) => {
    tabHTML += `<div draggable="true" data-position="north" data-av-type="${item.type}" data-id="${item.id}" data-page="${item.pageSize}" data-desc="${escapeAriaLabel(item.desc || "")}" class="ariaLabel item${item.id === data.viewID ? " item--focus" : ""}">
  ${item.icon ? unicode2Emoji(item.icon, "item__graphic", true) : `<svg class="item__graphic"><use xlink:href="#${getViewIcon(item.type)}"></use></svg>`}
  <span class="item__text">${escapeHtml(item.name)}</span>
</div>`;
    if (item.id === data.viewID) {
      viewData = item;
    }
  });
  return `<div class="av__header">
      <div class="fn__flex av__views${showSearch ? " av__views--show" : ""}">
          <div class="layout-tab-bar fn__flex">
              ${tabHTML}
          </div>
          <div class="fn__space"></div>
          <div class="fn__flex-1"></div>
          <div class="fn__space"></div>
          <div class="fn__space"></div>
          <div class="fn__space"></div>
          <div class="fn__space"></div>
          <div class="fn__space"></div>
          <div class="fn__space"></div>
          <div class="fn__space"></div>
          ${data.isMirror ? ` <span data-av-id="${data.id}" data-popover-url="/api/av/getMirrorDatabaseBlocks" class="popover__block block__icon block__icon--show ariaLabel" data-position="8south" aria-label="${window.top.siyuan.languages.mirrorTip}">
  <svg><use xlink:href="#iconSplitLR"></use></svg></span><div class="fn__space"></div>` : ""}
      </div>
      <div contenteditable="${editable}" spellcheck="${window.top.siyuan.config.editor.spellcheck.toString()}" class="av__title${viewData.hideAttrViewName ? " fn__none" : ""}" data-title="${data.name || ""}" data-tip="${window.top.siyuan.languages._kernel[267]}">${data.name || ""}</div>
      <div class="av__counter fn__none"></div>
  </div>`;
};

function getTableHTMLs(data, e) {
  let calcHTML = "";
  let contentHTML = '<div class="av__row av__row--header"><div class="av__colsticky"></div>';
  let pinIndex = -1;
  let pinMaxIndex = -1;
  let indexWidth = 0;
  const eWidth = e.clientWidth;
  data.columns.forEach((item, index) => {
    if (!item.hidden) {
      if (item.pin) {
        pinIndex = index;
      }
      if (indexWidth < eWidth - 200) {
        indexWidth += parseInt(item.width) || 200;
        pinMaxIndex = index;
      }
    }
  });
  if (eWidth === 0) {
    pinMaxIndex = pinIndex;
  }
  pinIndex = Math.min(pinIndex, pinMaxIndex);
  if (pinIndex > -1) {
    contentHTML = '<div class="av__row av__row--header"><div class="av__colsticky"><div class="av__firstcol"><svg><use xlink:href="#iconUncheck"></use></svg></div>';
    calcHTML = '<div class="av__colsticky">';
  }
  let hasCalc = false;
  data.columns.forEach((column, index) => {
    if (column.hidden) {
      return;
    }
    contentHTML += `<div class="av__cell av__cell--header" data-col-id="${column.id}"  draggable="true" 
data-icon="${column.icon}" data-dtype="${column.type}" data-wrap="${column.wrap}" data-pin="${column.pin}" 
data-desc="${escapeAttr(column.desc)}" data-position="north" 
style="width: ${column.width || "200px"};">${column.icon ? unicode2Emoji(column.icon, "av__cellheadericon", true) : `<svg class="av__cellheadericon"><use xlink:href="#${getColIconByType(column.type)}"></use></svg>`}<span class="av__celltext fn__flex-1">${escapeHtml(column.name)}</span>${column.pin ? '<svg class="av__cellheadericon av__cellheadericon--pin"><use xlink:href="#iconPin"></use></svg>' : ""}<div class="av__widthdrag"></div></div>`;
    if (pinIndex === index) {
      contentHTML += "</div>";
    }
    if (column.type === "lineNumber") {
      // lineNumber type 不参与计算操作
      calcHTML += `<div data-col-id="${column.id}" data-dtype="${column.type}" class="av__calc" style="width: ${column.width || "200px"}">&nbsp;</div>`;
    } else {
      calcHTML += `<div class="av__calc${column.calc && column.calc.operator !== "" ? " av__calc--ashow" : ""}" data-col-id="${column.id}" data-dtype="${column.type}" data-operator="${column.calc?.operator || ""}" 
style="width: ${column.width || "200px"}">${getCalcValue(column) || `<svg><use xlink:href="#iconDown"></use></svg><small>${window.top.siyuan.languages.calc}</small>`}</div>`;
    }
    if (column.calc && column.calc.operator !== "") {
      hasCalc = true;
    }

    if (pinIndex === index) {
      calcHTML += "</div>";
    }
  });
  contentHTML += `</div>`;
  // body
  data.rows.forEach((row, rowIndex) => {
    contentHTML += `<div class="av__row" data-id="${row.id}">`;
    if (pinIndex > -1) {
      contentHTML += '<div class="av__colsticky"><div class="av__firstcol"><svg><use xlink:href="#iconUncheck"></use></svg></div>';
    } else {
      contentHTML += '<div class="av__colsticky"></div>';
    }

    row.cells.forEach((cell, index) => {
      if (data.columns[index].hidden) {
        return;
      }
      // https://github.com/siyuan-note/siyuan/issues/10262
      let checkClass = "";
      if (cell.valueType === "checkbox") {
        checkClass = cell.value?.checkbox?.checked ? " av__cell-check" : " av__cell-uncheck";
      }
      contentHTML += `<div class="av__cell${checkClass}" data-id="${cell.id}" data-col-id="${data.columns[index].id}" 
data-wrap="${data.columns[index].wrap}" 
data-dtype="${data.columns[index].type}" 
${cell.value?.isDetached ? ' data-detached="true"' : ""} 
style="width: ${data.columns[index].width || "200px"};${cell.valueType === "number" ? "text-align: right;" : ""}${cell.bgColor ? `background-color:${cell.bgColor};` : ""}${cell.color ? `color:${cell.color};` : ""}">${renderCell(cell.value, rowIndex, data.showIcon)}</div>`;
      if (pinIndex === index) {
        contentHTML += "</div>";
      }
    });
    contentHTML += "<div></div></div>";
  });
  return `${contentHTML}<div class="av__row--util${data.rowCount > data.rows.length ? " av__readonly--show" : ""}">
  <div class="av__colsticky">
      <span class="fn__space"></span>
  </div>
</div>
<div class="av__row--footer${hasCalc ? " av__readonly--show" : ""}">${calcHTML}</div>`.replaceAll(`background-image:url('assets/`, `background-image:url('${window.top.location.origin}/assets/`).replaceAll(`src="assets/`, `src="${window.top.location.origin}/assets/`);
};

function getGroupTitleHTML(group, counter) {
  let nameHTML = "";
  if (["mSelect", "select"].includes(group.groupValue.type)) {
    group.groupValue.mSelect.forEach((item) => {
      nameHTML += `<span class="b3-chip" style="background-color:var(--b3-font-background${item.color});color:var(--b3-font-color${item.color})">${escapeHtml(item.content)}</span>`;
    });
  } else if (group.groupValue.type === "checkbox") {
    nameHTML = `<svg style="width:calc(1.625em - 12px);height:calc(1.625em - 12px)"><use xlink:href="#icon${group.groupValue.checkbox.checked ? "Check" : "Uncheck"}"></use></svg>`;
  } else {
    nameHTML = group.name;
  }
  return `<div class="av__group-title">
  <span class="fn__space"></span>
  ${nameHTML}
  ${counter === 0 ? '<span class="fn__space"></span>' : `<span class="av__group-counter">(${counter})</span>`}
</div>`;
};

function getGalleryHTML(data) {
  let galleryHTML = "";
  // body
  data.cards.forEach((item, rowIndex) => {
    galleryHTML += `<div data-id="${item.id}" draggable="true" class="av__gallery-item">`;
    if (data.coverFrom !== 0) {
      const coverClass = "av__gallery-cover av__gallery-cover--" + data.cardAspectRatio;
      if (item.coverURL) {
        if (item.coverURL.startsWith("background")) {
          galleryHTML += `<div class="${coverClass}"><img class="av__gallery-img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" style="${item.coverURL}"></div>`;
        } else {
          galleryHTML += `<div class="${coverClass}"><img loading="lazy" class="av__gallery-img${data.fitImage ? " av__gallery-img--fit" : ""}" src="${getCompressURL(item.coverURL)}"></div>`;
        }
      } else if (item.coverContent) {
        galleryHTML += `<div class="${coverClass}"><div class="av__gallery-content">${item.coverContent}</div><div></div></div>`;
      } else {
        galleryHTML += `<div class="${coverClass}"></div>`;
      }
    }
    galleryHTML += '<div class="av__gallery-fields">';
    item.values.forEach((cell, fieldsIndex) => {
      if (data.fields[fieldsIndex].hidden) {
        return;
      }
      let checkClass = "";
      if (cell.valueType === "checkbox") {
        checkClass = cell.value?.checkbox?.checked ? " av__cell-check" : " av__cell-uncheck";
      }
      const isEmpty = cellValueIsEmpty(cell.value);

      let ariaLabel = escapeAttr(data.fields[fieldsIndex].name) || getColNameByType(data.fields[fieldsIndex].type);
      if (data.fields[fieldsIndex].desc) {
        ariaLabel += escapeAttr(`<div class="ft__on-surface">${data.fields[fieldsIndex].desc}</div>`);
      }

      if (cell.valueType === "checkbox" && !data.displayFieldName) {
        cell.value.checkbox.content = data.fields[fieldsIndex].name || getColNameByType(data.fields[fieldsIndex].type);
      }
      const cellHTML = `<div class="av__cell${checkClass}${data.displayFieldName ? "" : " ariaLabel"}" 
data-wrap="${data.fields[fieldsIndex].wrap}" 
aria-label="${ariaLabel}" 
data-position="5west"
data-id="${cell.id}" 
data-field-id="${data.fields[fieldsIndex].id}" 
data-dtype="${cell.valueType}" 
${cell.value?.isDetached ? ' data-detached="true"' : ""} 
style="${cell.bgColor ? `background-color:${cell.bgColor};` : ""}
${cell.color ? `color:${cell.color};` : ""}">${renderCell(cell.value, rowIndex, data.showIcon, "gallery")}</div>`;
      if (data.displayFieldName) {
        galleryHTML += `<div class="av__gallery-field av__gallery-field--name" data-empty="${isEmpty}">
  <div class="av__gallery-name">
      ${data.fields[fieldsIndex].icon ? unicode2Emoji(data.fields[fieldsIndex].icon, undefined, true) : `<svg><use xlink:href="#${getColIconByType(data.fields[fieldsIndex].type)}"></use></svg>`}${window.top.Lute.EscapeHTMLStr(data.fields[fieldsIndex].name)}
      ${data.fields[fieldsIndex].desc ? `<svg aria-label="${data.fields[fieldsIndex].desc}" data-position="north" class="ariaLabel"><use xlink:href="#iconInfo"></use></svg>` : ""}
  </div>
  ${cellHTML}
</div>`;
      } else {
        galleryHTML += `<div class="av__gallery-field" data-empty="${isEmpty}">
  ${cellHTML}
</div>`;
      }
    });
    galleryHTML += `</div></div>`;
  });
  return `<div class="av__gallery${data.cardSize === 0 ? " av__gallery--small" : (data.cardSize === 2 ? " av__gallery--big" : "")}">
  ${galleryHTML}
</div>
<div class="av__gallery-load${data.cardCount > data.cards.length ? "" : " fn__none"}">
  <button class="b3-button av__button" data-type="av-load-more">
      <svg><use xlink:href="#iconArrowDown"></use></svg>
      <span>${window.top.siyuan.languages.loadMore}</span>
      <svg data-type="set-page-size" data-size="${data.pageSize}"><use xlink:href="#iconMore"></use></svg>
  </button>
</div>`.replaceAll(`background-image:url('assets/`, `background-image:url('${window.top.location.origin}/assets/`).replaceAll(`src="assets/`, `src="${window.top.location.origin}/assets/`);
};

function getKanbanTitleHTML(group, counter) {
  let nameHTML = "";
  if (["mSelect", "select"].includes(group.groupValue.type)) {
    group.groupValue.mSelect.forEach((item) => {
      nameHTML += `<span class="b3-chip" style="background-color:var(--b3-font-background${item.color});color:var(--b3-font-color${item.color})">${escapeHtml(item.content)}</span>`;
    });
  } else if (group.groupValue.type === "checkbox") {
    nameHTML = `<svg style="width:calc(1.625em - 12px);height:calc(1.625em - 12px);margin: 4px 0;float: left;"><use xlink:href="#icon${group.groupValue.checkbox.checked ? "Check" : "Uncheck"}"></use></svg>`;
  } else {
    nameHTML = group.name;
  }
  return `<div class="av__group-title">
  <span class="av__group-name fn__ellipsis" style="white-space: nowrap;">${nameHTML}</span>
  ${counter === 0 ? '<span class="fn__space"></span>' : `<span aria-label="${window.top.siyuan.languages.entryNum}" data-position="north" class="av__group-counter ariaLabel">(${counter})</span>`}
  <span class="fn__flex-1"></span>
  <span class="av__group-icon av__group-icon--hover ariaLabel" data-type="av-add-top" data-position="north" aria-label="${window.top.siyuan.languages.newRow}"></span>
</div>`;

}

function getKanbanHTML(data){
  let galleryHTML = "";
  // body
  data.cards.forEach((item, rowIndex) => {
      galleryHTML += `<div data-id="${item.id}" draggable="true" class="av__gallery-item">`;
      if (data.coverFrom !== 0) {
          const coverClass = "av__gallery-cover av__gallery-cover--" + data.cardAspectRatio;
          if (item.coverURL) {
              if (item.coverURL.startsWith("background")) {
                  galleryHTML += `<div class="${coverClass}"><img class="av__gallery-img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" style="${item.coverURL}"></div>`;
              } else {
                  galleryHTML += `<div class="${coverClass}"><img loading="lazy" class="av__gallery-img${data.fitImage ? " av__gallery-img--fit" : ""}" src="${getCompressURL(item.coverURL)}"></div>`;
              }
          } else if (item.coverContent.trim()) {
              galleryHTML += `<div class="${coverClass}"><div class="av__gallery-content">${item.coverContent}</div><div></div></div>`;
          }
      }
      galleryHTML += '<div class="av__gallery-fields">';
      item.values.forEach((cell, fieldsIndex) => {
          if (data.fields[fieldsIndex].hidden) {
              return;
          }
          let checkClass = "";
          if (cell.valueType === "checkbox") {
              checkClass = cell.value?.checkbox?.checked ? " av__cell-check" : " av__cell-uncheck";
          }
          const isEmpty = cellValueIsEmpty(cell.value);
          let ariaLabel = escapeAttr(data.fields[fieldsIndex].name) || getColNameByType(data.fields[fieldsIndex].type);
          if (data.fields[fieldsIndex].desc) {
              ariaLabel += escapeAttr(`<div class="ft__on-surface">${data.fields[fieldsIndex].desc}</div>`);
          }
          if (cell.valueType === "checkbox" && !data.displayFieldName) {
              cell.value.checkbox.content = data.fields[fieldsIndex].name || getColNameByType(data.fields[fieldsIndex].type);
          }
          const cellHTML = `<div class="av__cell${checkClass}${data.displayFieldName ? "" : " ariaLabel"}" 
data-wrap="${data.fields[fieldsIndex].wrap}" 
aria-label="${ariaLabel}" 
data-position="5west"
data-id="${cell.id}" 
data-field-id="${data.fields[fieldsIndex].id}" 
data-dtype="${cell.valueType}" 
${cell.value?.isDetached ? ' data-detached="true"' : ""} 
style="${cell.bgColor ? `background-color:${cell.bgColor};` : ""}
${cell.color ? `color:${cell.color};` : ""}">${renderCell(cell.value, rowIndex, data.showIcon, "kanban")}</div>`;
          if (data.displayFieldName) {
              galleryHTML += `<div class="av__gallery-field av__gallery-field--name" data-empty="${isEmpty}">
  <div class="av__gallery-name">
      ${data.fields[fieldsIndex].icon ? unicode2Emoji(data.fields[fieldsIndex].icon, undefined, true) : `<svg><use xlink:href="#${getColIconByType(data.fields[fieldsIndex].type)}"></use></svg>`}${window.top.Lute.EscapeHTMLStr(data.fields[fieldsIndex].name)}
      ${data.fields[fieldsIndex].desc ? `<svg aria-label="${data.fields[fieldsIndex].desc}" data-position="north" class="ariaLabel"><use xlink:href="#iconInfo"></use></svg>` : ""}
  </div>
  ${cellHTML}
</div>`;
          } else {
              galleryHTML += `<div class="av__gallery-field" data-empty="${isEmpty}">${cellHTML}</div>`;
          }
      });
      galleryHTML += `</div></div>`;
  });
  return `<div class="av__gallery av__gallery--small">
  ${galleryHTML}
</div>
<div class="av__gallery-load${data.cardCount > data.cards.length ? "" : " fn__none"}">
  <button class="b3-button av__button" data-type="av-load-more">
      <svg><use xlink:href="#iconArrowDown"></use></svg>
      <span>${window.top.siyuan.languages.loadMore}</span>
      <svg data-type="set-page-size" data-size="${data.pageSize}"><use xlink:href="#iconMore"></use></svg>
  </button>
</div>`.replaceAll(`background-image:url('assets/`, `background-image:url('${window.top.location.origin}/assets/`).replaceAll(`src="assets/`, `src="${window.top.location.origin}/assets/`);
};


// 渲染数据表格——数据库的表格视图、画廊视图
async function avRender() {
  let avElements = Array.from(document.querySelectorAll('[data-type="NodeAttributeView"]'));
  if (avElements.length === 0) {
    return;
  }
  await addScript("./theme/dayjs.js");
  if (avElements.length > 0) {
    addAttributeViewIcon();
    avElements.forEach((e) => {
      // 表格视图
      if (e.getAttribute("data-av-type") === "table") {
        request("/api/av/renderAttributeView", {
          id: e.getAttribute("data-av-id")
        }).then(response => {
          const data = response.data.view;
          if (data.groups?.length > 0) {
            // 表格视图，分组
            let avBodyHTML = "";
            data.groups.forEach((group) => {
              if (group.groupHidden === 0) {
                avBodyHTML += `${getGroupTitleHTML(group, group.rows.length)}
      <div data-group-id="${group.id}" data-page-size="${group.pageSize}" data-dtype="${group.groupKey.type}" data-content="${group.groupValue.text?.content}" style="float: left" class="av__body${group.groupFolded ? " fn__none" : ""}">${getTableHTMLs(group, e)}</div>`;
              }
            });

            e.firstElementChild.outerHTML = `<div class="av__container">
    ${genTabHeaderHTML(response.data)}
    <div class="av__scroll">
        ${avBodyHTML}
    </div>
</div>`;
          } else {
            // 表格视图，不分组
            const avBodyHTML = `<div class="av__body" data-group-id="" data-page-size="${data.pageSize}" style="float: left">
            ${getTableHTMLs(data, e)}
        </div>`;
            e.firstElementChild.outerHTML = `<div class="av__container">
        ${genTabHeaderHTML(response.data)}
        <div class="av__scroll">
            ${avBodyHTML}
        </div>
    </div>`;
          }
        })
      }
      // 画廊视图
      else if (e.getAttribute("data-av-type") === "gallery") {
        request("/api/av/renderAttributeView", {
          "id": e.getAttribute("data-av-id"),
          "viewID": e.getAttribute("custom-sy-av-view"),
          "query": ""
        }).then(response => {
          const view = response.data.view;
          if (view.groups?.length > 0) {
            // 画廊视图，分组
            let avBodyHTML = "";
            view.groups.forEach((group) => {
              if (group.groupHidden === 0) {
                  avBodyHTML += `${getGroupTitleHTML(group, group.cards.length)}
      <div data-group-id="${group.id}" data-page-size="${group.pageSize}" data-dtype="${group.groupKey.type}" data-content="${group.groupValue.text?.content}" class="av__body${group.groupFolded ? " fn__none" : ""}">${getGalleryHTML(group)}</div>`;
              }
          });
          e.firstElementChild.outerHTML = `<div class="av__container fn__block">
          ${genTabHeaderHTML(response.data)}
          <div>
              ${avBodyHTML}
          </div>
      </div>`;
          } else {
            // 画廊视图，不分组
            const bodyHTML = getGalleryHTML(view);
            e.firstElementChild.outerHTML = `<div class="av__container fn__block">
            ${genTabHeaderHTML(response.data)}
            <div>
                <div class="av__body" data-group-id="" data-page-size="${view.pageSize}">
                    ${bodyHTML}
                </div>
            </div>
        </div>`;
          }
        })
      }
      // 看板视图
      else if (e.getAttribute("data-av-type") === "kanban") {
        request("/api/av/renderAttributeView", {
          "id": e.getAttribute("data-av-id"),
          "viewID": e.getAttribute("custom-sy-av-view"),
          "query": ""
        }).then(response => {
          const view = response.data.view;
          if (view?.groups?.length - 1 > 0) {
            let bodyHTML = "";
            // 不显示最后一个空卡片
            view.groups.pop();
            view.groups.forEach((group) => {
              if (group.groupHidden === 0) {
                bodyHTML += `<div class="av__kanban-group${group.cardSize === 0 ? " av__kanban-group--small" : (group.cardSize === 2 ? " av__kanban-group--big" : "")}">
        ${getKanbanTitleHTML(group, group.cardCount)}
        <div data-group-id="${group.id}" data-page-size="${group.pageSize}" data-dtype="${group.groupKey.type}" class="av__body">${getKanbanHTML(group)}</div>
    </div>`;
              }
            });
            e.firstElementChild.outerHTML = `<div class="av__container fn__block">${genTabHeaderHTML(response.data)}<div class="av__kanban">${bodyHTML}</div></div>`;
          }
        })
      }
    })
  }
}

// 代码高亮
async function highlight() {
  let codeBlocks = document.querySelectorAll('.code-block[data-type="NodeCodeBlock"]');
  if (codeBlocks.length > 0) {
    addStyle("./theme/highlight/atom-one-dark.min.css");
    await addScript("./theme//highlight/highlight.min.js");
    codeBlocks.forEach(codeBlock => {
      let code = codeBlock.querySelector(".hljs");
      let content = code.innerText;
      let codeLanguage = codeBlock.querySelector(".protyle-action__language").innerText
      let highlightedCode;
      try {
        highlightedCode = hljs.highlight(content,
          { language: codeLanguage, ignoreIllegals: true }
        ).value
      } catch (err) {
        // 不支持高亮的语言，就按plaintext渲染
        highlightedCode = hljs.highlight(content,
          { language: "plaintext", ignoreIllegals: true }
        ).value
      }
      code.innerHTML = highlightedCode

    })
  }
}

// 添加刷新按钮
async function addRefreshBtn() {
  let domStr = `<div id="refreshDoc" title="重载/Reload"><svg t="1747160319122" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1458" width="20" height="20"><path d="M1022.955204 522.570753c0 100.19191-81.516572 181.698249-181.718715 181.698249l-185.637977 0c-11.2973 0-20.466124-9.168824-20.466124-20.466124 0-11.307533 9.168824-20.466124 20.466124-20.466124l185.637977 0c77.628008 0 140.786467-63.148226 140.786467-140.766001 0-77.423347-62.841234-140.448776-140.203182-140.766001-0.419556 0.030699-0.818645 0.051165-1.217734 0.061398-5.945409 0.143263-11.686157-2.292206-15.687284-6.702656-4.001127-4.400217-5.894244-10.335393-5.167696-16.250102 1.330298-10.806113 1.944282-19.760043 1.944282-28.192086 0-60.763922-23.658839-117.884874-66.617234-160.833035-42.968627-42.968627-100.089579-66.617234-160.843268-66.617234-47.368844 0-92.742241 14.449084-131.208321 41.781592-37.616736 26.738991-65.952084 63.700811-81.925894 106.884332-2.425236 6.538927-8.012488 11.399631-14.827707 12.893658-6.815219 1.483794-13.927197-0.603751-18.859533-5.54632-19.289322-19.330254-44.943608-29.972639-72.245418-29.972639-56.322773 0-102.146425 45.813419-102.146425 102.125959 0 0.317225 0.040932 0.982374 0.092098 1.627057 0.061398 0.920976 0.122797 1.831718 0.153496 2.762927 0.337691 9.465582-5.863545 17.928325-15.001669 20.455891-32.356942 8.933463-61.541635 28.550243-82.181721 55.217602-21.305235 27.516704-32.571836 60.508096-32.571836 95.41307 0 86.244246 70.188572 156.422585 156.443052 156.422585l169.981393 0c11.2973 0 20.466124 9.15859 20.466124 20.466124 0 11.2973-9.168824 20.466124-20.466124 20.466124l-169.981393 0c-108.828614 0-197.3753-88.536452-197.3753-197.354833 0-44.053332 14.223956-85.712127 41.126676-120.473839 22.809495-29.460985 53.897537-52.086285 88.710414-64.816215 5.065366-74.322729 67.149353-133.2447 142.751215-133.2447 28.386514 0 55.504128 8.217149 78.651314 23.52581 19.657712-39.868009 48.842405-74.169233 85.497233-100.212376 45.434795-32.295544 99.004875-49.354058 154.918325-49.354058 71.692832 0 139.087778 27.915793 189.782368 78.600149 50.694589 50.694589 78.610382 118.089535 78.610382 189.782368 0 3.704368-0.102331 7.470135-0.296759 11.368932C952.633602 352.568894 1022.955204 429.511287 1022.955204 522.570753z" p-id="1459"></path><path d="M629.258611 820.711014l-102.023628 102.013395c-3.990894 4.001127-9.230222 5.996574-14.46955 5.996574s-10.478655-1.995447-14.46955-5.996574l-102.023628-102.013395c-7.992021-7.992021-7.992021-20.947078 0-28.939099s20.947078-8.002254 28.939099 0l67.087954 67.077721 0-358.699522c0-11.2973 9.15859-20.466124 20.466124-20.466124 11.307533 0 20.466124 9.168824 20.466124 20.466124l0 358.699522 67.087954-67.077721c7.992021-8.002254 20.947078-7.992021 28.939099 0S637.250632 812.718993 629.258611 820.711014z" p-id="1460"></path></svg></div>`;
  document.body.insertAdjacentHTML("afterbegin", domStr);
  let refreshBtn = document.getElementById("refreshDoc");
  refreshBtn.addEventListener("click", () => { window.location.reload(); })
}

// 搜索、高亮iframe中的关键词
window._searchText = function (keyword) {
  const allTextNodes = [];
  const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let currentNode = treeWalker.nextNode();
  while (currentNode) {
    allTextNodes.push(currentNode);
    currentNode = treeWalker.nextNode();
  }
  // If the CSS Custom Highlight API is not supported,
  // display a message and bail-out.
  if (!CSS.highlights) {
    console.log("CSS Custom Highlight API not supported.");
    return;
  }
  CSS.highlights.clear();
  // keyword
  const str = keyword.trim().toLowerCase();
  if (!str) {
    return;
  }
  // Iterate over all text nodes and find matches.
  const ranges = allTextNodes
    .map((el) => {
      return { el, text: el.textContent.toLowerCase() };
    })
    .map(({ text, el }) => {
      const indices = [];
      let startPos = 0;
      while (startPos < text.length) {
        const index = text.indexOf(str, startPos);
        if (index === -1) break;
        indices.push(index);
        startPos = index + str.length;
      }
      // Create a range object for each instance of
      // str we found in the text node.
      return indices.map((index) => {
        const range = new Range();
        range.setStart(el, index);
        range.setEnd(el, index + str.length);
        return range;
      });
    });

  if (ranges.flat().length > 0) {
    // Create a Highlight object for the ranges.
    const searchResultsHighlight = new Highlight(...ranges.flat());
    // Register the Highlight object in the registry.
    CSS.highlights.set("search-results", searchResultsHighlight);
    // 记录包含关键词的iframe元素的Id
    window.parent._searchList.push(window.frameElement.getAttribute("id"));
  }
}
// 取消关键词的高亮
window._cancelHighligh = function () {
  CSS.highlights.clear();
}

// 对预览文档进行渲染
async function main() {
  await renderBody();
  await handleIframeInternalLink()
  await highlight();
  await renderEmbedBlock();
  await renderKatex();
  await avRender();
  await renderMermaid();
  await addRefreshBtn();
}

main().catch(err => { console.error(err); })

