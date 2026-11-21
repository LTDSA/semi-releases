# 数据缓存

| API | 说明 |
| --- | --- |
| `semi.getStorage` | 读取跨重启保留的插件设置，例如上次选择的设备。接收 `{ key }`，返回 `{ data }`。 |
| `semi.setStorage` | 接收 `{ key, data }`，写入持久 KV。 |
| `semi.removeStorage` | 接收 `{ key }`，删除持久 KV 项。 |

这组 API 将小型 JSON 数据持久化到本地，适合设置、上次选中的设备等需跨重启保留的数据。存储按包和运行作用域隔离，每个存储上限 1 MiB。`getStorage` 在键缺失时返回 `{ data: null }`。三项均可使用 Promise 或 `success`、`fail`、`complete`。

```ts
await semi.setStorage({ key: 'compact', data: true });
const { data } = await semi.getStorage<boolean>({ key: 'compact' });
```

可重新生成的数据使用[缓存管理](./cache.md)，用户清理插件缓存时会保留这组 API 保存的设置。
