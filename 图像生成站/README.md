<!-- BEGIN DURABLE_PROJECT_GOVERNANCE -->
## Durable Project Governance

本项目使用 Durable Project Governance schema `DPG-LANES-1.0.0`。

治理层：

- `PROJECT/`：项目事实；
- `TASKS/`：任务、交付物和 issue；
- `MEMORY/`：长期决策和经验；
- `LANES/`：多会话 Agent Lanes 的 session、message、worklog、resume 和 handoff。

默认 lanes：`planner`、`executor`、`adversarial_reviewer`。`planner` 是默认用户沟通入口。任何 lane、dispatch 或 automation 都不能绕过 `task-accept` 的精确用户验收口令。
<!-- END DURABLE_PROJECT_GOVERNANCE -->

# GDHE 窗帘轨道场景可视化工具

本目录用于规划和治理 GDHE 独立站的窗帘轨道场景可视化功能。

目标产品是一套桌面网页工具：经授权的经销商在浏览器本地选择客户窗户照片，手动标定窗户、窗帘覆盖区域、轨道安装线和一段已知尺寸，再选择经过验证的 GDHE 轨道、电机及静态窗帘示意模板，最后在浏览器本地下载统一带 GDHE 品牌的效果图。

核心边界：

- 不使用图片大模型；
- 不上传或持久化客户照片；
- 不保存项目或云端效果图；
- 不设计额度、计费或经销商项目中心；
- 不提供经销商 Logo 或白标；
- 不做施工测量、BOM、动画、3D 或 AR；
- 嵌入式电动轨道必须显示电机；
- 真实产品尺寸、兼容关系和视觉资产必须经过 GDHE 权威资料确认。

文档入口：

- [完整项目规划](PROJECT/PROJECT_PLAN.md)
- [项目章程](PROJECT/CHARTER.md)
- [项目约束](PROJECT/CONSTRAINTS.md)
- [项目上下文](PROJECT/CONTEXT.md)
- [当前状态](PROJECT/STATE.md)
- [任务看板](TASKS/BOARD.md)

当前阶段仅完成项目初始化与规划，不包含产品功能代码。生产实现预计需要在后续独立任务中接入上级 `frontend/` 和 `cms/`，不得在本任务中直接修改。
