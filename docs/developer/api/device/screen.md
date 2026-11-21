# 屏幕

| API | 说明 |
| --- | --- |
| `semi.setKeepScreenOn` | 接收 `{ keepScreenOn }`，申请或释放屏幕常亮 |

```ts
await semi.setKeepScreenOn({ keepScreenOn: true });
await semi.setKeepScreenOn({ keepScreenOn: false });
```

供插件后台使用，常亮请求随后台实例结束而释放。支持 Promise 或 `success`、`fail`、`complete` 回调。
