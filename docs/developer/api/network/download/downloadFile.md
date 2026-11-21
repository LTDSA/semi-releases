# semi.downloadFile

| API | 说明 |
| --- | --- |
| `semi.downloadFile` | 通过 GET 下载文件，返回状态码、路径和写入字节数。 |

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
const onProgress = ({ totalBytesWritten }) => console.log(totalBytesWritten);
task.onProgressUpdate(onProgress);
// 如需停止更新，调用 task.offProgressUpdate(onProgress)。
```

`DownloadTask` 支持 `abort()`。进度包含 `progress`、`totalBytesWritten`、`totalBytesExpectedToWrite`，总大小未知时后者为 `0`。临时路径由宿主在调用实例结束时清理。指定文件路径时，仅下载成功才替换旧文件。
