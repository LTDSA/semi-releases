# 插件包声明

Semi 读取标准 `package.json`，插件声明放在 `semi` 对象中。

## npm 字段

| 字段 | 用途 |
| --- | --- |
| `name` | 插件的唯一标识，使用任意符合 [npm 命名规则](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#name) 的名称，例如 `room-controls` 或 `@example/room-controls` |
| `version` | 插件自己的语义版本 |
| `description` | npm 包说明 |
| `author` | 可选。Semi 在插件发现页展示作者姓名。可以填写字符串，或包含 `name` 的 npm 作者对象 |
| `files` | 随 npm 包发行的文件，通常为 `["dist"]` |
| `dependencies` | 运行依赖 |
| `scripts` | 插件自己的构建、检查和打包命令 |
| `engines.semi` | 支持的宿主版本范围，例如 `>=0.7.2` |

## semi 字段

| 字段 | 用途 |
| --- | --- |
| `displayName` | 显示名称，缺省使用包名 |
| `scope` | `global`、`account` 或 `device`，见[运行范围](./lifecycle.md#运行范围) |
| `permissions` | 需要申请的受保护能力 |
| `permissionReasons` | 权限申请说明，键为权限名称 |
| `background` | 后台 HTML，或 `{ runtime: "node", entry, permissions, scope? }` |
| `activationEvents` | `onReady` 自动激活；`onResume` 恢复已保活后台 |
| `contributes` | 视图、菜单、命令和界面入口 |
| `accountProviders` | 账号提供者 |
| `deviceAdapters` | 设备适配器 |
| `serviceProviders` | 向其他插件公开的服务 |
| `services` | 消费的服务契约与版本 |
| `deviceCapabilities` | 消费的设备契约与版本 |
| `requires` | 当前设备必须报告的能力标记 |
| `icon`／`color` | 插件自身的图标和可选颜色，图标可引用本包位图／SVG |

插件说明使用 npm 标准 `description`，图标使用 `semi.icon`（例如 `./dist/icon.svg`），颜色使用 `semi.color`。npm 图标库可在构建时导出为包内 SVG／位图。声明 `main` 或 `window` 页面的外部插件会列入实用工具，由用户启用。

## 声明视图

```json
{
    "name": "room-controls",
    "version": "1.0.0",
    "description": "查看和控制局域网设备",
    "author": "示例作者",
    "files": ["dist"],
    "semi": {
        "displayName": "我的插件",
        "scope": "global",
        "contributes": {
            "views": [
                {
                    "id": "main",
                    "entry": "dist/index.html",
                    "placement": "window",
                    "window": { "width": 800, "height": 600 }
                }
            ]
        }
    }
}
```

| placement | 展示方式 |
| --- | --- |
| `main` | 主窗口内容区域 |
| `window` | 独立窗口 |
| `overlay` | 主窗口覆盖层，常用于对话框 |
| `tray` | 共享托盘面板中的内容 |

入口路径相对 npm 包根目录。独立窗口宽高固定；`main` 的 `keepAlive: false` 表示离开页面时销毁。

## 界面扩展

`contributes` 的各条目使用本包内唯一的 `id`。

| 扩展 | 主要字段 |
| --- | --- |
| `sidebar` | `id`、`title`、`view`、可选 `icon` |
| `settings` | `id`、`title`、`view` |
| `commands` | `id`、`title` |
| `trayMenu` | `id`、`title`、`command` |
| `statusbar` | `id`、`title`、`command` |
| `deviceTools` | `id`、`title`、`view`、可选 `icon`／`color` |

侧栏常用图标为 `intro`、`chart`、`config`、`token`、`tree`、`switch`。设备适配器自己的卡片操作和工具由运行时 `menu()` 返回，见[设备与适配器](./devices.md)。

## 依赖与发行

构建时将页面依赖打包到 `dist`。Node 后台的依赖可打包进入口，或使用 npm 的 `bundleDependencies` 随包提供。普通 `dependencies` 声明不会自动将依赖文件放进 tarball。

[构建与分发 →](./distribution.md)
