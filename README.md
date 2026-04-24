# 💰 财务管理 Web 应用

一个基于浏览器的离线财务管理应用，使用 React + TypeScript + SQL.js 构建。

## ✨ 功能特性

- 📊 **交易记录管理** - 记录收入和支出，支持多账户
- 💼 **预算规划** - 按月/周/日设置预算，跟踪预算使用情况
- 📂 **分类管理** - 自定义收入/支出分类，图标可视化
- 🏦 **多账户管理** - 支持银行账户、现金、数字钱包、信用卡
- 📈 **账户余额追踪** - 记录月度期初/期末余额
- 📥 **数据导入导出** - JSON 格式完整备份与恢复
- 📱 **响应式设计** - 支持桌面和移动设备
- 💾 **本地持久化** - 数据存储在浏览器 localStorage

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| React 19 | UI 框架 |
| TypeScript | 类型安全 |
| Vite | 构建工具 |
| SQL.js | 浏览器端 SQLite 数据库 |
| Tailwind CSS | 样式框架 |

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📁 项目结构

```
src/
├── components/           # React 组件
│   ├── ui/             # 通用 UI 组件 (Button, Modal, DataTable 等)
│   ├── layout/         # 布局组件 (Header, StatusPanel)
│   ├── debug/          # 调试界面组件
│   └── forms/          # 表单组件 (添加预算/交易/分类等)
├── contexts/           # React Context
│   ├── DatabaseContext.tsx    # 数据库服务上下文
│   ├── RepositoryContext.tsx  # 数据仓库上下文 (依赖注入)
│   └── AppStateContext.tsx    # 全局状态上下文
├── hooks/              # 自定义 Hooks
├── pages/              # 页面组件
│   ├── Dashboard.tsx   # 仪表盘
│   ├── Budgets.tsx     # 预算管理
│   ├── Transactions.tsx # 交易记录
│   ├── Reports.tsx     # 报表统计
│   ├── Categories.tsx  # 分类管理
│   ├── Accounts.tsx    # 账户管理
│   └── Debugger.tsx    # 调试工具 (导入/导出)
├── services/           # 业务逻辑层
│   └── database/       # 数据库层
│       ├── repositories/  # 数据仓库 (Repository 模式)
│       │   ├── CategoryRepository.ts
│       │   ├── BudgetRepository.ts
│       │   ├── TransactionRepository.ts
│       │   ├── AccountRepository.ts
│       │   └── AccountBalanceRepository.ts
│       └── schemas/    # 数据库表结构定义
│           ├── Category.ts
│           ├── Budget.ts
│           ├── Transaction.ts
│           ├── Account.ts
│           └── AccountBalance.ts
└── types/              # TypeScript 类型定义
```

## 🗄️ 数据库架构 (Schema v2.0.0)

### 表结构

| 表名 | 说明 | 关联 |
|------|------|------|
| categories | 收入/支出分类 | - |
| accounts | 账户 (银行/现金/数字钱包/信用卡) | - |
| account_balances | 账户月度余额 | accounts |
| budgets | 预算 | categories |
| transactions | 交易记录 | categories, accounts, budgets |

### 分类 (categories)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| name | TEXT | 分类名称 |
| icon | TEXT | 图标 emoji |
| type | TEXT | income/expense |
| sortOrder | INTEGER | 排序 |
| isDefault | BOOLEAN | 是否默认 |
| isActive | BOOLEAN | 是否激活 |

### 账户 (accounts)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| name | TEXT | 账户名称 |
| type | TEXT | bank/cash/digital/credit |
| currency | TEXT | 货币代码 (默认 CNY) |
| icon | TEXT | 图标 emoji |
| isActive | BOOLEAN | 是否激活 |

### 账户余额 (account_balances)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| accountId | INTEGER | 账户 ID |
| year | INTEGER | 年份 |
| month | INTEGER | 月份 |
| openingBalance | DECIMAL | 期初余额 |
| closingBalance | DECIMAL | 期末余额 |

### 预算 (budgets)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| name | TEXT | 预算名称 |
| categoryId | INTEGER | 关联分类 |
| amount | DECIMAL | 预算金额 |
| period | TEXT | daily/weekly/monthly/yearly |
| startDate | TEXT | 开始日期 |
| endDate | TEXT | 结束日期 |
| month | TEXT | 预算月份 (YYYY-MM) |
| isRegular | BOOLEAN | 是否固定预算 |
| isBudgetExceeded | BOOLEAN | 是否超支 |

### 交易 (transactions)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| amount | REAL | 金额 |
| categoryId | INTEGER | 分类 ID |
| accountId | INTEGER | 账户 ID |
| budgetId | INTEGER | 预算 ID |
| description | TEXT | 描述 |
| date | DATETIME | 交易日期 |
| type | TEXT | income/expense |

## 🏗️ 架构说明

### 上下文依赖注入

应用使用 React Context 实现依赖注入：

- `DatabaseProvider` - 提供 SQL.js 数据库服务
- `RepositoryProvider` - 提供数据仓库（通过 DatabaseProvider）
- `AppStateProvider` - 提供全局状态管理

### 数据仓库模式

各实体有独立的数据仓库类：

- `CategoryRepository` - 分类管理
- `AccountRepository` - 账户管理
- `AccountBalanceRepository` - 账户余额管理
- `BudgetRepository` - 预算管理
- `TransactionRepository` - 交易管理

### 全局状态管理

使用 React Context + useReducer 管理全局状态，包括：

- 所有数据的缓存
- 加载状态
- 操作日志

## 📥 数据导入导出

### 导出数据

1. 访问 Debugger 页面
2. 选择要导出的表
3. 点击导出按钮
4. JSON 文件将自动下载

### 导入数据

1. 访问 Debugger 页面
2. 选择要导入的 JSON 文件
3. 点击导入按钮
4. **注意**：导入会先清除所有现有数据，然后导入新数据
5. 导入完成后页面状态会自动刷新

导出的 JSON 格式：

```json
{
  "categories": [...],
  "accounts": [...],
  "accountBalances": [...],
  "budgets": [...],
  "transactions": [...]
}
```

## 🎨 组件库

应用提供了可复用的 UI 组件：

| 组件 | 说明 |
|------|------|
| Button | 按钮（支持多种变体：primary/secondary/danger） |
| Modal | 模态对话框 |
| DataTable | 通用数据表格，支持排序和分页 |
| Card / StatCard | 卡片组件 |
| Input / Select | 表单输入组件 |
| FormField / Checkbox | 表单字段组件 |
| ErrorBoundary | 错误边界 |

## 📝 版本历史

### v2.0.0 (当前版本)

- 新增多账户管理功能
- 新增账户余额追踪功能
- 重构数据库架构，支持账户概念
- 优化数据导入导出功能
- 添加本地存储持久化
- 更新 UI 设计

### v1.0.0

- 基础交易记录管理
- 预算管理
- 分类管理
- 数据导入导出

## 📝 许可证

MIT
