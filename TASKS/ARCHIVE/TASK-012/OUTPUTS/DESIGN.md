# TASK-012 路线图重排设计

## 1. 决策边界

本任务不重选架构，只替换 TASK-005 之后尚未实施的顺序：

- 保留：Headless WordPress + Next.js、`wp-admin`、SCF、REST-first、结构化 CMS、server-only 消费和现有合同校验。
- 停止扩张：通用 Transport、Validator、wrapper、Fixture harness 和治理抽象。
- 提前：真实 GDHE 产品验证、IA、URL、CTA、技术 SEO、Preview、缓存/Webhook、Staging 和部署类型决策。
- 调后：孤立设计系统、完整首页、其余模板和完整多语言建设。

TASK-007 Schema 3 仅是技术合同基线。真实 GDHE 产品样本尚未提供和确认，产品/变体/Article Number 等业务规则也尚未确认；本设计只建立验证门，不声称这些业务边界已经冻结。

## 2. 权威来源与替代规则

1. `docs/architecture/headless-wordpress-nextjs-contract.md` 第 14 节仍是唯一实施顺序权威。
2. TASK-005 保留为历史基线，不回写归档任务文件。
3. ADR-004/005 的架构决策保持；若多语言触发条件或实施顺序发生实质替代，新增窄 ADR，不篡改历史。
4. `TASKS/BOARD.md` 是当前任务状态视图；Git commit/远端 ancestry 是代码交付事实；`PROJECT/STATE.md` 只记录当前总体状态和唯一下一步。

## 3. 替代矩阵

| 既有顺序 | 新顺序 | 处理 |
|---|---|---|
| 全局壳层含完整设计令牌/Header/Footer | 先真实产品/IA/URL/CTA，再真实产品纵切形成视觉基线，之后全局壳层 | 替代 |
| 首页按小批次先于产品模板 | 产品系统先于正式首页 | 替代 |
| 页面基本完成后再做 SEO | 技术 SEO 从首个正式模板开始 | 替代 |
| Preview/Webhook/cache 接近后期 | 真实产品纵切后立即进入 Preview/cache/Webhook/Staging | 提前 |
| 部署形态以后再决定 | 正式首页前冻结部署类型并建立 Staging | 提前 |
| 英语生产稳定固定三个月后才开始多语言 | 完整多语言按成熟度门；可在单独授权后做最小 PoC | 替代实施触发条件，不授权采购/实施 |

## 4. 后续候选阶段

1. 英语站信息架构、真实目录与转化基线。
2. 视觉基线与真实产品纵向切片。
3. Preview、缓存、Webhook 与 Staging。
4. 全局 Header、受控导航、Mega Menu 与 Footer。
5. 产品分类、系列与详情系统。
6. 正式首页。
7. 其余页面模板。
8. 询盘、CRM/协作系统、分析和隐私。
9. 上线加固。
10. 小型多语言 PoC 与后续完整多语言建设。

候选阶段只有在用户创建并确认后才成为正式 TASK；本任务不预建后续活动任务。

## 5. Schema 数量口径

- `19-file transitive graph`：TASK-007 CMS 权威交付包为其完整 API/页面合同解析的 Schema 文件图。
- `16-Schema closure`：TASK-008 固定、TASK-010 编译、TASK-011 消费的前端本地 `/resolve` Page Schema 3 闭包。
- 两者统计对象不同，不代表丢失三份合同。实施时必须用 manifest 和文件清单重新计算并写入验证证据。

## 6. 多语言边界

- 英语仍是唯一当前公开语言。
- 完整多语言不得在 URL、Schema、Preview、发布流程、关键模板和内容边界未稳定时开始。
- 最小 PoC 只验证一个产品、一个分类、一个下载、一个关系、翻译 slug、hreflang、Preview 和发布链路。
- PoC 需要商业插件、译文或外部服务时必须另行授权；本任务不采购、不安装、不生成公开非英语页面。

## 7. 安全和失败语义调整

- server-only 的安全目标是保护凭据、草稿、管理接口和内部字段，不把 CMS 域名不可发现当作安全保证。
- 当前实时 Transport 不重试的交付保持不变；后续 ISR/Webhook/后台同步可在独立任务中设计有限退避。
- 生产公开页必须规划最后成功缓存；CMS 不可用或新内容合同无效时不得覆盖已知良好页面。

## 8. 完成定义

- 权威路线图、必要 ADR、索引与状态文件一致。
- 明确区分“已交付的技术合同基线”和“尚未完成的真实产品业务验证”，并将真实产品资料列为 human-required 阻断输入。
- 专业 Lane 可实施性检查没有未处理 P1。
- 19/16 统计已机器复算。
- 产品代码和运行环境零差异。
- 独立审查 PASS，P0/P1/P2 为 0。
