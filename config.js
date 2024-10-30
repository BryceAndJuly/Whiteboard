export {
    language
};

let zh_CN = {
    "saveBtn" : "保存",
    "refreshBtn": "刷新",
    "msgClipboard": "刚刚复制的不是画板元素！",
    "msgIDFailed": "ID匹配失败",
    "msgCopied": "已将链接复制到剪切板",
    "msgPreviewMode": "预览模式",
    "msgAutoSaveOff": "已关闭自动保存！",
    "msgAutosave": "编辑结束约2s后自动保存",
    "msgRelevantResults": "未查找到相关结果！",
    "msgResults": "未查找到相关结果！"
}

let en_UK = {
    "saveBtn" : "Save",
    "refreshBtn": "Refresh",
    "msgClipboard": "What you just copied is not the artboard element!",
    "msgIDFailed": "ID matching failed",
    "msgCopied":  "Link copied to clipboard",
    "msgPreviewMode":  "Preview mode",
    "msgAutoSaveOff": "Autosave turned off!",
    "msgAutosave": "The editing process will be automatically saved about 2 seconds after completion.",
    "msgRelevantResults":   "No relevant results found!"
}

let es_ES = {
    "saveBtn": "Guardar",
    "refreshBtn": "Actualizar",
    "msgClipboard": "¡Lo que acabas de copiar no es un elemento de la mesa de trabajo!",
    "msgIDFailed": "La coincidencia de ID falló",
    "msgCopied":   "Enlace copiado al portapapeles",
    "msgPreviewMode":   "Modo de vista previa",
    "msgAutoSaveOff": "¡Auto guardado desactivado!",
    "msgAutosave": "Se guardará automáticamente unos 2 segundos después de completar la edición.",
    "msgRelevantResults": "¡No se encontraron resultados relevantes!"
}


let language = zh_CN;
let lang = window.top.siyuan.config.lang;
console.log(lang)

if (lang.startsWith("es")) {
    language = es_ES;
} else if (lang.startsWith("en")) {
    language = en_UK;
} 