export const MOCK_TRAINING_STEPS = [
    {
        id: 'step-1',
        type: 'step',
        title: '正在加载数据集: self-instruct.jsonl',
        content: 'Size: 2.4MB, Examples: 5200',
        status: 'complete' as const,
        timestamp: new Date()
    },
    {
        id: 'step-2',
        type: 'step',
        title: '初始化模型: qwen3-4b-instruct',
        content: 'Loading weights into BF16, Context Length: 32k',
        status: 'complete' as const,
        timestamp: new Date()
    },
    {
        id: 'step-3',
        type: 'step',
        title: '开始 SFT 训练',
        content: 'Epoch 1/3, LR: 2e-5, Batch Size: 8',
        status: 'active' as const,
        timestamp: new Date()
    }
];

export const MOCK_TERMINAL_LOGS = [
    {
        type: 'terminal',
        title: 'bash',
        toolName: 'bash',
        content: 'ls -lh datasets/self-instruct.jsonl',
        status: 'complete' as const,
        timestamp: new Date()
    },
    {
        type: 'terminal',
        title: 'bash',
        toolName: 'bash',
        content: '-rw-r--r--  1 agent  staff   2.4M Feb 13 16:30 self-instruct.jsonl',
        status: 'complete' as const,
        timestamp: new Date()
    },
    {
        type: 'terminal',
        title: 'bash',
        toolName: 'bash',
        content: 'python train.py --model qwen3-4b-instruct --dataset datasets/self-instruct.jsonl --output models/qwen3-sft',
        status: 'active' as const,
        timestamp: new Date()
    },
    {
        type: 'terminal',
        title: 'bash',
        toolName: 'bash',
        content: '[TRAIN] Epoch 1: 10% [██░░░░░░░░] Loss: 1.423 | LR: 2.0e-5',
        status: 'active' as const,
        timestamp: new Date()
    }
];

export const MOCK_FINAL_LOGS = [
    ...MOCK_TRAINING_STEPS.slice(0, 2).map(s => ({ ...s, status: 'complete' as const })),
    {
        id: 'step-3',
        type: 'step',
        title: 'SFT 训练已完成',
        content: 'Elapsed: 42m, Final Loss: 0.125, Model saved to models/qwen3-sft',
        status: 'complete' as const,
        timestamp: new Date()
    }
];

export const MOCK_DEMO_PROMPT = "基于qwen3-4b-instruct模型 和sefl-instruct的数据完成SFT训练";

export const MOCK_FINAL_CONTENT = `### ✅ SFT 训练任务已成功完成！

针对 **qwen3-4b-instruct** 模型的微调工作已顺利结束。以下是训练摘要：

#### 📊 训练统计
- **数据集**: \`self-instruct.jsonl\` (5,200 条数据)
- **训练时长**: 42 分钟
- **收敛 Loss**: 0.125 📉
- **硬件使用**: 2x A100 (80GB)

#### 🚀 模型已就绪
微调后的权重已保存至 \`models/qwen3-sft\`。
您可以立即在 **推理部署** 模块中加载此模型，或通过以下指令进行测试：

\`\`\`bash
python inference.py --model models/qwen3-sft --prompt "你好，请介绍一下你自己。"
\`\`\`

如有需要，您可以点击右下角的 **任务中心** 查看完整的训练日志和资源消耗曲线。`;
