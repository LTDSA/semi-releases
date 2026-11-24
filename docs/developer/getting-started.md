---
description: 从 npm 安装 Semi 插件 SDK，用 Vite 创建第一个插件。
---

# 快速开始

本例创建一个内嵌页面：显示宿主版本、同步明暗主题，并保存一个设置。

## 1. 准备 SDK

创建插件项目，从 npm 安装 SDK。运行本例需要 Semi 0.8.0 或更新版本。

```sh
mkdir semi-example
cd semi-example
npm init -y
npm install @semi-app/plugin-sdk@0.8.0
npm install -D vite typescript
```

## 2. 声明插件

编辑 `package.json`。`name` 是 npm 包名，`semi.displayName` 是界面中的名称。

```json
{
    "name": "my-semi-example",
    "version": "1.0.0",
    "description": "显示应用信息并保存设置",
    "author": "示例作者",
    "type": "module",
    "files": ["dist"],
    "scripts": {
        "build": "vite build --base=./"
    },
    "engines": {
        "semi": ">=0.8.0"
    },
    "semi": {
        "displayName": "我的示例",
        "scope": "global",
        "icon": "settings-2",
        "color": "blue",
        "contributes": {
            "views": [
                { "id": "main", "entry": "dist/index.html", "placement": "main" }
            ]
        }
    }
}
```

保留安装命令添加的 `dependencies` 和 `devDependencies`。

## 3. 编写页面

创建 `index.html`：

```html
<!doctype html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>我的示例</title></head>
<body>
    <h1>我的示例</h1>
    <p id="version">正在加载…</p>
    <label><input id="compact" type="checkbox">紧凑模式</label>
    <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

创建 `src/main.ts`：

```ts
import { semi } from '@semi-app/plugin-sdk';
import './style.css';

async function main() {
    const { version, theme } = semi.getAppBaseInfo();
    document.querySelector('#version')!.textContent = `Semi ${version}`;
    document.documentElement.dataset.theme = theme;

    const applyTheme = ({ theme }: { theme: 'light' | 'dark' }) => {
        document.documentElement.dataset.theme = theme;
    };
    semi.onThemeChange(applyTheme);
    window.addEventListener('pagehide', () => semi.offThemeChange(applyTheme), { once: true });

    const checkbox = document.querySelector<HTMLInputElement>('#compact')!;
    const { data: compact } = await semi.getStorage<boolean>({ key: 'compact' });
    checkbox.checked = compact ?? false;
    checkbox.addEventListener('change', () => {
        semi.setStorage({ key: 'compact', data: checkbox.checked }).catch(console.error);
    });

    await semi.markViewReady();
}

main().catch(console.error);
```

创建 `src/style.css`：

```css
:root { color-scheme: light; font-family: system-ui, sans-serif; }
:root[data-theme="dark"] { color-scheme: dark; }
body { margin: 24px; }
```

## 4. 构建插件

```sh
npm run build
npm pack
```

发行包包含 `package.json` 和 `dist`。宿主读取构建后的入口，SDK 调用在 Semi 插件运行时中执行。

插件包的检查和安装方式见[构建与分发](./distribution.md)。

接下来阅读[插件包声明](./package.md)，配置独立窗口、侧栏或后台。
