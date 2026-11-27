# 数据缓存

| API | 起始版本 | 说明 |
| --- | --- | --- |
| `semi.getStorage` | 0.8.0 | 读取跨重启保留的插件设置，例如上次选择的设备。接收 `{ key }`，返回 `{ data }`。 |
| `semi.setStorage` | 0.8.0 | 接收 `{ key, data }`，写入持久 KV。 |
| `semi.removeStorage` | 0.8.0 | 接收 `{ key }`，删除持久 KV 项。 |

这组 API 将小型 JSON 数据持久化到本地，适合设置、上次选中的设备等需跨重启保留的数据。存储按包和运行作用域隔离，每个存储上限 1 MiB。`getStorage` 在键缺失时返回 `{ data: null }`。三项均可使用 Promise 或 `success`、`fail`、`complete`。

```ts
await semi.setStorage({ key: 'compact', data: true });
const { data } = await semi.getStorage<boolean>({ key: 'compact' });
```

可重新生成的数据使用[缓存管理](./cache.md)，用户清理插件缓存时会保留这组 API 保存的设置。

## 调用参数与结果

| 调用 | 参数 | Promise 结果 |
| --- | --- | --- |
| `getStorage(options)` | `{ key: string }` | `{ data: JSON \| null }` |
| `setStorage(options)` | `{ key: string, data: JSON }` | 完成，无返回数据 |
| `removeStorage(options)` | `{ key: string }` | 完成，无返回数据 |

键长为 1–128 字符；值可为字符串、数值、布尔值、数组、JSON 对象或 `null`。保存 `null` 与未保存的键在读取时同样返回 `null`。同一键再次写入会覆盖旧值。跨账号或跨设备的实例应通过各自的作用域读写设置。

传任一回调时返回 `void`。读取成功的回调收到 `{ data, errMsg }`；写入和移除成功时可读 `errMsg`；失败时收到 `{ code, errMsg }`。

```js
semi.getStorage({
    key: 'compact',
    success: ({ data }) => console.log(data ?? false),
    fail: ({ code, errMsg }) => console.warn(code, errMsg),
});
await semi.removeStorage({ key: 'compact' }); // 恢复默认值。
```
