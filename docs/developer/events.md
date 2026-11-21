# 事件与错误

## 订阅事件

```ts
const off = semi.onEvent('device.list.changed', () => refreshDevices());
window.addEventListener('pagehide', off, { once: true });
```

`onEvent` 返回取消订阅函数。后台业务事件也可以通过 `onBackgroundEvent` 订阅。

| 事件 | 数据与用途 |
| --- | --- |
| `theme.changed` | `{ theme }`，实际明暗变化，常用入口为 `onThemeChange` |
| `lifecycle.visibility` | `{ visible }`，暂停或恢复页面工作 |
| `availability.changed` | `{ available, reason, code }`，目标可用性 |
| `lifecycle.suspend`／`lifecycle.resume` | 可用性变化后的暂停／恢复 |
| `permissions.changed` | `{ permissions }`，授权决定变化 |
| `device.list.changed` | 设备列表变化，重新查询 |
| `host.viewport.changed` | 主窗口内容尺寸 `{ width, height }` |
| `host.embedded.changed` | 内嵌槽位与扩展状态 |
| `views.closed` | `{ instanceId }`，子覆盖层关闭 |
| `runtime.changed` | 同包实例的描述、可见性及 `closed?`，供后台清理 |
| `flow.closed` | `{ flowId }`，登录／添加流程结束 |
| `tray.click` | `{ id }`，托盘交互 |

## 取消请求

支持 `CallOptions` 的接口接受 `signal` 和 `timeout`：

```ts
import { SemiError } from '@semi-app/plugin-sdk';

const controller = new AbortController();
try {
    await semi.callBackground('refresh', {}, {
        signal: controller.signal,
        timeout: 15000,
    });
} catch (error) {
    if (error instanceof SemiError && error.code === 'CANCELLED') return;
    throw error;
}
```

调用 `controller.abort()` 取消。请求缺省超时 120 秒，最高 600 秒；登录缺省为 600 秒。

超时或取消停止交付结果。已经送达设备的写操作可能仍在执行，调用方应读取实际状态后再决定下一步。

## 常见错误

| code | 处理方式 |
| --- | --- |
| `HOST_UNAVAILABLE` | 在 Semi 插件运行时内调用 SDK |
| `PERMISSION_DENIED` | 检查声明与用户授权 |
| `AUTH_REQUIRED` | 请求账号登录 |
| `TARGET_REQUIRED` | 传入账号或设备目标 |
| `TARGET_UNAVAILABLE` | 目标不可用，等待连接或依赖恢复 |
| `CONTEXT_CHANGED` | 原目标／会话已变化，重新读取状态 |
| `PROVIDER_UNAVAILABLE` | 提供者停用或不可用 |
| `METHOD_NOT_FOUND` | 检查方法名与契约版本 |
| `HOST_INCOMPATIBLE` | 更新宿主至插件要求的版本 |
| `CANCELLED`／`TIMEOUT` | 本次调用已结束，按需重新读取 |
| `ACTIVATION_TIMEOUT` | 检查后台处理器注册和 ready 握手 |
| `QUOTA_EXCEEDED` | 降低并发、数据大小或运行实例数量 |

## 申请权限

基础存储、公开文件／网络读取、登录和本视图操作无需权限弹窗。完整 Node 后台、托盘创建及普通跨插件契约调用需要声明和申请。

```ts
await semi.authorize({ scope: 'ui.tray.create', reason: '用于快捷查看设备。' });
await semi.callBackground('enable-tray');
```

同时申请多项时，返回以权限名为键的布尔对象：

```ts
const granted = await semi.authorize({ scope: ['runtime.node', 'ui.tray.create'] });
if (!granted['runtime.node']) return;
```

插件通过 `semi.login` 请求具体账号授权；账号授权服务不另外申请“调用认证服务”。
