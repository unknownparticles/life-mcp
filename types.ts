
export enum AIProvider {
  GEMINI = 'Gemini',
  GLM = 'GLM',
  DEEPSEEK = 'DeepSeek'
}

export interface AppSettings {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  modelName: string;
  backendUrl: string;
}

export interface AuthSession {
  email: string;
  passwordHash: string;
  isGuest?: boolean;
}

export enum Category {
  WORK = '工作',
  LIFE = '生活',
  HEALTH = '健康',
  LEARNING = '学习',
  FINANCE = '财务',
  OTHER = '其他'
}

export interface LifeRecord {
  id: string;
  timestamp: number;
  rawContent: string;
  summary: string;
  experience: string;
  category: Category;
  tags: string[];
}

export interface AIResponse {
  summary: string;
  experience: string;
  category: Category;
  tags: string[];
}

export interface UserStats {
  totalRecords: number;
  totalExperiences: number;
  topCategory: string;
}
