# 后台与服务

## 网页后台

在 `semi.background` 填写 HTML 入口。网页后台在沙箱中运行，可使用 SDK 的存储、文件与公开网络接口。

```json
{
    "semi": {
        "background": "dist/background.html",
        "activationEvents": ["onReady"]
    }
}
```

页面调用本包后台：

```ts
const result = await semi.callBackground('refresh', { limit: 10 }, {
    signal: controller.signal,
});
```

后台注册处理器：

```ts
semi.handleBackgroundCall('refresh', async (params, { signal, caller }) => {
    return readItems(params, signal);
});
await semi.markViewReady();
```

`readItems` 由插件实现。`caller` 包含调用方的视图、目标及可见性；宿主填入该信息，插件据此管理业务资源。

## 后台事件

```ts
// 后台
await semi.emitBackgroundEvent('updated', { count: 10 });

// 页面
const off = semi.onBackgroundEvent('updated', ({ count }) => renderCount(count));
```

默认向同包、同范围的页面发送。后台可通过第三个参数 `{ to: runtimeId }` 定向发送；`raw: true` 使用原始事件名，由接收端 `onEvent` 订阅。

## Node 后台

需要本机协议、原生依赖或系统操作时，声明完整 Node 后台：

```json
{
    "semi": {
        "permissions": ["runtime.node"],
        "background": {
            "runtime": "node",
            "entry": "dist/background.cjs",
            "permissions": ["runtime.node"]
        }
    }
}
```

前端先申请 `runtime.node`，再调用后台。Node 后台入口导出一个接收 SDK 的函数，可返回清理函数：

```js
module.exports = async semi => {
    const off = semi.handleBackgroundCall('status', () => ({ running: true }));
    return () => off();
};
```

Node 后台通过独立进程执行，完整系统访问权限不代替托盘或其他受保护宿主接口的权限。

## 保活与恢复

`setBackgroundActive(true, { tray: 'main' })` 保持后台工作，并登记声明的托盘内容；`setBackgroundActive(false)` 释放保活。

`activationEvents: ["onResume"]` 仅恢复此前保活的后台，不会因启用插件而自动启动后台或申请权限。`onReady` 在范围与依赖就绪时自动激活。

后台可声明 `scope: "global"` 跨本包视图共享；否则按账号或设备范围分配。

## 公开服务

跨插件共享的接口放入 `serviceProviders`。本包私有方法使用 `handleBackgroundCall`，无需登记为公共服务。

提供者声明契约、版本、范围及参数 Schema；消费者声明 `services` 依赖并调用：

```ts
const value = await semi.callService('example.catalog', 'search', {
    query: 'lamp',
}, { version: 1 });
```

普通跨包调用默认申请 `services.invoke:example.catalog`，同包调用不需要该权限。消费方声明依赖，提供者负责实际业务，宿主校验参数并管理双方生命周期。

[账号授权服务](./accounts.md#使用认证服务)采用具体账号授权。不同提供者即使声明相同域名，也不会共享认证凭据。

## 发现提供者

```ts
const providers = await semi.discoverProviders({
    kind: 'serviceProviders',
    contract: 'example.catalog',
    version: 1,
});
```

返回提供者 ID、包名、名称、契约和 `available` 状态。注册方法为 `registerAccountProvider`、`registerDeviceAdapter` 和 `registerServiceProvider`，均返回注销函数。
