# DatabaseDebugger 组件

## 🎯 功能说明

这是一个专门用于调试和查看数据库信息的组件，提供了完整的数据库状态监控和数据查看功能。

## ✨ 主要特性

### 📊 数据库状态监控
- 初始化状态检查
- 数据库版本信息
- 表数量统计

### 📈 数据概览
- 各表数据数量统计
- 快速导出功能
- 可视化数据展示

### 📋 详细数据查看
- 分类数据表格
- 预算数据表格
- 交易数据表格
- 银行余额数据表格

### 🧪 调试功能
- 运行数据库测试
- 重置数据库
- 刷新数据

### 📝 操作日志
- 实时操作记录
- 时间戳记录
- 日志清理功能

## 🚀 使用方法

```typescript
import DatabaseDebugger from './components/debug/DatabaseDebugger';

function App() {
  return (
    <div className="App">
      <DatabaseDebugger />
    </div>
  );
}
```

## 🔧 组件结构

```
src/components/debug/
├── DatabaseDebugger.tsx    # 主组件
├── DatabaseDebugger.css    # 样式文件
└── README.md              # 说明文档
```

## 💡 使用场景

1. **开发调试**：查看数据库结构和数据
2. **测试验证**：运行数据库测试用例
3. **数据导出**：导出各表数据为JSON格式
4. **状态监控**：实时监控数据库状态
5. **问题排查**：通过日志追踪操作历史

## 🎨 界面特点

- 现代化UI设计
- 响应式布局
- 丰富的交互效果
- 清晰的数据展示
- 直观的操作按钮
