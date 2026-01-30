# Life MCP - 人生经验管理中心

Life MCP 是一个基于 AI 驱动的个人成长与经验管理中心。它致力于帮助用户记录生活中的点滴感悟、专业经验和成长瞬间，并利用大语言模型（Google Gemini）进行深度分析、分类和提炼。

## 🌟 核心功能

- **身份认证**：内置登录与注册功能，支持邀请码机制，确保个人数据私密安全。
- **云端同步**：支持一键将本地记录备份至云端，并在登录时自动恢复数据，实现跨设备同步。
- **AI 智能处理**：集成 AI (Gemini, GLM, DeepSeek)，自动从原始输入中提取核心观点、总结经验、记录心情，并识别潜在的动作项。
- **极简输入体验**：沉浸式的底部输入面板，支持快速记录，AI 在后台静默处理并同步。
- **云端同步**：支持将本地数据一键同步至云端，确保宝贵的人生成长经验永不丢失。
- **响应式设计**：完美适配桌面端和移动端，随时随地记录灵感。

## 🛠️ 技术栈

- **前端框架**：React + TypeScript
- **构建工具**：Vite
- **样式方案**：Tailwind CSS (Vanilla CSS 驱动的极致视觉)
- **AI 引擎**：Google Gemini API GLM DEEPSEEK
- **数据存储**：Local Storage + Cloud Sync API

## 🚀 快速开始

### 1. 克隆并安装依赖

```bash
git clone <your-repo-url>
cd life-mcp
npm install
```

### 2. 构建与运行

```bash
npm run dev
```

运行后，在浏览器中打开 `http://localhost:5173`。

### 3. 配置与使用

1. **注册账号**：使用邀请码完成注册并登录。
2. **设置 AI**：点击右上角齿轮图标，配置您的 API Key (Gemini, GLM 或 DeepSeek)。
3. **设置后端**：默认使用 `https://mynote-api.aliveservice.asia`，您也可以在设置中配置自己的后端地址。


