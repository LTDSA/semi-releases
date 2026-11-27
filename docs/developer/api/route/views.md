# 打开与关闭视图

| API | 起始版本 | 说明 |
| --- | --- | --- |
| `semi.openView` | 0.8.0 | 打开本包声明的窗口、页面或覆盖层，可传入启动参数和显式的设备或账号目标。接收 `{ id, params?, target? }`，返回 `{ instanceId }`。 |
| `semi.closeView` | 0.8.0 | 接收 `{ instanceId }`，关闭本插件创建的覆盖层。 |
| `semi.closeCurrentView` | 0.8.0 | 关闭当前运行实例。 |
| `semi.getViewOptions` | 0.8.0 | 读取打开当前视图时传入的参数与绑定目标，例如设备详情页需要的设备 ID。返回 `{ viewId, params, target }`。 |

打开本包声明的页面时可以传启动参数，以及显式的设备或账号引用。

```ts
const { instanceId } = await semi.openView({
    id: 'settings',
    params: { section: 'network' },
    target: { deviceId },
});

// settings 入口读取自己的选项。
const { params, target } = await semi.getViewOptions();
```

宿主通过 `target` 绑定设备或账号，调用方不能用 `params` 覆盖它。视图自己退场时调用 `closeCurrentView()`，同包的父视图或后台可以用 `closeView({ instanceId })` 关闭有权管理的覆盖层。详见[视图与界面](../../views.md)。

## 覆盖层与独立视图

| 调用 | 参数 | Promise 结果 |
| --- | --- | --- |
| `openView(options)` | `id` 为同包 `contributes.views` 中的 ID，`params` 为 JSON 对象，`target` 为 `{ deviceId }` 或 `{ accountId }` | `{ instanceId: string }` |
| `getViewOptions()` | 无，仅视图 | `{ viewId, params, target }`，无目标时 `target` 为 `null` |
| `closeView(options)` | `{ instanceId: string }` | 完成，无返回数据 |
| `closeCurrentView()` | 无 | 完成，无返回数据 |

可见的内嵌父页可通过 `openView` 创建本包的 `overlay`。普通独立窗口使用 `closeCurrentView` 自行退出；托盘面板由托盘打开，保活面板调用 `closeCurrentView` 时收起。若父页需要在覆盖层退出后刷新，可匹配 `views.closed` 的实例 ID。重复调用 `closeView` 关闭已销毁的覆盖层不产生新动作。

```js
// 在可见内嵌父页中调用，detail 声明为 overlay。
const { instanceId } = await semi.openView({
    id: 'detail',
    params: { itemId: '42' },
});
await semi.closeView({ instanceId });
```
