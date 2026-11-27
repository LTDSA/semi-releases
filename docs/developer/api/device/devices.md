# 设备能力

| API | 用途 | 参数与返回 |
| --- | --- | --- |
| `semi.getDeviceList` | 列出支持指定能力的设备，供插件填充设备选择器。设备离线时仍可列出，并通过 `connected` 标记状态。 | `({ capability, version? }, options?)` → `DeviceSummary[]` |
| `semi.callDevice` | 调用设备适配器声明的能力方法，例如读取某台路由器的统计指标。通过 `options.deviceId` 指定目标。 | `(capability, method, params?, options?)` → 由能力契约定义的 JSON 结果 |

支持多台设备各自保持连接。列表型插件自行选择展示的设备，在调用时传入 `deviceId`。从设备卡片打开的视图可读取已绑定的目标。参见[设备与适配器](../../devices.md)。

## semi.getDeviceList(query, options?)

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `query.capability` | `string` | 能力契约名，例如 `device.metrics` |
| `query.version` | `number`，默认 `1` | 精确匹配的契约版本 |
| `options` | `{ signal?, timeout? }` | 取消信号与超时毫秒数 |

返回 `Promise<DeviceSummary[]>`。每项包含 `id`、`name`、`model`、`image`、`connected`、`sessionRevision`。使用 `id` 作为选择器值，`connected` 用于禁用在线操作。空数组表示当前没有符合该能力的设备。插件须在包声明中包含对应 `deviceCapabilities`。

## semi.callDevice(capability, method, params?, options?)

| 参数 | 类型／默认值 | 说明 |
| --- | --- | --- |
| `capability` | `string` | 调用的能力契约 |
| `method` | `string` | 契约声明的方法 |
| `params` | JSON 对象，默认 `{}` | 按能力契约传入 |
| `options.version` | `number`，默认 `1` | 契约版本 |
| `options.deviceId` | `string` | global 视图传所选设备 ID，已绑定设备的视图可省略且不能改投其他设备 |
| `options.signal`、`options.timeout` | `AbortSignal`、毫秒 | 取消与超时 |

返回由契约定义的 JSON。通常需声明 `device.invoke:<capability>`，契约可为单个方法指定权限。设备离线、权限被拒绝、切换连接期间结果作废时，应让界面重新读取设备状态。

```js
// 在 semi.permissions 声明后，从用户操作中申请读取权限。
await semi.authorize({ scope: 'device.invoke:device.metrics' });
const devices = await semi.getDeviceList({ capability: 'device.metrics' });
// 设备列表用于填充选择器。chosenId 是用户选中的设备 ID。
const selected = devices.find(device => device.id === chosenId);
if (selected?.connected) {
    const metrics = await semi.callDevice('device.metrics', 'read', {}, {
        deviceId: selected.id,
        timeout: 5000,
    });
    console.log(metrics);
}
```

内置指标契约包含 `describe` 与 `read`。见[设备与适配器](../../devices.md)。
