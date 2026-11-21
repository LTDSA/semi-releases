# 应用级事件

| API | 说明 |
| --- | --- |
| `semi.onAppShow` | 注册插件进入前台监听。 |
| `semi.offAppShow` | 用同一函数取消插件进入前台监听。 |
| `semi.onAppHide` | 注册插件退出前台监听。 |
| `semi.offAppHide` | 用同一函数取消插件退出前台监听。 |
| `semi.onThemeChange` | 注册主题变化监听。 |
| `semi.offThemeChange` | 用同一函数取消主题变化监听。 |

应用级显隐以整个插件为单位。第一个界面显示时触发 `onAppShow`，最后一个界面隐藏、最小化或关闭时触发 `onAppHide`。同一个插件打开第二个界面时仍处于前台。无界面的后台不计入可见界面。建议在就绪握手前注册监听。

```ts
const show = () => resumeRefresh();
const hide = () => pauseRefresh();
semi.onAppShow(show);
semi.onAppHide(hide);
await semi.markViewReady();

// 结束业务时可以注销。
semi.offAppShow(show);
semi.offAppHide(hide);
```

单个窗口或对话框的可见性使用 `onEvent('lifecycle.visibility', callback)`。主题变化时 `onThemeChange` 的回调收到 `{ theme }`，此时 `getAppBaseInfo().theme` 已更新。
