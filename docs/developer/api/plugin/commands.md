# 命令与 Intent

| API | 说明 |
| --- | --- |
| `semi.invokeIntent` | 发起由插件声明的动作，例如打开某个目标的工具。接收 `(name, params, options?)`，结果由 Intent 契约定义。 |
| `semi.handleIntent` | (name, handler) → Dispose；登记 Intent 处理器 |
| `semi.registerCommand` | (name, handler) → Dispose；登记声明的命令 |
| `semi.executeCommand` | (name, params?) → JSON；执行本包命令 |

命令定向到本插件声明的处理器。Intent 支持跨插件调用已声明的动作。详见[命令与 Intent](../../views.md#命令与-intent)。

## 本包命令

在 `package.json` 的 `semi.contributes.commands` 中声明入口，例如：

```json
[{ "id": "refresh", "title": "刷新" }]
```

后台用 `registerCommand(name, handler)` 注册同 ID 的处理器，返回注销函数。页面通过 `executeCommand(name, params?)` 触发，`params` 是 JSON 对象，默认为 `{}`。处理器收到 `{ params, caller, requestId, signal }`，可同步或异步返回 JSON。无返回值时宿主返回 `null`。命令也可以被同包声明的托盘菜单调用。

```ts
// 后台入口，完成其他注册后也要调用 markViewReady()
semi.registerCommand('refresh', ({ params }) => ({ full: params.full === true }));

// 页面
const result = await semi.executeCommand('refresh', { full: true });
```

## 跨包 Intent

提供方在 `semi.intents` 声明下列契约。这里使用后台，也可以将 `handler` 设为本包视图 ID。对视图设置 `reuse: false` 可按次创建实例。

```json
[
    {
        "name": "example.echo",
        "version": 1,
        "handler": "background",
        "params": {
            "type": "object", "additionalProperties": false,
            "properties": { "text": { "type": "string" } },
            "required": ["text"]
        },
        "result": {
            "type": "object", "additionalProperties": false,
            "properties": { "text": { "type": "string" } },
            "required": ["text"]
        }
    }
]
```

TypeScript 项目在提供方与消费方添加同一份类型声明：

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

`handleIntent(name, handler)` 在声明的入口注册，返回注销函数。处理器收到 `{ params, caller, requestId, signal }`。`invokeIntent(name, params, options?)` 等待处理结果，`options` 可指定 `target`（提供方 npm 包名）、`version`（默认 1）、`signal`、`timeout`。宿主校验参数和声明的结果结构。未找到可用实现、授权失败或超时会拒绝 Promise。

```ts
// 提供方后台
semi.handleIntent('example.echo', ({ params }) => ({ text: params.text }));
await semi.markViewReady();
```

```ts
// 消费方在 semi.permissions 中声明 intents.invoke:example.echo
await semi.authorize({ scope: 'intents.invoke:example.echo' });
const { text } = await semi.invokeIntent('example.echo', { text: '你好' }, {
    target: 'example-provider',
    version: 1,
    timeout: 5_000,
});
console.log(text);
```
