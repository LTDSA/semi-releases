# 提供者与服务

| API | 说明 |
| --- | --- |
| `semi.callFlow` | 在登录或添加设备的页面里调用本次流程的处理器，例如轮询扫码状态。接收 `(operation, params?, options?)`，结果由处理器定义。 |
| `semi.completeFlow` | 提交登录或添加设备结果。原提供者验证通过后，宿主保存账号或设备并结束流程。 |
| `semi.cancelFlow` | 取消正在进行的登录或设备添加，关闭流程并中止关联请求。 |
| `semi.getProviderState` | 在后台读取本包适配器管理的设备及可访问的账号，用于恢复会话或准备提供者操作。返回 `BackendState`。 |
| `semi.updateDevice` | (params) → void；本包适配器更新设备状态，需 Node 后台 |
| `semi.saveAccount` | (provider, value, { flowId, signal?, timeout? }) → AccountInfo；本包有效流程保存账号，需 Node 后台 |
| `semi.reconnectDevice` | (deviceId, preference?) → void；重连本包适配器设备，需 Node 后台 |
| `semi.discoverProviders` | 按提供者类型、账号域名或服务契约查找可用实现，例如在有多个实现时展示选择列表。返回 `ProviderDescriptor[]`。 |
| `semi.registerAccountProvider` | (id, handlers) → Dispose；注册账号提供者 |
| `semi.registerDeviceAdapter` | (id, handlers) → Dispose；注册设备适配器 |
| `semi.registerServiceProvider` | (id, handlers) → Dispose；注册公开服务 |
| `semi.callService` | 调用插件公开的版本化服务方法，例如用已获授权的账号查询云端目录。参数含契约名、方法、业务参数和可选的 `version`、`provider`、`accountId`，结果由服务契约定义。 |

提供者通过声明与后台注册公开能力，宿主协调账号授权、设备引用和协议版本。

## 注册提供者

三种注册接口都在后台入口调用。第一个参数是包声明中的本地 `id`。第二个参数是处理器对象，键是操作或方法名。调用同步返回注销函数。在处理器注册完毕后调用 `await semi.markViewReady()`。

处理器通常接收 `(params, context)`，可返回 JSON 或它的 Promise。`context.signal` 随调用取消，`caller` 描述调用方。同一个处理器可能处理不同账号或设备，有绑定时用 `accountId` 或 `deviceId` 区分。`credentials` 只在宿主允许该处理器读取原提供者的凭据时传入。

### registerAccountProvider(id, handlers)

对应 `semi.accountProviders`。有 `loginView` 时，登录视图调用 `flow` 推进交互，再将结果交给 `validate`。未声明视图时，宿主直接调用 `login`，同样经 `validate` 后登记。

| 处理器 | 输入与用途 |
| --- | --- |
| `login` | 执行提供者认证，返回 `{ subject, credentials, profile? }`。使用真实、稳定的账号身份作为 `subject`。 |
| `validate` | 接收登录或提交结果，验证后返回可保存的账号对象。认证无效时抛出错误。 |
| `flow` | 接收 `{ flowId, operation, params }`，例如用 `flowId` 区分不同二维码会话。 |
| `getProfile` | 接收 `{ subject }`，返回 `{ name?, userId?, avatar? }` 或 `null`。头像使用 HTTPS URL。 |
| `refresh`、`logout` | 可声明的提供者操作。宿主设置中删除账号时执行本地清理。 |

```ts
// lookupProfile 和 verifyLogin 是提供者自己的实现。
semi.registerAccountProvider('account', {
    validate: (result, { signal }) => verifyLogin(result, signal),
    getProfile: ({ subject }, { credentials, signal }) =>
        lookupProfile(subject, credentials, signal),
    flow: ({ flowId, operation, params }, { signal }) =>
        handleLoginStep(flowId, operation, params, signal),
});
```

### registerDeviceAdapter(id, handlers)

对应 `semi.deviceAdapters`。适配器决定如何验证连接、描述设备、提供能力及呈现设备工具。按所声明的能力实现对应处理器。

| 处理器 | 输入与用途 |
| --- | --- |
| `add`、`flow`、`validate` | 没有声明添加视图时调用 `add`，交互添加页使用 `flow`。提交结果经 `validate` 后返回 `{ record, credentials, capabilities }`。 |
| `connect` | 接收 `{ record, credentials, preference }`，重建会话，返回相同的设备结果结构。记录包含 `type`、`identifiers` 以及可选的 `name`、`model`、`connections`，ID 由宿主分配。 |
| `describe` | 根据 `{ record }` 返回 `{ name, model, image?: { asset } }`，图片路径相对于发行包。断开连接时同样可调用。 |
| `discover` | 收到命中规则的邻居表、mDNS 或 SSDP 信息。返回候选数组，每项至少有 `type`、`name`、`model`，可带 `identifiers`、`endpoint`、`params` 和图片。无法确认时返回 `[]`。 |
| `capability` | 接收 `{ capability, version, method, params, deviceId }`，返回该设备契约的业务结果。 |
| `menu`、`action` | 根据记录、连接状态和能力返回 `{ actions, tools }`。菜单动作由适配器处理，工具可引用同包的设备作用域视图。 |

例如，给离线设备提供看板图片：

```ts
semi.registerDeviceAdapter('adapter', {
    describe: ({ record }) => ({
        name: record.name || '示例设备',
        model: record.model || 'Example Model',
        image: { asset: 'devices/example.png' },
    }),
});
```

发现规则、连接、状态检查、指标契约与完整的适配器示例见[设备指南](../../devices.md)。

### registerServiceProvider(id, handlers)

对应 `semi.serviceProviders`。处理器键名必须对应声明中的 `methods`。下面是 `semi.serviceProviders` 的声明例子：

```json
[
    {
        "id": "catalog",
        "contract": "example.catalog",
        "version": 1,
        "scope": "global",
        "methods": {
            "count": {
                "params": { "type": "object", "properties": {}, "additionalProperties": false },
                "result": {
                    "type": "object",
                    "properties": { "count": { "type": "integer" } },
                    "required": ["count"],
                    "additionalProperties": false
                }
            }
        }
    }
]
```

后台提供与声明一致的实现：

```ts
semi.registerServiceProvider('catalog', {
    count: () => ({ count: 12 }),
});
await semi.markViewReady();
```

## 查找和调用提供者

`discoverProviders(query?, options?)` 返回 `ProviderDescriptor[]`。按需传 `kind`（`accountProviders`、`deviceAdapters` 或 `serviceProviders`）、`realm`（完整域名数组）、`contract`、`version`。描述含提供者完整 ID、所属包、显示名、版本、`available` 和适用的契约信息，适合用于展示或选择提供者。返回值不含凭据。`options` 接受 `signal` 和毫秒数 `timeout`。

`callService(contract, method, params?, options?)` 调用服务的已声明方法。参数和结果遵守该版本契约的 JSON Schema。消费者在包声明中登记服务依赖。普通跨包服务需要声明并获得 `services.invoke:<contract>` 或契约指定的权限。账号授权服务通过 `login` 获得对应账号授权。选择不同账号时显式传入 `accountId`，使用登录结果的内部 `id`。

| 选项 | 说明 |
| --- | --- |
| `version` | 精确匹配的版本，默认 1。 |
| `provider` | 可选完整 ID，如 `@scope/example/catalog`。 |
| `accountId` | 账号服务使用的内部账号 ID。 |
| `signal`、`timeout` | 中止信号和毫秒数超时。 |

```ts
// 消费方已声明 example.catalog@1、services.invoke:example.catalog。
await semi.authorize({ scope: 'services.invoke:example.catalog' });
const providers = await semi.discoverProviders({
    kind: 'serviceProviders', contract: 'example.catalog', version: 1,
});
const provider = providers.find(item => item.available);
if (provider) {
    const summary = await semi.callService<{ count: number }>(
        'example.catalog', 'count', {}, { provider: provider.id, timeout: 5_000 },
    );
    console.log(summary.count);
}
```

## 登录和添加流程

这三个方法供宿主打开的专用流程视图使用。视图可从 `getViewOptions().then(({ params }) => params)` 读取 `flowId` 和 `purpose`。

| 方法 | 参数、结果与调用时机 |
| --- | --- |
| `callFlow(operation, params?, options?)` | `operation` 是提供者约定的操作名，`params` 为业务 JSON 对象，`options` 接受 `signal` 和 `timeout`。Promise 返回 `flow` 处理器的业务结果。 |
| `completeFlow(result)` | 将 JSON 交给原提供者的 `validate`，成功后登记账号或设备并关闭视图。宿主将账号信息或含 `deviceId`、`ready` 和会话版本的设备连接结果交给发起方。调用 SDK 的页面应在提交前更新状态，成功后的界面刷新交给发起方。 |
| `cancelFlow()` | 取消并关闭当前流程，结束关联调用，返回 `Promise<null>`。发起方收到取消错误。 |

```ts
// 在用户提交添加表单后，'connect' 由这个适配器的 flow 实现。
const draft = await semi.callFlow('connect', { address }, { timeout: 15_000 });
await semi.completeFlow(draft);

// 在取消按钮的独立处理器中调用 await semi.cancelFlow()。
```

已结束的流程可能返回 `FLOW_CLOSED`，重复提交可能返回 `FLOW_BUSY`。验证失败时可以提示错误后重试。

## 在后台读写提供者状态

| 方法 | 参数与结果 |
| --- | --- |
| `getProviderState()` | 返回 `{ devices, accounts, defaultAccountId }`。设备项含 `record`、`context`、`expired` 和凭据字段。只有获系统访问授权的 Node 后台能读取自身设备及自身账号提供者的私有凭据。获授权使用的外部账号只返回身份与提供者元数据。 |
| `updateDevice(params)` | Node 后台更新自己适配器的设备，接收 `deviceId`、`sessionRevision`、`revision` 和需要修改的 `name`、`credentials`、`capabilities` 或 `connected: false`。凭据更新要求活动会话。返回 `Promise<void>`。收到 `CONTEXT_CHANGED` 时应重新读取状态。 |
| `saveAccount(provider, value, { flowId, signal?, timeout? })` | Node 后台在本包活动流程内登记本包账号。`provider` 为完整 ID，`value` 交由提供者校验，通常包含 `subject`、`credentials` 和可选 `profile`。返回 `AccountInfo`，流程由原调用继续推进。 |
| `reconnectDevice(deviceId, preference?)` | Node 后台要求宿主重新连接本包适配器管理的设备，返回 `Promise<void>`。`preference` 是约定给适配器的连接偏好，例如 `'local'`。 |

```ts
// 本包适配器的 Node 后台
const { devices } = await semi.getProviderState();
const device = devices.find(item => item.record.id === deviceId);
if (device && typeof device.context.sessionRevision === 'number'
    && typeof device.context.revision === 'number') {
    await semi.updateDevice({
        deviceId, name: '客厅设备',
        sessionRevision: device.context.sessionRevision,
        revision: device.context.revision,
    });
}
```
