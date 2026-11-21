# 账号与登录

## 选择账号

```ts
const account = await semi.login({ domain: 'account.xiaomi.com' });
console.log(account.name, account.userId);
```

宿主按域名发现 AccountProvider，展示可选账号。用户可选择已有账号，或由对应提供者完成登录。

| 参数 | 说明 |
| --- | --- |
| `domain` | 完整账号域名，例如 `account.xiaomi.com` |
| `selectAccount?` | `true` 时重新展示账号选择 |
| `provider?` | 精确指定完整提供者 ID |

第二个参数支持 `{ signal, timeout }`。返回 `AccountInfo`：

```ts
{
    id: string;
    domain: string;
    name: string;
    userId: string;
    avatar: string;
    pluginCount: number;
}
```

`id` 是宿主保存的账号引用。登录将所选账号授权给当前插件，返回展示资料，不返回 Cookie、密码或令牌。

## 使用认证服务

账号提供者可同时提供基于账号授权的认证服务。以小米账号为例，消费插件声明服务依赖：

```json
{
    "semi": {
        "services": [{ "contract": "xiaomi.auth", "version": 1 }]
    }
}
```

```ts
const account = await semi.login({ domain: 'account.xiaomi.com' });
const result = await semi.callService('xiaomi.auth', 'request', {
    purpose: 'mijia',
    method: 'POST',
    path: '/v2/home/device_list_page',
    payload: JSON.stringify({ limit: 20, getVirtualModel: true }),
}, { accountId: account.id });
```

这是小米插件提供的契约，路径及用途由该提供者校验。`authorization: "account"` 服务沿用用户选择的具体账号授权，不再申请一项服务调用权限。普通跨插件服务见[后台与服务](./background.md#公开服务)。

## 提供账号体系

在 `package.json.semi` 中声明：

```json
{
    "accountProviders": [{
        "id": "identity",
        "displayName": "示例账号",
        "realm": ["accounts.example.org", "login.example.org"],
        "protocol": "example.identity.v1",
        "icon": "https://accounts.example.org/icon.png",
        "loginView": "login"
    }]
}
```

`loginView` 须指向本包声明的全局 `overlay` 视图；`icon` 使用 HTTPS 图片 URL，未设置时使用通用用户图标。提供者在后台注册 `flow`、`validate`、`getProfile` 等处理器：

```ts
semi.registerAccountProvider('identity', {
    validate: async (result, context) => {
        // 校验本提供者的登录结果，返回 subject、profile 和 credentials。
        return validateLogin(result, context.signal);
    },
    getProfile: async ({ subject }, context) => {
        return readProfile(subject, context.credentials, context.signal);
    },
});
```

`validateLogin` 和 `readProfile` 是插件自己实现的认证逻辑。`getProfile` 返回 `{ name?, avatar?, userId? }`，用于账号页的头像、用户名和 ID。

完整提供者 ID 为 `<npm包名>/<本地id>`。Realm 数组的交集用于发现，同域名的不同提供者不共享凭据。

## 登录流程

登录视图通过 `semi.callFlow(operation, params, options?)` 与本提供者后台交互，成功后调用 `semi.completeFlow(result)`；取消调用 `semi.cancelFlow()`。

`flow.closed` 通知后台清理下载、扫码轮询和临时会话。账号删除或撤销后，消费插件需要重新调用 `login`，旧引用不能继续使用。
