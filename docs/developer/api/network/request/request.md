# semi.request

| API | 说明 |
| --- | --- |
| `semi.request` | 发起公网或局域网 HTTP(S) 请求，返回 `{ data, statusCode, header, cookies }`。 |

## 参数

| 字段 | 说明 |
| --- | --- |
| `url` | HTTP(S) 地址，支持公网和局域网 |
| `method` | HTTP 方法，默认 `GET` |
| `data` | GET / HEAD 的查询参数，其他方法的 JSON、表单或原始请求体 |
| `header` | 可选 HTTP 请求头，例如 `Content-Type`、`Authorization` 或 `User-Agent` |
| `dataType` | 默认 `json`，尝试解析 JSON，失败时保留原文。使用 `text` 可直接读取文本 |
| `responseType` | `text` 或 `arraybuffer`，后者直接返回二进制 |
| `redirect` | `follow` 或 `manual`，默认跟随 |
| `query`、`timeout`、`maxBytes`、`signal` | 附加查询参数、超时、响应大小上限与取消信号 |
| `success`、`fail`、`complete` | 可选回调。传入任一回调会返回 `RequestTask`，省略则返回 Promise |

请求收到 HTTP 响应后由调用方检查 `statusCode`，包括 4xx 和 5xx。网络失败、超时或取消进入 `fail` 或拒绝 Promise。响应头名字为小写，`cookies` 是当前响应的 `Set-Cookie` 字符串数组。

```ts
const task = semi.request({
    url: 'http://192.168.1.1/status',
    data: { format: 'json' },
    success: ({ data, statusCode }) => console.log(statusCode, data),
    fail: ({ code, errMsg }) => console.error(code, errMsg),
});

// 在用户取消时调用。
cancelButton.addEventListener('click', () => task.abort());
```

更多编码、跳转和大小规则见[网络用法](../../../storage-network.md#http-请求)。
