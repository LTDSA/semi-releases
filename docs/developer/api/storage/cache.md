# 缓存管理

| API | 说明 |
| --- | --- |
| `semi.registerCacheDirectories` | ([{ folder, category }]) → void；后台登记数据目录内的缓存文件夹 |
| `semi.getCache` | 读取可重建的缓存数据，例如上次取得的产品资料。接收 `key`，返回 JSON 或 `null`。 |
| `semi.setCache` | (key, value, category?) → void；写入缓存 |
| `semi.removeCache` | (key) → void；移除缓存 |
| `semi.getCacheUsage` | 按分类统计插件缓存占用，供缓存管理界面展示。返回 `{ category, bytes }[]`。 |

缓存按插件管理，并支持按分类统计和清理。后台可以将本插件数据目录中的相对文件夹登记为缓存。

## JSON 缓存

| 调用 | 参数 | Promise 结果 |
| --- | --- | --- |
| `getCache(key)` | 键，1–128 字符 | JSON 值，缺失时为 `null` |
| `setCache(key, value, category?)` | 键、JSON 值、可选分类 | 完成，无返回数据 |
| `removeCache(key)` | 键 | 完成，无返回数据 |
| `getCacheUsage()` | 无 | `{ category: string, bytes: number }[]`，按本包汇总 |

单个 JSON 缓存条目（含分类）最多 1 MiB。分类最多 80 字符，省略时统计到「插件缓存」。JSON 键按运行作用域隔离，缓存可以被用户清理，代码应处理缺失并按需重建。

```js
await semi.setCache('products', { names: ['示例设备'] }, '产品资料');
const cached = await semi.getCache('products');
console.log(cached ?? { names: [] });
await semi.removeCache('products');
console.log(await semi.getCacheUsage());
```

## semi.registerCacheDirectories(resources)

仅后台调用。传入最多 16 个 `{ folder: string, category: string }`，返回 `Promise<void>`。每个 `folder` 是本包数据目录的直接子目录名，只能使用字母、数字、下划线和连字符，最长 80 字符。登记不会创建目录。新登记会替换本包此前的列表，应一次传入全部需登记的目录；用户清理缓存时目录中的文件也会删除。

```js
const fs = semi.getFileSystemManager();
await fs.mkdir('/data/thumbnails');
await semi.registerCacheDirectories([{ folder: 'thumbnails', category: '缩略图' }]);
```
