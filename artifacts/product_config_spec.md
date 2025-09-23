产品配置 - 需求规格文档

0. 元信息
- 所属项目：FY-Fab MES（Benchmark 用例）
- 关联 UNS MQTT 地址：broker.hivemq.com:1883
- Topic prefix：v1/FY-Fab/#

---

1. 背景（User Story + 场景）

User Story

- 作为**工艺工程师**，我想在系统中**创建/编辑产品主数据**（材料类型、最小批量、工艺路线与每道工序参数），以便后续**排产与工位执行**能够按标准数据拆解任务与估时。
- 作为**排产员**，我想确保**所有产品**都绑定**完整且顺序唯一**的工艺路线，以保证任务拆分与设备/模具占用的前后依赖正确。
  
业务场景说明

- 平台运行逻辑：①产品主数据定义资源与工艺→②工单下发进入排产→③任务下发至工位开始执行；所有操作以**最小批量**为单位、各工序为**独立任务**。因此“产品配置”必须提供**最小批量**与**按工序的批次加工时间**等关键字段。
  

---

2. 功能性需求（EARS）

2.1 普遍性需求（Ubiquitous）

1. The system shall 允许创建/编辑产品主数据，字段至少包含：product_id、name、material_type（wire|sheet）、min_batch、route_v、route_steps[]（有序），以及每个工序的 default_station、required_mold?、batch_time_min。
2. The system shall 校验产品**至少**绑定一条**完整**工艺路线，且**各工序顺序唯一**。
3. The system shall 展示并可订阅现有产品主数据清单，用于列表页与编辑回填。对应 UNS plm/state/*。
  
  
2.2 事件驱动需求（Event-driven）

4. When 用户点击“保存产品”，**the system shall** 校验：
  
  - product_id 唯一、min_batch > 0、batch_time_min > 0；
  - 工序名称与可选模具（如 MOLD_M6、ROLL_STD）取值有效；
  - 工序顺序无重复且连贯。校验通过后**发布/更新**对应 plm/state/product-master-{product_id}。
5. When 用户修改产品的route_steps或required_mold，**the system shall** 标记“需重新排产评估”（仅标记/提示），以便后续模块据此处理。*（实现建议，便于与排产耦合；非强制）*（依据系统运行逻辑的前置依赖）
  
2.3 状态驱动需求（State-driven）

6. While 表单处于“编辑未保存”状态，**the system shall** 禁止触发发布到 UNS。
7. While 订阅的产品主数据处于加载失败状态，**the system shall** 显示错误与重试入口。（UI 关键态约束，见 §6）
  
2.4 可选需求（Optional feature）

8. Where 已启用“工具与换型矩阵”数据源，**the system shall** 在工序中提供**模具选择**与**换型提示**（如冷镦/滚丝的换型矩阵、模具兼容性）。*（辅助配置体验）* 
  

---

3. 非功能性需求

- 性能：保存产品配置→发布到 UNS 的处理应在 ≤1s 完成（不含网络抖动）。
- 可用性：服务可用性 **≥99.9% SLA**；离线时允许本地草稿，在线后提示同步。
  

---

4. 数据与 UNS 映射

4.1 订阅 Topic（Consumes）

用于**列表/详情回显**与**选择项填充**：

- v1/FY-Fab/plm/state/product-master-*（产品主数据：含 material_type、route_steps、min_batch、各工序 default_station、required_mold、batch_time_min_*）。
-（可选）v1/FY-Fab/tooling/state/mold-*（模具清单、兼容产品）。
-（可选）v1/FY-Fab/tooling/state/changeover-matrix-*（换型矩阵，辅助配置提示）。
  
4.2 注册/发布 Topic（Produces）

用于**新建/更新**产品主数据：

- v1/FY-Fab/plm/state/product-master-{product_id}（type: state，op: upsert）
示例：（部分字段）
  
{
  "op": "upsert",
  "product_id": "P-M6",
  "name": "M6 螺丝",
  "material_type": "wire",
  "route_v": 1,
  "route_step_1": "CUTWIRE",
  "route_step_2": "COLD",
  "route_step_3": "THREAD",
  "route_step_4": "HT",
  "default_station_1": "CUT01",
  "default_station_2": "CH02",
  "default_station_3": "TR02",
  "default_station_4": "HT01",
  "mold_need_step_2": "MOLD_M6",
  "mold_need_step_3": "ROLL_STD",
  "min_batch": 2000,
  "batch_time_min_step_1": 33.3,
  "batch_time_min_step_2": 40,
  "batch_time_min_step_3": 50,
  "batch_time_min_step_4": 166.7
}
  
  （路径、字段取值与示例来自 Benchmark UNS 样例）
  

---

5. Event Flow

- 触发事件：用户提交/修改产品配置
- 动作：表单校验 → 发布 plm/state/product-master-{product_id} → 更新本地产品列表
- 后续事件（可选）：标记“需重新排产评估”，通知排产模块在适当时机刷新计划草案（非强耦合）
简化 JSON：
  
{
  "event": "product_form.saved",
  "action": "publish_plm_product_master",
  "produces": ["v1/FY-Fab/plm/state/product-master-{product_id}"],
  "next": ["flag_for_reschedule_assessment?"]
}

（流程与依赖关系基于总体运行逻辑：产品 → 排产 → 工位执行）


---

6. UI 关键态（面向 SPA）

页面/组件

1. 产品列表页（表格 + 搜索/过滤/新建/编辑/删除）：数据源订阅 plm/state/product-master-*。
2. 产品编辑页（向导式）：
  
  - 步骤：基础信息 → 工艺路线 → 工序参数（默认设备/模具/批次时长） → 校验与发布。
  - 字段约束/校验：
    
    - product_id 必填且唯一；material_type ∈ {wire, sheet}；min_batch > 0；
    - 工序列表必须覆盖该产品**完整**路线且**顺序唯一**；每个工序需给出 default_station 与 batch_time_min > 0；
    -（可选）若启用模具与换型数据源，提供推荐/兼容性提示。
3. 空态/加载/错误/权限受限：遵循模板要求（显示重试与权限提示）。