const downloadDiffReport = (originalText, modifiedText) => {
    const htmlContent = reportContent(originalText, modifiedText);
    // const htmlContent = reportContent("originalText", "modifiedText");

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diff-report-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const reportContent = (originalText, modifiedText) => {
    // 编码：UTF-8 → Base64
    const toBase64 = (str) => btoa(unescape(encodeURIComponent(str || '')));
    const originalB64 = toBase64(originalText);
    const modifiedB64 = toBase64(modifiedText);

    return `
    <!DOCTYPE html>
    <html style="height: 100%" >
        <head>
            <meta charset="UTF-8" />
            <title>代码差异报告</title>
            <style>
                html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; font-family: sans-serif; }
                #editor-container {
                    height: calc(100vh - 60px);
                    margin: 0;
                    padding: 0;
                }
                .report-header {
                    padding: 10px 20px;
                    background: #f3f3f3;
                    border-bottom: 1px solid #ccc;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="report-header">
                <strong>代码差异报告</strong>
                <span style="margin-left: 20px; color: #888;">生成时间：${new Date().toLocaleString()}</span>
            </div>
            <div id="editor-container"></div>
    
            <!-- 从 12服务器 加载编辑器  -->
            <script src="http://10.208.24.12:8518/static/monaco/min/vs/loader.js"><\/script>
            <script>
                //  配置并加载 Monaco Editor
                require.config({
                    paths: {
                        'vs': 'http://10.208.24.12:8518/static/monaco/min/vs'
                    }
                });

                // window.MonacoEnvironment = {
                //     getWorkerUrl: function (moduleId, label) {
                //         return 'http://10.208.24.12:8518/static/monaco/min/vs/base/worker/workerMain.js'
                //     }
                // };
    
                require(['vs/editor/editor.main'], function(monaco) {
                    monaco.languages.register({id: 'text'});

                    monaco.languages.setMonarchTokensProvider('text', {
                        tokenizer: {
                            root: [
                                [/.+/, 'text']
                            ]
                        }
                    });

                    // 创建 DiffEditor
                    const diffEditor = monaco.editor.createDiffEditor(
                        document.getElementById('editor-container'),
                        {
                            wordWrap: 'on',
                            scrollbar: {
                                vertical: 'visible',
                            }
                        }
                    );

                    const fromBase64 = (b64) => decodeURIComponent(escape(atob(b64)));
                    const originalText = fromBase64("${originalB64}");
                    const modifiedText = fromBase64("${modifiedB64}");

                    const originalModel = monaco.editor.createModel(originalText, 'text');
                    const modifiedModel = monaco.editor.createModel(modifiedText, 'text');
        
                    diffEditor.setModel({
                        original: originalModel,
                        modified: modifiedModel
                    })
        
                    window.addEventListener('resize', () => {
                        diffEditor.layout();
                    })
                })
            <\/script>
        </body>
    </html>
    `
}

export default downloadDiffReport;