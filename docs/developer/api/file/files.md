# 插件文件

| API | 说明 |
| --- | --- |
| `semi.getFileSystemManager` | () → FileSystemManager；获取本插件的文件管理器 |
| `semi.handleResourceRequest` | (handler) → Dispose；后台提供本包动态资源 |

## FileSystemManager

`getFileSystemManager()` 同步返回文件管理器。下面的方法均返回 Promise，供本插件后台调用。路径统一用虚拟路径，Node 后台通过这个接口读写时也用同样的写法。宿主会校验真实路径，拒绝越界。

| 方法 | 参数、返回值与行为 |
| --- | --- |
| `stat(path)` | 返回 `{ size, directory, modified }`。大小以字节为单位，修改时间是 Unix 毫秒时间戳。目标不存在时拒绝。 |
| `digest(path, options?)` | 流式计算 SHA-256，返回十六进制字符串。文件上限 300 MiB。`options` 支持 `signal` 和毫秒数 `timeout`。 |
| `readChunk(path, offset, length)` | 偏移和长度以字节为单位。最多读取 128 KiB，返回实际读到的字节的 Base64。到达文件末尾返回空字符串。 |
| `writeChunk(path, data, offset?, exclusive?)` | `data` 是 Base64，每次最多写入 128 KiB。偏移默认 0，会截断重写；传 `exclusive: true` 在偏移 0 时要求新建。后续分块用非零偏移写入现有文件。 |
| `mkdir(path)` | 在 `/data` 下创建目录，可创建缺失的父目录。 |
| `mkdtemp(prefix)` | 在已存在的父目录下用指定前缀加随机后缀创建目录，返回虚拟路径。例如 `'/data/import-'`。 |
| `remove(path, options?)` | 传 `{ recursive: true }` 删除目录及内容，`{ force: true }` 可在路径已不存在时继续。 |
| `rename(from, to)` | 移动或重命名 `/data` 下的文件或目录。目标父目录应先创建。 |

```ts
const files = semi.getFileSystemManager();
const directory = await files.mkdtemp('/data/export-');
try {
    const path = directory + '/message.txt';
    await files.writeChunk(path, 'aGVsbG8=', 0, true);
    const { size } = await files.stat(path);
    console.log(await files.readChunk(path, 0, size)); // aGVsbG8=
    console.log(await files.digest(path));
} finally {
    await files.remove(directory, { recursive: true, force: true });
}
```

## handleResourceRequest(handler)

后台注册一个服务本包动态资源的处理器，返回注销函数。插件用同源的 `/.semi/…` 路径访问资源。回调收到 `{ params, signal }`，其中 `params.url` 为资源请求 URL，`params.target` 为相关目标。处理器返回 MIME 类型以及 Base64 正文或虚拟文件路径。大文件使用 `filePath` 由宿主流式返回，最大 64 MiB。嵌入隔离子页时可额外返回 `sandbox: { root, inlineScripts? }`，`root` 必须是当前资源所属的 `/.semi/目录/` 前缀。

```ts
// 本包后台，页面可 fetch('/.semi/greeting.txt')。
semi.handleResourceRequest(({ params }) => {
    if (new URL(params.url).pathname !== '/.semi/greeting.txt') {
        throw new Error('未知资源');
    }
    return { contentType: 'text/plain; charset=utf-8', body: 'aGVsbG8=' };
});
await semi.markViewReady();
```

处理器应显式匹配已支持的路径，再选择要返回的资源。
