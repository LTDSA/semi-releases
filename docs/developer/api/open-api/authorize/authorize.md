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

## 参数与返回值

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `scope` | `string \| string[]`，必填 | 权限标识，例如 `ui.tray.create`。受保护权限应先写入包的 `semi.permissions` |
| `reason` | `string`，可选 | 说明本次使用目的；也可在 `permissionReasons` 中为权限提供说明 |
| `success`、`fail`、`complete` | 可选回调 | 传任一回调时返回 `void`；失败对象含 `code`、`errMsg` |

单项 Promise 成功时无返回数据，拒绝时抛出 `PERMISSION_DENIED`。批量 Promise 返回 `Record<string, boolean>`。回调模式的批量结果形如 `{ authSetting: { 'ui.tray.create': true }, errMsg }`。调用具体能力前，逐项判断所需权限。

适合从设置开关或按钮触发申请。已明确作出的授权决定会复用，可在宿主设置更改。若要启动需要 `runtime.node` 的后台，应先在前端申请系统访问，再调用后台方法。账号授权使用 [`semi.login`](../login/login.md)。
