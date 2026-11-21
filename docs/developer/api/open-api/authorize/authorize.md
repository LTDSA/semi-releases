# semi.authorize

| API | 说明 |
| --- | --- |
| `semi.authorize` | 接收 `{ scope, reason? }`，支持单项或批量申请。 |

`scope` 接受权限字符串或数组，`reason` 可选。单项授权获准后完成，拒绝时返回 `PERMISSION_DENIED`。批量申请返回以权限名为键的布尔结果，允许同一次申请中出现部分获准。

```ts
await semi.authorize({ scope: 'ui.tray.create', reason: '用于从托盘查看设备' });

const grants = await semi.authorize({ scope: ['runtime.node', 'ui.tray.create'] });
if (grants['runtime.node'] && grants['ui.tray.create']) {
    await semi.callBackground('start');
}
```

也可以传 `success`、`fail`、`complete`。批量授权使用回调时，逐项结果位于 `authSetting`。账号授权通过 `login` 完成。
