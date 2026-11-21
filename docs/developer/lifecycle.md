# 宿主与生命周期

## 初始化

```ts
import { semi } from '@semi-app/plugin-sdk';

const { version, theme, platform } = semi.getAppBaseInfo();
await semi.markViewReady();
```

[宿主基础信息](./api/base/system/getAppBaseInfo.md)使用同步快照。页面启动参数由 `getViewOptions()` 提供，布局及初始可见性由 `getViewState()` 提供。

`version` 是实际宿主版本；`semi.version` 是插件所用 SDK 的版本。`platform` 为 `darwin`、`win32` 或 `linux`，实际应用发行平台以下载页为准。

后台先注册处理器，再调用 `markViewReady()`；Node 后台的入口函数返回后，宿主引导程序完成 ready 握手。宿主等待启动最多 15 秒。

## 明暗主题

`theme` 为宿主当前生效的 `light` 或 `dark`。将它应用到所选 UI，再监听后续变化：

```ts
const { theme } = semi.getAppBaseInfo();
document.documentElement.dataset.theme = theme;

const applyTheme = ({ theme }) => { document.documentElement.dataset.theme = theme; };
semi.onThemeChange(applyTheme);
window.addEventListener('pagehide', () => semi.offThemeChange(applyTheme), { once: true });
```

可使用标准 `@douyinfe/semi-ui` 或其他组件库。SDK 负责传递主题信息，页面负责样式。

## 运行范围

| scope | 目标 | 适合的功能 |
| --- | --- | --- |
| `global` | 无固定目标 | 工具入口、多设备查询 |
| `account` | 明确的账号引用 | 智能设备列表、账号服务 |
| `device` | 明确的设备引用 | 设备配置、设备工具 |

视图可以声明自己的 `scope`。通过 `openView` 的 `target` 传入 `{ deviceId }` 或 `{ accountId }`。账号范围页面也可以在调用 `login` 后建立账号绑定。

各设备独立连接，没有全局“当前设备”。全局插件通过 `callDevice` 的 `deviceId` 为单次调用选择目标。

## 可见性与清理

使用 [onAppShow / onAppHide](./api/base/app/app-events.md) 监听插件进入或退出前台。单个视图的显隐适合控制该视图的轮询和动画。

```ts
const controller = new AbortController();
const off = semi.onEvent('lifecycle.visibility', ({ visible }) => {
    if (!visible) controller.abort();
});

window.addEventListener('pagehide', () => {
    controller.abort();
    off();
}, { once: true });
```

页面隐藏时停止轮询；再次显示时按业务需要重新读取。关闭、账号撤销、设备会话变化或提供者停用会使相关在途调用失效。

## 检查接口支持

```ts
if (semi.canIUse('request')) {
    // 可以使用 HTTP 请求接口。
}
```

参数为不含 `semi.` 的方法路径。返回值只表示宿主支持该 API；权限、登录状态和目标能力分别检查。
