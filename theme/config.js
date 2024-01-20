// 内嵌块中的超链接跳转
function handleIframeInternalLink(e) {
  // 超链接
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
}

document.addEventListener('click', handleIframeInternalLink, true);