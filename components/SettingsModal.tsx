
import React, { useState, useEffect } from 'react';
import { AppSettings, AIProvider } from '../types';
import { storageService } from '../services/storageService';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
    const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());

    useEffect(() => {
        if (isOpen) {
            setSettings(storageService.getSettings());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        storageService.saveSettings(settings);
        onSave(settings);
        onClose();
    };

    const providers = Object.values(AIProvider);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-900">AI 设置</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Provider Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">AI 供应商</label>
                        <div className="grid grid-cols-3 gap-2">
                            {providers.map(p => (
                                <button
                                    key={p}
                                    onClick={() => {
                                        let defaultModel = 'gemini-1.5-flash';
                                        if (p === AIProvider.GLM) defaultModel = 'glm-4';
                                        if (p === AIProvider.DEEPSEEK) defaultModel = 'deepseek-chat';
                                        setSettings({ ...settings, provider: p, modelName: defaultModel });
                                    }}
                                    className={`py-2 px-3 rounded-xl text-sm font-semibold border transition-all ${settings.provider === p
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Model Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">模型名称 (Model Name)</label>
                        <input
                            type="text"
                            value={settings.modelName}
                            onChange={e => setSettings({ ...settings, modelName: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none"
                            placeholder="例如: gemini-1.5-flash, glm-4, deepseek-chat"
                        />
                    </div>

                    {/* API Key */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">API Key</label>
                        <input
                            type="password"
                            value={settings.apiKey}
                            onChange={e => setSettings({ ...settings, apiKey: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none"
                            placeholder="请输入您的 API Key"
                        />
                    </div>

                    {/* Base URL (Conditional) */}
                    {(settings.provider === AIProvider.GLM || settings.provider === AIProvider.DEEPSEEK) && (
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">AI 接口地址 (可选)</label>
                            <input
                                type="text"
                                value={settings.baseUrl || ''}
                                onChange={e => setSettings({ ...settings, baseUrl: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm outline-none"
                                placeholder="默认使用官方 API 地址"
                            />
                        </div>
                    )}

                    {/* API Key Guide Link */}
                    {settings.provider === AIProvider.GLM && (
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-2">
                            <div className="flex items-center space-x-2 text-amber-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs font-bold">获取 API Key 指南</span>
                            </div>
                            <p className="text-xs text-amber-600 leading-relaxed">
                                还没有 API Key？请前往 <a href="https://bigmodel.cn/usercenter/proj-mgmt/apikeys" target="_blank" rel="noopener noreferrer" className="underline font-bold">智谱 AI 控制台</a> 注册并登录。
                                登录后填写开发者邮箱即可领取免费 API Key。
                            </p>
                        </div>
                    )}
                </div>

                <div className="px-6 py-5 bg-slate-50 flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                    >
                        保存设置
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
