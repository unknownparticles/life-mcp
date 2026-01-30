
import { GoogleGenAI } from "@google/genai";
import { AIResponse, AIProvider, AppSettings, Category } from "../types";

const SYSTEM_INSTRUCTION = `你是一个人生经验管理中心 (Life MCP) 的核心 AI。
你的任务是接收用户的原始记录（文字或语音转换的文本），并执行以下操作：
1. 总结内容：用一句话简洁概括发生了什么。
2. 提取经验：从事件中提炼出深刻的、可复用的经验教训或智慧。
3. 自动分类：将内容归类为工作、生活、健康、学习、财务或其他。
4. 生成标签：生成 2-3 个关键词标签。

请务必以 JSON 格式输出结果，格式如下：
{
  "summary": "...",
  "experience": "...",
  "category": "...",
  "tags": ["...", "..."]
}`;

export async function processLifeContent(content: string, settings: AppSettings): Promise<AIResponse> {
    const { provider, apiKey, baseUrl, modelName } = settings;

    if (!apiKey) {
        throw new Error("请先在设置中配置 API Key");
    }

    switch (provider) {
        case AIProvider.GEMINI:
            return processGemini(content, apiKey, modelName);
        case AIProvider.GLM:
        case AIProvider.DEEPSEEK:
            return processOpenAICompatible(content, apiKey, baseUrl || '', modelName);
        default:
            throw new Error("不支持的 AI 供应商");
    }
}

async function processGemini(content: string, apiKey: string, modelName: string): Promise<AIResponse> {
    const genAI = new GoogleGenAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
            responseMimeType: "application/json",
        },
    });

    const prompt = `${SYSTEM_INSTRUCTION}\n\n需要处理的内容：\n${content}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
}

async function processOpenAICompatible(content: string, apiKey: string, baseUrl: string, modelName: string): Promise<AIResponse> {
    const url = baseUrl || (modelName.includes('glm') ? 'https://open.bigmodel.cn/api/paas/v4/chat/completions' : 'https://api.deepseek.com/chat/completions');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelName,
            messages: [
                { role: 'system', content: SYSTEM_INSTRUCTION },
                { role: 'user', content: content }
            ],
            response_format: { type: 'json_object' }
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`AI 服务请求失败: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    return JSON.parse(resultText);
}
