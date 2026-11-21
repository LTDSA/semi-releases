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
