# 窗口与交互

| API | 起始版本 | 说明 |
| --- | --- | --- |
| `semi.getViewState` | 0.8.0 | 读取视图当前是否可见、主窗口可用尺寸、弹层布局及可用性，供视图初始化布局和决定是否启动轮询。返回 `{ visible, hostViewport, embeddedLayout, availability }`。 |
| `semi.setModalLayout` | 0.8.0 | 在插件打开对话框时扩展当前内嵌视图，关闭后恢复。接收布尔值 `open`，返回布局或 `null`。 |
| `semi.updateSidebarItem` | 0.8.0 | (id, patch) → void；更新自己的侧栏项 |
| `semi.updateStatusBarItem` | 0.8.0 | (id, patch) → void；更新自己的状态栏项 |
| `semi.showContextMenu` | 0.8.0 | () → void；标准编辑菜单 |
| `semi.openExternal` | 0.8.0 | (url) → void；打开 HTTP(S) 外部链接 |

通过 `getViewState()` 可读取当前视图初始可见性、主窗口可用区域和弹层布局。平台与主题用 `getAppBaseInfo()` 读取。弹层关闭可监听 `views.closed`，内嵌布局变化可监听 `host.embedded.changed`。

`setModalLayout(open)` 用于临时扩展当前内嵌视图，以容纳插件自己渲染的对话框。应用布局后由插件显示内容，关闭动画结束后调用 `setModalLayout(false)` 恢复原区域。

## semi.getViewState()

无参数，仅视图调用，异步返回下列字段。

| 字段 | 含义 |
| --- | --- |
| `visible` | 当前视图是否可见 |
| `hostViewport` | 主窗口尺寸 `{ width, height }` |
| `embeddedLayout` | 内嵌布局 `{ expanded, bounds, viewport }`；无布局时为 `null` |
| `availability` | `{ available, reason, code }`；连接或权限变化时结合 `availability.changed` 更新 |

## semi.setModalLayout(open)

`open` 为布尔值。返回 `Promise<EmbeddedLayout | null>`。当前可见内嵌视图传 `true` 后，宿主扩大渲染区域；对话框仍由插件渲染。结束关闭动画后传 `false`。独立窗口返回 `null`；后台、托盘以及隐藏的内嵌页不能用它打开弹层。

```js
await semi.setModalLayout(true);
setDialogVisible(true); // 插件渲染自己的对话框。

// 绑定对话框的 afterClose。
async function afterClose() {
    await semi.setModalLayout(false);
}
```

## 更新已声明的侧栏、状态栏和托盘菜单

`updateSidebarItem(id, patch)`、`updateStatusBarItem(id, patch)`、`updateTrayMenuItem(id, patch)` 都返回 `Promise<void>`。

| 参数 | 用法 |
| --- | --- |
| `id` | 分别对应本包 `contributes.sidebar`、`statusbar`、`trayMenu` 中的条目 ID |
| `patch.title`、`badge` | 可选字符串，各最多 100 字符；显示方式取决于对应区域 |
| `patch.enabled`、`hidden` | 可选布尔值，控制可用性与可见性 |

每次只覆盖传入的字段，省略的字段保留。声明不存在或不属于本包时拒绝。动态托盘图标由 [`createTray`](./tray.md) 管理。

```js
await semi.updateSidebarItem('overview', { badge: '3' });
await semi.updateStatusBarItem('connection', { title: '已连接' });
await semi.updateTrayMenuItem('quick-open', { enabled: false });
```

## 标准编辑菜单和外部链接

`showContextMenu()` 无参数，显示系统编辑菜单。适合绑定输入框的 `contextmenu` 事件；编辑动作作用于当前焦点。 `openExternal(url)` 接收完整 HTTP(S) URL，交给系统默认浏览器。二者均返回 `Promise<void>`，无需额外权限。

```js
input.addEventListener('contextmenu', event => {
    event.preventDefault();
    void semi.showContextMenu();
});
await semi.openExternal('https://example.org/help');
```
