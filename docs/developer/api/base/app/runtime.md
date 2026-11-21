# 初始化与事件订阅

| API | 说明 |
| --- | --- |
| `semi.markViewReady` | 等待已注册的处理器并告知宿主可以显示页面、交付调用。 |
| `semi.onEvent` | 订阅宿主或本插件的事件，例如设备列表变化和当前视图显隐。接收 `(name, callback)`，返回取消订阅函数。 |

视图准备好接受用户操作后调用 `markViewReady()`。HTML 后台在注册处理器后也使用这个握手。Node 后台入口返回后由宿主完成握手。

`onEvent(name, callback)` 返回取消订阅函数。参见[事件与错误](../../../events.md)。
