# 存储与网络

## 设置与缓存

```ts
await semi.setStorage({ key: 'preferences', data: { compact: true } });
const { data: preferences } = await semi.getStorage<{ compact: boolean }>({ key: 'preferences' });
await semi.removeStorage({ key: 'preferences' });
```

`getStorage` 在键不存在时返回 `{ data: null }`。设置按插件和运行目标隔离，适合 JSON 数据，存储上限 1 MiB。

```ts
await semi.setCache('catalog', { items: [] }, '产品资料');
const cached = await semi.getCache('catalog');
const categories = await semi.getCacheUsage();
```

`cache` 可由用户清除。`usage()` 返回 `{ category, bytes }[]`，`remove(key)` 删除一项。`registerCacheDirectories([{ folder, category }])` 将后台数据目录内的相对文件夹登记到缓存分类。

## 插件文件

后台通过虚拟路径访问文件：

| 路径 | 范围 |
| --- | --- |
| `/package` | 本包发行文件，只读 |
| `/data` | 本插件数据，可读写 |

```ts
const fs = semi.getFileSystemManager();
await fs.mkdir('/data/downloads');
await fs.writeChunk('/data/downloads/note.txt', btoa('hello'));
const bytes = await fs.readChunk('/data/downloads/note.txt', 0, 128);
console.log(atob(bytes));
```

读写内容为 Base64，每次最多 128 KiB；适合二进制文件的分块传输。文本含非 ASCII 字符时先用 `TextEncoder` 编码。

| 接口 | 返回值 |
| --- | --- |
| `stat(path)` | `{ size, directory, modified }` |
| `digest(path, options?)` | SHA-256 十六进制摘要，支持 `signal` 和 `timeout`，最大 300 MiB |
| `readChunk(path, offset, length)` | Base64 字符串 |
| `writeChunk(path, data, offset?, exclusive?)` | 写入完成 |
| `mkdir(path)` | 创建目录 |
| `mkdtemp(prefix)` | 生成临时目录并返回路径 |
| `rename(from, to)` | 移动本数据目录内文件 |
| `remove(path, { recursive?, force? }?)` | 删除文件或目录 |

`writeChunk` 的 `offset` 缺省为 0，从头写入并截断文件；后续分块使用递增偏移。`exclusive: true` 用于首次创建且文件不能已存在的场景。

## HTTP 请求

```ts
const response = await semi.request({
    url: 'http://192.168.1.1:8080/status',
    query: { format: 'json' },
    signal: controller.signal,
});
```

插件页面、沙箱后台和 Node 后台均可访问公网及局域网的 HTTP(S) 服务，包括非默认端口。网络请求属于基础能力。插件可设置 `User-Agent`、`Content-Type`、`Authorization`、`Cookie` 等，宿主生成 `Host`、`Content-Length` 等传输头。账号认证由插件与 AccountProvider 处理，通用请求只使用调用方提供的凭据。

- `method` 默认 `GET`，方法名不区分大小写，可使用常见 HTTP 和 WebDAV 方法。`query` 和 GET／HEAD 的 `data` 追加到 URL，数组生成多个同名参数。其他请求中的对象默认编码为 JSON，指定 `application/x-www-form-urlencoded` 时编码为表单。字符串和 `ArrayBuffer` 可直接用作请求体。
- 返回 `{ statusCode, header, cookies, data }`。响应头名称为小写。默认尝试 JSON 解析，失败时返回原文；`dataType: 'text'` 跳过解析，`responseType: 'arraybuffer'` 返回二进制。
- `redirect` 默认 `follow`，最多跟随 5 次。`manual` 返回 3xx 响应，目标可从 `header.location` 读取。自动跨源跳转会移除凭据和自定义请求头。同一主机从 HTTP 升级到 HTTPS 时可保留请求体。其他需要跨源转发请求体的跳转及 HTTPS 降级由调用方处理。HTTPS 使用系统证书校验。回环、链路本地和云实例元数据地址受限。
- `timeout` 默认 30 秒，`signal` 可取消请求。响应体在解压后最多 8 MiB，`maxBytes` 可指定更小的上限。请求体和请求头受宿主的 256 KiB 消息上限约束。压缩协商默认由宿主完成，可设置 `Accept-Encoding`。

## 下载文件

```ts
const result = await semi.downloadFile({
    url: 'https://example.org/catalog.zip',
    filePath: '/data/catalog.zip',
    onProgress: ({ loaded, total }) => console.log(loaded, total),
    signal: controller.signal,
});
```

下载以 GET 流式写入本插件的 `/data`。目标的父目录需已存在，成功后替换目标文件。返回 `{ statusCode, header, filePath, bytesWritten }`，非 2xx 响应的 `filePath` 为 `null`。失败和取消保留原文件。省略 `filePath` 时，成功结果给出 `tempFilePath`，调用实例结束时清理临时文件。进度的 `total` 在大小未知时为 `null`。下载和请求也支持[回调写法](./api.md#promise-与回调)。默认超时 120 秒，单文件上限 300 MiB，可通过 `timeout` 和 `maxBytes` 调整。请求与下载每个实例同时运行最多 8 个，其余排队，等待时间计入超时。

## 动态资源

后台可处理本包 `/.semi/` 下的资源请求：

```ts
semi.handleResourceRequest(async ({ params, signal }) => {
    const image = await readPluginImage(params.url, params.target, signal);
    return { body: image.base64, contentType: 'image/png' };
});
```

`readPluginImage` 是插件业务代码；处理器接收资源 URL、目标和取消信号。返回 `body` 为 Base64，`contentType` 为 MIME 类型。页面按本包资源地址读取，宿主核验所属插件。

文件资源可返回 `{ filePath, contentType }`，由宿主从本包的 `/data` 或 `/package` 流式读取普通文件，最大 64 MiB。

沙箱子页及其资源可声明 `sandbox: { root: '/.semi/device-page/' }`。宿主允许隔离的子页加载目录内的脚本及资源。子页可设置 `inlineScripts: true` 以执行内联脚本，此时连接和嵌套子页受限。

## 通用系统操作

- `openExternal(url)`：用系统打开 HTTP(S) 链接。
- `showContextMenu()`：显示宿主标准编辑菜单。
- `setKeepScreenOn({ keepScreenOn })`：后台持有或释放屏幕唤醒资源，关闭后台时回收。
