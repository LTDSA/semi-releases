# 屏幕

| API | 说明 |
| --- | --- |
| `semi.setKeepScreenOn` | 接收 `{ keepScreenOn }`，申请或释放屏幕常亮 |

```ts
await semi.setKeepScreenOn({ keepScreenOn: true });
await semi.setKeepScreenOn({ keepScreenOn: false });
```

供插件后台使用，常亮请求随后台实例结束而释放。支持 Promise 或 `success`、`fail`、`complete` 回调。

## semi.setKeepScreenOn(options)

仅插件后台调用。在用户启用需要持续显示的功能后申请常亮，任务结束或关闭功能时释放。宿主按后台实例持有，后台停止时自动释放。重复传入相同状态不会重复申请。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `keepScreenOn` | `boolean`，必填 | `true` 申请，`false` 释放 |
| `success`、`fail`、`complete` | 可选回调 | 成功和完成回调可读 `errMsg`，失败回调还提供 `code` |

省略回调时返回 `Promise<void>`，传入回调时返回 `void`。

```js
await semi.setKeepScreenOn({ keepScreenOn: true });
try {
    await runPresentation(); // 插件自己的展示任务。
} finally {
    await semi.setKeepScreenOn({ keepScreenOn: false });
}
```
