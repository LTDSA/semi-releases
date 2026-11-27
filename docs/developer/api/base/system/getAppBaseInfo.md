# 宿主基础信息

| API | 起始版本 | 说明 |
| --- | --- | --- |
| `semi.canIUse` | 0.8.0 | (api) → boolean；同步查询宿主支持的接口 |
| `semi.getAppBaseInfo` | 0.8.0 | 读取 Semi 的版本、当前主题和平台，供界面初始化或判断平台差异。同步返回 `{ version, theme, platform }`。 |

宿主版本与 SDK 版本可分别从 `getAppBaseInfo().version` 和 `semi.version` 读取。平台为 `darwin`、`win32` 或 `linux`。

```ts
if (semi.canIUse('getAppBaseInfo')) {
    const { version, theme, platform } = semi.getAppBaseInfo();
    console.log(version, theme, platform);
}
```

`canIUse` 接收不含 `semi.` 的公开方法路径，例如 `request` 或 `getDeviceList`。返回值描述当前宿主支持的接口。授权状态和设备能力由相应接口判断。

## semi.canIUse(api)

`api` 为宿主公开方法名，例如 `'downloadFile'`。省略 `semi.` 前缀。同步返回布尔值，可在调用可选接口前判断当前宿主是否实现。权限结果、设备是否在线、插件声明是否符合要求仍在实际调用时检查。

## semi.getAppBaseInfo()

无参数，同步返回当前快照，可在页面或后台初始化时调用。

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `version` | `string` | 正在运行的 Semi 宿主版本 |
| `theme` | `'light' \| 'dark'` | 宿主当前生效主题 |
| `platform` | `'darwin' \| 'win32' \| 'linux'` | 平台标识 |

在普通浏览器中直接执行、且未安装测试传输层时，会抛出 `HOST_UNAVAILABLE`。插件包内的 SDK 版本见 `semi.version`。

```js
const { version, theme, platform } = semi.getAppBaseInfo();
console.log('Semi', version, 'SDK', semi.version, theme, platform);
const supportsDownload = semi.canIUse('downloadFile');
```
