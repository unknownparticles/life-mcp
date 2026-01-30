
import React, { useState, useEffect, useCallback } from 'react';
import { LifeRecord, Category } from './types';
import { storageService } from './services/storageService';
import { processLifeContent } from './services/aiService';
import { authService } from './services/authService';
import RecordCard from './components/RecordCard';
import InputPanel from './components/InputPanel';
import SettingsModal from './components/SettingsModal';
import AuthPage from './components/AuthPage';

const App: React.FC = () => {
  const [records, setRecords] = useState<LifeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filter, setFilter] = useState<string>('全部');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(storageService.getSettings());
  const [session, setSession] = useState(storageService.getSession());

  // Load initial data
  useEffect(() => {
    if (session) {
      const loadedRecords = storageService.getAllRecords();
      setRecords(loadedRecords);
    }
  }, [session]);

  const handleProcess = async (content: string): Promise<boolean> => {
    if (!settings.apiKey) {
      setIsSettingsOpen(true);
      return false;
    }

    setIsLoading(true);
    try {
      const aiResponse = await processLifeContent(content, settings);

      const newRecord: LifeRecord = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        rawContent: content,
        ...aiResponse
      };

      storageService.saveRecord(newRecord);
      setRecords(prev => [newRecord, ...prev]);
      return true;
    } catch (error: any) {
      alert(error.message || "AI 处理失败，请检查设置或重试。");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这条记录吗？")) {
      storageService.deleteRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleSync = async () => {
    if (!session) return;
    if (session.isGuest) {
      alert("访客模式不支持云端同步。请使用导出功能手动备份您的记忆 JSON 文件。");
      return;
    }
    setIsSyncing(true);
    try {
      await authService.syncToCloud(records, session, settings);
      alert("云端同步成功！");
    } catch (error: any) {
      alert(error.message || "同步失败");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (confirm("导入将与现有本地记忆合并。继续吗？")) {
      try {
        const result = await storageService.importRecords(file);
        if (result.success) {
          alert(`导入成功！新增了 ${result.added} 条记录。`);
          setRecords(storageService.getAllRecords());
        }
      } catch (err: any) {
        alert("导入失败: " + err.message);
      }
    }
    e.target.value = ''; // Reset file input
  };

  const handleLogout = () => {
    if (confirm("确定要退出登录吗？")) {
      storageService.clearSession();
      setSession(null);
      setRecords([]);
    }
  };

  const handleLoginSuccess = async (newSession: any) => {
    setSession(newSession);
    if (newSession.isGuest) {
      setRecords(storageService.getAllRecords());
      return;
    }
    setIsLoading(true);
    try {
      const cloudRecords = await authService.restoreFromCloud(newSession, settings);
      if (cloudRecords && Array.isArray(cloudRecords)) {
        storageService.setAllRecords(cloudRecords);
        setRecords(cloudRecords);
      }
    } catch (error) {
      console.error("恢复数据失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  const categories = ['全部', ...Object.values(Category)];
  const filteredRecords = filter === '全部'
    ? records
    : records.filter(r => r.category === filter);

  const stats = {
    total: records.length,
    experiences: records.length, // Simpler for this demo
    latest: records[0]?.timestamp ? new Date(records[0].timestamp).toLocaleDateString() : '无'
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
              M
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Life MCP</h1>
              <p className="text-xs text-slate-500 font-medium">人生经验管理中心</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="AI 设置"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <button
              onClick={storageService.exportRecords}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="导出记忆 JSON"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>

            <label className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer" title="导入记忆 JSON">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>

            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm font-medium shadow-md shadow-slate-200"
            >
              {isSyncing ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                  <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
                </svg>
              )}
              <span className="hidden sm:inline">{isSyncing ? '同步中' : '同步云端'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="退出登录"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">总记录数</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">智慧经验值</p>
              <p className="text-2xl font-bold text-slate-800">{stats.experiences}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">最近记录</p>
              <p className="text-2xl font-bold text-slate-800">{stats.latest}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-6 scrollbar-hide no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${filter === cat ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-white text-slate-600 border border-slate-100 hover:border-indigo-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content List */}
        {filteredRecords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map(record => (
              <RecordCard
                key={record.id}
                record={record}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium">暂无记录，开始记录你的人生成长吧</p>
          </div>
        )}
      </main>

      {/* Persistent Input Panel */}
      <InputPanel onProcess={handleProcess} isLoading={isLoading} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={setSettings}
      />
    </div>
  );
};

export default App;
