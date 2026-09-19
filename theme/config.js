// 请求函数
function request(url, data = null) { return new Promise((resolve, reject) => { fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), }).then((data) => resolve(data.json()), (error) => { reject(error); }).catch((err) => { console.error("请求失败:", err); }); }); }

async function renderBody() {
  let blockLnk = document.getElementById("link").getAttribute("content");
  let id = blockLnk.trim().split('siyuan://blocks/')[1];
  window._currentDocumentID = id;
  let doc = "";
  let htmlStr = "";
  let rootIcon = "";
  let docTags = "";
  let res = await request("/api/filetree/getDoc", { id });
  if (res?.code === 0 && res?.data?.content) {
    // 判断是否是文档块，是的话要另外获取标题
    if (res?.data?.type === "NodeDocument") {
      htmlStr = res.data.content.replaceAll(`"assets/`, `"${window.top.location.origin}/assets/`).replaceAll(`contenteditable="true"`, `contenteditable="false"`).replaceAll(`src="api/icon/getDynamicIcon`, `src="${window.top.location.origin}/api/icon/getDynamicIcon`);
      let response = await request("/api/block/getDocInfo", { id });
      if (response?.code === 0 && response?.data?.name && htmlStr) {
        try {
          // 文档图标
          if (response.data.icon) {
            let icon = response.data.icon;
            if (icon.includes(".")) {
              rootIcon = `<div class="protyle-background__icon" style="margin-top: 8px;transition:none;margin-bottom:12px;"><img class="" src="${window.top.location.origin + '/emojis/' + icon}"></div> `;
            } else if (icon.startsWith("api/icon/getDynamicIcon")) {
              rootIcon = `<div class="protyle-background__icon" style="margin-top: 8px;transition:none;margin-bottom:12px;"><img class="" src="${window.top.location.origin + '/' + icon}"></div> `;
            } else {
              rootIcon = `<div class="protyle-background__icon" style="margin-top: 8px;transition:none;margin-bottom:12px;">${String.fromCodePoint(parseInt(icon, 16))}</div> `;
            }
          }
          // 文档的标签
          if (response.data.ial?.tags) {
            let tags = response.data.ial.tags;
            if (tags.includes(",")) {
              docTags = `<div class="b3-chips b3-chips__doctag">`;
              tags.split(",").forEach(item => {
                docTags += `<div class="b3-chip b3-chip--middle b3-chip--pointer" data-type="open-search">${item}</div>`
              })
              docTags += `</div>`
            } else {
              docTags = `<div class="b3-chips b3-chips__doctag"><div class="b3-chip b3-chip--middle b3-chip--pointer" data-type="open-search">${tags}</div></div>`
            }
          }
        } catch (err) { }
        // 文档标题
        let title = response.data.name.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
        doc = `${rootIcon}${docTags}<h1 data-node-id="${response.data.rootID}">${title}</h1>` + htmlStr;
      }
    } else {
      doc = res.data.content.replaceAll(`"assets/`, `"${window.top.location.origin}/assets/`).replaceAll(`contenteditable="true"`, `contenteditable="false"`).replaceAll(`src="api/icon/getDynamicIcon`, `src="${window.top.location.origin}/api/icon/getDynamicIcon`);
    }
  } else {
    doc = "<h2>加载失败，未找到该内容块！</h2><h2>Failed to load. The content block was not found!</h2>"
  }
  document.body.insertAdjacentHTML("afterbegin", doc);
}
// 部分内容块需要加载依赖文件来进行渲染
const libs = {
  highlight: false,
  katex: false,
  av: false,
  mermaid: false
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
  let QueryEmbedElements = Array.from(document.querySelectorAll('.render-node[data-type="NodeBlockQueryEmbed"]:not([render])'));
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
        let contentStr = blocksItem.block.content.replaceAll(`"assets/`, `"${window.top.location.origin}/assets/`).replaceAll(`contenteditable="true"`, `contenteditable="false"`);
        // 
        html += `<div class="protyle-wysiwyg__embed" data-id="${blocksItem.block.id}">${breadcrumbHTML}${contentStr}</div>`;
      });
      if (blocks.length > 0) {
        element.lastElementChild.insertAdjacentHTML("beforebegin", html);
      } else {
        element.lastElementChild.insertAdjacentHTML("beforebegin", `<div class="ft__smaller ft__secondary b3-form__space--small" contenteditable="false">不存在符合条件的内容块</div><div style="position: absolute;">"\u200b"</div>`);
      }
      element.setAttribute('render', true);
    }
  }
}
// 渲染Katex公式
async function renderKatex() {
  let inlineMathElements = Array.from(document.querySelectorAll('span[data-type="inline-math"]:not([render])'));
  let MathBlockElements = Array.from(document.querySelectorAll('.render-node[data-type="NodeMathBlock"]:not([render]),div.render-node[data-subtype="math"]:not([render])'));
  let tableCellKatexElements = Array.from(document.querySelectorAll('.table__cell-rich>.language-math:not([render])'));
  if (inlineMathElements.length > 0 || MathBlockElements.length > 0 || tableCellKatexElements.length > 0) {
    if (!libs.katex) {
      addStyle("./theme/katex.min.css");
      await addScript("./theme/katex.min.js");
      libs.katex = true;
    }
  }
  if (inlineMathElements.length > 0) {
    for (let element of inlineMathElements) {
      let katexHTML = katex.renderToString(window.top.Lute.UnEscapeHTMLStr(element.getAttribute("data-content")), {
        displayMode: false,
        output: "html",
        macros: {},
        trust: true,
        strict: "ignore"
      });
      element.innerHTML = katexHTML;
      element.setAttribute('render', true);
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
      element.firstElementChild.innerHTML = katexHTML;
      element.setAttribute('render', true);
    }
  }
  if (tableCellKatexElements.length > 0) {
    tableCellKatexElements.forEach(element => {
      let katexHTML = katex.renderToString(
        window.top.Lute.UnEscapeHTMLStr(element.innerText), {
        displayMode: true,
        output: "html",
        macros: {},
        trust: true,
        strict: "ignore"
      });
      element.innerHTML = katexHTML;
      element.setAttribute('render', true);
    })
  }
}

// 渲染Mermaid图表
async function renderMermaid() {
  const mermaidElements = Array.from(document.querySelectorAll('.render-node[data-subtype="mermaid"]:not(render)'));
  if (mermaidElements.length === 0) { return }
  if (!libs.mermaid) {
    await addScript("./theme/mermaid.min.js")
    await addScript("./theme/mermaid-zenuml.min.js")
    await addScript("./theme/mermaid-layout-tidy-tree.min.js")
    await window.mermaid.registerExternalDiagrams([window.zenuml]);
    await window.mermaid.registerLayoutLoaders(window.mermaidTidyTree)
    libs.mermaid = true;
  }
  let mermaidTheme = window?.top?.siyuan?.config?.appearance?.mode === 1 ? "dark" : "light"
  mermaid.initialize({
    startOnLoad: false,
    theme: mermaidTheme
  });
  const MERMAID_LAYOUTS = new Set([
    "dagre",
    "cose-bilkent",
    "tidy-tree",
  ]);
  for (let element of mermaidElements) {
    let content = window.top.Lute.UnEscapeHTMLStr(element.getAttribute("data-content"));
    const layout = element.getAttribute("custom-mermaid-layout");
    if (MERMAID_LAYOUTS.has(layout)) {
      const separator = content.endsWith("\n") ? "" : "\n";
      content = `${content}${separator}%%{init: ${JSON.stringify({ layout })}}%%`;
    }
    const {
      svg
    } = await mermaid.render(`mermaid_${element.getAttribute('data-node-id')}`, content);
    element.firstElementChild.insertAdjacentHTML("afterbegin", `<div contenteditable="false">${svg}</div>`);
    element.setAttribute('render', true);
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
    } catch (e) { }
  }
  return emoji;
};

function escapeHtml(html) {
  if (!html) {
    return html;
  }
  return html.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function getAVTextSource(value) {
  const rich = value?.type === "text" ? value.text?.rich : undefined;
  if (rich && rich.spec === 1 && rich.format === "kramdown" &&
    typeof rich.content === "string") {
    return { kind: "rich", content: rich.content };
  }
  return {
    kind: "plain", content: value?.type === "text" && typeof value.text?.content === "string" ?
      value.text.content : ""
  };
}


function renderCell(cellValue, rowIndex = 0, showIcon = true, type = "table") {
  let text = "";
  if ("template" === cellValue.type) {
    text = `<span class="av__celltext">${cellValue ? (cellValue.template.content || "") : ""}</span>`;
  } else if ("text" === cellValue.type) {
    // 数据库——文本字段——富文本
    const source = getAVTextSource(cellValue);
    if (source.kind === "rich") {
      if (!window.top.lute) {
        window.top.lute = window.top.Lute.New();
        window.top.lute.SetTextMark(true);
        window.top.lute.SetHTMLTag2TextMark(true);
      }
      // 去除空行、处理文字样式、处理引述块和列表与下方文本的粘连
      let str = source.content.replace(/^\s*[\r\n]/gm, '').replace(/(\<span)([^>]+?\>[^<]+?\<\/span\>)\{\: (style\=\"[^"]+?\")\}/g, '$1 $3 $2').replace(/(^\>.*?)\n(?!\>)/mg, '$1\n\n').replace(/(^\s*\-\s.*)\n(?!\s*?\-\s|\s*?\d+\.\s)/mg, '$1\n\n').replace(/(^\s*\d+\.\s.*)\n(?!\s*?\d+\.\s|\s*?\-\s)/mg, '$1\n\n');
      let htmlResult = window.top.lute.Md2HTML(str);
      // 替换换行符，方便控制段落间的间距
      htmlResult = htmlResult.replace(/\<br\s*\/\>/g, `<span class="line-break"></span>`);
      let parser = new DOMParser();
      let doc = parser.parseFromString(htmlResult, 'text/html');
      // highlight()和renderKatex()中,数据库相关子节点仍未挂载,无法查询到对应节点,需在此单独渲染
      let codes = doc.querySelectorAll("pre>code");
      if (codes.length > 0) {
        codes.forEach(code => {
          const content = code.innerText;
          let lang = "plaintext"
          let class_name = code.getAttribute('class');
          if (class_name) {
            lang = class_name.split("-")[1];
          }
          let highlightedCode = hljs.highlight(content,
            { language: lang, ignoreIllegals: true }
          ).value;
          // 数据库文本字段中的代码块，需要手动加上类名：hljs，否则代码渲染有点问题，比如：===会被渲染成三根长横线，跟笔记中显示的不一致。
          code.classList.add("hljs");
          code.innerHTML = highlightedCode;
        })
      }
      // 公式块、行内公式
      let inlineMathElements = doc.querySelectorAll('.render-node[data-type="inline-math"]');
      let MathBlockElements = doc.querySelectorAll('.language-math');
      if (inlineMathElements.length > 0) {
        inlineMathElements.forEach(element => {
          let katexHTML = katex.renderToString(window.top.Lute.UnEscapeHTMLStr(element.getAttribute("data-content")), {
            displayMode: false,
            output: "html",
            macros: {},
            trust: true,
            strict: "ignore"
          });
          element.innerHTML = katexHTML;
        })
        inlineMathElements = null;
      }
      if (MathBlockElements.length > 0) {
        MathBlockElements.forEach(element => {
          let katexHTML = katex.renderToString(
            window.top.Lute.UnEscapeHTMLStr(element.innerText), {
            displayMode: true,
            output: "html",
            macros: {},
            trust: true,
            strict: "ignore"
          });
          element.innerHTML = katexHTML;
        })
        MathBlockElements = null;
      }
      htmlResult = doc.body.innerHTML;
      text = `<div class="av__celltext av__celltext--rich b3-typography" data-protyle-lite-render="safe">${htmlResult}</div>`;
      parser = null;
      doc = null;
      htmlResult = null;
    } else {
      text = `<span class="av__celltext">${cellValue ? window.top.Lute.EscapeHTMLStr(cellValue.text.content || "") : ""}</span>`;
    }
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
  // let hasFilter = false;
  // getFieldsByData(data).forEach((item) => {
  //   if (!hasFilter) {
  //     data.view.filters.find(filterItem => {
  //       if (filterItem.value.type === item.type && item.id === filterItem.column) {
  //         hasFilter = true;
  //         return true;
  //       }
  //     });
  //   }
  // });
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

function getKanbanHTML(data) {
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

// 渲染单个数据表格
async function renderSingleAV(e) {
  request("/api/av/renderAttributeView", {
    "id": e.getAttribute("data-av-id"),
    "viewID": e.getAttribute("custom-sy-av-view"),
    "query": ""
  }).then(response => {
    const viewType = response.data.viewType;
    const view = response.data.view;
    switch (viewType) {
      case "table":
        if (view.groups?.length > 0) {
          // 表格视图，分组
          let avBodyHTML = "";
          view.groups.forEach((group) => {
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
          const avBodyHTML = `<div class="av__body" data-group-id="" data-page-size="${view.pageSize}" style="float: left">
        ${getTableHTMLs(view, e)}
    </div>`;
          e.firstElementChild.outerHTML = `<div class="av__container">
    ${genTabHeaderHTML(response.data)}
    <div class="av__scroll">
        ${avBodyHTML}
    </div>
  </div>`;
        }
        break;

      case "gallery":
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
        break;

      case "kanban":
        if (view?.groups?.length > 0) {
          let bodyHTML = "";
          // 不显示最后一个空卡片
          //view.groups.pop();
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
        break;
    }
    e.setAttribute('render', true);
  })
}

// 数据表格
async function avRender() {
  let avElements = Array.from(document.querySelectorAll('[data-type="NodeAttributeView"]:not([render])'));
  if (avElements.length === 0) {
    return;
  }
  if (!libs.av) {
    await addScript("./theme/dayjs.js");
    addAttributeViewIcon();
    libs.av = true;
  }
  // 富文本中的公式、代码高亮
  if (!libs.highlight) {
    window.top.siyuan.config.appearance.mode === 1 ? addStyle("./theme/highlight/atom-one-dark.min.css") : addStyle("./theme/highlight/github.min.css");
    await addScript("./theme//highlight/highlight.min.js");
    libs.highlight = true;
  }
  if (!libs.katex) {
    addStyle("./theme/katex.min.css");
    await addScript("./theme/katex.min.js");
    libs.katex = true;
  }
  avElements.forEach((e) => {
    renderSingleAV(e);
  })

}

// 代码高亮
async function highlight() {
  let codeBlocks = document.querySelectorAll('.code-block[data-type="NodeCodeBlock"]:not([render])');
  let tableCodeElements = document.querySelectorAll('.table__cell-rich pre>code:not([render])');
  if (codeBlocks.length > 0 || tableCodeElements.length > 0) {
    if (!libs.highlight) {
      window.top.siyuan.config.appearance.mode === 1 ? addStyle("./theme/highlight/atom-one-dark.min.css") : addStyle("./theme/highlight/github.min.css");
      await addScript("./theme//highlight/highlight.min.js");
      libs.highlight = true;
    }
  }
  if (codeBlocks.length > 0) {
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
        highlightedCode = hljs.highlight(content,
          { language: "plaintext", ignoreIllegals: true }
        ).value
      }
      code.innerHTML = highlightedCode;
      codeBlock.setAttribute('render', true);
    })
  }
  if (tableCodeElements.length > 0) {
    tableCodeElements.forEach(element => {
      let content = element.innerText;
      let lang = "plaintext";
      let attr = element.getAttribute('class');
      if (attr) {
        lang = attr.split('-')[1];
      }
      highlightedCode = hljs.highlight(content,
        { language: lang, ignoreIllegals: true }
      ).value;
      // 表格中的代码块，需要手动加上类名：hljs，否则代码渲染有点问题，比如：===会被渲染成三根长横线，跟笔记中显示的不一致。
      element.classList.add("hljs");
      element.innerHTML = highlightedCode;
      element.setAttribute('render', true);
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
  if (!CSS.highlights) {
    console.error("CSS Custom Highlight API not supported.");
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


// util
function hasClosestByAttribute(element, attr, value, top = false) {
  if (!element || element.nodeType === 9) {
    return false;
  }
  if (element.nodeType === 3) {
    element = element.parentElement;
  }
  let e = element;
  let isClosest = false;
  while (e && !isClosest && (top ? e.tagName !== "BODY" : !e.classList.contains("protyle-wysiwyg"))) {
    if (typeof value === "string" && e.getAttribute(attr)?.split(" ").includes(value)) {
      isClosest = true;
    } else if (typeof value !== "string" && e.hasAttribute(attr)) {
      isClosest = true;
    } else {
      e = e.parentElement;
    }
  }
  return isClosest && e;
};
function hasTopClosestByAttribute(element, attr, value, top = false) {
  let closest = hasClosestByAttribute(element, attr, value, top);
  let parentClosest = false;
  let findTop = false;
  while (closest && !closest.classList.contains("protyle-wysiwyg") && !findTop) {
    parentClosest = hasClosestByAttribute(closest.parentElement, attr, value, top);
    if (parentClosest) {
      closest = parentClosest;
    } else {
      findTop = true;
    }
  }
  return closest || false;
};
function isInEmbedBlock(element) {
  const embedElement = hasTopClosestByAttribute(element, "data-type", "NodeBlockQueryEmbed");
  if (embedElement) {
    if (embedElement === element) {
      return false;
    } else {
      return embedElement;
    }
  } else {
    return false;
  }
};
function hasClosestBlock(element) {
  const nodeElement = hasClosestByAttribute(element, "data-node-id", null);
  if (nodeElement && nodeElement.tagName !== "BUTTON" && nodeElement.getAttribute("data-type")?.startsWith("Node")) {
    return nodeElement;
  }
  return false;
};


// foldHeading
function handleFoldHeading(operation) {
  document.querySelectorAll(`[data-node-id="${operation.id}"]`).forEach(item => {
    item.setAttribute("fold", "1");
  })
  if (operation.retData) {
    operation.retData.forEach((blockID) => {
      Array.from(document.querySelectorAll(`[data-node-id="${blockID}"]`)).forEach(itemElement => {
        itemElement.remove();
      });
    });
  }
}
// unfoldHeading
function handleUnfoldHeading(operation) {
  Array.from(document.querySelectorAll(`[data-node-id="${operation.id}"]`)).forEach(async item => {
    item.removeAttribute("fold");
    if (operation.retData) {
      let dom = operation.retData.replaceAll(`"assets/`, `"${window.top.location.origin}/assets/`).replaceAll(`contenteditable="true"`, `contenteditable="false"`).replaceAll(`src="api/icon/getDynamicIcon`, `src="${window.top.location.origin}/api/icon/getDynamicIcon`);
      item.insertAdjacentHTML("afterend", dom);
      await renderEmbedBlock();
      await renderNodeTab();
      await handleTable();
      await avRender();
      await highlight();
      await renderKatex();
      await renderMindMap();
      await renderMermaid();
      await renderCustomBlock();
    }
    if (operation.data === "remove") {
      item.remove();
    }
  })
}
// attributeView change
function handleAvUpdate(operation) {
  // 数据库标题的更新，单独处理
  if (operation.action === "setAttrViewName") {
    Array.from(document.querySelectorAll(`.av[data-av-id="${operation.id}"]`)).forEach(item => {
      const titleElement = item.querySelector(".av__title");
      if (!titleElement) {
        return;
      }
      titleElement.textContent = operation.data;
      titleElement.dataset.title = operation.data;
    })
    return;
  }
  // 数据表格的其他变更
  Array.from(document.querySelectorAll(`[data-av-id="${operation.avID}"]`)).forEach(e => {
    request("/api/av/renderAttributeView", {
      "id": operation.avID,
      "viewID": operation.id,
      "query": ""
    }).then(response => {
      const viewType = response.data.viewType;
      const view = response.data.view;
      e.setAttribute("data-av-id", operation.avID);
      e.setAttribute("custom-sy-av-view", operation.id)
      e.setAttribute("data-av-type", viewType)
      switch (viewType) {
        case "table":
          if (view.groups?.length > 0) {
            let avBodyHTML = "";
            view.groups.forEach((group) => {
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
            const avBodyHTML = `<div class="av__body" data-group-id="" data-page-size="${view.pageSize}" style="float: left">
              ${getTableHTMLs(view, e)}
          </div>`;
            e.firstElementChild.outerHTML = `<div class="av__container">
          ${genTabHeaderHTML(response.data)}
          <div class="av__scroll">
              ${avBodyHTML}
          </div>
        </div>`;
          }
          break;

        case "gallery":
          if (view.groups?.length > 0) {
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
          break;

        case "kanban":
          if (view?.groups?.length > 0) {
            let bodyHTML = "";
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
          break;
      }
    })
  })

}
// update
function handleUpdate(operation) {
  let items = Array.from(document.querySelectorAll(`[data-node-id="${operation.id}"]`))
  items.forEach(async item => {
    let dom = operation.data.replaceAll(`"assets/`, `"${window.top.location.origin}/assets/`).replaceAll(`contenteditable="true"`, `contenteditable="false"`).replaceAll(`src="api/icon/getDynamicIcon`, `src="${window.top.location.origin}/api/icon/getDynamicIcon`);
    item.outerHTML = dom;
    await renderEmbedBlock();
    await renderNodeTab();
    await handleTable();
    await avRender();
    await highlight();
    await renderKatex();
    await renderMindMap();
    await renderMermaid();
    await renderCustomBlock();
  });
}

// insert
function handleInsert(operation) {
  if (operation.previousID) {
    let items = Array.from(document.querySelectorAll(`[data-node-id="${operation.previousID}"]`));
    items.forEach(async item => {
      if (item.nextElementSibling?.getAttribute("data-node-id") !== operation.id) {
        let dom = operation.data.replaceAll(`"assets/`, `"${window.top.location.origin}/assets/`).replaceAll(`contenteditable="true"`, `contenteditable="false"`).replaceAll(`src="api/icon/getDynamicIcon`, `src="${window.top.location.origin}/api/icon/getDynamicIcon`);
        item.insertAdjacentHTML("afterend", dom);
        await renderEmbedBlock();
        await renderNodeTab();
        await handleTable();
        await avRender();
        await highlight();
        await renderKatex();
        await renderMindMap();
        await renderMermaid();
        await renderCustomBlock();
      }
    });
  } else if (operation.nextID) {
    Array.from(document.querySelectorAll(`[data-node-id="${operation.nextID}"]`)).forEach(async item => {
      item.insertAdjacentHTML("beforebegin", operation.data.replaceAll(`"assets/`, `"${window.top.location.origin}/assets/`).replaceAll(`contenteditable="true"`, `contenteditable="false"`).replaceAll(`src="api/icon/getDynamicIcon`, `src="${window.top.location.origin}/api/icon/getDynamicIcon`));
      await renderEmbedBlock();
      await renderNodeTab();
      await handleTable();
      await avRender();
      await highlight();
      await renderKatex();
      await renderMindMap();
      await renderMermaid();
      await renderCustomBlock();
    });
  } else {
    const parentElement = document.querySelectorAll(`[data-node-id="${operation.parentID}"]`);
    parentElement.forEach(item => {
      if (!isInEmbedBlock(item)) {
        item.insertAdjacentHTML("afterend", operation.data.replaceAll(`"assets/`, `"${window.top.location.origin}/assets/`).replaceAll(`contenteditable="true"`, `contenteditable="false"`).replaceAll(`src="api/icon/getDynamicIcon`, `src="${window.top.location.origin}/api/icon/getDynamicIcon`));
      }
    });
  }
}

// delete
function handleDelete(operation) {
  Array.from(document.querySelectorAll(`[data-node-id="${operation.id}"]`)).forEach(item => {
    item.remove();
  });
}
// move
function handleMove(operation) {
  const updateElements = [];
  Array.from(document.querySelectorAll(`[data-node-id="${operation.id}"]`)).forEach(item => {
    if (!isInEmbedBlock(item)) {
      updateElements.push(item);
    }
  });
  let hasFind = false;
  if (operation.previousID && updateElements.length > 0) {
    const previousElement = document.querySelectorAll(`[data-node-id="${operation.previousID}"]`);
    if (previousElement.length > 0) {
      previousElement.forEach(item => {
        if (!isInEmbedBlock(item)) {
          item.after(updateElements[0].cloneNode(true));
          hasFind = true;
        }
      });
    }
  } else if (updateElements.length > 0) {
    Array.from(document.querySelectorAll(`[data-node-id="${operation.parentID}"]`)).forEach(item => {
      if (!isInEmbedBlock(item)) {
        const cloneElement = updateElements[0].cloneNode(true);
        if (item.firstElementChild?.classList.contains("protyle-action")) {
          item.firstElementChild.after(cloneElement);
        } else if (item.classList.contains("callout")) {
          item.querySelector(".callout-content").prepend(cloneElement);
        } else {
          item.prepend(cloneElement);
        }
        hasFind = true;
      }
    });
  }
  updateElements.forEach(item => {
    if (hasFind) {
      item.remove();
    }
  });
}
// setAttrs

function handleSetAttrs(operation) {
  document.querySelectorAll(`[data-node-id="${operation.id}"]`).forEach(item => {
    if (JSON.parse(operation.data).fold === "1") {
      item.setAttribute("fold", "1");
    } else {
      item.removeAttribute("fold");
    }
  });
}
// transactions
function handleEventBus(e) {
  if (e.detail.cmd !== "transactions") {
    return;
  }
  let operations = Array.from(e.detail.data[0].doOperations);
  operations.forEach(operation => {
    if (operation.action === "foldHeading") {
      handleFoldHeading(operation);
    }
    if (operation.action === "unfoldHeading") {
      handleUnfoldHeading(operation);
    }
    if (["addAttrViewCol", "updateAttrViewCol", "updateAttrViewColOptions",
      "updateAttrViewColOption", "updateAttrViewCell", "sortAttrViewRow", "sortAttrViewCol", "setAttrViewColHidden",
      "setAttrViewColWrap", "setAttrViewColWidth", "removeAttrViewColOption", "setAttrViewName", "setAttrViewFilters",
      "setAttrViewSorts", "setAttrViewColCalc", "removeAttrViewCol", "updateAttrViewColNumberFormat", "removeAttrViewBlock",
      "replaceAttrViewBlock", "updateAttrViewColTemplate", "setAttrViewColPin", "addAttrViewView", "setAttrViewColIcon",
      "removeAttrViewView", "setAttrViewViewName", "setAttrViewViewIcon", "duplicateAttrViewView", "sortAttrViewView",
      "updateAttrViewColRelation", "setAttrViewPageSize", "updateAttrViewColRollup", "sortAttrViewKey", "setAttrViewColDesc",
      "duplicateAttrViewKey", "setAttrViewViewDesc", "setAttrViewCoverFrom", "setAttrViewCoverFromAssetKeyID",
      "setAttrViewBlockView", "setAttrViewCardSize", "setAttrViewCardAspectRatio", "hideAttrViewName", "setAttrViewShowIcon",
      "setAttrViewWrapField", "setAttrViewGroup", "removeAttrViewGroup", "hideAttrViewGroup", "sortAttrViewGroup",
      "foldAttrViewGroup", "hideAttrViewAllGroups", "setAttrViewFitImage", "setAttrViewDisplayFieldName",
      "insertAttrViewBlock", "setAttrViewColDateFillSpecificTime", "setAttrViewFillColBackgroundColor", "setAttrViewUpdatedIncludeTime",
      "setAttrViewCreatedIncludeTime"].includes(operation.action)) {
      handleAvUpdate(operation);
    }
    if (operation.action === "update") {
      handleUpdate(operation);
    }
    if (operation.action === "insert") {
      handleInsert(operation);
    }
    if (operation.action === "delete") {
      handleDelete(operation);
    }
    if (operation.action === "move") {
      handleMove(operation);
    }
    if (operation.action === "setAttrs") {
      handleSetAttrs(operation);
    }
  })
}

async function contentSync() {
  if (!window.contentSync) {
    return
  }
  if (!window.top?.openAPI) {
    return
  }
  window.top.openAPI.plugin.eventBus.off("ws-main", handleEventBus);
  window.top.openAPI.plugin.eventBus.on("ws-main", handleEventBus);
}

function getTabItems(tab) {
  return Array.from(tab.children).filter(item => item.classList.contains("tab-item"))
}
function getTabTitle(item) {
  return item.querySelector(":scope > .tab-item-info > .tab-item-title, :scope > .tab-item-info > [tabs-title] > .tab-item-title");
}
function itemID(item) {
  return item.getAttribute("data-node-id") || item.id;
}
function getTabContent(item) {
  return item.querySelector(":scope > .tab-item-content");
}
// 渲染页签块
async function renderNodeTab() {
  const nodeTabElements = Array.from(document.querySelectorAll('.tabs[data-type="NodeTabs"]:not(render)'));
  if (nodeTabElements.length > 0) {
    nodeTabElements.forEach((tab, tabIndex) => {
      let activeID = tab.getAttribute("tabs-active-id");
      // 如果嵌入的是页签块中的单个页签项，则显示该项，忽略原本的选中项
      let EmbedSingleTag = tab.querySelector(`.tab-item[data-node-id="${window._currentDocumentID}"]`);
      if (EmbedSingleTag) {
        activeID = window._currentDocumentID;
      }
      const items = getTabItems(tab);
      const narrow = tab.clientWidth < 420;
      const vertical = tab.getAttribute("tabs-position") === "left" && !narrow;
      tab.setAttribute("data-tabs-orientation", vertical ? "vertical" : "horizontal");
      let header = tab.querySelector(":scope > .tabs-header");
      if (!header) {
        header = document.createElement("div");
        header.className = "tabs-header protyle-action";
        tab.prepend(header);
      }
      const list = document.createElement("div");
      list.className = "tabs-list";
      list.setAttribute("role", "tablist");
      list.setAttribute("aria-label", window.parent._languages["tabLabel"]);
      items.forEach((item, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "tabs-tab ariaLabel";
        button.setAttribute("role", "tab");
        const item_id = itemID(item);
        if (item_id === activeID) {
          button.setAttribute("aria-selected", true);
          const itemTitle = item.querySelector(".tab-item-info");
          itemTitle.classList.add("hidden")
        } else {
          item.classList.add("hidden")
        }
        button.dataset.tabId = item_id;
        const title = getTabTitle(item);
        const label = title?.textContent || window.parent._languages["tabLabel"];
        if (title?.textContent) {
          const clone = title.cloneNode(true);
          clone.className = "tabs-tab-label";
          button.appendChild(clone);
        } else {
          button.innerHTML = '<span class="tabs-tab-label"></span>';
          button.firstElementChild.textContent = window.parent._languages["tabLabel"];
        }
        list.appendChild(button);
      })
      header.replaceChildren(list);
      tab.setAttribute('render', true);
    })

  }
}

// 表格——富文本：去掉列表中用来包裹文本的p元素
async function handleTable() {
  let richCells = document.querySelectorAll('.table__cell-rich:not([render])');
  if (richCells.length > 0) {
    richCells.forEach(cell => {
      let listElements = cell.querySelectorAll('ul, ol');
      if (listElements.length > 0) {
        const template = document.createElement("template");
        template.innerHTML = cell.innerHTML;
        template.content.querySelectorAll('ul p,ol p').forEach(p => {
          p.outerHTML = p.innerHTML;
        })
        cell.innerHTML = template.innerHTML;
        cell.setAttribute('render', true);
      }
    })
  }
}
function decodeCustomBlockInfo(info) {
  const separator = info.indexOf("/");
  if (separator < 1 || separator !== info.lastIndexOf("/") || separator === info.length - 1) {
    return;
  }
  try {
    const pluginName = decodeURIComponent(info.slice(0, separator));
    const blockType = decodeURIComponent(info.slice(separator + 1));
    if (pluginName && blockType) {
      return { pluginName, blockType };
    }
  } catch {
    return;
  }
};
function getContentElement(element) {
  let contentElement = Array.from(element.children).find(item =>
    item.classList.contains("custom-block__content"));
  if (contentElement) {
    contentElement.innerHTML = "";
  } else {
    contentElement = element.ownerDocument.createElement("div");
    contentElement.className = "custom-block__content";
    const attrElement = Array.from(element.children).find(item => item.classList.contains("protyle-attr"));
    element.insertBefore(contentElement, attrElement || null);
  }
  return contentElement;
};
function disposeRenderer(dispose) {
  try {
    dispose();
  } catch (error) {
    console.error("Custom block cleanup failed:", error);
  }
};

// 自定义块
async function renderCustomBlock() {
  let elements = document.querySelectorAll('.custom-block[data-type="NodeCustomBlock"]:not(render)');
  if (elements.length > 0) {
    try {
      elements.forEach(element => {
        const info = element.getAttribute("data-info") || "";
        const content = element.getAttribute("data-content") || "";
        const decoded = decodeCustomBlockInfo(info);
        const plugin = window.top?.siyuan?.ws?.app?.plugins.find(item => item.name === decoded?.pluginName);
        if (plugin) {
          const render = plugin?.customBlockRenders[decoded.blockType]?.render;
          const contentElement = getContentElement(element);
          const dispose = render({ element: contentElement, content, setContent: false });
          if (typeof dispose === "function") {
            disposeRenderer(dispose);
          }
          element.setAttribute("render", true);
        } else {
          const contentElement = getContentElement(element);
          contentElement.innerHTML = `⚠️${window.parent._languages["renderCustomBlockFailed"]}<span data-type="text" style="background-color: var(--b3-inline-builtin-error-background-color, var(--b3-card-error-background)); color: var(--b3-inline-builtin-error-color, var(--b3-card-error-color));padding: 4px;border-radius: 4px;">${decoded?.pluginName}</span>`;
        }
      });
    } catch (err) {
      console.error(err);
    }
  }
}



// ===============================================================================================================================

const isRecord = (value) =>
  !!value && typeof value === "object" && !Array.isArray(value);
const directBlocks = (element) => Array.from(element.children).filter(child =>
  child.hasAttribute("data-node-id"));
const directItems = (list) => directBlocks(list).filter(child =>
  child.getAttribute("data-type") === "NodeListItem");
function parseListMindmapMetadata(value) {
  if (value === null) {
    return { version: 1, nodes: Object.create(null), relations: [] };
  }
  let data;
  try {
    data = JSON.parse(value);
  } catch {
    throw new Error("Invalid list mindmap metadata");
  }
  if (!isRecord(data) || data.version !== 1 || !isRecord(data.nodes) || !Array.isArray(data.relations)) {
    throw new Error("Invalid list mindmap metadata");
  }
  const stringKeys = ["textColor", "backgroundColor", "borderColor", "lineColor"];
  const numberKeys = ["fontSize", "borderWidth", "borderRadius", "lineWidth"];
  const booleanKeys = ["bold", "italic", "lineDash"];
  for (const [id, style] of Object.entries(data.nodes)) {
    if (!id || !isRecord(style) ||
      stringKeys.some(key => key in style && typeof style[key] !== "string") ||
      numberKeys.some(key => key in style && (typeof style[key] !== "number" ||
        !Number.isFinite(style[key]) || Number(style[key]) < 0)) ||
      booleanKeys.some(key => key in style && typeof style[key] !== "boolean")) {
      throw new Error("Invalid list mindmap metadata");
    }
  }
  const relationIds = new Set();
  for (const relation of data.relations) {
    if (!isRecord(relation) || typeof relation.id !== "string" || !relation.id ||
      relationIds.has(relation.id) || typeof relation.from !== "string" || !relation.from ||
      typeof relation.to !== "string" || !relation.to || typeof relation.label !== "string" ||
      ("color" in relation && typeof relation.color !== "string") ||
      ("width" in relation && (typeof relation.width !== "number" ||
        !Number.isFinite(relation.width) || relation.width < 0)) ||
      ("dash" in relation && typeof relation.dash !== "boolean")) {
      throw new Error("Invalid list mindmap metadata");
    }
    relationIds.add(relation.id);
  }
  return data;
};
function readListMindmap(list) {
  if (list.getAttribute("data-type") !== "NodeList" || !list.getAttribute("data-node-id")) {
    throw new Error("A list mindmap requires a list block");
  }
  const metadata = parseListMindmapMetadata(list.getAttribute("custom-sy-list-mindmap-data"));
  const nodes = new Map();
  const virtualRoot = {
    id: list.getAttribute("data-node-id"),
    contentBlocks: [],
    children: [],
    collapsed: false,
    virtual: true,
  };
  const pending = [{ list, parent: virtualRoot }];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const item of directItems(current.list)) {
      const id = item.getAttribute("data-node-id");
      if (!id || nodes.has(id) || id === virtualRoot.id) {
        throw new Error("Invalid list mindmap node identity");
      }
      const blocks = directBlocks(item);
      const node = {
        id,
        parentId: current.parent.id,
        element: item,
        contentBlocks: blocks.filter(block => block.getAttribute("data-type") !== "NodeList"),
        children: [],
        collapsed: item.getAttribute("fold") === "1",
        virtual: false,
      };
      current.parent.children.push(node);
      nodes.set(id, node);
      blocks.filter(block => block.getAttribute("data-type") === "NodeList").reverse().forEach(child => {
        pending.push({ list: child, parent: node });
      });
    }
  }
  const root = virtualRoot.children.length === 1 ? virtualRoot.children[0] : virtualRoot;
  if (root.virtual) {
    nodes.set(root.id, root);
  } else {
    delete root.parentId;
  }
  return { list, root, nodes, metadata };
};

const createElement = (tag, className) => {
  const element = document.createElement(tag);
  element.className = className;
  return element;
};

function layoutListMindmap(root, options = {}) {
  const horizontalGap = options.horizontalGap ?? 40;
  const verticalGap = options.verticalGap ?? 24;
  const padding = options.padding ?? 32;
  if ([horizontalGap, verticalGap, padding].some(value => !Number.isFinite(value) || value < 0)) {
    throw new Error("Invalid list mindmap layout spacing");
  }
  const ordered = [];
  const pending = [{ node: root, depth: 0, parentId: undefined }];
  const seen = new Set();
  while (pending.length > 0) {
    const current = pending.pop();
    if (!current.node.id || seen.has(current.node.id) ||
      !Number.isFinite(current.node.width) || current.node.width <= 0 ||
      !Number.isFinite(current.node.height) || current.node.height <= 0) {
      throw new Error("Invalid list mindmap layout node");
    }
    seen.add(current.node.id);
    ordered.push(current);
    if (!current.node.collapsed) {
      [...current.node.children].reverse().forEach(node => {
        pending.push({ node, depth: current.depth + 1, parentId: current.node.id });
      });
    }
  }
  const heights = new Map();
  [...ordered].reverse().forEach(({ node }) => {
    const children = node.collapsed ? [] : node.children;
    const childHeight = children.reduce((sum, child) => sum + heights.get(child.id), 0) +
      Math.max(0, children.length - 1) * verticalGap;
    heights.set(node.id, Math.max(node.height, childHeight));
  });
  const tops = new Map([[root.id, padding]]);
  const nodes = new Map();
  const edges = [];
  let width = padding;
  ordered.forEach(({ node, parentId }) => {
    const top = tops.get(node.id);
    const height = heights.get(node.id);
    const parent = nodes.get(parentId);
    const position = {
      id: node.id,
      parentId,
      x: parent ? parent.x + parent.width + horizontalGap : padding,
      y: top + (height - node.height) / 2,
      width: node.width,
      height: node.height,
    };
    nodes.set(node.id, position);
    width = Math.max(width, position.x + position.width);
    if (parentId) {
      edges.push({ from: parentId, to: node.id });
    }
    const children = node.collapsed ? [] : node.children;
    const childHeight = children.reduce((sum, child) => sum + heights.get(child.id), 0) +
      Math.max(0, children.length - 1) * verticalGap;
    let childTop = top + (height - childHeight) / 2;
    children.forEach(child => {
      tops.set(child.id, childTop);
      childTop += heights.get(child.id) + verticalGap;
    });
  });
  return { nodes, edges, width: width + padding, height: heights.get(root.id) + padding * 2 };
};

function routeMindmapRelation(from, to, nodes, clearance = 12) {
  const boxes = nodes.flatMap(node => [
    {
      left: node.x - clearance, right: node.x + node.width + clearance,
      top: node.y - clearance, bottom: node.y + node.height + clearance
    },
    {
      left: node.x + node.width - 19, right: node.x + node.width + 46,
      top: (node.controlY ?? node.y + node.height) - 19, bottom: (node.controlY ?? node.y + node.height) + 19
    },
  ]);
  const ports = (node) => [
    { x: node.x + node.width / 2, y: node.y - clearance, direction: 1 },
    { x: node.x + node.width / 2, y: node.y + node.height + clearance, direction: 1 },
    { x: node.x - clearance, y: node.y + node.height / 2, direction: 0 },
    { x: node.x + node.width + clearance, y: node.y + Math.max(0, Math.min(node.height / 2, node.height - 22)), direction: 0 },
  ];
  const starts = ports(from);
  const goals = to.width === 0 && to.height === 0 ?
    [{ x: to.x, y: to.y, direction: 0 }, { x: to.x, y: to.y, direction: 1 }] : ports(to);
  const xs = [...new Set([...boxes.flatMap(box => [box.left, box.right]), ...starts.map(p => p.x), ...goals.map(p => p.x)])].sort((a, b) => a - b);
  const ys = [...new Set([...boxes.flatMap(box => [box.top, box.bottom]), ...starts.map(p => p.y), ...goals.map(p => p.y)])].sort((a, b) => a - b);
  const point = (index) => ({ x: xs[index % xs.length], y: ys[Math.floor(index / xs.length)] });
  const indexOf = (p) => ys.indexOf(p.y) * xs.length + xs.indexOf(p.x);
  const columns = new Map();
  const rows = new Map();
  const blocked = (a, b) => {
    if (a.x === b.x) {
      if (!columns.has(a.x)) {
        columns.set(a.x, boxes.filter(box => a.x > box.left && a.x < box.right));
      }
      return columns.get(a.x).some(box => Math.max(a.y, b.y) > box.top && Math.min(a.y, b.y) < box.bottom);
    }
    if (!rows.has(a.y)) {
      rows.set(a.y, boxes.filter(box => a.y > box.top && a.y < box.bottom));
    }
    return rows.get(a.y).some(box => Math.max(a.x, b.x) > box.left && Math.min(a.x, b.x) < box.right);
  };
  const heuristic = (p) => Math.min(...goals.map(goal => Math.abs(p.x - goal.x) + Math.abs(p.y - goal.y)));
  const targets = new Set(goals.map(goal => indexOf(goal) * 2 + goal.direction));
  const distance = new Map();
  const previous = new Map();
  const heap = [];
  const push = (item) => {
    let i = heap.length;
    heap.push(item);
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (heap[parent].score <= item.score) {
        break;
      }
      heap[i] = heap[parent];
      i = parent;
    }
    heap[i] = item;
  };
  const pop = () => {
    const first = heap[0];
    const last = heap.pop();
    if (heap.length) {
      let i = 0;
      while (i * 2 + 1 < heap.length) {
        let child = i * 2 + 1;
        if (child + 1 < heap.length && heap[child + 1].score < heap[child].score) {
          child++;
        }
        if (last.score <= heap[child].score) {
          break;
        }
        heap[i] = heap[child];
        i = child;
      }
      heap[i] = last;
    }
    return first;
  };
  starts.forEach(start => {
    if (blocked(start, start)) {
      return;
    }
    const key = indexOf(start) * 2 + start.direction;
    distance.set(key, 0);
    push({ key, cost: 0, score: heuristic(start) });
  });
  while (heap.length) {
    const current = pop();
    if (distance.get(current.key) !== current.cost) {
      continue;
    }
    const index = Math.floor(current.key / 2);
    const a = point(index);
    if (targets.has(current.key) && previous.has(current.key)) {
      const route = [];
      let key = current.key;
      while (key !== undefined) {
        route.push(point(Math.floor(key / 2)));
        key = previous.get(key);
      }
      route.reverse();
      return route.filter((p, i) => i === 0 || i === route.length - 1 ||
        !((route[i - 1].x === p.x && route[i + 1].x === p.x) || (route[i - 1].y === p.y && route[i + 1].y === p.y)));
    }
    const x = index % xs.length;
    const y = Math.floor(index / xs.length);
    const neighbors = [x > 0 ? index - 1 : -1, x + 1 < xs.length ? index + 1 : -1,
    y > 0 ? index - xs.length : -1, y + 1 < ys.length ? index + xs.length : -1];
    neighbors.forEach((next, side) => {
      if (next < 0) {
        return;
      }
      const b = point(next);
      const direction = side < 2 ? 0 : 1;
      if ((!previous.has(current.key) && direction !== current.key % 2) || blocked(a, b)) {
        return;
      }
      const key = next * 2 + direction;
      const cost = current.cost + Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + (direction === current.key % 2 ? 0 : 24);
      if (cost >= (distance.get(key) ?? Infinity)) {
        return;
      }
      distance.set(key, cost);
      previous.set(key, current.key);
      push({ key, cost, score: cost + heuristic(b) });
    });
  }
  return [];
};


class ListMindmapView {
  #options;
  #model;
  #viewport;
  #world;
  #canvas;
  #toolbar;
  #inspector;
  #zoomLabel;
  #zoomSlider = createElement("input", "b3-slider");
  #nodeElements = new Map();
  #relationElements = new Map();
  #buttons = new Map();
  #folded = new Map();
  #colorProbe = createElement("span", "list-mindmap__color-probe");
  #positions = new Map();
  #edges = [];
  #bounds = { width: 1, height: 1 };
  #selectedId;
  #selectedRelation;
  #selectedEdge;
  #hoveredLine;
  #finishRelationEdit;
  #linePaths = [];
  #relationRoutes = new Map();
  #relationFrom;
  #relationPreview = { x: null, y: null, targetId: "" };
  #editingId;
  #pointer;
  #pointerCapture;
  #pendingPointerId;
  #linkTimer = 0;
  #suppressLinkClick = false;
  #ghost;
  #scale = 1;
  #offsetX = 0;
  #offsetY = 0;
  #foldAnchor;
  #frame = 0;
  #initialFit = true;
  #destroyed = false;
  #resizeObserver;
  #fullscreenMarker;
  #disposers = [];
  #printTransform = { scale: null, offsetX: null, offsetY: null };
  constructor(options) {
    this.#options = options;
    this.#model = options.model;
    this.#selectedId = options.model.root.id;
    options.host.classList.add("list-mindmap");
    options.host.contentEditable = "false";
    options.host.setAttribute("role", "group");
    options.host.setAttribute("aria-label", "mindmap");
    options.host.tabIndex = 0;
    this.#viewport = createElement("div", "list-mindmap__viewport");
    this.#canvas = createElement("canvas", "list-mindmap__canvas");
    this.#canvas.setAttribute("aria-hidden", "true");
    this.#world = createElement("div", "list-mindmap__world");
    this.#inspector = createElement("div", "list-mindmap__inspector");
    this.#inspector.hidden = true;
    this.#zoomLabel = createElement("span", "list-mindmap__zoom");
    this.#viewport.append(this.#canvas, this.#world);
    this.#colorProbe.setAttribute("aria-hidden", "true");
    this.#zoomLabel = createElement("span", "list-mindmap__zoom");
    options.host.append(this.#viewport, this.#inspector, this.#colorProbe, this.#zoomLabel);
    this.#resizeObserver = new ResizeObserver(() => this.refreshLayout());
    this.#resizeObserver.observe(this.#viewport);
    // 使用鼠标滚轮缩放、移动画布
    this.listen(this.#viewport, "wheel", this.wheel, { passive: false });
    // 拖拽方式移动画布
    this.listen(this.#viewport, "pointerdown", this.pointerDown);
    this.listen(this.#viewport, "pointermove", this.pointerMove);
    this.listen(this.#viewport, "pointerup", this.pointerUp);
    this.listen(this.#viewport, "pointerleave", this.pointerUp);
    // 缩放重置为：100%
    this.listen(this.#zoomLabel, "click", () => { this.zoomAt(1) });
    this.update(this.#model);
  }
  pointerDown = (event) => {
    event.preventDefault();
    this.#pointer = {
      pointerdown: true,
      startX: event.clientX,
      startY: event.clientY,
      x: this.#offsetX,
      y: this.#offsetY,
      moved: false,
    };
  }
  pointerMove = (event) => {
    event.preventDefault();
    if (this.#pointer?.pointerdown) {
      const dx = event.clientX - this.#pointer.startX;
      const dy = event.clientY - this.#pointer.startY;
      this.#offsetX = this.#pointer.x + dx;
      this.#offsetY = this.#pointer.y + dy;
      this.draw();
    }
  }
  pointerUp = (event) => {
    if (this.#pointer) {
      this.#pointer = undefined;
    }
  }

  listen(target, event, handler, options) {
    target.addEventListener(event, handler, options);
  }
  update(model) {
    if (this.#destroyed) {
      return;
    }
    this.#model = model;
    const descendants = new Map();
    const ordered = [model.root];
    for (let i = 0; i < ordered.length; i++) {
      ordered.push(...ordered[i].children);
    }
    for (let i = ordered.length - 1; i >= 0; i--) {
      descendants.set(ordered[i].id, ordered[i].children.reduce((count, child) => count + 1 + descendants.get(child.id), 0));
    }
    this.#nodeElements.forEach((element, id) => {
      if (!model.nodes.has(id)) {
        element.remove();
        this.#nodeElements.delete(id);
      }
    });
    model.nodes.forEach((node, id) => {
      let element = this.#nodeElements.get(id);
      if (!element) {
        element = createElement("div", "list-mindmap__node");
        element.dataset.mindmapId = id;
        element.setAttribute("role", "treeitem");
        element.append(createElement("div", "list-mindmap__content"));
        const addBridge = createElement("span", "list-mindmap__add-bridge");
        addBridge.hidden = !!this.#options.readOnly;
        addBridge.setAttribute("aria-hidden", "true");
        element.append(addBridge);
        const fold = this.makeButton("collapse", "iconDown", "list-mindmap__fold");
        fold.append(createElement("span", "list-mindmap__fold-count"));
        element.append(fold);
        const addChild = this.makeButton("listMindmapChild", "iconAdd", "list-mindmap__add-child");
        addChild.hidden = !!this.#options.readOnly;
        addChild.disabled = !!this.#options.readOnly;
        element.append(addChild);
        this.#nodeElements.set(id, element);
        this.#world.append(element);
      }
      element.classList.toggle("list-mindmap__node--virtual", node.virtual);
      element.classList.toggle("list-mindmap__node--root", id === model.root.id);
      element.classList.toggle("list-mindmap__node--branch", node.children.length > 0);
      element.style.backgroundColor = model.metadata.nodes[id]?.backgroundColor || "";
      element.style.color = model.metadata.nodes[id]?.textColor || "";
      const collapsed = this.#folded.get(id) ?? node.collapsed;
      element.setAttribute("aria-expanded", String(!collapsed));
      const fold = element.querySelector(".list-mindmap__fold");
      fold.hidden = !node.children.length;
      fold.classList.toggle("list-mindmap__fold--closed", collapsed);
      fold.setAttribute("aria-label", collapsed ? "expand" : "collapse");
      fold.querySelector("span").textContent = String(descendants.get(id));

      if (id !== this.#editingId) {
        const content = this.getContentHost(id);
        content.replaceChildren();
        if (node.virtual) {
          content.textContent = "listMindmapRoot";
        } else {
          node.contentBlocks.forEach((block) => {
            const clone = block.cloneNode(true);
            clone.querySelectorAll(".protyle-attr, .protyle-action, .protyle-icons, .list-mindmap").forEach(item => item.remove());
            [clone, ...Array.from(clone.querySelectorAll("*"))].forEach((item) => {
              item.removeAttribute("contenteditable");
              item.removeAttribute("data-node-id");
              item.removeAttribute("spellcheck");
              item.removeAttribute("draggable");
              if (item.getAttribute("data-type")?.startsWith("Node")) {
                item.removeAttribute("data-type");
              }
            });
            content.append(clone);
          });
        }
        const empty = !content.textContent.replace(/[\u200b\ufeff]/g, "").trim() &&
          !content.querySelector("img, svg, video, audio, iframe, canvas, hr, [data-content]");
        content.classList.toggle("list-mindmap__content--empty", empty);
        content.dataset.placeholder = "listMindmapPlaceholder";
      }
    });
    if (this.#selectedId && !model.nodes.has(this.#selectedId)) {
      this.#selectedId = undefined;
      this.#inspector.hidden = true;
    }
    if (this.#selectedRelation && !model.metadata.relations.some(relation => relation.id === this.#selectedRelation)) {
      this.#selectedRelation = undefined;
      this.#inspector.hidden = true;
    }
    if (this.#selectedEdge && !model.nodes.has(this.#selectedEdge)) {
      this.#selectedEdge = undefined;
      this.#inspector.hidden = true;
    }
    this.updateRelations();
    this.updateSelection();
    this.renderInspector();
    this.refreshLayout();
  }
  updateSelection() {
    if (!this.#relationFrom) {
      this.#relationPreview = undefined;
    }
    this.#nodeElements.forEach((element, id) => {
      element.classList.toggle("list-mindmap__node--selected", this.#selectedId === id);
      element.classList.toggle("list-mindmap__node--relation", this.#relationFrom === id ||
        this.#relationPreview?.targetId === id);
      element.setAttribute("aria-selected", String(this.#selectedId === id));
    });
    this.#relationElements.forEach((element, id) => element.classList.toggle("list-mindmap__relation--selected", this.#selectedRelation === id));
    const node = this.#model.nodes.get(this.#selectedId);
    const disabled = {
      relation: !node || node.virtual,
      style: !node && !this.#selectedRelation && !this.#selectedEdge,
    };
    Object.keys(disabled).forEach((key) => {
      const button = this.#buttons.get(key);
      if (button) {
        button.disabled = disabled[key];
      }
    });
    this.#buttons.get("relation")?.classList.toggle("block__icon--active", !!this.#relationFrom);
    this.draw();
  }
  getContentHost(id) {
    return this.#nodeElements.get(id)?.querySelector(".list-mindmap__content");
  }
  relationPath(id, from, to, label) {
    let points = id ? this.#relationRoutes.get(id) : undefined;
    if (!points) {
      points = routeMindmapRelation(from, to, this.routingObstacles());
      if (id) {
        this.#relationRoutes.set(id, points);
      }
    }
    if (points.length < 2) {
      return;
    }
    const path = new Path2D();
    path.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const a = points[i - 1];
      const b = points[i];
      const c = points[i + 1];
      const before = Math.hypot(b.x - a.x, b.y - a.y);
      const after = Math.hypot(c.x - b.x, c.y - b.y);
      const radius = Math.min(8, before / 2, after / 2);
      path.lineTo(b.x + (a.x - b.x) * radius / before, b.y + (a.y - b.y) * radius / before);
      path.quadraticCurveTo(b.x, b.y, b.x + (c.x - b.x) * radius / after, b.y + (c.y - b.y) * radius / after);
    }
    const end = points[points.length - 1];
    const previous = points[points.length - 2];
    path.lineTo(end.x, end.y);
    if (!label) {
      return { path, end, previous, labelPoint };
    }
    const width = label.offsetWidth;
    const height = label.offsetHeight;
    const segments = points.slice(1).map((p, i) => ({
      a: points[i], b: p,
      length: Math.hypot(p.x - points[i].x, p.y - points[i].y)
    })).sort((a, b) => b.length - a.length);
    let labelPoint;
    for (const segment of segments) {
      const center = { x: (segment.a.x + segment.b.x) / 2, y: (segment.a.y + segment.b.y) / 2 };
      const candidates = [center, { x: center.x + width / 2 + 6, y: center.y },
        { x: center.x - width / 2 - 6, y: center.y },
        { x: center.x, y: center.y - height / 2 - 6 }, { x: center.x, y: center.y + height / 2 + 6 }];
      labelPoint = candidates.find(p => ![...this.#positions.values()].some(node =>
        p.x + width / 2 > node.x - 4 && p.x - width / 2 < node.x + node.width + 40 &&
        p.y + height / 2 > node.y - 4 && p.y - height / 2 < node.y + node.height + 4));
      if (labelPoint) {
        break;
      }
    }
    label.style.visibility = labelPoint ? "" : "hidden";
    return { path, end, previous, labelPoint };
  }
  makeButton(key, icon, className = "") {
    const button = createElement("button", "block__icon block__icon--show " + className);
    button.type = "button";
    button.setAttribute("aria-label", key);
    if (icon) {
      button.innerHTML = `<svg aria-hidden="true"><use xlink:href="#${icon}"></use></svg>`;
    }
    return button;
  }
  toolButton(key, icon, action, className = "") {
    const button = createElement("button", "block__icon block__icon--show " + className);
    button.type = "button";
    button.setAttribute("aria-label", key);
    if (icon) {
      button.innerHTML = `<svg aria-hidden="true"><use xlink:href="#${icon}"></use></svg>`;
    }
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      action();
    });
    return button;
  }
  updateRelations() {
    this.#relationElements.forEach((element, id) => {
      if (!this.#model.metadata.relations.some(relation => relation.id === id)) {
        element.remove();
        this.#relationElements.delete(id);
      }
    });
    this.#model.metadata.relations.forEach((relation) => {
      let element = this.#relationElements.get(relation.id);
      if (!element) {
        element = createElement("button", "list-mindmap__relation");
        element.type = "button";
        element.dataset.relationId = relation.id;
        this.#relationElements.set(relation.id, element);
        this.#world.append(element);
      }
      element.textContent = relation.label || "";
      element.setAttribute("aria-label", relation.label || "connect");
      element.style.color = relation.color || "";
    });
  }
  routingObstacles() {
    return [...this.#positions.values()].map(node => ({
      ...node,
      controlY: node.y + (node.id === this.#model.root.id ? node.height / 2 : node.height),
    }));
  }
  fit() {
    const width = this.#viewport.clientWidth;
    const height = this.#viewport.clientHeight;
    this.#scale = Math.min(1, Math.max(.15, Math.min((width - 64) / this.#bounds.width, (height - 64) / this.#bounds.height)));
    this.#offsetX = (width - this.#bounds.width * this.#scale) / 2;
    this.#offsetY = (height - this.#bounds.height * this.#scale) / 2;
    this.draw();
  }
  wheel = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const mode = event.deltaMode;
    const unitX = mode === 0x01 ? 16 :
      mode === 0x02 ? this.#viewport.clientWidth : 1;
    const unitY = mode === 0x01 ? 16 :
      mode === 0x02 ? this.#viewport.clientHeight : 1;
    if (event.ctrlKey) {
      const bounds = this.#viewport.getBoundingClientRect();
      const delta = Math.max(-24, Math.min(24, event.deltaY * unitY));
      this.zoomAt(this.#scale * Math.exp(-delta * .01),
        event.clientX - bounds.left, event.clientY - bounds.top);
      return;
    }
    if (event.shiftKey) {
      this.#offsetX -= event.deltaX ? event.deltaX * unitX : event.deltaY * unitX;
    } else {
      this.#offsetX -= event.deltaX * unitX;
      this.#offsetY -= event.deltaY * unitY;
    }
    this.draw();
  };
  zoomAt(scale, x = this.#viewport.clientWidth / 2, y = this.#viewport.clientHeight / 2) {
    const next = Math.min(2.5, Math.max(.15, scale));
    this.#offsetX = x - (x - this.#offsetX) * next / this.#scale;
    this.#offsetY = y - (y - this.#offsetY) * next / this.#scale;
    this.#scale = next;
    this.draw();
  }
  draw() {
    this.#world.style.transform = `translate(${this.#offsetX}px, ${this.#offsetY}px) scale(${this.#scale})`;
    this.#zoomLabel.textContent = `${Math.round(this.#scale * 100)}%`;
    this.#zoomSlider.value = String(Math.round(this.#scale * 100));
    const width = this.#viewport.clientWidth;
    const height = this.#viewport.clientHeight;
    const ratio = window.devicePixelRatio || 1;
    if (this.#canvas.width !== Math.round(width * ratio) || this.#canvas.height !== Math.round(height * ratio)) {
      this.#canvas.width = Math.round(width * ratio);
      this.#canvas.height = Math.round(height * ratio);
    }
    const context = this.#canvas.getContext("2d");
    this.linePaths = [];
    if (!context) {
      return;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.translate(this.#offsetX, this.#offsetY);
    context.scale(this.#scale, this.#scale);
    const theme = getComputedStyle(this.#options.host);
    const defaultLine = theme.getPropertyValue("--b3-border-color").trim() || "#a8adb5";
    const primary = theme.getPropertyValue("--b3-theme-primary").trim() || "#3574f0";
    const colors = new Map();
    const resolveColor = (value, fallback) => {
      const key = value || fallback;
      if (!colors.has(key)) {
        this.#colorProbe.style.color = fallback;
        if (value) {
          this.#colorProbe.style.color = value;
        }
        colors.set(key, getComputedStyle(this.#colorProbe).color);
      }
      return colors.get(key);
    };
    this.#edges.forEach((edge) => {
      const from = this.#positions.get(edge.from);
      const to = this.#positions.get(edge.to);
      if (!from || !to) {
        return;
      }
      const style = { ...this.#model.metadata.nodes[this.#model.root.id], ...this.#model.metadata.nodes[edge.to] };
      const startX = from.x + from.width;
      const startY = from.y + (edge.from === this.#model.root.id ? from.height / 2 : from.height);
      const endX = to.x;
      const endY = to.y + to.height;
      const center = (startX + endX) / 2;
      const path = new Path2D();
      path.moveTo(startX, startY);
      path.bezierCurveTo(center, startY, center, endY, endX, endY);
      path.lineTo(to.x + to.width, endY);
      this.#linePaths.push({ id: edge.to, relation: false, path });
      context.beginPath();
      context.strokeStyle = resolveColor(style.lineColor, defaultLine);
      context.lineWidth = (style.lineWidth || 1.5) + (this.#selectedEdge === edge.to ? 1 : 0) +
        (this.#hoveredLine === `edge:${edge.to}` ? 1.5 / this.#scale : 0);
      context.setLineDash(style.lineDash ? [6, 4] : []);
      context.stroke(path);
    });
    this.#model.metadata.relations.forEach((relation) => {
      const from = this.#positions.get(relation.from);
      const to = this.#positions.get(relation.to);
      const element = this.#relationElements.get(relation.id);
      element.hidden = !from || !to || !relation.label?.trim();
      if (!from || !to) {
        return;
      }
      const route = this.relationPath(relation.id, from, to, element);
      if (!route) {
        element.hidden = true;
        return;
      }
      const { path, end, previous, labelPoint } = route;
      this.#linePaths.push({ id: relation.id, relation: true, path });
      context.beginPath();
      context.strokeStyle = resolveColor(relation.color, primary);
      context.lineWidth = (relation.width || 1.5) + (relation.id === this.#selectedRelation ? 1 : 0) +
        (this.#hoveredLine === `relation:${relation.id}` ? 1.5 / this.#scale : 0);
      element.classList.toggle("list-mindmap__relation--hover", this.#hoveredLine === `relation:${relation.id}`);
      context.setLineDash(relation.dash === false ? [] : [5, 4]);
      context.stroke(path);
      context.setLineDash([]);
      context.beginPath();
      const direction = Math.atan2(end.y - previous.y, end.x - previous.x);
      const arrowSize = Math.max(10 / this.#scale, (relation.width || 1.5) * 3);
      context.fillStyle = context.strokeStyle;
      context.moveTo(end.x - arrowSize * Math.cos(direction - Math.PI / 6), end.y - arrowSize * Math.sin(direction - Math.PI / 6));
      context.lineTo(end.x, end.y);
      context.lineTo(end.x - arrowSize * Math.cos(direction + Math.PI / 6), end.y - arrowSize * Math.sin(direction + Math.PI / 6));
      context.closePath();
      context.fill();
      if (labelPoint) {
        element.style.left = `${labelPoint.x}px`;
        element.style.top = `${labelPoint.y}px`;
      }
    });
    this.drawRelationPreview(context, primary);
  }
  refreshLayout() {
    if (this.#destroyed || this.#frame) {
      return;
    }
    this.#frame = requestAnimationFrame(() => {
      this.#frame = 0;
      if (!this.#viewport.clientWidth || !this.#viewport.clientHeight) {
        return;
      }
      const makeLayoutNode = (id) => {
        const node = this.#model.nodes.get(id);
        const element = this.#nodeElements.get(id);
        return {
          id,
          width: Math.max(64, element.offsetWidth),
          height: Math.max(36, element.offsetHeight),
          collapsed: this.#folded.get(id) ?? node.collapsed,
          children: node.children.map(child => makeLayoutNode(child.id)),
        };
      };
      const anchorId = this.#editingId || this.#foldAnchor;
      const previous = anchorId ? this.#positions.get(anchorId) : undefined;
      const result = layoutListMindmap(makeLayoutNode(this.#model.root.id));
      this.#positions = result.nodes;
      this.#relationRoutes.clear();
      this.#edges = result.edges;
      this.#bounds = result;
      let top = 0;
      let left = 0;
      this.#model.metadata.relations.forEach((relation) => {
        const from = this.#positions.get(relation.from);
        const to = this.#positions.get(relation.to);
        if (from && to) {
          const points = routeMindmapRelation(from, to, this.routingObstacles());
          this.#relationRoutes.set(relation.id, points);
          points.forEach(point => {
            top = Math.min(top, point.y - 24);
            left = Math.min(left, point.x - 100);
            this.#bounds.width = Math.max(this.#bounds.width, point.x + 100);
            this.#bounds.height = Math.max(this.#bounds.height, point.y + 24);
          });
        }
      });
      if (top < 0 || left < 0) {
        this.#positions.forEach(position => {
          position.y -= top;
          position.x -= left;
        });
        this.#relationRoutes.forEach(points => points.forEach(point => {
          point.x -= left;
          point.y -= top;
        }));
        this.#bounds.height -= top;
        this.#bounds.width -= left;
      }
      this.#nodeElements.forEach((element, id) => {
        const position = this.#positions.get(id);
        element.hidden = !position;
        if (position) {
          element.style.left = `${position.x}px`;
          element.style.top = `${position.y - 1}px`;
        }
      });
      const current = anchorId ? this.#positions.get(anchorId) : undefined;
      if (previous && current) {
        this.#offsetX += (previous.x - current.x) * this.#scale;
        this.#offsetY += (previous.y - current.y) * this.#scale;
      }
      this.#foldAnchor = undefined;
      this.fit();
    });
  }
  drawRelationPreview(context, color) {
    const from = this.#positions.get(this.relationFrom);
    if (!from || !this.#relationPreview) {
      return;
    }
    const target = this.#positions.get(this.#relationPreview.targetId);
    const route = this.relationPath(undefined, from, target || {
      id: "", x: this.#relationPreview.x, y: this.#relationPreview.y, width: 0, height: 0,
    });
    if (!route) {
      return;
    }
    const { path, end, previous } = route;
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = 1.5;
    context.setLineDash([5, 4]);
    context.stroke(path);
    context.setLineDash([]);
    context.beginPath();
    const size = Math.max(10 / this.scale, 4.5);
    const direction = Math.atan2(end.y - previous.y, end.x - previous.x);
    context.fillStyle = color;
    context.moveTo(end.x - size * Math.cos(direction - Math.PI / 6), end.y - size * Math.sin(direction - Math.PI / 6));
    context.lineTo(end.x, end.y);
    context.lineTo(end.x - size * Math.cos(direction + Math.PI / 6), end.y - size * Math.sin(direction + Math.PI / 6));
    context.closePath();
    context.fill();
  }
  renderInspector() {
    this.#inspector.replaceChildren();
    const lineSelected = !!this.#selectedRelation || !!this.#selectedEdge;
    this.#inspector.classList.toggle("list-mindmap__inspector--node", !lineSelected);
    this.#inspector.classList.toggle("list-mindmap__inspector--line", lineSelected);
    this.#inspector.style.left = "";
    this.#inspector.style.top = "";
    const squareButton = (key, icon, action) => {
      const button = this.makeButton(key, icon, action);
      button.className = "color__square";
      button.querySelector("svg").classList.add("svg--mid");
      return button;
    };
    const color = (value, action, key = "color") => {
      const palette = createElement("div", "list-mindmap__palette");
      palette.setAttribute("role", "group");
      palette.setAttribute("aria-label", this.label(key));
      const colors = [{ label: "default", value: "" }, ...(this.#options.colors?.() || [])];
      colors.forEach(item => {
        const button = this.makeButton("color", "", () => action(item.value));
        const selected = (value || "") === item.value;
        button.className = "color__square" + (selected ? " color__square--current" : "");
        button.setAttribute("aria-label", item.label);
        button.setAttribute("aria-pressed", String(selected));
        button.style.backgroundColor = item.value || "var(--b3-theme-background)";
        palette.append(button);
      });
      if (this.#options.onManageLineColors) {
        palette.append(squareButton("manageColors", "iconSettings", this.#options.onManageLineColors));
      }
      this.#inspector.append(palette);
    };
    if (this.#selectedRelation) {
      const relation = this.#model.metadata.relations.find(item => item.id === this.selectedRelation);
      if (!relation) {
        return;
      }
      const change = (patch) => this.#options.onRelationChange?.(relation.id, patch);
      color(relation.color, value => change({ color: value }));
      const remove = squareButton("delete", "iconTrashcan", () => this.#options.onRelationDelete?.(relation.id));
      this.#inspector.append(remove);
      return;
    }
    if (this.#selectedEdge) {
      const id = this.#selectedEdge;
      const style = { ...this.#model.metadata.nodes[this.#model.root.id], ...this.#model.metadata.nodes[id] };
      const change = (patch) => this.#options.onNodeStyle?.(id, patch);
      color(style.lineColor, value => change({ lineColor: value }));
      return;
    }
    if (!this.#selectedId) {
      return;
    }
    const id = this.#selectedId;
    const style = this.#model.metadata.nodes[id] || {};
    const change = (patch) => this.#options.onNodeStyle?.(id, patch);
    const nodePalette = createElement("div", "fn__flex");
    nodePalette.setAttribute("role", "group");
    nodePalette.setAttribute("aria-label", "color");
    [{ label: "default", color: "", backgroundColor: "" }, ...(this.#options.nodeColors?.() || [])].forEach(item => {
      const button = this.makeButton("color", "iconFont", () => change({
        textColor: item.color, backgroundColor: item.backgroundColor,
      }));
      const selected = (style.textColor || "") === item.color && (style.backgroundColor || "") === item.backgroundColor;
      button.className = "color__square" + (selected ? " color__square--current" : "");
      button.textContent = "A";
      button.setAttribute("aria-label", item.label);
      button.setAttribute("aria-pressed", String(selected));
      button.style.color = item.color;
      button.style.backgroundColor = item.backgroundColor;
      nodePalette.append(button);
    });
    if (this.#options.onManageNodeColors) {
      const manage = squareButton("manageColors", "iconSettings", this.#options.onManageNodeColors);
      nodePalette.append(manage);
    }
    this.#inspector.append(nodePalette);
    const node = this.#model.nodes.get(id);
    if (node && !node.virtual && node !== this.#model.root) {
      nodePalette.append(squareButton("delete", "iconTrashcan", () => this.deleteSelection()));
    }
  }
}


function isSingleElement(element) {
  return element.previousElementSibling?.getAttribute('id') === "refreshDoc" && element.nextElementSibling?.getAttribute('id') === "svg"
}

// 导图
async function renderMindMap() {
  const selector = `[data-type="NodeList"][custom-sy-list-mindmap="1"]:not([render])`;
  const lists = Array.from(document.querySelectorAll(selector));
  if (lists.length > 0) {
    if (lists.length === 1 && isSingleElement(lists[0])) {
      lists[0].classList.add('fullScreen');
    }
    lists.forEach(list => {
      try {
        list.querySelector('div[data-type="NodeListItem"]')?.setAttribute("style", "display:none;")
        const model = readListMindmap(list);
        list.querySelector(":scope > .list-mindmap")?.remove();
        const host = document.createElement("div");
        host.className = "list-mindmap";
        host.contentEditable = "false";
        list.appendChild(host);
        new ListMindmapView({ host, model, readOnly: true, labels: "mindmap" });
        list.setAttribute('render', true);
      } catch (err) {
        console.error(err)
      }
    })
  }
}

// ===============================================================================================================================

// 对预览文档进行渲染
async function main() {
  await renderBody();
  await addRefreshBtn();
  await handleIframeInternalLink()
  await renderEmbedBlock();
  await renderNodeTab();
  await handleTable();
  await avRender();
  await highlight();
  await renderKatex();
  await renderMindMap();
  await renderMermaid();
  await renderCustomBlock();
  await contentSync();
}

main().catch(err => { console.error(err); })

