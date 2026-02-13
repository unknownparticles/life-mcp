import { LifeRecord, AppSettings, AIProvider, AuthSession } from "../types";

const STORAGE_KEY = 'life_mcp_records';
const SETTINGS_KEY = 'life_mcp_settings';
const SESSION_KEY = 'life_mcp_session';

const DEFAULT_SETTINGS: AppSettings = {
  provider: AIProvider.GEMINI,
  apiKey: '',
  modelName: 'gemini-1.5-flash',
  backendUrl: 'https://life-mcp.aliveservice.asia'
};

export const storageService = {
  saveRecord: (record: LifeRecord): void => {
    const records = storageService.getAllRecords();
    records.unshift(record); // Add to beginning
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  },

  getAllRecords: (): LifeRecord[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  deleteRecord: (id: string): void => {
    const records = storageService.getAllRecords().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  },

  getSettings: (): AppSettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  },

  saveSettings: (settings: AppSettings): void => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  getSession: (): AuthSession | null => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveSession: (session: AuthSession): void => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  clearSession: (): void => {
    localStorage.removeItem(SESSION_KEY);
  },

  setAllRecords: (records: LifeRecord[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  },

  exportRecords: (): void => {
    const records = storageService.getAllRecords();
    const dataStr = JSON.stringify(records, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `life-mcp-memory-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  },

  importRecords: async (file: File): Promise<{ success: boolean; added: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string) as LifeRecord[];
          if (!Array.isArray(importedData)) throw new Error("无效的数据格式");

          const existingRecords = storageService.getAllRecords();
          const existingIds = new Set(existingRecords.map(r => r.id));

          const newRecords = importedData.filter(r => !existingIds.has(r.id));
          const mergedRecords = [...newRecords, ...existingRecords];

          storageService.setAllRecords(mergedRecords);
          resolve({ success: true, added: newRecords.length });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("文件读取失败"));
      reader.readAsText(file);
    });
  },

  findRelevantExperience: (text: string): string | null => {
    if (!text.trim()) return null;
    const records = storageService.getAllRecords();
    
    // Simple matching: score based on keywords
    const keywords = text.toLowerCase().split(/[\s,，。！!？?]+/).filter(k => k.length > 1);
    if (keywords.length === 0) return null;

    let bestMatch: LifeRecord | null = null;
    let maxScore = 0;

    for (const record of records) {
      let score = 0;
      const content = (record.rawContent + (record.tags?.join(' ') || '')).toLowerCase();
      
      for (const kw of keywords) {
        if (content.includes(kw)) {
          score += kw.length; // Priority to longer keywords
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestMatch = record;
      }
    }

    // Threshold to avoid weak matches
    return maxScore >= 2 ? bestMatch?.experience || null : null;
  }
};
