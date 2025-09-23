
5. 工站执行 Dashboard - 需求规格文档

1. 元信息
- 关联 UNS MQTT 地址：ws://broker.hivemq.com:8884/mqtt
- topic prefix：v1/FY-Fab
  

---

1. 背景（User Story + 场景）

User Stories

- 作为**生产主管**，我想在同一处看到全部工站的**运行中/排队中**任务与关键计数，快速判断产线负载与拥塞点。为此需要一个跨站汇总视图与分站卡片。
- 作为**线长/班组长**，我希望能**筛选工序/工站状态**并查看每台设备的**当前任务与队列**，必要时执行**派工、开始**等操作（若启用远程操作）。
- 作为**设备操作员**，我需要在设备页执行**开始/完成**操作；Dashboard 需同步反映这些状态变化与时间戳。
  
业务场景说明

- 排产模块生成计划后并不会进入执行，需由工站执行模块**实际启动任务**；Dashboard 作为跨站总览，应汇总“计划→队列→执行”的实时状态以支撑现场决策。
- 工站侧基本交互为：查看当前任务信息→开始任务→完成任务（系统自动记录开始/结束时间；本用例不处理异常与报工），这些行为应实时驱动 Dashboard 变化。
  

---

2. 功能性需求（EARS）


2.1 普遍性需求（Ubiquitous）

1. The system shall 提供**顶层汇总指标**：station_count、running_jobs、queued_jobs，以卡片形式实时展示。数据来自 v1/FY-Fab/sched/state/queue-snapshot。
2. The system shall 以**工站卡片**展示每台设备的**当前任务/队列**、snapshot_ts、queued 数与 running 数。示例数据见 sheet/LASER01/state/queue、sheet/COAT01/state/queue、sheet/ASSY01/02/state/queue。 
3. The system shall 对**清线/换色/清洁**中的设备以明显状态标注（如 COAT01 的 type=clean、reason=color_change），并显示预期剩余时间。
4. The system shall 支持按**工序（LASER/BEND/COAT/ASSY…）**、**工站**、**状态（运行/排队/清洗/空闲）**、**产品/订单**多条件过滤与搜索。工序与默认工站可由产品主数据提供参考。
5. The system shall 支持查看**排队详情**（job\_id、产品、批量、预计时长/开始时间）与**当前任务**（job\_id、状态、起止时间）。示例见 LASER01/state/queue、current-job。 
6. The system shall（可选启用）在卡片上提供**轻量操作**：
  
  - 派工：.../action/dispatch-task；
  - 开始：.../action/start-task。
  （完成/报工依设备页处理；本用例未定义报异常）。 
7. The system shall（可选启用）展示**班组配置**（每班人手、班次数）作为工站产能参考，来源 workforce/state/workgroup-*。
  
  
2.2 事件驱动需求（Event-driven）

8. When 任一工站 state/queue 或 state/current-job 发生变化，**the system shall** 在 ≤1s 内更新对应卡片与顶层汇总计数。 
9. When 发现 type=clean 的任务开始，**the system shall** 将卡片状态切换为“清线/换色中”并显示预计剩余时间（expect_minutes）。
10. When 收到新的计划草案（sched/state/plan-draft），**the system shall** 在“待派工”区显示可派工的建议任务。
  
2.3 状态驱动需求（State-driven）

11. While 数据源连接断开或超时，**the system shall** 显示离线提示与重试入口，不允许远程操作。
12. While 用户无“执行监控/远程操作”权限，**the system shall** 仅展示只读视图并隐藏操作按钮。
  
2.4 可选需求（Optional feature）

13. Where 已启用“工单/产品主数据”订阅，**the system shall** 在任务行中补充**产品名称**、**标准工艺路线**与**默认工站**提示。 
14. Where 启用“用工状态”订阅，**the system shall** 在卡片上显示**班组人力配置**，辅助判断是否需调配人员。
  

---

4. 数据与 UNS 映射

4.1 订阅 Topic（Consumes）

- 跨站汇总：v1/FY-Fab/sched/state/queue-snapshot（station_count/queued_jobs/running_jobs）。
- 分站队列与当前任务：
  
  - v1/FY-Fab/sheet/LASER01/state/queue、.../state/current-job（示例）。 
  - v1/FY-Fab/sheet/COAT01/state/queue（含清线任务）。
  - v1/FY-Fab/sheet/ASSY01/state/queue、.../ASSY02/state/queue。 
- 计划草案：v1/FY-Fab/sched/state/plan-draft（待派工）。
- 主数据/工单（增强展示）：erp/state/order-registry、plm/state/product-master-*。 
- 人力配置（可选）：workforce/state/workgroup-*。
  
4.2 注册 Topic（Produces）

- 派工（可选）：.../action/dispatch-task（ids、目标工站、模式）。
- 开始（可选）：.../action/start-task（job\_id、operator\_group、expect\_minutes）。
- 清线启动（仅喷涂线示例）：sheet/COAT01/action/clean-start。
  
注：**完成**/报工流程由**工站单机界面**承载，Dashboard 不直接产出对应 Topic（基于用例定义）。

字段示例（派工）

{
  "job_ids": ["JOB-LZ-002"],
  "order_id": "PO-202507-1001",
  "product_id": "P-PANEL1",
  "step_code": "LASER",
  "batch_qty": 5
}

（示例路径与字段见 .../LASER01/action/dispatch-task）


---

5. Event Flow（Dashboard 子流程）

- 触发事件：收到 sched/state/queue-snapshot 或任一 .../state/queue / state/current-job 更新
- 动作：
  
  1. 更新顶部 KPI（站点数/运行/排队）；
  2. 更新对应工站卡片的当前任务与队列；
  3. 若侦测到 type=clean 的任务，切换卡片为“清线/换色中”并显示剩余时间；
  4. 若启用派工/开始操作，执行相应 Action Topic 并本地“乐观更新”。
- 后续事件：
  
  - 派工成功→对应工站队列增加；
  - 开始成功→对应工站当前任务进入 running。
  （数据与行为依据用例与 Topic 设计） 
    
简化 JSON

{
  "event": "station.state.changed | sched.queue-snapshot.changed",
  "action": ["update_kpis", "refresh_station_card", "toggle_cleaning_state?"],
  "next": ["maybe_dispatch", "maybe_start"]
}

（主题与更新点对应 §4 订阅与 §4.2 操作）


---

6. UI 关键态（面向 SPA）

信息架构

1. 顶部 KPI 区：站点数、运行中任务数、排队任务数，实时时钟/快照时间。来源 sched/state/queue-snapshot。
2. 过滤条：工序、工站、状态、订单/产品搜索；清空筛选。（工序/默认工站参考 plm/state/product-master-*）
3. 工站卡片网格：每卡片显示：
  
  - 工站名、当前任务（job\_id/产品/批量/起止时间/状态）、队列长度；
  - 清线/换色状态（若存在 type=clean 且显示 expect_minutes 倒计时）；
  - （可选）班组人力与班次。 
4. 操作区（可选）：在卡片上提供“派工/开始”快捷按钮（受权限与配置控制）。
  
通用态

- 空态/加载/错误/权限受限：统一样式；离线显示重试入口；无权限隐藏操作。
- 表单/交互反馈：操作成功/失败 Toaster；Action 请求中的旋转态。