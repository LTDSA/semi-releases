# 插件文件

| API | 说明 |
| --- | --- |
| `semi.getFileSystemManager` | () → FileSystemManager；获取本插件的文件管理器 |
| `semi.handleResourceRequest` | (handler) → Dispose；后台提供本包动态资源 |

## FileSystemManager

| 方法 | 说明 |
| --- | --- |
| `stat` | (path) → { size, directory, modified } |
| `digest` | (path, options?) → 文件 SHA-256 十六进制摘要 |
| `readChunk` | (path, offset, length) → Base64；每块最多 128 KiB |
| `writeChunk` | (path, base64, offset?, exclusive?) → void |
| `mkdir` | (path) → void；创建目录 |
| `mkdtemp` | (prefix) → string；创建临时目录 |
| `remove` | (path, { recursive?, force? }?) → void |
| `rename` | (from, to) → void；移动数据目录内文件 |

后台通过 `/package` 访问只读发行文件，通过 `/data` 访问可写的插件数据。分块读写使用 Base64，参见[文件操作示例](../../storage-network.md#插件文件)。
