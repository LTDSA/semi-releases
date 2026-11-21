# 窗口与交互

| API | 说明 |
| --- | --- |
| `semi.getViewState` | 读取视图当前是否可见、主窗口可用尺寸、弹层布局及可用性，供视图初始化布局和决定是否启动轮询。返回 `{ visible, hostViewport, embeddedLayout, availability }`。 |
| `semi.setModalLayout` | 在插件打开对话框时扩展当前内嵌视图，关闭后恢复。接收布尔值 `open`，返回布局或 `null`。 |
| `semi.updateSidebarItem` | (id, patch) → void；更新自己的侧栏项 |
| `semi.updateStatusBarItem` | (id, patch) → void；更新自己的状态栏项 |
| `semi.showContextMenu` | () → void；标准编辑菜单 |
| `semi.openExternal` | (url) → void；打开 HTTP(S) 外部链接 |

通过 `getViewState()` 可读取当前视图初始可见性、主窗口可用区域和弹层布局。平台与主题用 `getAppBaseInfo()` 读取。弹层关闭可监听 `views.closed`，内嵌布局变化可监听 `host.embedded.changed`。

`setModalLayout(open)` 用于临时扩展当前内嵌视图，以容纳插件自己渲染的对话框。应用布局后由插件显示内容，关闭动画结束后调用 `setModalLayout(false)` 恢复原区域。
