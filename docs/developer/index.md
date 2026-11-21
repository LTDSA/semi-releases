---
description: 使用 Semi SDK 创建插件，扩展设备、账号、服务和界面。
---

# SDK 与插件开发

<span class="sdk-version">SDK 0.7.2</span>

Semi 插件是标准 npm 包。使用 JavaScript 或 TypeScript 编写页面和后台，通过 SDK 连接宿主提供的账号、设备、存储与界面能力。

<div class="sdk-paths">
<div>

### 写一个插件

从一个 HTML 页面开始，用 Vite 构建，在 Semi 中运行。

[快速开始 →](./getting-started.md)

</div>
<div>

### 接入设备或账号

通过 DeviceAdapter、AccountProvider 或公开服务扩展 Semi。

[了解插件能力 →](./devices.md)

</div>
<div>

### 查找接口

按用途查看方法、参数、返回值与示例。

[API 索引 →](./api.md)

</div>
</div>

## 选择需要的能力

| 想做什么 | 从这里开始 |
| --- | --- |
| 显示独立窗口、内嵌页面或对话框 | [视图与界面](./views.md) |
| 读取主题、监听页面可见性 | [宿主与生命周期](./lifecycle.md) |
| 登录用户选择的账号 | [账号与登录](./accounts.md) |
| 为设备提供连接、展示和菜单 | [设备与适配器](./devices.md) |
| 在插件页面和后台间通信 | [后台与服务](./background.md) |
| 保存设置、读取文件或下载公开资源 | [存储与网络](./storage-network.md) |
| 处理取消、超时或错误 | [事件与错误](./events.md) |

## 一个包，多种能力

同一个插件可以同时提供页面、后台、账号提供者和设备适配器。能力按需组合，不要求为每种能力创建一个包。

```text
my-plugin/
├── package.json       # npm 元数据和 semi 声明
├── index.html
├── src/
│   └── main.ts
└── dist/              # 构建后的发行内容
```

SDK 不依赖 React 或 Vue。页面可以直接使用 DOM，也可以使用你选择的框架与组件库。

SDK 版本跟随宿主发布。插件自己的版本独立维护，使用 `engines.semi` 声明最低宿主版本，使用 `semi.canIUse()` 检查可选接口。
