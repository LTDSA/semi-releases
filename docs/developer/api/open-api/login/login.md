# semi.login

| API | 说明 |
| --- | --- |
| `semi.login` | (options, callOptions?) → AccountInfo；选择或登录账号 |

使用 `{ domain, selectAccount?, provider? }` 请求用户选择或登录账号。返回账号引用和展示资料。支持 Promise 或 `success`、`fail`、`complete` 回调。详见[账号与登录](../../../accounts.md)。
