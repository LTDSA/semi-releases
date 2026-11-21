# 缓存管理

| API | 说明 |
| --- | --- |
| `semi.registerCacheDirectories` | ([{ folder, category }]) → void；后台登记数据目录内的缓存文件夹 |
| `semi.getCache` | 读取可重建的缓存数据，例如上次取得的产品资料。接收 `key`，返回 JSON 或 `null`。 |
| `semi.setCache` | (key, value, category?) → void；写入缓存 |
| `semi.removeCache` | (key) → void；移除缓存 |
| `semi.getCacheUsage` | 按分类统计插件缓存占用，供缓存管理界面展示。返回 `{ category, bytes }[]`。 |

缓存按插件管理，并支持按分类统计和清理。后台可以将本插件数据目录中的相对文件夹登记为缓存。
