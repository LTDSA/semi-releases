# semi.downloadFile

| API | 起始版本 | 说明 |
| --- | --- | --- |
| `semi.downloadFile` | 0.8.0 | 通过 GET 下载文件，返回状态码、路径和写入字节数。 |

| 字段 | 说明 |
| --- | --- |
| `url` | HTTP(S) 下载地址 |
| `header` | 可选请求头 |
| `filePath` | 本插件 `/data` 内的目标路径。省略时写入临时文件 |
| `signal`、`timeout`、`maxBytes`、`redirect` | 取消、超时、大小上限与跳转策略 |
| `success`、`fail`、`complete` | 可选回调。传入任一回调会返回 `DownloadTask`，省略则返回 Promise |
| `onProgress` | 可选字节进度侦听器，适用于 Promise 写法 |

```ts
const task = semi.downloadFile({
    url: 'https://example.org/catalog.zip',
    success: ({ tempFilePath, statusCode }) => console.log(statusCode, tempFilePath),
});
const onProgress = ({ totalBytesWritten }: { totalBytesWritten: number }) => {
    console.log(totalBytesWritten);
};
task.onProgressUpdate(onProgress);
// 如需停止更新，调用 task.offProgressUpdate(onProgress)。
```

`DownloadTask` 支持 `abort()`。进度包含 `progress`、`totalBytesWritten`、`totalBytesExpectedToWrite`，总大小未知时后者为 `0`。临时路径由宿主在调用实例结束时清理。指定文件路径时，仅下载成功才替换旧文件。

## 下载行为与返回值

`timeout` 默认 120,000 毫秒，`maxBytes` 默认 300 MiB，可设置较低的字节限制。`redirect` 默认为 `follow`，传 `manual` 可自行处理 3xx。指定 `filePath` 时，先用后台文件管理器创建所需的上级目录。

| 返回字段 | 含义 |
| --- | --- |
| `statusCode`、`header` | HTTP 状态码和小写键名的响应头。 |
| `filePath` | 下载成功时为指定的目标路径。非 2xx 时为 `null`。 |
| `tempFilePath` | 省略目标路径且成功时由宿主返回。若需长期保留，从后台将文件移到持久路径。 |
| `bytesWritten` | 实际写入的字节数，非 2xx 时为 0。 |

非 2xx 响应走成功回调或解析 Promise，需检查状态码。网络失败、超时、中止或超出大小上限会拒绝 Promise 或进入 `fail`。未完成的文件会被清理，已有的目标文件保持原样。回调模式的 `complete` 会在成功或失败后执行。

```ts
// 后台先准备存放文件的目录。
await semi.getFileSystemManager().mkdir('/data/catalog');
const controller = new AbortController();
const result = await semi.downloadFile({
    url: 'https://example.org/catalog.zip',
    filePath: '/data/catalog/latest.zip',
    signal: controller.signal,
    onProgress: ({ loaded, total }) => {
        console.log(loaded, total === null ? '总大小未知' : total);
    },
});
if (result.statusCode < 200 || result.statusCode >= 300) {
    throw new Error('下载失败，HTTP ' + result.statusCode);
}
console.log(result.filePath, result.bytesWritten);
```
