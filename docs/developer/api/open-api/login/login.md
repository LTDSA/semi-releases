# semi.login

| API | 起始版本 | 说明 |
| --- | --- | --- |
| `semi.login` | 0.8.0 | (options, callOptions?) → AccountInfo；选择或登录账号 |

使用 `{ domain, selectAccount?, provider? }` 请求用户选择或登录账号。返回账号引用和展示资料。支持 Promise 或 `success`、`fail`、`complete` 回调。详见[账号与登录](../../../accounts.md)。

## 参数

| 字段 | 类型／默认值 | 说明 |
| --- | --- | --- |
| `options.domain` | `string`，必填 | AccountProvider 声明的账号域名，例如 `account.xiaomi.com`，填写域名本身 |
| `options.selectAccount` | `boolean`，默认 `false` | 请求重新选择账号；省略时可复用已确认的绑定 |
| `options.provider` | `string`，可选 | 完整提供者 ID，例如 `@semi-app/xiaomi/account` |
| `options.success`、`fail`、`complete` | 可选回调 | 传任一回调时返回 `void` |
| `callOptions.signal`、`timeout` | `AbortSignal`、毫秒 | 取消信号与超时；默认等待最长 600 秒 |

## 结果和作用域

Promise 返回 `AccountInfo`，包含 `id`（宿主账号引用）、`domain`、`name`、`userId`（公开显示 ID）、`avatar` 和 `pluginCount`。向其他 SDK 方法传账号时使用 `id`。凭据由账号提供者和宿主管理。用户取消时应结束本次操作；回调模式下从 `fail({ code, errMsg })` 取得原因。

global 实例可用 `accountId` 显式使用已授权的账号。已绑定账号的实例保持自己的目标，再次选择后可通过 `openView({ id, target: { accountId } })` 打开新账号的视图。

```js
const controller = new AbortController();
try {
    const account = await semi.login({
        domain: 'account.xiaomi.com',
        selectAccount: true,
    }, { signal: controller.signal });
    console.log(account.name, account.id);
} catch (error) {
    if (error.code !== 'CANCELLED') throw error;
}
// 提前离开页面时可调用 controller.abort()。
```
