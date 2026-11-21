# 视图与界面

## 打开本包视图

```ts
const { instanceId } = await semi.openView({ id: 'details', params: { section: 'network' } });
```

`details` 是 `contributes.views` 中的 ID。页面通过 `(await semi.getViewOptions()).params` 读取启动参数。

设备或账号范围的视图可显式传入目标：

```ts
await semi.openView({ id: 'configuration', target: { deviceId } });
```

| 接口 | 用途 |
| --- | --- |
| `openView({ id, params?, target? })` | 打开本包声明的视图 |
| `closeView({ instanceId })` | 关闭本视图创建的覆盖层；同包后台也可关闭本包覆盖层 |
| `closeCurrentView()` | 关闭自己 |

跨插件入口使用 Intent。

## 对话框

视图声明 `placement: "overlay"`，从当前可见的内嵌页面或设备卡片入口打开。插件负责对话框正文，宿主负责承载和目标绑定。

带退场动画的对话框应在动画结束后调用 `closeCurrentView()`；等待 `lifecycle.visibility` 确认可见，再开始入场动画。

已有内嵌页中的弹层可以调用 `setModalLayout(true)` 扩展视图至主窗口范围，关闭动画结束后调用 `false` 恢复。返回 `EmbeddedLayout | null`，坐标与尺寸由宿主计算。

## 更新界面贡献

```ts
await semi.updateSidebarItem('entry', { badge: '3' });
await semi.updateStatusBarItem('status', { title: '已完成' });
await semi.updateTrayMenuItem('refresh', { enabled: false });
```

可更新 `title`、`badge`、`enabled`、`hidden`，仅作用于本包声明的项目。

## 托盘

在 `contributes.views` 中声明：

```json
{
    "id": "tray",
    "entry": "dist/tray.html",
    "placement": "tray",
    "keepAlive": true,
    "window": { "width": 320, "height": 300 }
}
```

由后台登记：

```ts
await semi.createTray('panel', { view: 'tray' });
// 使用结束
await semi.destroyTray('panel');
```

先在前端申请 `ui.tray.create`。共享面板的公共标题和切换由宿主提供，插件渲染自己的内容。切换到其他内容时接收可见性事件，应停止轮询。

## 命令与 Intent

命令是本包内部动作，声明在 `contributes.commands`：

```ts
semi.registerCommand('refresh', () => refresh());
await semi.executeCommand('refresh');
```

Intent 用于跨插件动作。提供者声明名字、版本、参数 Schema 和 `handler`（视图 ID 或 `background`），再注册处理器：

```ts
semi.handleIntent('example.echo', ({ params }) => ({ text: params.text }));
```

TypeScript 中扩展契约：

```ts
import '@semi-app/plugin-sdk';

declare module '@semi-app/plugin-sdk' {
    interface IntentMap {
        'example.echo': {
            params: { text: string };
            result: { text: string };
        };
    }
}
```

消费者声明并申请 `intents.invoke:example.echo`，然后调用：

```ts
const result = await semi.invokeIntent('example.echo', { text: 'hello' }, {
    target: 'example-provider',
    version: 1,
    signal: controller.signal,
});
```

`target` 是提供者 npm 包名；省略时由宿主寻找可用提供者。参数和返回值使用双方约定的 JSON Schema 校验。
