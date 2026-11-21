# 设备与适配器

## 查询设备

全局插件声明需要的设备契约：

```json
{
    "semi": {
        "scope": "global",
        "permissions": ["device.invoke:device.metrics"],
        "deviceCapabilities": [{ "name": "device.metrics", "version": 1 }]
    }
}
```

```ts
const devices = await semi.getDeviceList({ capability: 'device.metrics', version: 1 });
```

返回数组中的每项包含 `id`、`name`、`model`、`image`、`connected` 和 `sessionRevision`。未提供对应契约或版本不匹配的设备不会列出；支持契约但未连接的设备仍可返回。

监听 `device.list.changed` 后重新查询列表。

## 调用设备能力

```ts
await semi.authorize({ scope: 'device.invoke:device.metrics', reason: '用于读取设备指标。' });

const result = await semi.callDevice('device.metrics', 'read', {}, {
    version: 1,
    deviceId: devices[0].id,
    signal: controller.signal,
});
```

全局插件通过 `deviceId` 指定单次调用的目标。设备范围实例使用已绑定目标；`getViewOptions()` 返回该视图打开时绑定的设备 ID。

宿主检查声明的契约版本、方法参数和调用权限。连接变化或账号／设备删除后，旧响应失效。

## 提供设备适配器

```json
{
    "semi": {
        "deviceAdapters": [{
            "id": "sensor",
            "displayName": "示例传感器",
            "icon": "https://assets.example.org/sensor.png",
            "addView": "add-device",
            "provides": ["device.metrics@1"]
        }]
    }
}
```

`add-device` 是本包全局 `overlay` 视图。用户添加设备时选择适配器，再进入该视图。适配器 `icon` 使用可访问的 HTTPS 图片地址，缺省时显示通用图标；下方 `describe().image.asset` 则引用本包内部图片。

```ts
semi.registerDeviceAdapter('sensor', {
    describe: ({ record }) => ({
        name: record.name,
        model: record.model,
        image: { asset: 'dist/sensor.png' },
    }),
    menu: ({ connected }) => ({
        actions: connected ? [{ id: 'identify', title: '识别设备' }] : [],
        tools: [],
    }),
    action: async ({ actionId, deviceId }, context) => {
        return identifyDevice(actionId, deviceId, context.signal);
    },
});
```

`identifyDevice` 是插件自行实现的业务。操作可以发送请求、打开视图或执行其他行为，不限定为弹出对话框。

## 自动发现设备

在 `semi.deviceAdapters[].discovery` 加入 HA 风格的 `zeroconf`、`ssdp` 或 `dhcp` 规则。例如 `{ "zeroconf": [{ "type": "_http._tcp.local.", "name": "example-*" }] }`。多条规则满足任一即可，单条规则的字段需要同时匹配。

宿主在局域网搜索，命中后调用适配器的 `discover(info, { signal })`。插件可以读取设备资料，确认支持后返回 `type`、`name`、`model` 和可选的包内 `image`。还可以返回 `identifiers` 供宿主识别已登记设备、`endpoint` 供缺少稳定身份时合并候选，以及 `params` 供添加页面预填信息。无法确认时返回空数组。

`dhcp` 示例为 `[{ "hostname": "miwifi-*" }]`。规则可只写 `hostname`、只写 `macaddress` 或同时写两者。宿主读取系统邻居表，并为需要主机名的候选查询局域网 DNS。只把命中规则的候选交给适配器。系统邻居表为空时，仅为只声明主机名的规则向局域网 DNS 补查小型直连子网，每轮最多查询 254 个地址。该结果只提供主机名和地址。识别参数的 `source` 为 `neighbor`，包含 `address` 和可用的 `macaddress`、`hostname`。

用户选择发现项后，添加页面可以通过 `(await semi.getViewOptions()).params.discovery` 读取该项的 `params`，例如预填的地址和端口。设备认证继续走原有添加流程。

## 连接与状态

| 处理器 | 作用 |
| --- | --- |
| `discover` | 识别命中规则的设备，返回添加候选与展示资料 |
| `flow` | 处理添加视图的流程请求 |
| `validate` | 校验添加结果并返回设备记录与连接凭据 |
| `connect` | 根据保存的记录与凭据恢复连接 |
| `describe` | 提供看板名称、型号和包内图片 |
| `check`／`refresh` | 检查连接或刷新状态 |
| `menu`／`action` | 返回可用菜单及执行卡片操作 |
| `capability` | 执行公开设备契约方法 |
| `disconnect`／`maintain` | 断开或维护本适配器连接 |

处理器接收 `params` 和包含 `signal`、调用方、设备引用及所属凭据的上下文。数据结构和连接版本由宿主校验。

添加流程用 `completeFlow` 提交适配器的校验结果。结果包含设备 `record`、不透明 `credentials` 和当前 `capabilities`；协议实现与凭据解释由适配器负责。

## 卡片工具

`menu()` 返回 `{ actions, tools }`。工具项形如：

```ts
{
    id: 'configure',
    title: '设备设置',
    view: 'configuration',
    icon: 'config',
    color: 'blue',
}
```

`view` 引用本包设备范围的 `overlay` 或 `window`。插件按目标设备支持情况返回工具；不可用的工具不列入菜单。宿主提供通用的目标绑定、视图生命周期及“移除设备”操作。
