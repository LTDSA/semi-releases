# 插件后台

| API | 起始版本 | 说明 |
| --- | --- | --- |
| `semi.getBackgroundInfo` | 0.8.0 | 在后台初始化时找到本包的资源目录和可写的数据目录，并读取声明和当前绑定的目标。 |
| `semi.callBackground` | 0.8.0 | 从插件页面调用同包后台的业务方法，例如发起设备查询。接收 `(name, params?, options?)`，结果由处理器定义。 |
| `semi.handleBackgroundCall` | 0.8.0 | 为同包页面或后台注册业务方法。接收 `(name, handler)`，返回注销函数。 |
| `semi.emitBackgroundEvent` | 0.8.0 | 将状态变化通知同包运行实例，例如在后台任务完成时刷新页面。接收 `(name, data, { to?, raw? }?)`。 |
| `semi.onBackgroundEvent` | 0.8.0 | 订阅后台发出的业务事件。接收 `(name, callback)`，返回取消订阅函数。 |
| `semi.setBackgroundActive` | 0.8.0 | 在页面关闭后继续运行后台任务。接收 `(active, { tray? }?)`，可登记托盘内容。 |

后台启动时使用 `getBackgroundInfo()` 获取本包目录、数据目录及绑定目标。视图与同包后台通过 `callBackground` 通信。参见[后台与服务](../../background.md)。

## 初始化与运行信息

`await semi.getBackgroundInfo()` 只能在后台调用。返回 `{ packageDirectory, dataDirectory, definition, development, target, plugin }`。其中 `definition` 是宿主解析后的包声明，`plugin` 包含 `id`（npm 包名）、`name`（显示名）、`version`。沙箱后台的目录为虚拟的 `/package` 和 `/data`，Node 后台返回实际路径。`target` 是后台绑定的 `{ deviceId }` 或 `{ accountId }`，全局后台为 `null`。

## 注册和调用业务方法

| 方法 | 参数与结果 |
| --- | --- |
| `handleBackgroundCall(name, handler)` | 后台注册字符串方法名。处理器接收 `(params, { signal, caller })`，可同步或异步返回 JSON 或空值。立即返回注销函数。 |
| `callBackground(name, params?, options?)` | 页面调用同包后台，目标由视图与后台的作用域决定。`params` 是 JSON 对象，默认 `{}`。`options` 可传 `signal` 或毫秒数 `timeout`。Promise 解析为处理结果。 |

后台先完成注册，再调用 `markViewReady()`。方法名由插件定义，无需放到公开服务清单。处理器应将 `signal` 传给可中止的操作。`caller` 可能省略，跨实例调用时可通过它读取调用方的视图 ID 和目标。后台调用自己已注册的方法可直接执行处理器，需要异步返回或超时控制时由处理器自行安排。

```ts
// 后台入口
semi.handleBackgroundCall('catalog.count', async (_params, { signal }) => {
    const { data, statusCode } = await semi.request({
        url: 'https://example.org/catalog.json', signal,
    });
    if (statusCode !== 200 || !Array.isArray(data)) {
        throw new Error('无法读取目录');
    }
    return { count: data.length };
});
await semi.markViewReady();
```

```ts
// 页面入口
const controller = new AbortController();
const { count } = await semi.callBackground<{ count: number }>(
    'catalog.count', {}, { timeout: 5_000, signal: controller.signal },
);
console.log(count);
```

## 通知页面状态变化

`emitBackgroundEvent(name, data, options?)` 仅供后台调用，返回 `Promise<void>`。事件数据是 JSON。默认发送给同包、同作用域的其他实例。传入 `{ to: runtimeId }` 可指定同包接收实例。页面通过 `onBackgroundEvent(name, callback)` 订阅，回调收到 `data`，调用返回的函数即可取消订阅。传 `{ raw: true }` 时事件名原样发送，接收端改用 `onEvent(name, callback)`。

```ts
// 页面订阅，离开页面时调用 unsubscribe()
const unsubscribe = semi.onBackgroundEvent('catalog.updated', ({ count }) => {
    console.log('目录条目数', count);
});

// 后台完成更新后调用
await semi.emitBackgroundEvent('catalog.updated', { count: 12 });
```

## 让后台在窗口关闭后继续运行

`await semi.setBackgroundActive(active, { tray? })` 由后台在开启或停止持续任务时调用。传 `true` 保留后台，传 `false` 释放此状态。默认 `tray: 'none'`。Node 后台可以使用 `tray: 'main'`，由宿主登记已声明的托盘视图。

```ts
await semi.setBackgroundActive(true);
// 用户停止持续任务并完成资源回收后
await semi.setBackgroundActive(false);
```
