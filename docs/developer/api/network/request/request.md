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

## 编码、默认值与限制

- `query` 为查询对象，可在任意方法使用。GET 和 HEAD 的 `data` 可传同样的查询对象，也可传已编码的查询字符串。值可用字符串、数字、布尔值、`null`，或这些值的数组。数组编码为同名的多项查询参数。
- 其他方法的 `data` 可用 JSON、字符串或 `ArrayBuffer`。以 `application/x-www-form-urlencoded` 发送表单时，对象会编码为表单字段。以 `responseType: 'arraybuffer'` 读取二进制时，`dataType` 不参与解析。
- `header` 是字符串到字符串的映射。可按需设置 UA 等请求头，`Host`、`Content-Length` 等连接和分帧字段由宿主处理。跨源跳转会清理凭据和大部分自定义请求头。需要自行处理 3xx 时传 `redirect: 'manual'`。
- `timeout` 默认 30,000 毫秒，包含排队时间。可用 `signal` 中止 Promise 写法，用任务的 `abort()` 中止回调写法。响应上限为 8 MiB，`maxBytes` 可设更小的正整数字节数。下载大文件可使用 [downloadFile](../download/downloadFile.md)。
- 公网和局域网请求无需额外授权。宿主校验初始和跳转地址，回环、链路本地及部分云元数据地址不可访问。

## Promise 示例

```ts
const response = await semi.request({
    url: 'https://example.org/catalog.json',
    query: { tag: ['router', 'storage'] },
    header: { Accept: 'application/json' },
    timeout: 5_000,
});
if (response.statusCode !== 200) {
    throw new Error('目录获取失败，HTTP ' + response.statusCode);
}
console.log(response.data);
```

Promise 拒绝时可读取 `SemiError.code`，例如 `TIMEOUT`、`CANCELLED`、`PAYLOAD_TOO_LARGE`。回调模式的 `fail` 收到 `{ code, errMsg }`，`complete` 在成功或失败后都执行。
