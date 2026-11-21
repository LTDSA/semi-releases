# 打开与关闭视图

| API | 说明 |
| --- | --- |
| `semi.openView` | 打开本包声明的窗口、页面或覆盖层，可传入启动参数和显式的设备或账号目标。接收 `{ id, params?, target? }`，返回 `{ instanceId }`。 |
| `semi.closeView` | 接收 `{ instanceId }`，关闭本插件创建的覆盖层。 |
| `semi.closeCurrentView` | 关闭当前运行实例。 |
| `semi.getViewOptions` | 读取打开当前视图时传入的参数与绑定目标，例如设备详情页需要的设备 ID。返回 `{ viewId, params, target }`。 |

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
