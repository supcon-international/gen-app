# MES Single Screen App

单页 MES 应用模板，基于 Vite + React + Tailwind CSS v3 + MQTT

## 特性

- 单页架构：仅有 `/` 路由，所有功能在单页以分区/卡片/标签形式呈现
- Tailwind CSS v3 锁定版本（3.4.x）
- MQTT 实时消息支持（mqtt@4）
- shadcn 经典中性色风格
- 根容器不滚动设计

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:5173` 运行

### 构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

### 验证 Tailwind 版本

```bash
npm run check:tw
```

确保使用的是 Tailwind CSS v3 版本

## 环境配置

1. 复制 `.env.example` 为 `.env`
2. 填写 MQTT 连接参数：

```env
VITE_MQTT_URL=wss://your-broker.com:8083/mqtt
VITE_MQTT_USERNAME=your-username
VITE_MQTT_PASSWORD=your-password
```

## MQTT 功能

### 连接管理
- 自动重连（指数退避）
- 心跳保持（60秒）
- 连接状态实时显示

### 使用示例

```typescript
import { useMQTT } from "@/mqtt/MQTTProvider";

const { state, connect, subscribe, publish, end } = useMQTT();

// 连接
connect({
  url: "wss://broker.com:8083/mqtt",
  username: "user",
  password: "pass",
  clientIdPrefix: "mes"
});

// 订阅
subscribe("/factory/sensors/+", 0);

// 发布
publish("/factory/cmd/start", '{"action":"start"}', 0, false);
```

## 项目结构

```
template/
├── src/
│   ├── mqtt/              # MQTT 模块
│   │   ├── client.ts      # MQTT 客户端服务
│   │   └── MQTTProvider.tsx # React Context Provider
│   ├── components/
│   │   └── ui/           # shadcn UI 组件
│   ├── App.tsx           # 主应用组件
│   ├── main.tsx          # 应用入口
│   └── index.css         # Tailwind CSS
├── .env.example          # 环境变量示例
├── package.json          # 依赖配置
├── vite.config.ts        # Vite 配置
├── tailwind.config.cjs   # Tailwind v3 配置
├── postcss.config.cjs    # PostCSS 配置
└── tsconfig.json         # TypeScript 配置
```

## 设计约束

1. **单页约束**：仅有 `/` 路由，所有功能通过 Tabs/区块切换实现
2. **样式约束**：
   - 使用 shadcn 经典中性色（gray/zinc）
   - 不扩展 theme.colors
   - 不使用任意色值类
3. **滚动约束**：
   - 根容器 `h-screen overflow-hidden`
   - 仅次级区域（如消息列表）允许 `overflow-auto`
4. **版本锁定**：
   - Tailwind CSS 3.4.x
   - PostCSS 8.4.x
   - autoprefixer 10.4.x
   - mqtt 4.3.x

## 开发指南

### 添加新功能

1. 所有新功能应作为 Tab 或卡片添加到现有页面
2. 保持单页结构，不引入路由库
3. 遵循 shadcn 组件风格

### MQTT Topics 约定

建议的 topic 命名规范：
- `/factory/sensors/{device_id}` - 传感器数据
- `/factory/cmd/{action}` - 控制命令
- `/factory/alerts/{level}` - 告警消息
- `/factory/status/{component}` - 状态更新

## License

MIT