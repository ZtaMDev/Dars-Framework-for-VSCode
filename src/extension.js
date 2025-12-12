// Dars Framework Preview VS Code extension
// MVP en JavaScript simple para evitar toolchain de TypeScript

const vscode = require('vscode');
/** @type {vscode.WebviewPanel | null} */
let previewPanel = null;

const LAST_URL_KEY = 'dars.preview.lastUrl';

const DARS_UTIL_COMPLETIONS_ENABLED_KEY = 'dars.utilities.enableCompletions';

/** @type {Promise<vscode.CompletionItem[]> | null} */
let darsUtilityCompletionItemsPromise = null;

/** @type {vscode.CompletionItem[] | null} */
let darsUtilityCompletionItemsCache = null;

const DARS_UTILITY_ITEMS = [
    { label: 'container', kind: vscode.CompletionItemKind.Keyword },
    { label: 'block', kind: vscode.CompletionItemKind.Keyword },
    { label: 'inline-block', kind: vscode.CompletionItemKind.Keyword },
    { label: 'inline', kind: vscode.CompletionItemKind.Keyword },
    { label: 'flex', kind: vscode.CompletionItemKind.Keyword },
    { label: 'inline-flex', kind: vscode.CompletionItemKind.Keyword },
    { label: 'grid', kind: vscode.CompletionItemKind.Keyword },
    { label: 'hidden', kind: vscode.CompletionItemKind.Keyword },

    { label: 'items-start', kind: vscode.CompletionItemKind.Keyword },
    { label: 'items-center', kind: vscode.CompletionItemKind.Keyword },
    { label: 'items-end', kind: vscode.CompletionItemKind.Keyword },
    { label: 'justify-start', kind: vscode.CompletionItemKind.Keyword },
    { label: 'justify-center', kind: vscode.CompletionItemKind.Keyword },
    { label: 'justify-end', kind: vscode.CompletionItemKind.Keyword },
    { label: 'justify-between', kind: vscode.CompletionItemKind.Keyword },
    { label: 'justify-around', kind: vscode.CompletionItemKind.Keyword },
    { label: 'justify-evenly', kind: vscode.CompletionItemKind.Keyword },
    { label: 'gap-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('gap-${1:4}') },
    { label: 'gap-x-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('gap-x-${1:4}') },
    { label: 'gap-y-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('gap-y-${1:4}') },

    { label: 'p-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('p-${1:4}') },
    { label: 'px-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('px-${1:4}') },
    { label: 'py-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('py-${1:4}') },
    { label: 'pt-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('pt-${1:4}') },
    { label: 'pr-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('pr-${1:4}') },
    { label: 'pb-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('pb-${1:4}') },
    { label: 'pl-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('pl-${1:4}') },

    { label: 'm-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('m-${1:4}') },
    { label: 'mx-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('mx-${1:4}') },
    { label: 'my-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('my-${1:4}') },
    { label: 'mt-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('mt-${1:4}') },
    { label: 'mr-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('mr-${1:4}') },
    { label: 'mb-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('mb-${1:4}') },
    { label: 'ml-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('ml-${1:4}') },

    { label: 'w-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('w-${1:full}') },
    { label: 'h-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('h-${1:full}') },

    { label: 'text-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('text-${1:base}') },
    { label: 'font-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('font-${1:medium}') },
    { label: 'leading-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('leading-${1:normal}') },
    { label: 'tracking-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('tracking-${1:normal}') },

    { label: 'bg-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('bg-${1:green-500}') },
    { label: 'text-color-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('text-${1:green-500}') },
    { label: 'border-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('border-${1:green-500}') },
    { label: 'rounded-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('rounded-${1:md}') },

    { label: 'opacity-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('opacity-${1:90}') },
    { label: 'shadow-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('shadow-${1:md}') },
    { label: 'blur-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('blur-${1:sm}') },

    { label: 'absolute', kind: vscode.CompletionItemKind.Keyword },
    { label: 'relative', kind: vscode.CompletionItemKind.Keyword },
    { label: 'fixed', kind: vscode.CompletionItemKind.Keyword },
    { label: 'sticky', kind: vscode.CompletionItemKind.Keyword },
    { label: 'top-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('top-${1:0}') },
    { label: 'right-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('right-${1:0}') },
    { label: 'bottom-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('bottom-${1:0}') },
    { label: 'left-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('left-${1:0}') },
    { label: 'z-', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('z-${1:10}') },

    { label: 'overflow-hidden', kind: vscode.CompletionItemKind.Keyword },
    { label: 'overflow-auto', kind: vscode.CompletionItemKind.Keyword },
    { label: 'overflow-scroll', kind: vscode.CompletionItemKind.Keyword },

    { label: 'cursor-pointer', kind: vscode.CompletionItemKind.Keyword },
    { label: 'select-none', kind: vscode.CompletionItemKind.Keyword },
    { label: 'pointer-events-none', kind: vscode.CompletionItemKind.Keyword },

    { label: 'hover:', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('hover:${1:bg-green-500}') },
    { label: 'active:', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('active:${1:bg-green-600}') },
    { label: 'focus:', kind: vscode.CompletionItemKind.Snippet, insertText: new vscode.SnippetString('focus:${1:ring-2}') },
];

/**
 * @param {string} text
 */
function extractUtilitiesFromStylingMarkdown(text) {
    /** @type {Set<string>} */
    const out = new Set();

    // 1) Utilities in backticks: `bg-blue-500`, `hover:bg-blue-600`, etc.
    // Keep tokens that look like a utility (letters/numbers + separators).
    const backtickRe = /`([A-Za-z0-9_:\-\[\]\.]+)`/g;
    for (let m = backtickRe.exec(text); m; m = backtickRe.exec(text)) {
        const tok = String(m[1] || '').trim();
        if (!tok) continue;
        if (/^[A-Za-z]/.test(tok) || tok.includes(':')) out.add(tok);
    }

    // 2) style="..." or style='...' occurrences; split by whitespace.
    const styleRe = /style\s*=\s*("([^\"]*)"|'([^']*)')/g;
    for (let m = styleRe.exec(text); m; m = styleRe.exec(text)) {
        const raw = (m[2] ?? m[3] ?? '').trim();
        if (!raw) continue;
        for (const t of raw.split(/\s+/g)) {
            const tok = String(t || '').trim();
            if (!tok) continue;
            out.add(tok);
        }
    }

    // 3) Heuristic: scan code fences and pick tokens that look like utilities.
    // This helps catch examples not using style="..." explicitly.
    const codeFenceRe = /```[a-zA-Z]*\n([\s\S]*?)```/g;
    for (let m = codeFenceRe.exec(text); m; m = codeFenceRe.exec(text)) {
        const block = String(m[1] || '');
        const tokenRe = /\b([A-Za-z][A-Za-z0-9_:-]*\d*)\b/g;
        for (let t = tokenRe.exec(block); t; t = tokenRe.exec(block)) {
            const tok = String(t[1] || '').trim();
            if (!tok) continue;
            // Filter out obvious Python keywords/identifiers and keep utility-like patterns.
            if (tok.length < 2) continue;
            if (tok.includes('_')) continue;
            if (tok === 'from' || tok === 'import' || tok === 'return' || tok === 'def') continue;
            if (tok === 'Container' || tok === 'Text' || tok === 'Button' || tok === 'Page') continue;
            // Keep tokens with dash or colon, or common utility roots.
            if (tok.includes('-') || tok.includes(':') || /^(bg|text|p|m|w|h|flex|grid|items|justify|gap|rounded|border|shadow|opacity|overflow|cursor|select|pointer)\b/.test(tok)) {
                out.add(tok);
            }
        }
    }

    // Cleanup: remove trailing punctuation
    const cleaned = Array.from(out)
        .map((s) => s.replace(/[,;)]$/g, '').trim())
        .filter((s) => s.length > 0);

    return cleaned;
}

async function loadDarsUtilityCompletionItemsFromWorkspace() {
    const baseDefs = DARS_UTILITY_ITEMS;

    /** @type {Map<string, vscode.CompletionItem>} */
    const byLabel = new Map();

    for (const def of baseDefs) {
        const label = String(def.label || '');
        if (!label) continue;
        const ci = new vscode.CompletionItem(label, def.kind || vscode.CompletionItemKind.Keyword);
        if (def.insertText) ci.insertText = def.insertText;
        ci.filterText = label;
        ci.sortText = '0_' + label;
        byLabel.set(label, ci);
    }

    /** @type {vscode.Uri[]} */
    let mdFiles = [];
    try {
        // Try the known doc location but also allow any workspace layout.
        mdFiles = await vscode.workspace.findFiles('**/styling.md', '**/node_modules/**', 20);
    } catch (e) {
        mdFiles = [];
    }

    const decoder = new TextDecoder('utf-8');
    for (const uri of mdFiles) {
        let content = '';
        try {
            const bytes = await vscode.workspace.fs.readFile(uri);
            content = decoder.decode(bytes);
        } catch (e) {
            continue;
        }

        const tokens = extractUtilitiesFromStylingMarkdown(content);
        for (const t of tokens) {
            const label = String(t || '').trim();
            if (!label) continue;
            if (byLabel.has(label)) continue;

            const ci = new vscode.CompletionItem(label, vscode.CompletionItemKind.Keyword);
            ci.filterText = label;
            ci.sortText = '1_' + label;
            byLabel.set(label, ci);
        }
    }

    return Array.from(byLabel.values());
}

function ensureDarsUtilityCompletionItemsLoading() {
    if (darsUtilityCompletionItemsCache) return;
    if (darsUtilityCompletionItemsPromise) return;

    darsUtilityCompletionItemsPromise = loadDarsUtilityCompletionItemsFromWorkspace();
    darsUtilityCompletionItemsPromise
        .then((items) => {
            darsUtilityCompletionItemsCache = Array.isArray(items) ? items : null;
        })
        .catch(() => {
            // keep cache null; provider will fall back to base items
        });
}

/**
 * @param {vscode.TextDocument} document
 * @param {vscode.Position} position
 */
function getDarsStyleCompletionContext(document, position) {
    const lineText = document.lineAt(position.line).text;
    const before = lineText.slice(0, position.character);

    const styleDq = before.lastIndexOf('style="');
    const styleSq = before.lastIndexOf("style='");

    let styleStart = -1;
    let quote = '';
    if (styleDq === -1 && styleSq === -1) return null;
    if (styleDq > styleSq) {
        styleStart = styleDq + 'style="'.length;
        quote = '"';
    } else {
        styleStart = styleSq + "style='".length;
        quote = "'";
    }

    const afterStart = before.slice(styleStart);
    if (afterStart.includes(quote)) return null;

    const lastPipe = afterStart.lastIndexOf('|');
    const lastSpace = afterStart.lastIndexOf(' ');
    const lastTab = afterStart.lastIndexOf('\t');
    const lastSep = Math.max(lastPipe, lastSpace, lastTab);

    const afterSep = lastSep >= 0 ? afterStart.slice(lastSep + 1) : afterStart;
    if (afterSep.length === 0) {
        return {
            replaceRange: new vscode.Range(position, position),
            typed: '',
        };
    }

    const match = afterSep.match(/\s*([A-Za-z0-9_:\-\[\]\.]+)$/);
    const token = match ? match[1] : '';
    const tokenStartOffset = token ? before.length - token.length : before.length;

    const replaceRange = new vscode.Range(
        new vscode.Position(position.line, tokenStartOffset),
        position
    );

    return { replaceRange, typed: token };
}

function createDarsUtilitiesCompletionProvider() {
    return {
        /**
         * @param {vscode.TextDocument} document
         * @param {vscode.Position} position
         */
        provideCompletionItems(document, position) {
            const enabled = vscode.workspace.getConfiguration().get(DARS_UTIL_COMPLETIONS_ENABLED_KEY, true);
            if (!enabled) return undefined;

            const ctx = getDarsStyleCompletionContext(document, position);
            if (!ctx) return undefined;

            const typed = String(ctx.typed || '').toLowerCase();
            const out = [];

            ensureDarsUtilityCompletionItemsLoading();

            /** @type {vscode.CompletionItem[]} */
            const items = darsUtilityCompletionItemsCache || DARS_UTILITY_ITEMS.map((def) => {
                const label = String(def.label || '');
                const ci = new vscode.CompletionItem(label, def.kind || vscode.CompletionItemKind.Keyword);
                if (def.insertText) ci.insertText = def.insertText;
                ci.filterText = label;
                ci.sortText = '0_' + label;
                return ci;
            });

            for (const ci0 of items) {
                const label = String(ci0.label || '');
                if (!label) continue;
                if (typed && !label.toLowerCase().includes(typed)) continue;

                // Clone minimal fields so we can safely set range per request.
                const ci = new vscode.CompletionItem(label, ci0.kind || vscode.CompletionItemKind.Keyword);
                ci.range = ctx.replaceRange;
                if (ci0.insertText) ci.insertText = ci0.insertText;
                ci.filterText = ci0.filterText || label;
                ci.sortText = ci0.sortText || ('1_' + label);
                ci.command = {
                    command: 'editor.action.triggerSuggest',
                    title: 'Trigger Suggest',
                };
                out.push(ci);
            }

            return out;
        },
    };
}

/** @type {vscode.ExtensionContext | null} */
let activeContext = null;

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

        const nonce = String(Date.now());

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src http://localhost:* http://127.0.0.1:* https://*; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';" />
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
            gap: 8px;
        }
        .left {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
            flex: 1;
        }
        input.url {
            width: 100%;
            min-width: 180px;
            max-width: 520px;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(100,255,200,0.25);
            color: #a0cfc0;
            padding: 4px 6px;
            border-radius: 6px;
            outline: none;
        }
        button {
            background: rgba(100,255,200,0.12);
            border: 1px solid rgba(100,255,200,0.25);
            color: #a0cfc0;
            padding: 4px 8px;
            border-radius: 6px;
            cursor: pointer;
        }
        button:hover {
            background: rgba(100,255,200,0.18);
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
            <div class="left">
                <span style="white-space:nowrap; opacity:0.85;">Dars Preview</span>
                <input class="url" id="urlInput" value="${safeUrl}" spellcheck="false" />
                <button id="openBtn" title="Reload iframe">Open</button>
            </div>
        </header>
        <main>
            <iframe id="frame" src="${safeUrl}"></iframe>
        </main>
    </div>
    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        const input = document.getElementById('urlInput');
        const frame = document.getElementById('frame');
        const btn = document.getElementById('openBtn');

        function normalize(u) {
            u = String(u || '').trim();
            if (!u) return '';
            if (u.startsWith('http://') || u.startsWith('https://')) return u;
            return '';
        }

        function open() {
            const u = normalize(input.value);
            if (!u) return;
            frame.src = u;
            vscode.postMessage({ type: 'setUrl', url: u });
        }

        btn.addEventListener('click', open);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') open();
        });
    </script>
</body>
</html>`;
    }
}

/**
 * Opens (or updates) a preview webview panel beside the editor.
 * @param {string} url
 * @param {DarsPreviewViewProvider} provider
 */
function openOrUpdatePreviewPanel(url, provider, context) {
    const title = 'Dars Preview';
    const html = provider.getHtml(url);

    if (previewPanel) {
        try {
            previewPanel.webview.html = html;
            previewPanel.reveal(vscode.ViewColumn.Beside, true);
            return;
        } catch (e) {
            // If panel got disposed unexpectedly, recreate.
            previewPanel = null;
        }
    }

    previewPanel = vscode.window.createWebviewPanel(
        'darsPreviewPanel',
        title,
        { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
        {
            enableScripts: true,
            retainContextWhenHidden: true,
        }
    );

    if (context) {
        previewPanel.webview.onDidReceiveMessage((msg) => {
            if (!msg || msg.type !== 'setUrl' || !msg.url) return;
            try {
                context.workspaceState.update(LAST_URL_KEY, String(msg.url));
            } catch (e) {
                // best-effort
            }
        });
    }

    previewPanel.onDidDispose(() => {
        previewPanel = null;
    });

    previewPanel.webview.html = html;
}

/**
 * @param {string} url
 */
function normalizeUrl(url) {
    const u = String(url || '').trim().split('"').join('');
    if (!u) return '';
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    return '';
}

function getPreferredUrl() {
    const config = vscode.workspace.getConfiguration('dars.preview');
    return String(config.get('preferredUrl', '') || '').trim();
}

function getLastUrl() {
    try {
        if (!activeContext) return '';
        return String(activeContext.workspaceState.get(LAST_URL_KEY, '') || '').trim();
    } catch (e) {
        return '';
    }
}

/**
 * @param {string} url
 * @param {DarsPreviewViewProvider} provider
 */
function openPreviewUrl(url, provider) {
    const preferredUrl = getPreferredUrl();
    const lastUrl = getLastUrl();

    let normalized = '';
    if (preferredUrl) {
        normalized = normalizeUrl(preferredUrl);
    } else {
        normalized = normalizeUrl(url);
        if (!normalized && lastUrl) {
            normalized = normalizeUrl(lastUrl);
        }
    }
    if (!normalized) {
        vscode.window.showErrorMessage('No valid URL found (must start with http:// or https://).');
        return;
    }

    openOrUpdatePreviewPanel(normalized, provider, activeContext);
}

/**
 * @param {DarsPreviewViewProvider} provider
 */
function openPreviewFromSelection(provider) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found.');
        return;
    }
    const selectionText = editor.document.getText(editor.selection);
    openPreviewUrl(selectionText, provider);
}

/**
 * @param {DarsPreviewViewProvider} provider
 */
async function openPreviewFromClipboard(provider) {
    const text = await vscode.env.clipboard.readText();
    openPreviewUrl(text, provider);
}

/**
 * Terminal link provider: makes localhost URLs clickable and opens them in Dars Preview.
 * @param {DarsPreviewViewProvider} provider
 */
function createTerminalLinkProvider(provider) {
    const re = /(http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?[^\s]*)/gi;

    return {
        provideTerminalLinks(context) {
            const line = context.line;
            const links = [];
            let m;
            while ((m = re.exec(line)) !== null) {
                const url = m[1];
                links.push({
                    startIndex: m.index,
                    length: url.length,
                    tooltip: 'Open in Dars Preview',
                    url,
                });
            }
            return links;
        },
        async handleTerminalLink(link) {
            const url = link && link.url ? String(link.url) : '';
            if (!url) return;

            const choice = await vscode.window.showQuickPick(
                [
                    { label: 'Open in Dars Preview', action: 'preview' },
                    { label: 'Open in Browser', action: 'browser' },
                ],
                { title: 'Open Link', placeHolder: url }
            );

            if (!choice) return;
            if (choice.action === 'browser') {
                vscode.env.openExternal(vscode.Uri.parse(url));
                return;
            }

            openPreviewUrl(url, provider);
        },
    };
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    activeContext = context;
    const provider = new DarsPreviewViewProvider(context);

    ensureDarsUtilityCompletionItemsLoading();

    /** @type {NodeJS.Timeout | null} */
    let suggestDebounce = null;
    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection((e) => {
            const enabled = vscode.workspace.getConfiguration().get(DARS_UTIL_COMPLETIONS_ENABLED_KEY, true);
            if (!enabled) return;
            if (!e || !e.textEditor || !e.textEditor.document) return;
            if (e.textEditor.document.languageId !== 'python') return;
            if (e.kind !== vscode.TextEditorSelectionChangeKind.Mouse && e.kind !== vscode.TextEditorSelectionChangeKind.Command) return;

            const pos = e.selections && e.selections[0] ? e.selections[0].active : null;
            if (!pos) return;

            const ctx0 = getDarsStyleCompletionContext(e.textEditor.document, pos);
            if (!ctx0) return;

            if (suggestDebounce) clearTimeout(suggestDebounce);
            suggestDebounce = setTimeout(() => {
                vscode.commands.executeCommand('editor.action.triggerSuggest');
            }, 150);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('dars.openPreview', async () => {
            const preferredUrl = getPreferredUrl();
            const lastUrl = getLastUrl();
            const input = await vscode.window.showInputBox({
                title: 'Open Dars Preview URL',
                prompt: 'Paste a URL like http://localhost:8000',
                value: preferredUrl || lastUrl || 'http://localhost:8000',
            });
            if (input) openPreviewUrl(input, provider);
        }),
        vscode.commands.registerCommand('dars.openPreviewFromSelection', () => openPreviewFromSelection(provider)),
        vscode.commands.registerCommand('dars.openPreviewFromClipboard', () => openPreviewFromClipboard(provider))
    );

    // Restore last URL (if any) on startup by opening the panel when user triggers the command.
    // We don't auto-open the panel on startup.
    context.subscriptions.push(
        vscode.window.registerTerminalLinkProvider(createTerminalLinkProvider(provider))
    );

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { language: 'python', scheme: 'file' },
            createDarsUtilitiesCompletionProvider(),
            ...' \tabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-:|[]"\'' .split('')
        )
    );
}

function deactivate() {
    if (previewPanel) {
        try {
            previewPanel.dispose();
        } catch (e) {
            // best-effort
        }
        previewPanel = null;
    }
}

module.exports = {
    activate,
    deactivate,
};
