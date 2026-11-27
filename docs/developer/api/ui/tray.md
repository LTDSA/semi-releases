# 托盘

| API | 说明 |
| --- | --- |
| `semi.createTray` | (id, options) → void；后台登记托盘 |
| `semi.destroyTray` | (id) → void；移除托盘 |
| `semi.updateTrayMenuItem` | (id, patch) → void；更新自己的托盘菜单项 |

托盘创建需要声明 `ui.tray.create`。后台可更新自己的托盘条目。参见[视图与界面](../../views.md)。

## createTray(id, options)

`id` 是插件为本次登记选择的 ID，销毁时用同一 ID。Promise 在登记完成后解析为 `void`。先在 `semi.permissions` 声明 `ui.tray.create` 并申请该权限。

| 字段 | 用法 |
| --- | --- |
| `view` | 引用 `contributes.views` 中 `placement: 'tray'` 的本包视图。后台在 macOS 或 Windows 登记后，内容进入 Semi 的共享托盘面板。 |
| `icon` | 包内 PNG 或 ICO 路径，独立图标模式必填。 |
| `menu` | 独立图标使用的菜单数组，每项有 `title` 和 `command`。命令必须在 `contributes.commands` 声明。有 `view` 时不能同时传菜单项。 |
| `tooltip`、`title` | 独立图标的悬停提示和 macOS 标题。 |
| `template` | macOS 模板图标开关，默认启用。 |

```ts
// 页面首次设置托盘时申请授权。
await semi.authorize({ scope: 'ui.tray.create' });
await semi.callBackground('tray.enable');
```

```ts
// 后台，包声明已有 id 为 tray 的托盘视图。
semi.handleBackgroundCall('tray.enable', async () => {
    await semi.createTray('panel', { view: 'tray' });
});
await semi.markViewReady();
```

也可以创建独立图标，例如 `await semi.createTray('status', { icon: 'icons/status.png', tooltip: '同步状态' })`。拥有者可以通过 `onEvent('tray.click', ({ id }) => …)` 接收独立图标的点击事件。额度超限时会收到 `QUOTA_EXCEEDED`。

## destroyTray(id)

用户关闭托盘功能时，由登记该项目的后台调用 `await semi.destroyTray('panel')`，释放相应图标或共享面板内容。实例关闭时宿主也会回收托盘资源。

## updateTrayMenuItem(id, patch)

仅更新 `contributes.trayMenu` 声明的本包项目。首参是该项的声明 ID，`patch` 可传 `title`、`badge`、`enabled`、`hidden`。返回 `Promise<void>`。

```json
[{ "id": "refresh", "title": "刷新目录", "command": "refresh" }]
```

```ts
await semi.updateTrayMenuItem('refresh', { title: '正在刷新…', enabled: false });
```

注册时通过 `createTray(id, { menu })` 提供的独立图标菜单由创建选项配置。声明式命令的注册见[命令与 Intent](../plugin/commands.md)。
