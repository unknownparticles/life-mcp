
import React from 'react';
import { LifeRecord } from '../types';

interface RecordCardProps {
  record: LifeRecord;
  onDelete: (id: string) => void;
}

const RecordCard: React.FC<RecordCardProps> = ({ record, onDelete }) => {
  const dateStr = new Date(record.timestamp).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full">
            {record.category}
          </span>
          <span className="text-slate-400 text-xs">{dateStr}</span>
        </div>
        <button 
          onClick={() => onDelete(record.id)}
          className="text-slate-300 hover:text-red-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">
        {record.summary}
      </h3>
      
      <div className="mb-4 bg-slate-50 p-4 rounded-xl border-l-4 border-indigo-400">
        <p className="text-sm font-semibold text-indigo-700 mb-1">💡 提取经验</p>
        <p className="text-slate-700 text-sm italic">{record.experience}</p>
      </div>

      <div className="text-slate-500 text-sm line-clamp-3 mb-4">
        {record.rawContent}
      </div>

      <div className="flex flex-wrap gap-2 mt-auto">
        {record.tags.map(tag => (
          <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RecordCard;
