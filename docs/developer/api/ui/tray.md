# 托盘

| API | 说明 |
| --- | --- |
| `semi.createTray` | (id, options) → void；后台登记托盘 |
| `semi.destroyTray` | (id) → void；移除托盘 |
| `semi.updateTrayMenuItem` | (id, patch) → void；更新自己的托盘菜单项 |

托盘创建需要声明 `ui.tray.create`。后台可更新自己的托盘条目。参见[视图与界面](../../views.md)。
