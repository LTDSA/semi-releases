# 宿主基础信息

| API | 说明 |
| --- | --- |
| `semi.canIUse` | (api) → boolean；同步查询宿主支持的接口 |
| `semi.getAppBaseInfo` | 读取 Semi 的版本、当前主题和平台，供界面初始化或判断平台差异。同步返回 `{ version, theme, platform }`。 |

宿主版本与 SDK 版本可分别从 `getAppBaseInfo().version` 和 `semi.version` 读取。平台为 `darwin`、`win32` 或 `linux`。

```ts
if (semi.canIUse('getAppBaseInfo')) {
    const { version, theme, platform } = semi.getAppBaseInfo();
    console.log(version, theme, platform);
}
```

`canIUse` 接收不含 `semi.` 的公开方法路径，例如 `request` 或 `getDeviceList`。返回值描述当前宿主支持的接口。授权状态和设备能力由相应接口判断。
