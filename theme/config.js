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
      htmlStr = res.data.content.replaceAll(`"assets/`, `"${window.top.location.origin}/assets/`).replaceAll(`contenteditable="true"`, `contenteditable="false"`);
      let response = await request("/api/block/getDocInfo", { id });
      // 读取标题成功,添加文档标题
      if (response?.code === 0 && response?.data?.name && htmlStr) {
        doc = `<h1>${response.data.name}</h1>` + htmlStr;
      }
    } else {
      doc = res.data.content.replaceAll(`"assets/`, `"${window.top.location.origin}/assets/`).replaceAll(`contenteditable="true"`, `contenteditable="false"`);
    }
  } else {
    doc = "<h2>加载失败，请检查链接是否正确！</h2><h2>Loading failed. Please check if the link is correct!</h2>"
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
    mermaid.initialize({
      startOnLoad: false
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
// 数据表格——所需工具函数1
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
// 数据表格——所需工具函数2
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
      value = `<span>${resultCalc.formattedContent}</span>${window.top.siyuan.languages.calcResultCountAll}`;
      break;
    case "Count values":
      value = `<span>${resultCalc.formattedContent}</span>${window.top.siyuan.languages.calcResultCountValues}`;
      break;
    case "Count unique values":
      value = `<span>${resultCalc.formattedContent}</span>${window.top.siyuan.languages.calcResultCountUniqueValues}`;
      break;
    case "Count empty":
      value = `<span>${resultCalc.formattedContent}</span>${window.top.siyuan.languages.calcResultCountEmpty}`;
      break;
    case "Count not empty":
      value = `<span>${resultCalc.formattedContent}</span>${window.top.siyuan.languages.calcResultCountNotEmpty}`;
      break;
    case "Percent empty":
      value = `<span>${resultCalc.formattedContent}</span>${window.top.siyuan.languages.calcResultPercentEmpty}`;
      break;
    case "Percent not empty":
      value = `<span>${resultCalc.formattedContent}</span>${window.top.siyuan.languages.calcResultPercentNotEmpty}`;
      break;
    case "Sum":
      value = `<span>${resultCalc.formattedContent}</span>${window.top.siyuan.languages.calcResultSum}`;
      break;
    case "Average":
      value = `<span>${resultCalc.formattedContent}</span>${window.top.siyuan.languages.calcResultAverage}`;
      break;
    case "Median":
      value = `<span>${resultCalc.formattedContent}</span>${window.top.siyuan.languages.calcResultMedian}`;
      break;
    case "Min":
      value = `<span>${resultCalc.formattedContent}</span>${window.top.siyuan.languages.calcResultMin}`;
      break;
    case "Max":
      value = `<span>${resultCalc.formattedContent}</span>${window.top.siyuan.languages.calcResultMax}`;
      break;
    case "Range":
      value = `<span>${resultCalc.formattedContent}</span>${window.top.siyuan.languages.calcResultRange}`;
      break;
    case "Earliest":
      value = `<span>${resultCalc.formattedContent}</span>${window.top.siyuan.languages.calcOperatorEarliest}`;
      break;
    case "Latest":
      value = `<span>${resultCalc.formattedContent}</span>${window.top.siyuan.languages.calcOperatorLatest}`;
      break;
    case "Checked":
      value = `<span>${resultCalc.formattedContent}</span>${window.top.siyuan.languages.checked}`;
      break;
    case "Unchecked":
      value = `<span>${resultCalc.formattedContent}</span>${window.top.siyuan.languages.unchecked}`;
      break;
    case "Percent checked":
      value = `<span>${resultCalc.formattedContent}</span>${window.top.siyuan.languages.percentChecked}`;
      break;
    case "Percent unchecked":
      value = `<span>${resultCalc.formattedContent}</span>${window.top.siyuan.languages.percentUnchecked}`;
      break;
  }
  return value;
};
// 数据表格——所需工具函数3
function renderCell(cellValue) {
  let text = "";
  if (["text", "template"].includes(cellValue.type)) {
    text = `<span class="av__celltext">${cellValue ? (cellValue[cellValue.type].content || "") : ""}</span>`;
  } else if (["url", "email", "phone"].includes(cellValue.type)) {
    const urlContent = cellValue ? cellValue[cellValue.type].content : "";
    // https://github.com/siyuan-note/siyuan/issues/9291
    let urlAttr = "";
    if (cellValue.type === "url") {
      urlAttr = ` data-href="${urlContent}"`;
    }
    text = `<span class="av__celltext av__celltext--url" data-type="${cellValue.type}"${urlAttr}>${urlContent}</span>`;
  } else if (cellValue.type === "block") {
    if (cellValue?.isDetached) {
      text = `<span class="av__celltext">${cellValue.block.content || ""}</span>
<span class="b3-chip b3-chip--info b3-chip--small" data-type="block-more">${window.top.siyuan.languages.more}</span>`;
    } else {
      text = `<span data-type="block-ref" data-id="${cellValue.block.id}" data-subtype="s" class="av__celltext av__celltext--ref">${cellValue.block.content || "Untitled"}</span>
<span class="b3-chip b3-chip--info b3-chip--small popover__block" data-id="${cellValue.block.id}" data-type="block-more">${window.top.siyuan.languages.update}</span>`;
    }
  } else if (cellValue.type === "number") {
    text = `<span class="av__celltext" data-content="${cellValue?.number.isNotEmpty ? cellValue?.number.content : ""}">${cellValue?.number.formattedContent || cellValue?.number.content || ""}</span>`;
  } else if (cellValue.type === "mSelect" || cellValue.type === "select") {
    cellValue?.mSelect?.forEach((item) => {
      text += `<span class="b3-chip" style="background-color:var(--b3-font-background${item.color});color:var(--b3-font-color${item.color})">${item.content}</span>`;
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
  } else if (cellValue.type === "mAsset") {
    cellValue?.mAsset?.forEach((item) => {
      if (item.type === "image") {
        text += `<img class="av__cellassetimg" src="${item.content}">`;
      } else {
        text += `<span class="b3-chip av__celltext--url" data-url="${item.content}">${item.name}</span>`;
      }
    });
  } else if (cellValue.type === "checkbox") {
    text += `<svg class="av__checkbox"><use xlink:href="#icon${cellValue?.checkbox?.checked ? "Check" : "Uncheck"}"></use></svg>`;
  } else if (cellValue.type === "rollup") {
    cellValue?.rollup?.contents?.forEach((item) => {
      const rollupText = ["select", "mSelect", "mAsset", "checkbox", "relation"].includes(item.type) ? renderCell(item) : renderRollup(item);
      if (rollupText) {
        text += rollupText + ", ";
      }
    });
    if (text && text.endsWith(", ")) {
      text = text.substring(0, text.length - 2);
    }
  } else if (cellValue.type === "relation") {
    cellValue?.relation?.contents?.forEach((item, index) => {
      text += `<span class="av__celltext--ref" style="margin-right: 8px" data-id="${cellValue?.relation?.blockIDs[index]}">${item?.block?.content || item || "Untitled"}</span>`;
    });
  }
  if (["text", "template", "url", "email", "phone", "number", "date", "created", "updated"].includes(cellValue.type) &&
    cellValue && cellValue[cellValue.type].content) {
    text += `<span ${cellValue.type !== "number" ? "" : 'style="right:auto;left:5px"'} data-type="copy" class="block__icon"><svg><use xlink:href="#iconCopy"></use></svg></span>`;
  }
  return text;
};
// 数据表格——所需工具函数4
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
// 数据表格——所需工具函数5
function unicode2Emoji(unicode, className = "", needSpan = false, lazy = false) {
  if (!unicode) {
    return "";
  }
  let emoji = "";
  if (unicode.indexOf(".") > -1) {
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
    } catch (e) {
    }
  }
  return emoji;
};

// 渲染数据表格——数据库的表格视图
async function avRender() {
  let avElements = Array.from(document.querySelectorAll('[data-type="NodeAttributeView"]'));
  if (avElements.length === 0) {
    return;
  }
  await addScript("./theme/dayjs.js");
  if (avElements.length > 0) {
    avElements.forEach((e) => {
      request("/api/av/renderAttributeView", {
        id: e.getAttribute("data-av-id")
      }).then(response => {
        const data = response.data.view;
        if (!e.dataset.pageSize) {
          e.dataset.pageSize = data.pageSize.toString();
        }
        let tableHTML = '<div class="av__row av__row--header"><div class="av__firstcol av__colsticky"><svg><use xlink:href="#iconUncheck"></use></svg></div>';
        let calcHTML = "";
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
        pinIndex = Math.min(pinIndex, pinMaxIndex);
        if (pinIndex > -1) {
          tableHTML = '<div class="av__row av__row--header"><div class="av__colsticky"><div class="av__firstcol"><svg><use xlink:href="#iconUncheck"></use></svg></div>';
          calcHTML = '<div class="av__colsticky">';
        }
        data.columns.forEach((column, index) => {
          if (column.hidden) {
            return;
          }
          tableHTML += `<div class="av__cell av__cell--header" data-col-id="${column.id}"  draggable="true" 
                  data-icon="${column.icon}" data-dtype="${column.type}" data-wrap="${column.wrap}" data-pin="${column.pin}" 
                  style="width: ${column.width || "200px"};">
                      ${column.icon ? unicode2Emoji(column.icon, "av__cellheadericon", true) : `<svg class="av__cellheadericon"><use xlink:href="#${getColIconByType(column.type)}"></use></svg>`}
                      <span class="av__celltext fn__flex-1">${column.name}</span>
                      ${column.pin ? '<svg class="av__cellheadericon av__cellheadericon--pin"><use xlink:href="#iconPin"></use></svg>' : ""}
                      <div class="av__widthdrag"></div>
                  </div>`;
          if (pinIndex === index) {
            tableHTML += "</div>";
          }
          calcHTML += `<div class="av__calc${column.calc && column.calc.operator !== "" ? " av__calc--ashow" : ""}" data-col-id="${column.id}" data-dtype="${column.type}" data-operator="${column.calc?.operator || ""}"  
                  style="width: ${index === 0 ? ((parseInt(column.width || "200") + 24) + "px") : (column.width || "200px")}">${getCalcValue(column) || '<svg><use xlink:href="#iconDown"></use></svg>' + window.top.siyuan.languages.calc}</div>`;
          if (pinIndex === index) {
            calcHTML += "</div>";
          }
        });
        tableHTML += `<div class="block__icons" style="min-height: auto">
              <div class="block__icon block__icon--show" data-type="av-header-add"><svg><use xlink:href="#iconAdd"></use></svg></div>
              <div class="fn__space"></div>
              <div class="block__icon block__icon--show"  data-type="av-header-more"><svg><use xlink:href="#iconMore"></use></svg></div>
              </div>
              </div>`;
        data.rows.forEach((row) => {
          tableHTML += `<div class="av__row" data-id="${row.id}">`;
          if (pinIndex > -1) {
            tableHTML += '<div class="av__colsticky"><div class="av__firstcol"><svg><use xlink:href="#iconUncheck"></use></svg></div>';
          } else {
            tableHTML += '<div class="av__firstcol av__colsticky"><svg><use xlink:href="#iconUncheck"></use></svg></div>';
          }

          row.cells.forEach((cell, index) => {
            if (data.columns[index].hidden) {
              return;
            }
            let checkClass = "";
            if (cell.valueType === "checkbox") {
              checkClass = cell.value?.checkbox?.checked ? " av__cell-check" : " av__cell-uncheck";
            }
            tableHTML += `<div class="av__cell${checkClass}" data-id="${cell.id}" data-col-id="${data.columns[index].id}"
                          ${cell.valueType === "block" ? 'data-block-id="' + (cell.value.block.id || "") + '"' : ""} data-wrap="${data.columns[index].wrap}" 
                          ${cell.value?.isDetached ? ' data-detached="true"' : ""} 
                          style="width: ${data.columns[index].width || "200px"};
                          ${cell.valueType === "number" ? "text-align: right;" : ""}
                          ${cell.bgColor ? `background-color:${cell.bgColor};` : ""}
                          ${cell.color ? `color:${cell.color};` : ""}">${renderCell(cell.value)}</div>`;

            if (pinIndex === index) {
              tableHTML += "</div>";
            }
          });
          tableHTML += "<div></div></div>";
        });
        let tabHTML = "";
        response.data.views.forEach((item) => {
          tabHTML += `<div data-id="${item.id}" class="item${item.id === response.data.viewID ? " item--focus" : ""}">
                      ${item.icon ? unicode2Emoji(item.icon, "item__graphic", true) : '<svg class="item__graphic"><use xlink:href="#iconTable"></use></svg>'}
                      <span class="item__text">${item.name}</span>
                      </div>`;
        });
        e.firstElementChild.outerHTML = `<div class="av__container" style="--av-background:${e.style.backgroundColor || "var(--b3-theme-background)"}">
              <div class="av__header">
                  <div class="fn__flex av__views">
                      <div class="layout-tab-bar fn__flex">
                          ${tabHTML}
                      </div>
                      <div class="fn__space"></div>
                      <span data-type="av-add" class="block__icon">
                          <svg><use xlink:href="#iconAdd"></use></svg>
                      </span>
                      <div class="fn__flex-1"></div>
                      <div class="fn__space"></div>
                      <span data-type="av-switcher" class="block__icon${response.data.views.length > 0 ? "" : " fn__none"}">
                          <svg><use xlink:href="#iconDown"></use></svg>
                      </span>
                      <div class="fn__space"></div>
                      <span data-type="av-filter" class="block__icon${data.filters.length > 0 ? " block__icon--active" : ""}">
                          <svg><use xlink:href="#iconFilter"></use></svg>
                      </span>
                      <div class="fn__space"></div>
                      <span data-type="av-sort" class="block__icon${data.sorts.length > 0 ? " block__icon--active" : ""}">
                          <svg><use xlink:href="#iconSort"></use></svg>
                      </span>
                      <div class="fn__space"></div>
                      <span data-type="av-more" class="block__icon">
                          <svg><use xlink:href="#iconMore"></use></svg>
                      </span>
                      <div class="fn__space"></div>
                      <span data-type="av-add-more" class="block__icon">
                          <svg><use xlink:href="#iconAdd"></use></svg>
                      </span>
                      <div class="fn__space"></div>
                      ${response.data.isMirror ? ` <span class="block__icon block__icon--show ariaLabel" aria-label="${window.top.siyuan.languages.mirrorTip}">
              <svg><use xlink:href="#iconSplitLR"></use></svg></span><div class="fn__space"></div>` : ""}
                  </div>
                  <div contenteditable="false" spellcheck="${window.top.siyuan.config.editor.spellcheck.toString()}" class="av__title" data-title="${response.data.name || ""}" data-tip="${window.top.siyuan.languages.title}">${response.data.name || ""}</div>
                  <div class="av__counter fn__none"></div>
              </div>
              <div class="av__scroll">
                  <div class="av__body">
                      ${tableHTML}
                      <div class="av__row--util">
                          <div class="av__colsticky">
                              <button class="b3-button" data-type="av-add-bottom">
                                  <svg><use xlink:href="#iconAdd"></use></svg>
                                  ${window.top.siyuan.languages.addAttr}
                              </button>
                              <span class="fn__space"></span>
                              <button class="b3-button${data.rowCount > data.rows.length ? "" : " fn__none"}">
                                  <svg data-type="av-load-more"><use xlink:href="#iconArrowDown"></use></svg>
                                  <span data-type="av-load-more">
                                      ${window.top.siyuan.languages.loadMore}
                                  </span>
                                  <svg data-type="set-page-size" data-size="${data.pageSize}"><use xlink:href="#iconMore"></use></svg>
                              </button>
                          </div>
                      </div>
                      <div class="av__row--footer">${calcHTML}</div>
                  </div>
              </div>
              </div>`.replaceAll(`"assets/`, `"${window.top.location.origin}/assets/`);
      })
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
  let domStr = `<div id="refreshDoc" title="Update the current document."><svg t="1747160319122" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1458" width="20" height="20"><path d="M1022.955204 522.570753c0 100.19191-81.516572 181.698249-181.718715 181.698249l-185.637977 0c-11.2973 0-20.466124-9.168824-20.466124-20.466124 0-11.307533 9.168824-20.466124 20.466124-20.466124l185.637977 0c77.628008 0 140.786467-63.148226 140.786467-140.766001 0-77.423347-62.841234-140.448776-140.203182-140.766001-0.419556 0.030699-0.818645 0.051165-1.217734 0.061398-5.945409 0.143263-11.686157-2.292206-15.687284-6.702656-4.001127-4.400217-5.894244-10.335393-5.167696-16.250102 1.330298-10.806113 1.944282-19.760043 1.944282-28.192086 0-60.763922-23.658839-117.884874-66.617234-160.833035-42.968627-42.968627-100.089579-66.617234-160.843268-66.617234-47.368844 0-92.742241 14.449084-131.208321 41.781592-37.616736 26.738991-65.952084 63.700811-81.925894 106.884332-2.425236 6.538927-8.012488 11.399631-14.827707 12.893658-6.815219 1.483794-13.927197-0.603751-18.859533-5.54632-19.289322-19.330254-44.943608-29.972639-72.245418-29.972639-56.322773 0-102.146425 45.813419-102.146425 102.125959 0 0.317225 0.040932 0.982374 0.092098 1.627057 0.061398 0.920976 0.122797 1.831718 0.153496 2.762927 0.337691 9.465582-5.863545 17.928325-15.001669 20.455891-32.356942 8.933463-61.541635 28.550243-82.181721 55.217602-21.305235 27.516704-32.571836 60.508096-32.571836 95.41307 0 86.244246 70.188572 156.422585 156.443052 156.422585l169.981393 0c11.2973 0 20.466124 9.15859 20.466124 20.466124 0 11.2973-9.168824 20.466124-20.466124 20.466124l-169.981393 0c-108.828614 0-197.3753-88.536452-197.3753-197.354833 0-44.053332 14.223956-85.712127 41.126676-120.473839 22.809495-29.460985 53.897537-52.086285 88.710414-64.816215 5.065366-74.322729 67.149353-133.2447 142.751215-133.2447 28.386514 0 55.504128 8.217149 78.651314 23.52581 19.657712-39.868009 48.842405-74.169233 85.497233-100.212376 45.434795-32.295544 99.004875-49.354058 154.918325-49.354058 71.692832 0 139.087778 27.915793 189.782368 78.600149 50.694589 50.694589 78.610382 118.089535 78.610382 189.782368 0 3.704368-0.102331 7.470135-0.296759 11.368932C952.633602 352.568894 1022.955204 429.511287 1022.955204 522.570753z" p-id="1459"></path><path d="M629.258611 820.711014l-102.023628 102.013395c-3.990894 4.001127-9.230222 5.996574-14.46955 5.996574s-10.478655-1.995447-14.46955-5.996574l-102.023628-102.013395c-7.992021-7.992021-7.992021-20.947078 0-28.939099s20.947078-8.002254 28.939099 0l67.087954 67.077721 0-358.699522c0-11.2973 9.15859-20.466124 20.466124-20.466124 11.307533 0 20.466124 9.168824 20.466124 20.466124l0 358.699522 67.087954-67.077721c7.992021-8.002254 20.947078-7.992021 28.939099 0S637.250632 812.718993 629.258611 820.711014z" p-id="1460"></path></svg></div>`;
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

