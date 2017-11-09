/*!
 * FileInput Chinese Translations
 *
 * This file must be loaded after 'fileinput.js'. Patterns in braces '{}', or
 * any HTML markup tags in the messages must not be converted or translated.
 *
 * @see http://github.com/kartik-v/bootstrap-fileinput
 * @author kangqf <kangqingfei@gmail.com>
 *
 * NOTE: this file must be saved in UTF-8 encoding.
 */
(function ($) {
    "use strict";

    $.fn.fileinput.locales.zh = {
        fileSingle: '图片',
        filePlural: '多个图片',
        browseLabel: '上传本地图片 &hellip;',
        removeLabel: '移除',
        removeTitle: '清除选中图片',
        cancelLabel: '取消',
        cancelTitle: '中断上传',
        uploadLabel: '上传',
        uploadTitle: '上传选中图片',
        msgSizeTooLarge: '图片 "{name}" (<b>{size} KB</b>) 超过了允许大小 <b>{maxSize} KB</b>. 请重新上传',
        msgFilesTooLess: '你必须选择最少 <b>{n}</b> {files} 来上传，请重新上传',
        msgFilesTooMany: '选择的上传图片个数 <b>({n})</b> 超出最大图片的限制个数 <b>{m}</b>. 请重新上传',
        msgFileNotFound: '图片 "{name}" 未找到',
        msgFileSecured: '安全限制，为了防止读取图片 "{name}"',
        msgFileNotReadable: '图片 "{name}" 不可读',
        msgFilePreviewAborted: '取消 "{name}" 的预览',
        msgFilePreviewError: '读取 "{name}" 时出现了一个错误',
        msgInvalidFileType: '只支持 "{types}"',
        msgInvalidFileExtension: '只支持 "{extensions}"',
        msgValidationError: '图片上传错误',
        msgLoading: '加载第 {index} 张图片，共 {files} &hellip;',
        msgProgress: '加载第 {index} 张图片，共 {files} - {name} - {percent}% 完成',
        msgSelected: '{n} 个图片被选中',
        msgFoldersNotAllowed: '只支持拖拽图片! 跳过 {n} 拖拽的图片夹',
        // dropZoneTitle: '可拖拽图片到此处上传',
        dropZoneTitle: ' ',
        slugCallback: function(text) {
            return text ? text.split(/(\\|\/)/g).pop().replace(/[^\w\u4e00-\u9fa5\-.\\\/ ]+/g, '') : '';
        }
    };

    $.extend($.fn.fileinput.defaults, $.fn.fileinput.locales.zh);
})(window.jQuery);
