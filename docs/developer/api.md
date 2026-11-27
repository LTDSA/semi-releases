# API 参考

通过 `@semi-app/plugin-sdk` 导入 `semi`。API 按基础、路由、界面、网络、数据缓存、文件、开放接口和设备分类。插件后台、提供者与跨插件调用列在 Semi 扩展中。

各接口的「起始版本」是首次支持该接口的公开 SDK 版本。若插件支持多个宿主版本，可在调用可选接口前用 [`semi.canIUse()`](./api/base/system/getAppBaseInfo.md) 检查。各版本的变更见 [SDK 更新日志](./changelog.md)。

| 分类 | API |
| --- | --- |
| 基础 | [宿主基础信息](./api/base/system/getAppBaseInfo.md) · [应用级事件](./api/base/app/app-events.md) · [初始化与事件订阅](./api/base/app/runtime.md) |
| 路由 | [打开与关闭视图](./api/route/views.md) |
| 界面 | [窗口与交互](./api/ui/window.md) · [托盘](./api/ui/tray.md) |
| 网络 | [发起请求](./api/network/request/request.md) · [下载](./api/network/download/downloadFile.md) |
| 数据缓存 | [持久化 KV](./api/storage/kv.md) · [缓存管理](./api/storage/cache.md) |
| 文件 | [插件文件](./api/file/files.md) |
| 开放接口 | [登录](./api/open-api/login/login.md) · [授权](./api/open-api/authorize/authorize.md) |
| 设备 | [设备能力](./api/device/devices.md) · [屏幕](./api/device/screen.md) |
| Semi 扩展 | [插件后台](./api/plugin/background.md) · [提供者与服务](./api/plugin/providers.md) · [命令与 Intent](./api/plugin/commands.md) |

## Promise 与回调

`request`、`downloadFile`、`login`、`authorize`、`setKeepScreenOn` 以及三项 KV 接口接受可选的 `success`、`fail`、`complete`。省略回调时返回 Promise。回调模式下，`complete` 在成功或失败后执行一次，错误通过 `code` 与 `errMsg` 提供。异步调用均可通过 TypeScript 声明查看完整签名。
