// Dars Framework Preview VS Code extension
// MVP en JavaScript simple para evitar toolchain de TypeScript

const vscode = require('vscode');
const cp = require('child_process');
const path = require('path');

/** @type {cp.ChildProcess | null} */
let darsProcess = null;

/** @type {DarsPreviewViewProvider | null} */
let previewProvider = null;

/**
 * Proveedor de vista para el sidebar de preview.
 */
class DarsPreviewViewProvider {
    /** @param {vscode.ExtensionContext} context */
    constructor(context) {
        this.context = context;
        this.currentUrl = null; // Se actualiza cuando arrancamos el servidor
    }

    /** @param {vscode.WebviewView} webviewView */
    resolveWebviewView(webviewView) {
        this.webviewView = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
        };

        this.updateWebview();
    }

    reveal() {
        if (this.webviewView && typeof this.webviewView.show === 'function') {
            try {
                this.webviewView.show(true);
                return;
            } catch (e) {
                // best-effort
            }
        }
        // fallback: at least bring Explorer into focus
        vscode.commands.executeCommand('workbench.view.explorer');
    }

    /** Actualiza el HTML del webview con el iframe apuntando al preview de Dars. */
    updateWebview() {
        if (!this.webviewView) {
            return;
        }

        const config = vscode.workspace.getConfiguration('dars.preview');
        const port = config.get('port', 8000);
        const url = this.currentUrl || `http://localhost:${port}`;

        this.webviewView.webview.html = this.getHtml(url);
    }

    /**
     * @param {string} url
     */
    setUrl(url) {
        this.currentUrl = url;
        this.updateWebview();
    }

    /**
     * @param {string} url
     */
    getHtml(url) {
        const safeUrl = String(url || '').split('"').join('').trim();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src http://localhost:* http://127.0.0.1:* https://*; style-src 'unsafe-inline'; script-src 'unsafe-inline';" />
    <style>
        html, body {
            padding: 0;
            margin: 0;
            height: 100%;
            background: #0b1210;
            color: #a0cfc0;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .container {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        header {
            padding: 6px 10px;
            border-bottom: 1px solid rgba(100,255,200,0.2);
            font-size: 11px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        header span {
            opacity: 0.8;
        }
        main {
            flex: 1;
            position: relative;
        }
        iframe {
            border: none;
            width: 100%;
            height: 100%;
        }
        .hint {
            font-size: 11px;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <span>Dars Preview: <code>${safeUrl}</code></span>
            <span class="hint">Ejecuta "Dars: Start Preview" si no ves nada.</span>
        </header>
        <main>
            <iframe src="${safeUrl}"></iframe>
        </main>
    </div>
</body>
</html>`;
    }
}

/**
 * Arranca el proceso de preview (dars dev o python archivo.py) según config.
 * @param {vscode.ExtensionContext} context
 * @param {DarsPreviewViewProvider} provider
 */
async function startPreview(context, provider) {
    return startPreviewWithMode(context, provider, null);
}

async function startPreviewDev(context, provider) {
    return startPreviewWithMode(context, provider, 'dev');
}

/**
 * @param {vscode.ExtensionContext} context
 * @param {DarsPreviewViewProvider} provider
 * @param {'dev' | null} mode
 */
async function startPreviewWithMode(context, provider, mode) {
    if (darsProcess) {
        vscode.window.showInformationMessage('Dars preview ya está en ejecución.');
        provider.updateWebview();
        provider.reveal();
        return;
    }

    const config = vscode.workspace.getConfiguration('dars.preview');
    const useDarsDev = mode === 'dev' ? true : config.get('useDarsDev', false);
    const port = config.get('port', 8000);
    const pythonPath = config.get('pythonPath', 'python');

    let cwd = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : undefined;

    /** @type {string | undefined} */
    let entryFile = undefined;

    if (!useDarsDev) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No hay ningún archivo activo. Abre el archivo Python con app.rTimeCompile.');
            return;
        }
        const doc = editor.document;
        if (doc.languageId !== 'python') {
            vscode.window.showErrorMessage('El archivo activo no es un archivo Python.');
            return;
        }
        entryFile = doc.uri.fsPath;
        cwd = path.dirname(entryFile);
    }

    /** @type {string} */
    let cmd;
    /** @type {string[]} */
    let args;

    if (useDarsDev) {
        cmd = 'dars';
        args = ['dev', '--project', cwd || '.'];
    } else {
        cmd = pythonPath || 'python';
        args = [entryFile];
        // permitir pasar puerto a rTimeCompile si el usuario lo usa en sys.argv
        if (port && Number.isInteger(port)) {
            args.push('--port', String(port));
        }
    }

    const procCwd = cwd || process.cwd();

    try {
        darsProcess = cp.spawn(cmd, args, {
            cwd: procCwd,
            shell: process.platform === 'win32',
        });
    } catch (err) {
        vscode.window.showErrorMessage(`No se pudo lanzar el proceso Dars: ${err}`);
        darsProcess = null;
        return;
    }

    darsProcess.stdout?.on('data', (data) => {
        const text = data.toString();
        detectAndSetPreviewUrl(text, provider);
        // Mostrar en la salida de VS Code
        getOutputChannel().append(text);
    });

    darsProcess.stderr?.on('data', (data) => {
        const text = data.toString();
        detectAndSetPreviewUrl(text, provider);
        getOutputChannel().append(text);
    });

    darsProcess.on('exit', (code, signal) => {
        darsProcess = null;
        getOutputChannel().appendLine(`\n[Dars] Proceso terminado (code=${code}, signal=${signal}).`);
    });

    provider.setUrl(`http://localhost:${port}`);
    provider.reveal();
    getOutputChannel().show(true);
}

/**
 * Detecta la URL del preview desde logs de Dars.
 * Soporta formatos comunes:
 * - "Preview available at: http://localhost:8000"
 * - "✓ Preview server started on http://localhost:8000"
 * @param {string} text
 * @param {DarsPreviewViewProvider} provider
 */
function detectAndSetPreviewUrl(text, provider) {
    if (!text) return;

    const patterns = [
        /Preview available at:\s*(http:\/\/[^\s]+)/i,
        /Preview server started on\s*(http:\/\/[^\s]+)/i,
        /(http:\/\/(?:localhost|127\.0\.0\.1):\d+)/i,
    ];

    for (const re of patterns) {
        const match = text.match(re);
        if (match && match[1]) {
            provider.setUrl(match[1]);
            return;
        }
    }
}

function stopPreview() {
    if (!darsProcess) {
        vscode.window.showInformationMessage('No hay ningún preview Dars en ejecución.');
        return;
    }

    try {
        if (process.platform === 'win32') {
            cp.spawn('taskkill', ['/pid', String(darsProcess.pid), '/f', '/t']);
        } else {
            darsProcess.kill('SIGINT');
        }
    } catch (err) {
        // best-effort
    }

    darsProcess = null;
}

let outputChannel = null;
function getOutputChannel() {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('Dars Preview');
    }
    return outputChannel;
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const provider = new DarsPreviewViewProvider(context);
    previewProvider = provider;

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('darsPreviewView', provider)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('dars.startPreview', () => startPreview(context, provider)),
        vscode.commands.registerCommand('dars.startPreviewDev', () => startPreviewDev(context, provider)),
        vscode.commands.registerCommand('dars.stopPreview', () => stopPreview())
    );
}

function deactivate() {
    stopPreview();
}

module.exports = {
    activate,
    deactivate,
};
