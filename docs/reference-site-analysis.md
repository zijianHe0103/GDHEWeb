# RapidDirect 参考网站分析与第一阶段前端规划

> 研究日期：2026-07-22（Asia/Shanghai）  
> 参考站：[https://www.rapiddirect.com/](https://www.rapiddirect.com/)  
> 当前状态：仅完成公开网站研究、技术判断和前端规划；未初始化项目，未开发页面、后台、数据库或部署配置。  
> 当前目录检查结果：工作区尚无正式项目文件，可视为待初始化目录。

## 0. 结论摘要与证据口径

RapidDirect 是一个以“制造能力目录 + 行业解决方案 + 技术内容库 + 在线报价入口”为核心的 B2B 获客网站。官网负责让客户发现服务、建立信任、理解参数并选择询盘路径；独立报价平台负责上传 CAD、配置和后续订单流程。

本项目建议复用它的**信息架构、页面模板思路、视觉节奏、交互模式和转化路径**，但不复制其商标、源代码、受版权保护的图片/视频、原文文案或未获授权字体。正式网站全部换成我方品牌、内容与媒体资产。

证据标记：

- **确认**：可从当前公开 HTML、CSS、JavaScript、响应头或公开文件直接确认。
- **实测**：在 1440、1024、768、390 px 视口中观察或测量到的当前行为。
- **推测**：公开信息不足，只能依据资源和常见实现判断。
- 所有数值都是 2026-07-22 的页面快照，参考站改版后可能变化；开发时仍需逐页截图复核。

核心结论：

1. 主站确认使用 WordPress + Elementor/Elementor Pro + 自定义主题；并非纯前端 SPA。
2. `/ems/` 是一个技术栈不同的独立子站，确认使用 Astro + React Islands。
3. 根据 2026-07-22 的技术选型确认，我方改用 **WordPress + Elementor + Elementor Pro**，并以取得合法授权的 `mml-theme` 主题包为首选。
4. `mml-theme` 不是 WordPress.org 可直接安装的公共主题；公开主题头明确写有商业许可和联系 MML 的要求。未取得授权包前不能复制或部署参考站主题代码。
5. 第一步应先完成主题授权/兼容性验证，再配置 Elementor 全局设计系统、Header、Mega Menu、移动导航、Footer、公共组件和多语言骨架，然后按每次 1～3 个模块开发首页。
6. 第一阶段不开发自定义业务后台；但 WordPress/Elementor 自带的管理后台是页面搭建所必需的基础设施，不能与“完全没有后台”同时成立。

---

## 1. 本次研究页面清单

| 类型 | 页面 | URL | 研究重点 |
|---|---|---|---|
| 首页 | Home | [rapiddirect.com](https://www.rapiddirect.com/) | 全站入口、模块顺序、视觉系统、转化路径 |
| 服务总页 | Manufacturing Services | [/services/](https://www.rapiddirect.com/services/) | 服务目录、增值服务、RFQ 表单 |
| 能力证明页 | Our Capabilities | [/our-capabilities/](https://www.rapiddirect.com/our-capabilities/) | 公差、产能、质量与支持能力 |
| 服务详情 | CNC Machining | [/services/cnc-machining/](https://www.rapiddirect.com/services/cnc-machining/) | 长页模板、技术参数、材料、案例、FAQ |
| 行业解决方案 | Aerospace | [/industry/aerospace/](https://www.rapiddirect.com/industry/aerospace/) | 行业痛点、开发阶段、工艺组合 |
| 材料库 | Materials | [/materials/](https://www.rapiddirect.com/materials/) | 分类数据库、材料 SEO 详情入口 |
| 表面处理库 | Surface Finishes | [/surface-finishes/](https://www.rapiddirect.com/surface-finishes/) | 处理方式对照、详情入口 |
| 公司介绍 | About RapidDirect | [/about-rapiddirect/](https://www.rapiddirect.com/about-rapiddirect/) | 品牌、工厂、团队、信任证明 |
| 博客列表 | Blog | [/blog/](https://www.rapiddirect.com/blog/) | 推荐内容、分类、卡片、分页、订阅 |
| 博客详情 | AI Product Design Tools | [/blog/best-ai-product-design-tools/](https://www.rapiddirect.com/blog/best-ai-product-design-tools/) | 文章层级、Schema、内容内转化 |
| 博客详情补充 | What Is CNC Machining? | [/blog/what-is-cnc-machining/](https://www.rapiddirect.com/blog/what-is-cnc-machining/) | TOC、技术长文、FAQ、作者与 CTA |
| 联系页 | Contact Us | [/contact/](https://www.rapiddirect.com/contact/) | 按意图分流的表单和文件上传 |
| 技术子站 | EMS | [/ems/](https://www.rapiddirect.com/ems/) | 独立 Astro/React 技术证据 |
| SEO 公共文件 | Robots / Sitemap / LLM | [robots.txt](https://www.rapiddirect.com/robots.txt)、[sitemap](https://www.rapiddirect.com/sitemap_index.xml)、[llms.txt](https://www.rapiddirect.com/llms.txt) | 抓取、URL 清单和 SEO 技术结构 |

---

## 2. RapidDirect 网站总体结构

### 2.1 内容层级

```text
首页 /
├── Capabilities（制造能力 Mega Menu）
│   ├── Services 总页 /services/
│   ├── Our Capabilities /our-capabilities/
│   ├── CNC、注塑、钣金、3D 打印等服务详情
│   └── EMS、PCB 等电子制造能力
├── Solutions
│   ├── NPI Solutions 及设计、验证、量产、包装阶段
│   ├── Rapid Prototyping / On-demand Manufacturing
│   └── Surface Finishing / Assembly / Parts Marking
├── Industries
│   └── Aerospace、Medical、Automotive、Robotics 等行业模板页
├── Our Platform
│   ├── Online Platform
│   ├── Teamspace
│   └── AI Creator Lab
├── Resources
│   ├── Blog / News / eBooks / Case Studies / Help Center
│   ├── Materials 总库与材料详情
│   └── Surface Finishes 总库与处理详情
├── About
│   ├── About / Quality Assurance / Testimonials
│   └── Contact / Sponsorship / Careers
└── 外部转化系统
    ├── app.rapiddirect.com（上传 CAD、配置、报价、订单）
    └── aimfg.rapiddirect.com（无 CAD 的 AI Creator 路径）
```

### 2.2 主要页面类型

| 页面类型 | 内容职责 | 可复用模板 |
|---|---|---|
| 首页 | 总价值主张、服务入口、信任、平台、NPI、资源、询盘 | 独立首页模板 |
| 服务总页 | 汇总工艺并导向详情或 RFQ | 服务目录模板 |
| 能力证明页 | 公差、尺寸、产量、质控、项目支持 | 能力数据模板 |
| 服务详情 | 工艺教育、材料、处理、规格、案例、FAQ、询盘 | `ServiceDetail` |
| 行业页 | 行业需求、研发阶段、合适工艺、应用零件 | `IndustryDetail` |
| 材料/表面处理总页 | 可筛选/分组的技术资料库 | `LibraryIndex` |
| 材料/处理详情 | 性能、工艺适配、规格、应用、FAQ | `LibraryDetail` |
| 案例 | 问题、方案、过程、结果、关联服务 | `CaseStudyDetail` |
| 博客列表/分类 | SEO 内容发现、分类和分页 | `PostIndex` |
| 博客详情 | 长文、目录、作者、FAQ、内链、询盘 | `PostDetail` |
| 品牌页 | 故事、工厂、团队、认证、评价 | `About` |
| 联系/RFQ | 按客户意图分流，采集需求与文件 | `Contact/RFQ` |

值得注意：`/services/` 是偏转化的“服务目录”，`/our-capabilities/` 是偏参数与证据的“能力证明”。参考站没有让 `Capabilities` 一级文字直接链接这两个 Hub；我方应在导航中提供清晰的“查看全部能力”链接，避免 Hub 成为弱入口。

---

## 3. 顶部导航、Mega Menu 与 Footer

### 3.1 Header

桌面端从左到右：

1. Logo，返回首页。
2. 六个一级菜单触发器：Capabilities、Solutions、Industries、Our Platform、Resources、About。
3. 搜索。
4. 账户/登录，进入外部在线平台。
5. 高强调主 CTA：`Get Instant Quote`。

Header 上方还有轻量工具/活动区域，用于促销信息、Help Center 和语言入口。主 Header 固定吸顶；滚动后进入较紧凑状态并出现阴影。

### 3.2 Mega Menu 信息架构

#### Capabilities

- Mechanical Manufacturing
  - Machining：CNC Machining、Milling、Turning、Routing、5 Axis、Precision CNC
  - Molding：Injection Molding、Mold Tooling、Overmolding、Insert Molding、Low Volume
  - Fabrication：Sheet Metal、Laser Cutting、Metal Bending、Waterjet、Tube Laser、Enclosure、Welding
  - 3D Printing：Prototyping、SLA、SLS、SLM、FDM、MJF
- Value-Added：Die Casting、Vacuum Casting、Wire EDM、Aluminum Extrusion
- Electronics Manufacturing：EMS、PCB Design、Assembly、Manufacturing、Components Sourcing

#### Solutions

- NPI：Design & Engineering、Verification、Mass Production、Packaging、Service Package
- Manufacturing：Rapid Prototyping、On Demand、Surface Finishing、Assembly、Industrial Automation
- Value-Added：Surface Finishing、Assembly、Parts Marking

#### Industries

Aerospace、Medical Devices、Automotive、Robotics、Electronics、Communication、Semiconductor、New Energy、Consumer Goods。

#### Our Platform

- Online Platform
- Teamspace：Create Team、Collaboration、Tiers、Rewards
- AI Creator Lab：Communicate Requirements、Get Renders、Build 3D Models、Start Production

#### Resources

- Knowledge：Blog、News、eBooks & Guides、Case Studies、Help Center
- Materials Library：常用金属与塑料，并提供“40+ 材料”总入口
- Surface Finishes：常用处理方式，并提供总入口

#### About

- Company：About、Quality Assurance、Testimonials
- Connect：Contact、Sponsorship、Careers

### 3.3 Mega Menu 交互

- **确认/实测**：桌面端由点击一级标题展开，不是单纯 hover。
- 同一时间只展开一个 Mega Menu；点击外部关闭。
- 展开采用约 300 ms 的透明度和轻微 `translateY` 过渡。
- 面板为深色背景，最大宽度约 1200 px；左侧是约 280 px 的说明/图片栏，右侧多列链接。
- 普通链接 hover 变品牌橙并轻微右移；卡片型入口轻微上移并增加阴影。
- 搜索按钮打开独立搜索层，并提供 CNC、Injection Molding、Sheet Metal、3D Printing、Materials、Surface Finishes、NPI 等 Quick Links。

### 3.4 移动导航

- **确认/实测断点**：1024 px 及以下隐藏桌面菜单和 Header 报价按钮，显示汉堡按钮。
- 菜单在 Header 下方展开为全宽、可滚动的白色面板。
- 一级菜单仍由点击展开，子菜单改为文档流中的 Accordion；左侧说明图隐藏。
- 关闭主菜单时重置已展开子菜单，避免下次打开保留错误状态。
- 390 px 实测中，Capabilities 子面板约 358 px 宽，链接以紧凑多列方式展示；我方实现应额外验证长文案语言下的溢出和可点击面积。

### 3.5 Footer

Footer 为浅色长区块，桌面端主要包括：

- 品牌、公司名称、电话、Email、地址与即时通讯说明。
- Capabilities 链接列。
- Resources 链接列。
- About 链接列。
- Facebook、X、YouTube、LinkedIn。
- Newsletter 邮箱订阅。
- Privacy、Cookie、Terms、Consent Preferences 与版权。
- 移动端使用重排/精简后的独立布局。

公开页面源码还统一包含 `Book a meeting` 预约弹窗，字段包括姓名、Email、公司、日期时间、国家/地区、时区、留言和文件上传。

---

## 4. 代表页面逐页结构

### 4.1 首页

1. Header、Mega Menu、搜索层。
2. Hero：Eyebrow、H1、价值主张、品牌/信任标识、主报价 CTA、无 CAD 的 AI Creator 次 CTA。
3. 五项信任数字条：年限、零件量、制造中心、准时交付、认证。
4. Manufacturing Services：8 个工艺卡片。
5. The Tools to Manufacture Smarter：Instant Quoting 与 AI Creator 双路径。
6. 客户评价/Trustpilot 轮播。
7. 中国制造网络与全球交付：规模数字、工厂和设备图片。
8. 无独立标题的工厂/设备媒体轮播。
9. Digital Platform：功能 Accordion 与联动平台截图。
10. How to Work With Us：Upload CAD → Configure/Get Quote → Parts Delivered。
11. NPI 全流程 Tabs：项目与设计、原型与小批量、量产、包装。
12. Quality / Reliability：检测设备、文档、认证和质量能力。
13. Manufacturing Resources：三张内容卡片轮播。
14. FAQ Accordion。
15. Footer。

源码中存在客户故事和桌面/移动替代结构，其中部分容器在本轮桌面实测为隐藏状态。正式开发以“当前可见截图”为验收依据，不因 DOM 中存在隐藏模板就机械复制。

### 4.2 Services 总页

1. 浅桃色 Hero：H1、简介、`Explore All Capabilities` 锚点、`Get Instant Quote`。
2. Manufacturing Services：CNC、Injection Molding、Sheet Metal、3D Printing、Extrusion、Die Casting、Vacuum Casting、Wire EDM。
3. Value-Added：NPI、Industrial Automation、Materials、Surface Finishes。
4. `Start Custom Parts Manufacturing` 转化段。
5. RFQ 表单：姓名、Email、电话、公司、需求、拖拽文件上传。
6. Footer。

### 4.3 Our Capabilities

1. Hero 与能力数字。
2. 页内分区导航。
3. Robust Support。
4. 六类工艺标准/公差/尺寸/产能数据。
5. Rapid Prototype、Low Volume、High Volume 三种规模。
6. Quality Control。
7. Technical、Project、After-sales Support。
8. 全宽项目 CTA 与 Footer。

### 4.4 CNC 服务详情

1. 视频/图片 Hero、H1、Quote CTA。
2. 客户 Logo 与信任证明。
3. CNC 概述，Milling/Turning 子能力。
4. Prototype-to-Production 与 NPI 引流。
5. 工厂网络、机器/公差/交期数字和媒体画廊。
6. Materials：金属/塑料 Tabs 与材料卡。
7. Surface Finishes 卡片。
8. Customer Success Story。
9. Industries 应用。
10. Tolerances / Specifications 数据表。
11. Guaranteed Quality：认证、质量工程师、检测与追溯。
12. Design Guidelines 与指南下载。
13. Why Choose Us。
14. 原型与量产解决方案。
15. FAQ。
16. 相关文章。
17. 最终 Quote CTA 与 Footer。

可归纳为：`服务承诺 → 子能力 → 工厂证据 → 材料/处理 → 案例 → 参数 → 质量 → FAQ → 内容内链 → 询盘`。

### 4.5 Aerospace 行业页

1. 行业 Hero + `Upload your part`。
2. Why Choose Us：质量、交期、工程支持。
3. 产品开发五阶段：原型、工程验证、设计验证、生产验证、量产。
4. 8 个适用制造服务。
5. Materials 与 Surface Finishes 双入口。
6. Aerospace Applications 应用零件与图片。
7. 其他专业行业交叉推荐。
8. Quote CTA 与 Footer。

其组织逻辑不是重复工艺百科，而是“行业需求 → 产品阶段 → 合适工艺 → 材料/处理 → 典型应用 → 询盘”。

### 4.6 Materials

1. 浅桃 Hero、H1、`Order Your Parts`、三图视觉。
2. 分类锚点：CNC Metals、CNC Plastics、Injection Molding、Sheet Metals、3D Printing Plastics/Metals。
3. 分组材料目录/表格：名称、简介或特性、价格级别、详情链接。
4. 每个材料详情 URL 与适用工艺绑定。
5. 最终 `Start Free Quote` 与 Footer。

### 4.7 Surface Finishes

1. 浅桃 Hero、H1、`Order Your Parts`、三图视觉。
2. 表面处理对照库：Finish、Description、Applicable Services、Applicable Materials。
3. 每种处理进入独立详情页。
4. `Perfect Your Project's Finish` 转化带。
5. Recent Posts、FAQ、最终报价 CTA、Footer。

### 4.8 About Us

1. 视频 Hero。
2. Our Story 与 CTA。
3. 发展时间线。
4. Mission / Vision。
5. Core Values。
6. CEO/品牌陈述。
7. 客户评价。
8. Manufacturing Network、规模数字、工厂图片。
9. Digital Quoting Platform。
10. 团队、Work & Life 图片墙。
11. Blog、eBooks、Help Center 资源入口。
12. 最终 Quote CTA 与 Footer。

### 4.9 Blog 列表

1. Breadcrumb、H1、简介。
2. Featured Articles：一篇主推荐和多篇次推荐。
3. All Articles。
4. 工艺/主题分类筛选。
5. 桌面三列卡片：图片、分类、标题、摘要、日期、Read More。
6. 数字分页；本轮快照至少 48 页。
7. Newsletter 转化区与 Footer。

### 4.10 Blog 详情

1. Breadcrumb、H1。
2. 作者、日期、更新时间、阅读时长。
3. Cover 图片。
4. Share、Table of Contents、下载/辅助工具。
5. H2/H3 长文正文、图片、列表、技术表格和内部链接。
6. 正文中段服务/RFQ CTA。
7. Conclusion、FAQ、Author Bio。
8. `Ready to Manufacture?` 证据数字与 Quote CTA。
9. Recent Posts、最终 CTA、Footer。

博客不是纯阅读终点，而是通过服务内链、正文中段 CTA 和文末 CTA 三次引导报价。

### 4.11 Contact

1. Hero 与联系说明。
2. `What Can We Help You?` 意图选择：RFQ、通用咨询、售后、投诉、法务、营销合作。
3. 根据意图切换专用表单；RFQ 支持 CAD、图片、PDF、ZIP/RAR 等多文件上传。
4. Office 地址和按部门划分的 Email。
5. Why Choose Us：质量、速度、工程能力和评价。
6. 最终 Quote CTA 与 Footer。

---

## 5. 首页模块详细拆解

| 顺序 | 模块与用途 | 桌面布局 | 关键 CTA/交互 | 移动端变化 |
|---|---|---|---|---|
| 1 | Hero：立即说明制造范围和核心收益 | 左文右图/背景媒体，H1 与双 CTA，信任 Logo | Instant Quote、AI Creator | 变为全宽背景图；标题仍很大，CTA 纵向或满宽 |
| 2 | 信任数字：降低首次询盘风险 | 5 卡横排并与 Hero 轻微重叠 | 无或弱链接 | 390 px 呈 2+3 重排；中间宽度较拥挤 |
| 3 | 服务卡：把需求导入具体工艺 | 8 卡、桌面 4 列两行 | 卡片整块进入服务详情 | 参考站 768 仍较紧；390 为 2 列 |
| 4 | 双工具路径：区分有 CAD/无 CAD | 两个大面积图文入口 | Quoting / AI Creator | 垂直堆叠 |
| 5 | 客户评价：第三方信任 | 引语、评分、客户信息轮播 | 轮播控制 | 单卡轮播 |
| 6 | 制造网络：证明交付规模 | 左右图文、规模数字 | 了解工厂/能力 | 图文堆叠 |
| 7 | 工厂媒体：提供实景证据 | 宽图轮播 | 箭头/滑动 | 单图滑动 |
| 8 | Digital Platform：说明报价后流程 | 左侧功能 Accordion，右侧联动截图 | 平台入口 | Accordion 在上、截图在下 |
| 9 | How It Works：降低操作门槛 | 3 步横排 | Upload CAD | 3 步纵向 |
| 10 | NPI 生命周期：承接复杂项目 | Tabs + 对应说明/媒体/表单入口 | Start NPI Project | 可横向滚动或 Accordion 化，需实现时确认 |
| 11 | Quality：提供可验证证据 | 检测图、认证和质量文档 | Quality 页面/询盘 | 内容堆叠 |
| 12 | Resources：承接研究型访客 | 3 张文章卡轮播 | Read More | 每屏 1 张 |
| 13 | FAQ：处理询盘前异议 | 单列 Accordion | 展开/收起 | 同桌面，扩大触控区 |

内容宽度以约 1280 px 的主容器为核心，在 1440 px 视口两侧约 80 px。模块通常用浅色、白色、浅桃色和深色背景切换，形成长页面节奏；图片通常占卡片上半部或图文段约一半宽度。

---

## 6. 公共组件清单

### 6.1 全局壳层

- `UtilityBar`
- `SiteHeader`
- `DesktopMegaMenu`
- `MobileNavigation`
- `SearchOverlay`
- `LanguageSwitcher`
- `SiteFooter`
- `CookieConsent`
- `FloatingChatOrContact`

### 6.2 内容与导航

- `Breadcrumbs`
- `SectionHeading`
- `ServiceCard`
- `IndustryCard`
- `MaterialCard/Row`
- `FinishCard/Row`
- `StatCard`
- `TestimonialCard`
- `CaseStudyCard`
- `ArticleCard`
- `ResourceCarousel`
- `MediaGallery`
- `LogoStrip`
- `Tabs`
- `Accordion`
- `DataTable`
- `Pagination`

### 6.3 转化与表单

- `PrimaryButton`、`SecondaryButton`、`TextLink`
- `QuoteCTA`
- `NpiCTA`
- `NewsletterForm`
- `ContactIntentSelector`
- `RFQForm`
- `FileDropzone`
- `MeetingModal`
- 表单成功、失败、上传进度和隐私同意状态

### 6.4 工程公共层

- Elementor Site Settings：全局颜色、字体、按钮、容器、断点和间距。
- Elementor Theme Builder：Header、Footer、Single、Archive、404 和内容类型模板。
- 统一媒体策略：响应式尺寸、WebP/AVIF、占位、alt、裁切和首屏优先级。
- 统一 SEO 配置：canonical、hreflang、OG、Schema、robots、Sitemap。
- 内容实体：Service、Industry、Material、Surface Finish、Case Study、Post、Site Settings、SEO Fields、Localized Content。
- 内容类型和字段应放在独立的站点功能插件/字段层，而不是只写进主题，避免换主题后内容模型失效。
- 第二阶段如果引入自定义管理模板，应通过 WordPress REST API 或受控的插件接口读写同一套内容，避免产生两套后台和两份数据。

---

## 7. 视觉设计规范

### 7.1 色彩

以下为公开 CSS 与浏览器实测值：

| 用途 | 色值 | 说明 |
|---|---|---|
| 品牌主色 | `#EA543F` | 主 CTA、链接 hover、重点标识 |
| 新版导航辅助橙 | `#F46C4F` | 少量 Header/新组件覆盖色，说明原站存在组件代际差异 |
| 主文字 | `#161616` | 标题、正文主色 |
| 深色区块 | `#1E1E1E` / `#262626` | Mega Menu、深色模块 |
| 页面底色 | `#FBFBFB` | 非纯白的暖灰背景 |
| 卡片浅灰 | `#F6F6F6` / `#EDEDED` | 次级区块和卡片 |
| 次级文字 | `#868686` | 辅助说明、元数据 |
| 浅桃背景 | `#FBE7D7` | Hero、转化带、内容节奏 |
| 辅助橙 | `#FDA863` | 图形/状态点缀 |
| 其他点缀 | `#4F5BFF`、`#9DCED3`、`#1B615E` | 个别平台/图形模块 |

我方不必机械复制每个辅助色，应以我方 Logo 和品牌色生成等价层级；重点保留“珊瑚 CTA + 黑灰文字 + 浅桃/浅灰大背景”的清晰对比关系。

### 7.2 字体与字号

- 参考站主字体确认是自托管 Neue Haas，源码拼写为 `NEUE HASS`。
- 不应直接拷贝参考站字体文件；我方使用已获授权的企业字体，或以 Inter/同类中性无衬线字体作为开放替代，并优先 WOFF2。
- Elementor 全局 Kit 声明 H1 约 `48/60 px`、H2 约 `56/64 px`，手机 H1/H2 约 `36/28 px`；实际页面存在大量模板级覆盖，因此这组值不能直接当作所有页面的最终样式。
- 1440 px 首页实测：
  - H1 约 `46/56 px`、600；Hero 文本宽约 610 px。
  - H2 约 `32/48 px`、600。
  - H3 多为 `24/36 px`；移动服务卡标题约 `22/36 px`。
  - 正文约 `16/22.4 px`。
- 参考站在 390 px 的 Hero H1 仍约 46 px，产生三行大标题。这是有意的强视觉选择，也可能挤压首屏；我方实现时应以英文真实标题长度复核，而不是固定照搬。

### 7.3 容器、间距与组件外观

| 项目 | 参考值/特征 |
|---|---|
| 主内容最大宽度 | 约 1280 px |
| Mega Menu 最大宽度 | 约 1200 px |
| 1440 视口页边距 | 约 80 px |
| 模块垂直留白 | 桌面通常约 80～120 px；移动建议约 56～80 px（估算，开发时逐段截图校准） |
| 栅格间距 | 常见 20～32 px |
| Header | 自定义主导航标称约 70 px；加入工具/活动条后本轮初始可见栈约 160 px，滚动后的固定区约 92 px，内容变化会影响总高 |
| Header CTA | 高约 52 px，圆角约 4 px |
| Hero 主 CTA | 高约 64 px，水平 padding 约 32 px，文字约 20 px |
| 服务卡 | 1 px 灰边、约 20 px 圆角、弱阴影或无阴影、图片在上；源码 hover 约 0.3 s、放大 1.05 并强化橙边 |
| 统计卡 | 白底、1 px 边、约 20 px 圆角 |
| FAQ | 1 px `#D4D4D4` 边、约 17 px 圆角 |
| 图片 | WebP/PNG/JPEG/SVG 混用；服务卡约 4:3、博客图约 3:2、服务 Hero 视频约 16:9 |

整体风格不是高装饰性的 SaaS 渐变风，而是“工业图片 + 大留白 + 低圆角 CTA + 中等圆角卡片 + 技术数据表”的可信制造业风格。阴影使用克制，主要靠边框、背景色和图片建立层次。

### 7.4 响应式行为

| 视口 | 当前参考站行为 | 我方开发检查重点 |
|---|---|---|
| 1440 | 1280 容器、完整导航、4 列卡片、多列 Mega Menu | 精确对齐宽度、字号、模块间距和首屏高度 |
| 1024 | 已切换汉堡菜单；部分卡片仍保持多列 | 菜单滚动、平板触控、卡片是否过密 |
| 768 | 平板导航；部分 4/5 列布局仍较紧 | 主动消除拥挤，但保持视觉顺序 |
| 390 | 单列图文；服务卡常为 2 列；Mega Menu 卡片在额外 400 px 断点变单列；按钮接近满宽 | 长英文/德文换行、44 px 以上触控区、表格横向滚动 |

公开 Elementor CSS 的主要断点是 `1024 px` 和 `767 px`。我方仍按用户指定的 1440、1024、768、390 四档逐页验收，并可增加内部小断点修正长语言或表格，不必继承参考站在中等宽度下的拥挤问题。

---

## 8. 交互与动画清单

| 交互 | 参考站行为 | 我方实现建议 |
|---|---|---|
| Mega Menu | 点击展开、同级互斥、外部点击关闭、约 300 ms 淡入下移 | 支持键盘、Esc、焦点管理、`aria-expanded` |
| Sticky Header | 固定吸顶，滚动后加阴影/紧凑状态 | 避免布局跳动，保留锚点偏移 |
| Mobile Menu | 汉堡打开全宽滚动层，子菜单 Accordion | 锁定页面滚动、关闭后恢复焦点 |
| Link/Card Hover | 变橙、轻微位移/上浮、弱阴影 | 尊重 `prefers-reduced-motion` |
| Arrow Reveal | Surface/Blog 链接的箭头从 0 宽展开，约 0.5 s | 可保留为次级链接动效，避免所有按钮都使用 |
| Logo/评价/资源 | Swiper/Slick 轮播；资源约桌面 3、平板 2、手机 1 | 首选一个轻量轮播实现，避免多库并存 |
| 平台功能 | Accordion 切换并联动右侧截图 | 图片预加载，切换可键盘操作 |
| NPI | Tabs 切换生命周期内容 | 语义化 tablist；手机可横滑或改 Accordion |
| FAQ | 单项 Accordion，参考过渡约 400 ms | 服务端输出正文，JS 仅增强交互 |
| 表单 | 按意图切换字段，验证，拖拽多文件上传 | 第一阶段完成 UI/状态；真实上传接口第二阶段对接 |
| Search | 全局搜索层与 Quick Links | 初期可使用内容索引/静态搜索，后期接后台 |
| Video | Popup/嵌入播放 | 延迟加载，提供封面和可访问标题 |

本轮首页未观察到大量 `.elementor-invisible` 或统一的滚动入场动画。不能把参考站描述成“全页滚动炫技动画”；其主要动效来自 Header、菜单、轮播、Tabs、Accordion、图片联动和轻微 Hover。我方应保持同样克制的工业 B2B 节奏。

参考站上传器公开脚本允许 STEP/STL/IGES/PRT/SLDPRT/SAT/X_T、常见图片、PDF、ZIP/RAR 等格式，单文件上限标为 50 MB，并有拖拽、进度和错误状态。该限制只是参考；我方真实允许格式、容量、病毒扫描、对象存储和过期策略需在第二阶段接口设计时确认。

---

## 9. 询盘转化路径

| 客户状态 | 入口与路径 | 页面承担的任务 |
|---|---|---|
| 已有 CAD/设计 | 全局 Quote/Upload CTA → 外部报价平台 → 上传、配置、DFM、报价 | 最短路径，Header 与长页多次重复 |
| 只有概念 | AI Creator → 描述需求 → 渲染/3D 模型 → Start Production | 避免无 CAD 用户流失 |
| 复杂 NPI 项目 | NPI 内容 → 阶段说明 → 专用项目表单/文件 → 人工跟进 | 采集更完整的项目上下文 |
| 通用咨询/售后 | Contact → 选择意图 → 对应字段表单 | 减少部门分派成本 |
| 搜索型访客 | Blog/材料/处理详情 → 服务内链 → 中段/文末 Quote CTA | 用 SEO 内容教育后再转化 |
| 暂未决策 | Blog/eBook/Newsletter/Case Study | 长周期培育与再营销 |

我方前端应保留至少三条清楚的主路径：

1. `Get a Quote / Upload Files`：已有图纸。
2. `Talk to an Engineer / Start a Project`：复杂或未定型需求。
3. `Contact / Support`：通用问题和售后。

在后台尚未开发时，第一阶段只实现真实可评审的表单界面、验证状态和数据结构；提交可先指向经确认的邮箱/API 占位方案，不能伪装成已完成的生产级文件上传和 CRM 流程。

建议从一开始定义前端分析事件：`quote_cta_click`、`rfq_start`、`file_selected`、`form_submit`、`service_view`、`language_change`，但接入真实 Analytics/广告脚本应等隐私与 Cookie 方案确认。

---

## 10. 原站技术分析

### 10.1 已确认技术

| 层级 | 结论 | 公开证据 |
|---|---|---|
| CMS | WordPress 6.9.5 | Generator、`wp-content`、`wp-includes`、REST discovery |
| 页面构建 | Elementor 3.35.9 + Elementor Pro 3.35.1 | 对应前端资源和 Widget 输出 |
| 主题 | 自定义 `mml-theme` | 主题 CSS/JS 路径 |
| SEO | Yoast SEO 26.4 | Schema graph、Sitemap 注释、canonical、llms.txt |
| 多语言 | GTranslate | 插件资源及翻译页响应头 |
| 表单 | Contact Form 7、WPForms、自定义/插件化文件上传 | 公开 CSS/JS 和表单 DOM |
| 交互 | jQuery、Swiper、Slick、Elementor/PowerPack 等 | 公开脚本资源 |
| 缓存/CDN | Cloudflare、Cloudways 缓存、Breeze、DeBloat | 响应头和资源改写 |
| EMS 子站 | Astro + React Islands | `/_astro/` 资源和 `astro-island` |

**推测**：源站很可能托管于 Cloudways，但响应头只能确认 Cloudways 缓存层，不能确认完整主机、数据库和部署拓扑。

### 10.2 渲染与加载

- 主站导航、正文、标题、表单和 Footer 已存在于首次 HTML；确认是服务端生成/缓存交付的 HTML，不是 CSR-only SPA。
- JavaScript 主要增强 Mega Menu、轮播、Tabs、Accordion、表单、Popup 和追踪。
- CSS/JS 使用 Breeze/DeBloat 延迟加载与预取；首页源码快照约含 40 个 CSS、61 个 JS 引用，但该数字包括延迟和重复声明，不能等同于最终网络请求数。
- gzip HTML 快照：首页约 168 KB，CNC 页约 187 KB。Elementor/插件输出较重，这是我方不应照搬的部分。
- 页面同时加载多种交互库和较多第三方追踪；我方应按组件拆包，只在需要页面加载对应客户端代码。

### 10.3 图片与字体

- 图片确认混用 WebP、PNG、JPEG、SVG；本次首页未观察到 AVIF。
- 多数正文图使用 SVG 占位和懒加载；部分首屏图有 `srcset/sizes`、固定宽高与高优先级。
- 字体为自托管 Neue Haas 多字重 TTF，并混有其他字体和图标字体。
- 我方建议：响应式 AVIF/WebP 回退、显式宽高、首屏预加载、其余懒加载；字体使用授权 WOFF2 可变字体或最少必要字重；SVG 图标代替整套 Font Awesome。

---

## 11. SEO 与多语言结构

### 11.1 参考站现状

- 默认英语为根路径；其他语言使用 `/fr/`、`/de/`、`/es/`、`/zh-CN/`、`/ar/`、`/hi/`、`/ja/`、`/pt/`。
- 抽样页具有唯一 Title、Meta Description、`index,follow`、自引用 canonical、Open Graph、Twitter Card 和单一 H1。
- 法语页面具有 `lang="fr"`，阿拉伯语页面具有 `lang="ar" dir="rtl"`；多语言页有互相指向的 hreflang。
- 当前抽样未观察到 `x-default`。
- 通用 Yoast 图谱包括 `WebPage`、`WebSite`、`Organization`、`BreadcrumbList`、`ImageObject`、`SearchAction`。
- 博客详情有 `Article`、`Person`、发布时间/修改时间；CNC 页有 `Product`、`Brand`、`AggregateRating`；EMS 子站使用 `CollectionPage`、`ItemList`、`Service` 等。
- [robots.txt](https://www.rapiddirect.com/robots.txt) 声明主站和 EMS Sitemap；[主 Sitemap](https://www.rapiddirect.com/sitemap_index.xml) 按文章、页面、案例、新闻、表面处理、招聘、行业和作者拆分。
- [llms.txt](https://www.rapiddirect.com/llms.txt) 由 Yoast 生成，列出近期内容和 Sitemap。

### 11.2 参考站不应复制的问题

- 个别 OG/Breadcrumb/Schema 泄露内部编辑标记。
- 某些非文章页使用 `og:type=article`。
- 服务页使用 `Product + AggregateRating`；我方只有在页面确实是产品且评分真实、可见、可核验时才能这样标记，否则应使用 `Service`。
- 首页 OG 图片扩展名与声明 MIME 不一致。
- 未观察到 `x-default`。
- 大小写 URL 变体返回 200 后再 canonical；我方应 301 到唯一小写 URL。
- HTTP 到最终主域存在多跳；我方应一次 301 归一。
- 部分图片 alt 是内部编号或泛化词。

### 11.3 我方 SEO 结构建议

1. 英语根路径 `/`，其他语言 `/{locale}/...`；是否改为所有语言都显式前缀，应在初始化前最终确认。
2. 每个已发布语言版本输出自引用 canonical、全量 hreflang 与 `x-default`；未翻译页面不要伪造 hreflang。
3. 每页单一 H1，H2/H3 严格反映内容层级；Breadcrumb 在 UI 和 JSON-LD 中一致。
4. Schema 按模板生成：
   - 全站：Organization、WebSite、BreadcrumbList。
   - 服务/行业：Service。
   - 博客：Article + Person。
   - 案例：Article 或合适的 CreativeWork。
   - FAQ：仅对页面可见、符合搜索引擎政策的 FAQ 输出。
5. 按内容类型拆分 Sitemap；输出 robots.txt、OG/Twitter、图片 alt、404、canonical 归一规则。
6. Blog、Service、Industry、Material、Surface Finish 建立真实的双向内部链接，不批量制造薄内容页。
7. 翻译内容作为独立版本管理并允许人工校审；阿拉伯语从组件层支持 RTL，而不是只翻译字符串。
8. 第一阶段就在 WordPress 内容模型中预留每语言的 SEO 字段、Slug、发布状态、OG 图和 Schema 必填项；第二阶段的自定义后台若实施，应复用这些字段。

---

## 12. 技术路线确认：WordPress + Elementor

### 12.1 `mml-theme` 的授权与可获得性

参考站公开的 [`style.css`](https://www.rapiddirect.com/wp-content/themes/mml-theme/style.css) 主题头可以确认：

- Theme Name：`MML Theme for rapiddirect`
- Theme URI：`https://www.mmldigi.com/`
- Author：`MML & rapiddirect`
- Version：`1.0.0`
- License：`Commerce license. If you want to use, contact MML.`

[WordPress.org 官方目录搜索](https://wordpress.org/themes/search/mml-theme/?output_format=md)对 `mml-theme` 返回 0 个主题，[官方 Themes API 精确查询](https://api.wordpress.org/themes/info/1.2/?action=theme_information&request%5Bslug%5D=mml-theme)返回 404。因此它不是可从 WordPress 后台主题市场直接选择安装的公共主题，而是为 RapidDirect 开发的商业定制主题。

结论：

1. **首选路径**：由用户或主题权利方提供合法授权的 `mml-theme` ZIP、许可证和必要配套插件；可通过 [MML 联系页面](https://www.mmldigi.com/contact/)确认源码交付、修改权、多站点权和更新支持，再在隔离环境做兼容性审计。
2. **不能执行的路径**：从 RapidDirect 线上目录抓取 PHP/CSS/JS 后拼成主题。这既得不到完整服务端代码，也没有授权依据。
3. **备选路径**：若无法获得合法主题包，仍使用 WordPress + Elementor Pro，但以 [Hello Elementor](https://elementor.com/help/what-is-elementor-hello-theme/) + 自有 Child Theme/Site Plugin 重新实现相同布局和组件，不复制对方主题代码。

### 12.2 确认后的推荐组合

目标组合：

- WordPress 当前稳定版。
- 合法授权的 `mml-theme`；所有我方修改放在 Child Theme 或独立 Site Plugin 中，避免直接改供应商主题。
- Elementor + Elementor Pro。
- Elementor Site Settings 与 Theme Builder 负责全局样式和页面模板。
- Yoast SEO 或等价 SEO 插件；若追求与参考站一致，优先 Yoast。
- 多语言插件在初始化前二选一：
  - GTranslate：更接近参考站、上线快，但需评估翻译可编辑性和 SEO 版本控制。
  - WPML/Polylang 类方案：每个语言版本可人工维护，更符合高质量海外 SEO，但成本和编辑工作更高。
- Service、Industry、Material、Surface Finish、Case Study 使用 Custom Post Type；字段优先通过 ACF/等价字段层管理。
- 内容类型注册、字段映射、短代码和自定义 Elementor Widget 放进独立 Site Plugin，避免与展示主题绑定。
- 表单只选择一套主方案；优先评估 Elementor Pro Forms，确有复杂文件上传/分流需求时再引入 Contact Form 7 或定制上传接口，避免插件重复。
- CDN、页面缓存和图片优化各保留一条清晰链路，不复制参考站多个优化/插件层叠加的负担。

### 12.3 Elementor 页面实现方式

1. Site Settings 建立颜色、字体、按钮、容器、间距和响应式断点。
2. Theme Builder 建立 Header、Mega Menu、Mobile Menu、Footer、文章详情、文章归档、CPT 详情/归档和 404 模板。
3. 常用区块保存为可复用 Container/Template；只为 Material Tabs、复杂 Mega Menu、文件上传等 Elementor 无法稳定覆盖的交互开发自定义 Widget。
4. 动画以 Elementor 基础效果和 CSS Transition 为主，不堆叠多个轮播/动画扩展包。
5. 页面内容与样式分开：真实服务、材料、案例和文章来自 WordPress 内容实体，Elementor 模板通过 Dynamic Tags 展示，避免每个详情页手工复制。

### 12.4 与原始代码要求的调整

WordPress 主题和插件运行层必须使用 PHP、HTML、CSS 和 JavaScript，因此“所有代码都使用 TypeScript”无法原样成立。调整为：

- 自定义浏览器交互在构建链允许时使用 TypeScript，再编译为浏览器 JavaScript。
- WordPress Hooks、模板、CPT、REST 权限和 Elementor Widget 的服务端部分使用 PHP。
- Elementor 页面本身以可视化模板和结构化内容保存，不强行转换成 TypeScript。

### 12.5 WordPress 后台与第二阶段后台的边界

WordPress + Elementor 必然带有 `wp-admin`，否则无法安装主题、编辑页面和管理媒体。第一阶段的“不开发后台”应解释为：

- 可以使用 WordPress 自带后台和 Elementor 编辑器作为建站基础。
- 不开发用户自定义的订单、报价、CRM、权限工作台或独立管理界面。
- 第二阶段收到后台模板后，再决定它是美化/扩展 `wp-admin`，还是作为独立应用通过 REST API 管理 WordPress 内容。
- 不建议让第二阶段后台另建一份内容数据库，否则会出现双后台、双数据源和发布状态不一致。

### 12.6 性能与安全底线

- 使用 Elementor Containers、按需资源和最少数量的 Add-on，不复制参考站多套组件库并存的历史负担。
- WebP/AVIF、响应式图片、本地授权 WOFF2 字体、页面缓存、CDN/WAF；预发布环境必须 `noindex`。
- 开发、预发布、生产分离；建立自动备份、恢复演练、插件白名单、更新与回归策略。
- WordPress 账户采用最小权限和 2FA；自定义 PHP 做输入校验、清理、权限检查和输出转义。
- CAD/设计文件后续采用扩展名与 MIME 双校验、容量限制、反病毒、独立对象存储和过期删除，不长期堆入公开 Media Library。

---

## 13. 第一阶段开发顺序

### 阶段 0：授权、环境和内容契约

- 取得 `mml-theme` 合法主题包、授权证明、更新渠道和所需插件清单。
- 取得 Elementor Pro 许可证或由用户在隔离环境自行激活。
- 在干净的 WordPress 测试环境验证主题能否安装、是否依赖特定 PHP/WordPress/Elementor 版本、是否含 RapidDirect 专属数据或品牌资源。
- 确认公司名称、Logo、品牌色、字体授权、默认语言和首批语言。
- 确认服务、行业、材料、处理、案例、文章清单。
- 确认英语/多语言 URL 规则、报价入口和表单接收方式。
- 确认多语言插件选择，以及第二阶段后台是扩展 WordPress 还是独立 API 客户端。
- 定义 CPT、字段与 SEO 数据结构。

**验收**：主题授权和兼容性通过；路由表、内容实体、插件清单和素材缺口明确。当前尚未进入此阶段。

### 阶段 1：基础框架与全局组件

- 安装 WordPress、合法主题、Child Theme、Elementor/Pro 和经确认的最小插件集。
- Elementor Site Settings：颜色、字体、容器、间距、断点和基础控件样式。
- Theme Builder：Header、Mega Menu、搜索层、移动导航、Footer 和 404 骨架。
- 建立 Button、Card、Image、Breadcrumb、Tabs、Accordion、Carousel、Form 等可复用 Elementor 模板/Widget。
- 建立多语言和 Yoast SEO 基础配置，但不批量生成内容页。

**验收**：1440/1024/768/390 四宽度可运行；键盘与移动菜单行为正确；等待用户确认。

### 阶段 2：首页，按 1～3 个模块分批

建议批次：

1. Hero + 信任数字。
2. Manufacturing Services + 双工具路径。
3. 客户评价 + 制造网络/工厂媒体。
4. Digital Platform + How It Works。
5. NPI + Quality。
6. Resources + FAQ + 最终 CTA。

每批固定流程：实现 → 启动本地网站 → 截图 → 与参考站同位置比较 → 按严重/明显/细节分类 → 修正严重和明显差异 → 提交用户确认。

### 阶段 3：主要页面模板

1. 注册最小 CPT/字段，并用少量样例内容验证 Dynamic Tags。
2. Services 总页与 Service Single/Archive 模板，先落一个 CNC 示例。
3. Industry Single/Archive 模板。
4. Materials/Surface Finishes 总页与详情模板。
5. About、Case Study 模板。
6. Blog 列表/分类/详情模板。
7. Contact/RFQ。

**原则**：先 Theme Builder 模板后实例，公共区块复用；内容与布局分离，不为每个详情页复制一套 Elementor 页面。

### 阶段 4：多语言、SEO 与内容完善

- 真实翻译、语言切换和 RTL。
- Yoast 模板、canonical、hreflang、OG、Schema。
- Sitemap、robots、Breadcrumb、Alt、404 和 URL 归一。
- 内部链接、文章分类、分页与内容校验。

### 阶段 5：质量验收

- 四个指定宽度的页面对照。
- 键盘操作、焦点、对比度、Reduced Motion。
- Core Web Vitals、Elementor DOM/资源、图片/字体、缓存和长语言溢出。
- Safari、Chrome、Firefox 及常见移动浏览器。
- 表单验证、隐私同意、错误状态和追踪事件。
- WordPress/主题/插件更新、备份恢复、最小权限、WAF/反垃圾和预发布回归。

差异等级：

- **严重差异**：模块/转化路径缺失，布局断裂，菜单或表单不可用。
- **明显差异**：尺寸、字号、间距、裁切、列数、颜色或交互明显不符。
- **细节差异**：微小阴影、动画曲线、1～4 px 对齐等，不阻塞本批确认。

---

## 14. 确认后第一批应开发的内容

在取得 `mml-theme` 合法主题包和 Elementor Pro 许可，并完成兼容性检查后，第一批只做：

1. 在本地或 Staging 安装 WordPress，不触碰生产环境。
2. 安装并审计 `mml-theme`，建立 Child Theme；清除/替换任何无权使用的参考站品牌资源。
3. 安装 Elementor/Pro 及经审计的最小依赖插件。
4. Site Settings：颜色、字体、容器、间距、断点。
5. Header、桌面 Mega Menu、移动导航、搜索层和 Footer。
6. Button、Card、统一 Image、Breadcrumb 等最小可复用模板/Widget。
7. 多语言与 Yoast 基础配置。
8. 仅放壳层演示内容，不提前开发完整首页。
9. 1440、1024、768、390 截图与交互核对。

完成后暂停，等待确认，再进入首页 Hero 与信任数字模块。

---

## 15. 本阶段明确不做

- 不开发后台管理系统、数据库、账号、订单或真实报价引擎。
- 不初始化 WordPress 或创建数据库，直到取得合法主题包、Elementor Pro 许可并明确测试环境。
- 不从 RapidDirect 服务器抓取或重组未授权的主题 PHP/CSS/JS。
- 不一次性生成全部页面。
- 不部署，不提交或推送 Git。
- 不复制 RapidDirect 的源码、品牌素材、原文文案或未授权字体。
