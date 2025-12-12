<h1 align="center">Dars Framework for VS Code</h1>
 
<p align="center">
  <img src="https://raw.githubusercontent.com/ZtaMDev/Dars-Framework/CrystalMain/Dars-logo.png" alt="Dars Framework Logo" width="200" />
</p>

<p align="center">
  <img src="https://img.shields.io/pypi/v/dars-framework?color=brightgreen" alt="PyPI Version" />
  <img src="https://img.shields.io/pypi/pyversions/dars-framework?color=blue" alt="Python Versions" />
  <img src="https://img.shields.io/github/license/ZtaMDev/Dars-Framework" alt="License" />
</p>

<p align="center">
  <em>A lightweight VS Code extension to open a running <b>Dars</b> app preview inside VS Code and get Tailwind-like utility style completions in Python.</em>
</p>

<div align="center">

Official [Website](https://ztamdev.github.io/Dars-Framework/) | 
Documentation [Docs](https://ztamdev.github.io/Dars-Framework/docs.html)

</div>

This extension does **not** start/stop your Dars process. You run Dars normally in a VS Code terminal (or any terminal), then open the preview URL in a dedicated **Dars Preview** webview tab.

## Features

- Open `http://localhost:...` / `http://127.0.0.1:...` URLs in a VS Code webview preview tab (right side).
- Ctrl+Click a localhost URL in the integrated terminal and choose:
  - **Open in Dars Preview**
  - **Open in Browser**
- Open preview from:
  - a URL you paste
  - a selected URL in the editor
  - the clipboard
- Edit the URL directly in the preview tab header and reload it.
- Tailwind-like completions for Dars utility styles inside Python strings (for `style="..."` / `style='...'`).

## Commands

- `Dars: Open Preview URL`
  - Prompts for a URL and opens it in the Dars Preview tab.
- `Dars: Open Preview (Selected URL)`
  - Uses the current editor selection as the URL.
- `Dars: Open Preview (Clipboard URL)`
  - Reads the URL from your clipboard.

## Settings

- `dars.preview.preferredUrl` (string, default: empty)
  - If set, this URL is used when opening the preview (overrides clicked/selected URLs).
  - If empty, the clicked/selected URL is used.

- `dars.utilities.enableCompletions` (boolean, default: true)
  - Enables Dars utility style completions inside Python strings.
  - Triggered when your cursor is inside a `style="..."` (or `style='...'`) attribute.

## Usage

1. Start your Dars app preview in a terminal.
   - Example: `dars dev ...`
   - Or run your entry Python file that calls `app.rTimeCompile()`.
2. When you see a URL like `http://localhost:8000` in the VS Code terminal:
   - Ctrl+Click it
   - Choose **Open in Dars Preview**
3. Optional:
   - Run `Dars: Open Preview URL` and paste a URL
   - Or select a URL in the editor and right-click → **Dars: Open Preview (Selected URL)**

## Dars Utility Style Completions

Inside Python strings, when you write a `style` attribute, you will get Tailwind-like utility suggestions.

Example (type `bg-` and use IntelliSense):

```py
Button("Click", style="bg-")
```

Example:

```py
Button(
    "Click me",
    style="flex items-center gap-2 p-4 bg-green-500 hover:bg-green-600"
)
```
