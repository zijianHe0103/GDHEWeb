# TASK-004 Adversarial Review Report

verdict: PASS
reviewed_by: adversarial_reviewer
reviewed_at: 2026-07-23T02:29:53Z
review_message: MSG-TASK-004-ADVERSARIAL-REVIEW-R2
round: 2
p0_count: 0
p1_count: 0
p2_count: 0

## Round 1 Verdict

FAIL。SCF 官方供应链、写入前备份门、版本化字段组、英语单语边界、fixture 清理和 Git 范围基本真实，但当前实现未闭环两个验收关键边界：插件停用不撤销持久化角色 capability；公开 REST 投影对关系与媒体 ID 不做发布状态过滤。这两项均需在用户验收前窄修订并重验。本结论不授权 reviewer 修复、恢复数据库、转换任务状态、commit、push、merge、accept 或 close。

## Findings

### P0

- 无。

### P1

1. **停用 `gdhe-site` 不撤销已写入角色的 GDHE capability，停用边界不符合最小权限与非破坏性回滚要求。** `includes/capabilities.php` 的激活函数使用 `add_cap`，但停用函数只刷新 rewrite rules，已存在的 `gdhe_apply_role_capabilities` 从未以 `remove_cap` 调用。Reviewer 实时核对显示 administrator 持有 30 个 GDHE capability，editor 持有 15 个，且与配置精确一致；写入前 SQL 中没有这些 capability。完整 SQL restore 可以把它们恢复掉，但简单停用或中止部署会留下持久化权限，与 review request 明确要求的 activation 和 deactivation rollback 不符。需在停用时精确撤销由本插件添加的 capability，并用可恢复的实测证明停用后归零、重新激活后按配置恢复。
2. **公开 `gdhe` 投影会原样递归返回关系与媒体 ID，没有验证被引用对象是否可匿名公开。** `includes/rest.php` 对六个 allowlist 顶层字段直接调用 `get_field`，递归 sanitizer 对 integer 和数组原样保留，没有 post status、post type、attachment 可公开性或 capability 检查。`field-groups.v1.json` 的五类 relationship 和多个 image 字段都以 ID 返回。因此一个已发布实体可以暴露后来撤回、私有或草稿关联实体的 ID，也可以暴露未确认可公开的 attachment ID。现有 fixture 只验证了顶层 `acf` 和 `meta` 容器移除及主对象 draft denial，没有建立已发布对象指向草稿或私有关联项的负例。这与任务“公开 REST 只返回 publish 内容”直接冲突。需对公开投影的所有引用 ID 执行 publish 与可公开性过滤，或在 TASK-005 完成 DTO 前从匿名投影中 fail closed 移除这些字段；并增加草稿、私有、撤回关联和非公开媒体负例。

### P2

1. **主架构契约仍保留“Polylang 语言 capability”作为安全规则，与 ADR-005 的 WPML 延后决策不一致。** 契约其他部分和 ADR-005 已明确当前不安装 Polylang，未来候选是 WPML Multilingual CMS 与 ACFML，但安全章仍把 Polylang capability 写成执行边界。应改为不预设具体多语言插件 capability，并指向未来 WPML 加 ACFML PoC 的最小权限验收。
2. **`PROJECT/STATE.md` 的未解决问题仍声称 SCF 尚未安装、wordpress_cms 只是收到 execution request。** 同一文件的当前焦点和实时 CMS 已显示 SCF 6.9.2 与 `gdhe-site` 0.1.0 激活、execution 完成并进入审查。这是 planner 所有的可读状态叙事冲突，需在 Round 2 前同步，不得由 reviewer 直接修改。

## Acceptance Mapping

| Acceptance area | Result | Independent evidence |
|---|---|---|
| SCF 官方来源、版本、兼容与许可 | PASS | WordPress.org 官方页面与保存 API metadata 显示 6.9.2、WordPress 6.2 以上、tested 7.0.2、PHP 7.4 以上。ZIP 为 5,841,770 bytes，SHA-256 为 `40f72f...ed799`，安装后官方 plugin checksum 通过；包内 license 为 GPLv2 or later。 |
| 6.9.1 stable tag 不一致 | PASS with disclosed upstream limitation | 官方 API、下载文件名、可执行插件头和官方 changelog 均为 6.9.2；包内 readme 仍为 6.9.1。文档与 ADR 没有隐藏或改写该上游问题。 |
| ACF、ACF Pro 与禁止插件 | PASS | 当前插件列表只有 SCF、GDHE Site、Akismet 和 Hello Dolly；ACF、ACF Pro、WPML、ACFML、Polylang 和 WPGraphQL 均未安装。WordPress.org 也明确 SCF 会为避免冲突停用 ACF 系列插件。 |
| 写入前备份与非破坏性回滚门 | PASS with limitation | SQL 备份为 1,034,101 bytes，SHA-256 `7d41c1...47f7b`；pre 与 post 插件快照可解析且哈希符合 artifacts，写入前 dump 中无 GDHE capability。健康数据库未执行破坏性 restore，该限制已明确披露。 |
| 版本化字段组可重建 | PASS | 数据库中无 acf field group 或 field posts；运行时仅从自有 JSON 注册两个 local groups，主组 6 个顶层字段、settings 组 3 个字段，七种 layout 名称精确匹配。未另建干净 WordPress 站点，但当前证据足以证明不依赖 DB-only field group。 |
| CPT、Taxonomy 与内部 settings | PASS | 实时注册六个公开 CPT、一个非公开 `site_settings`、四个公开 taxonomy。真实 HTTP schema 返回六个公开类型和 locale `en`，`site_settings` Core REST route 返回 404。 |
| capability 最小权限与停用回滚 | FAIL | 实时角色 capability 与配置一致，editor 不具有 settings capability；但停用 hook 不调用 `remove_cap`，不能撤销持久化角色变更。 |
| 匿名与认证 REST 边界 | FAIL | 现有证据证明主对象 draft 401、authenticated 200、published 200、`acf` 与 `meta` 容器移除；但公开 relationship 与 media ID 没有发布状态过滤，也没有负例证据。 |
| fixture、revision 与 autosave 清理 | PASS | Service 列表为空；DB 查询显示 fixture ID 6、其 post parent 与精确标题共零行。Reviewer 为保持只读没有再创建 fixture。 |
| 英语限定与多语言延后 | PASS with P2 documentation issue | Schema 只启用 `en`，无多语言插件、内容、URL 或 hreflang。ADR-005 将 WPML 与 ACFML 门延后到生产英语站连续监控稳定三个月后，但主契约仍有一条 Polylang capability 旧叙述。 |
| 范围、完整性与 Git | PASS | PHP lint、JSON parse、Core checksum、SCF checksum、DB check、governance、registry、messages、strict lane audit 和 `git diff --check` 均通过。SCF vendor 与 local backup 受 ignore 且无 tracked files；无 frontend、Core、theme、credential 或真实业务内容交付变更。HEAD 仍为 TASK-003 提交 `65f5009`，TASK-004 分支无 upstream，无 TASK-004 commit 或 push。 |

## Independent Validation

- 现场版本：WordPress 7.0.2，PHP 8.3.32，MySQL 8.4.10，SCF 6.9.2 active，GDHE Site 0.1.0 active。
- 完整性：WordPress Core checksum PASS，SCF official plugin checksum PASS，12 张数据表 DB check PASS，六个 GDHE PHP 文件 lint PASS，六个 JSON 文件 parse PASS。
- 备份：独立重算 database dump、pre 与 post 插件快照、WordPress version 和 SCF ZIP 哈希，全部与执行报告一致；备份和 SCF runtime 均命中 Git ignore。
- 官方来源：WordPress.org 官方插件页面于 2026-07-23 显示 SCF 6.9.2、release date 2026-07-21、tested 7.0.2、PHP 7.4 以上，并由 WordPress.org 发布。本地保存的官方 API metadata 和 ZIP 可执行头一致。
- 运行时：独立启动临时 PHP server，真实 schema endpoint 返回 HTTP 200、Schema 1.0.0、locale `en`、六个公开类型与七个模块；Service collection 返回 HTTP 200 空列表，site settings route 返回 404。Server 已停止。
- 字段重建：DB 中 acf field group 和 field posts 为零，但两个 local groups、九个顶层字段和七个 module layouts 均在运行时可见。
- 治理：project、registry 和 messages validation PASS，strict lane audit 零 issues，Git diff check PASS。review request 已受控 ack。

## Deferred Boundary Decision

- **Stable module instance ID 和 per-module version 可留到 TASK-005，不构成本轮 finding。** TASK-004 只冻结顶层 Schema、layout 名称和最小编辑基础；完整页面 DTO 和 route resolution 在任务中明确排除。主契约也已要求在前端首次消费前补齐 ID、version 与契约测试。
- **结构化 `data_table` 可留到 TASK-005，不单独构成本轮 finding。** 当前 textarea 只是 CMS 编辑占位形状，尚无前端消费者；契约已明确不得在结构化行列校验和迁移完成前由前端使用自由文本。TASK-005 必须在任何正式消费或业务内容发布前完成该门。

## Limitations

- Reviewer 严格保持 CMS 只读，没有创建草稿或私有负例，也没有停用插件或执行数据库 restore。P1 由可达代码路径、实时角色状态、写入前 dump 和现有 fixture 覆盖缺口交叉证明，不伪造破坏性测试结果。
- 备份的结构检查和书面步骤不等于隔离环境 restore drill；当前任务已如实披露，且不应在健康现场为了证据破坏性运行。

## Required Remediation

planner 应受控转入 NEEDS_REVISION，仅做 Round 1 窄修订：

1. 为 `gdhe-site` 停用边界精确撤销本插件添加的 administrator 和 editor capability，记录停用后归零与重启后恢复的可回复实测。
2. 对匿名投影内的 relationship 与 media references 实施 publish 与可公开性 fail-closed 过滤，并增加草稿、私有、撤回和非公开媒体负例，同时保持认证 edit context 的预期行为。
3. 同步架构契约中的 Polylang capability 旧叙述与项目状态中已过期的“SCF 尚未安装”叙述。

修订后应重跑 PHP、JSON、Core 与 SCF checksum、DB、字段组、capability lifecycle、REST 正反例、fixture cleanup、Git 范围和全部治理检查，再发起 Round 2 独立审查。

## Round 2 Final Verdict

PASS。Round 1 的两项 P1 已真实闭环，两项 P2 叙述冲突也已修正；本轮未发现 P0、P1 或 P2。该结论仅表示 TASK-004 当前交付物通过最终独立审查，不等同于用户验收，也不授权任务状态转换、commit、push、merge、accept 或 close。

### Final Finding Counts

- P0: 0
- P1: 0
- P2: 0

### Round 1 Closure

1. **Capability lifecycle 已闭环。** 停用路径现在调用与激活路径相同的版本化矩阵 applicator，并使用精确撤销方法。当前插件版本为 0.1.1，激活后 administrator 为 28 of 28、editor 为 14 of 14。修订证据记录了 active 28 and 14、inactive 0 and 0、reactivated 28 and 14，最终状态 active；修订前后 capability 快照内容一致，且仅包含配置矩阵。代码、当前角色状态、插件状态和备份证据相互一致，没有发现用户记录修改或额外 capability 变更。
2. **公开引用可见性已闭环。** 匿名和所有 view context 现在只保留 publish 且 post type 可公开查看的 relationship 引用；image attachment 还必须是有效图片、具有公开 URL，并挂在 publish 且可公开查看的父内容下。只有 context edit 且当前用户可编辑父内容时才保留编辑态引用。修订 fixture 覆盖 publish、draft、private、pending or withdrawn relationship，以及公开父内容和私有父内容的 media；匿名真实 HTTP 与内部 dispatch 只保留公开 relationship 和 media，授权 edit 保留完整编辑集合，主对象 draft 继续返回 401。当前数据库对全部 fixture post、revision 和 postmeta 的独立查询为零，Service 数量为零。

### Round 2 Acceptance Mapping

| Acceptance area | Result | Independent Round 2 evidence |
|---|---|---|
| 两项 P1 修订 | PASS | 独立读取 0.1.1 implementation、versioned configs、revision report、controlled response、backup manifests 与 current runtime；代码路径和状态矩阵一致。 |
| 两项 P2 叙述冲突 | PASS | 架构契约已删除当前 Polylang capability 预设，改为未来 WPML plus ACFML PoC 的最小权限门；项目状态不再声称 SCF 未安装或 execution 尚未开始。 |
| SCF 供应链 | PASS | WordPress.org 官方页面于 2026-07-23 仍显示 SCF 6.9.2、WordPress 6.2 以上、tested 7.0.2、PHP 7.4 以上和 2026-07-21 release；本地 6.9.2 active，官方 checksum 通过，固定 ZIP hash 与初始证据一致。包内 stable tag 6.9.1 的上游不一致仍被明确披露。 |
| 备份与回滚 | PASS with disclosed limitation | 初始 dump 与修订前 dump 均存在于 ignored backup 边界；修订 dump hash 独立重算为 d8400025...f821，JSON snapshots 均可解析，DB check 通过。健康现场未运行 destructive restore，文档没有把结构验证冒充 restore drill。 |
| Schema 与可重建性 | PASS | 六份 GDHE JSON 可解析、六份 PHP lint 通过；两个 local field groups 加载，数据库 field group 和 field post 数量为零；六个 public CPT、一个 internal CPT、四个 taxonomy、Schema 1.0.0 和唯一 locale en 与版本化配置一致。 |
| REST、权限与清理 | PASS | schema dispatch 200，site settings route 404；当前 exact capability matrix 28 and 14；revision fixture negative and positive matrix 完整，零 post and postmeta residue，DB check 通过。Reviewer 未创建新 fixture 或改变插件状态。 |
| 英语限定与 deferred scope | PASS | SCF 与 GDHE Site 之外没有 ACF, ACF Pro, WPML, ACFML, Polylang 或 WPGraphQL；Schema enabled locale 仅 en。Full DTO、module instance ID and version、structured data table、route resolution、preview bridge、webhook、多语言、SEO 和前端消费仍明确延后。 |
| Git、秘密与治理 | PASS | Core 与 SCF checksum、PHP、JSON、DB、message、registry、project validation、strict lane audit 和 git diff check 通过；backup 与 SCF runtime ignored 且未跟踪；frontend、Core、theme 和 credential scopes 无 TASK-004 修改。HEAD 仍为 TASK-003 commit，TASK-004 分支没有 upstream、commit 或 push。 |

### Independent Round 2 Validation

- 实时复核 WordPress 7.0.2、PHP 8.3.32、MySQL 8.4.10、SCF 6.9.2 active 与 GDHE Site 0.1.1 active。
- 独立运行 WordPress Core checksum、SCF official checksum、12 table DB check、六个 PHP lint、六个 JSON parse，全部通过。
- 独立读取 exact capability configuration 并核对当前角色：administrator 28 of 28，editor 14 of 14。为保持 reviewer 只读，本轮没有再次停用或激活插件；停用中间态采用修订执行记录、可达代码路径和最终恢复状态交叉验证。
- 独立核对修订备份全部文件、hash、JSON parse、Git ignore 和 tracked scope；修订前后 plugin snapshot 分别显示 GDHE Site 0.1.0 和 0.1.1，SCF 均为 6.9.2 active。
- 独立核对 runtime registration、local field groups、数据库 field group zero state、schema dispatch、internal type denial、fixture residue 与 Service zero state。
- 独立审查引用过滤实现；现有公开 post、draft、internal 和不存在对象的只读 helper probe 按 publish plus viewable 规则 fail closed。完整媒体和 authorized edit 组合由可审查 fixture evidence 支持，本轮未重复写入 fixture。
- 独立重跑 message、registry、project validation、strict lane audit、Git scope、ignored runtime、secret pattern 和 diff whitespace 检查，未发现阻塞问题。

### Final Deferred Boundary Decision

Round 1 的 deferred decision 保持不变。Stable module instance ID and per-module version 与 structured data table 必须在 TASK-005 或任何前端首次消费之前完成，但当前没有 frontend consumer，也没有证据表明 TASK-004 越过该门，因此不构成本轮 finding。

### Round 2 Limitations

- Reviewer 遵守业务交付物与 CMS runtime 只读边界，没有重复执行 plugin deactivation, activation, destructive restore 或 content fixture 写入。中间态证据来自执行 lane 的精确记录，并由代码路径、备份快照、当前恢复状态和 planner 独立复验交叉支持。
- 当前 readable task state 仍由 planner 管理。正式 Round 2 request 是本轮审查授权；PASS response 之后的状态同步和 checked acceptance transition 仍完全属于 planner，不影响本报告的用户验收禁令。
