# 命令与 Intent

| API | 说明 |
| --- | --- |
| `semi.invokeIntent` | 发起由插件声明的动作，例如打开某个目标的工具。接收 `(name, params, options?)`，结果由 Intent 契约定义。 |
| `semi.handleIntent` | (name, handler) → Dispose；登记 Intent 处理器 |
| `semi.registerCommand` | (name, handler) → Dispose；登记声明的命令 |
| `semi.executeCommand` | (name, params?) → JSON；执行本包命令 |

命令定向到本插件声明的处理器。Intent 支持跨插件调用已声明的动作。详见[命令与 Intent](../../views.md#命令与-intent)。
