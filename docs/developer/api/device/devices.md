# 设备能力

| API | 用途 | 参数与返回 |
| --- | --- | --- |
| `semi.getDeviceList` | 列出支持指定能力的设备，供插件填充设备选择器。设备离线时仍可列出，并通过 `connected` 标记状态。 | `({ capability, version? }, options?)` → `DeviceSummary[]` |
| `semi.callDevice` | 调用设备适配器声明的能力方法，例如读取某台路由器的统计指标。通过 `options.deviceId` 指定目标。 | `(capability, method, params?, options?)` → 由能力契约定义的 JSON 结果 |

支持多台设备各自保持连接。列表型插件自行选择展示的设备，在调用时传入 `deviceId`。从设备卡片打开的视图可读取已绑定的目标。参见[设备与适配器](../../devices.md)。
