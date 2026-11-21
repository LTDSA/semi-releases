# 插件后台

| API | 说明 |
| --- | --- |
| `semi.getBackgroundInfo` | 在后台初始化时找到本包的资源目录和可写的数据目录，并读取声明和当前绑定的目标。 |
| `semi.callBackground` | 从插件页面调用同包后台的业务方法，例如发起设备查询。接收 `(name, params?, options?)`，结果由处理器定义。 |
| `semi.handleBackgroundCall` | 为同包页面或后台注册业务方法。接收 `(name, handler)`，返回注销函数。 |
| `semi.emitBackgroundEvent` | 将状态变化通知同包运行实例，例如在后台任务完成时刷新页面。接收 `(name, data, { to?, raw? }?)`。 |
| `semi.onBackgroundEvent` | 订阅后台发出的业务事件。接收 `(name, callback)`，返回取消订阅函数。 |
| `semi.setBackgroundActive` | 在页面关闭后继续运行后台任务。接收 `(active, { tray? }?)`，可登记托盘内容。 |

后台启动时使用 `getBackgroundInfo()` 获取本包目录、数据目录及绑定目标。视图与同包后台通过 `callBackground` 通信。参见[后台与服务](../../background.md)。
