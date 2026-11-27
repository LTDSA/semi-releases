# 初始化与事件订阅

| API | 说明 |
| --- | --- |
| `semi.markViewReady` | 等待已注册的处理器并告知宿主可以显示页面、交付调用。 |
| `semi.onEvent` | 订阅宿主或本插件的事件，例如设备列表变化和当前视图显隐。接收 `(name, callback)`，返回取消订阅函数。 |

视图准备好接受用户操作后调用 `markViewReady()`。HTML 后台在注册处理器后也使用这个握手。Node 后台入口返回后由宿主完成握手。

`onEvent(name, callback)` 返回取消订阅函数。参见[事件与错误](../../../events.md)。

## semi.markViewReady()

无参数，返回 `Promise<void>`。在页面完成初始渲染或后台完成初始化后调用。它等待当前已发出的处理器注册请求，再通知宿主交付调用。若登记了未声明的命令或提供者方法，注册失败会使就绪请求失败。不要把需要等待用户操作或长时间联网的步骤放在就绪握手之前。

```js
semi.handleBackgroundCall('ping', () => ({ online: true }));
await semi.markViewReady();
```

## semi.onEvent(name, callback)

| 参数 | 类型 | 用途 |
| --- | --- | --- |
| `name` | `string` | 事件名，区分大小写 |
| `callback` | `(data) => void` | 接收该事件的负载 |
| 返回值 | `() => void` | 取消本次订阅 |

事件订阅用于获取后续变化。页面初始化状态应从 [`getViewState()`](../../ui/window.md) 或 `getAppBaseInfo()` 读取。后台业务事件可使用 [`onBackgroundEvent`](../../plugin/background.md)。

| 事件 | 回调数据 | 使用场景 |
| --- | --- | --- |
| `lifecycle.visibility` | `{ visible: boolean }` | 按当前实例启动或暂停轮询 |
| `availability.changed` | `{ available, reason, code }` | 更新界面可用状态 |
| `device.list.changed` | `{}` | 重新请求设备列表 |
| `host.viewport.changed` | `{ width, height }` | 适配主窗口尺寸 |
| `host.embedded.changed` | `EmbeddedLayout \| null` | 更新内嵌视图的弹层布局 |
| `views.closed` | `{ instanceId }` | 父视图获知覆盖层已关闭 |
| `flow.closed` | `{ flowId }` | 后台清理登录或添加流程资源 |

```js
const off = semi.onEvent('lifecycle.visibility', ({ visible }) => {
    if (visible) startPolling();
    else stopPolling();
});
await semi.markViewReady();
// 组件卸载时调用 off() 和 stopPolling()。
```

上例中的轮询启动与停止由插件实现。完整的事件类型见 SDK 的 `EventMap`。
