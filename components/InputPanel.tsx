
import React, { useState, useRef, useEffect } from 'react';
import { storageService } from '../services/storageService';

interface InputPanelProps {
  onProcess: (content: string) => void;
  onQuery: (content: string) => void;
  isLoading: boolean;
  suggestion: string | null;
  setSuggestion: (s: string | null) => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ onProcess, onQuery, isLoading, suggestion, setSuggestion }) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // We no longer use automatic matching, so we remove the useEffect for debounce suggestion matching.
  // The suggestion will be set via the Query button.

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'zh-CN';

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('您的浏览器不支持语音识别。');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleRecord = async () => {
    if (!inputText.trim() || isLoading) return;
    const success = await (onProcess(inputText) as unknown as Promise<boolean>);
    if (success) {
      setInputText('');
      setSuggestion(null);
    }
  };

  const handleQuery = async () => {
    if (!inputText.trim() || isLoading) return;
    onQuery(inputText);
  };

  return (
    <div className="fixed bottom-6 inset-x-0 mx-auto max-w-2xl px-4 z-50">
      <div className="glass-morphism rounded-3xl p-3 shadow-2xl flex flex-col space-y-2">
        {/* Suggestion Box */}
        {suggestion && (
          <div className="px-3 py-2 mb-1 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start space-x-2">
              <div className="mt-0.5 text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-indigo-600 mb-0.5">经验建议</p>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  {suggestion}
                </p>
              </div>
              <button
                onClick={() => setSuggestion(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="记录或查询人生经验..."
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] text-slate-700 py-2 px-3"
            rows={1}
            disabled={isLoading}
          />
          <div className="flex items-center space-x-1">
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              title={isRecording ? '正在听取...' : '语音输入'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
                <path d="M4 8a1 1 0 011 1v1a5 5 0 0010 0V9a1 1 0 112 0v1a7 7 0 01-6 6.92V18a1 1 0 11-2 0v-1.08A7 7 0 014 10V9a1 1 0 011-1z" />
              </svg>
            </button>

            {/* Query Button */}
            <button
              onClick={handleQuery}
              disabled={!inputText.trim() || isLoading}
              className={`px-4 py-2.5 rounded-2xl flex items-center space-x-1.5 font-bold transition-all duration-300 ${!inputText.trim() || isLoading ? 'bg-slate-100 text-slate-400' : 'bg-amber-100 text-amber-700 hover:bg-amber-200 active:scale-95'}`}
              title="查询相关经验"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">查询</span>
            </button>

            {/* Record Button */}
            <button
              onClick={handleRecord}
              disabled={!inputText.trim() || isLoading}
              className={`px-4 py-2.5 rounded-2xl flex items-center space-x-1.5 font-bold transition-all duration-300 ${!inputText.trim() || isLoading ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 active:scale-95'}`}
              title="记录新经验"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">记录</span>
            </button>
          </div>
        </div>
        {isRecording && (
          <div className="px-3 pb-1">
            <div className="flex space-x-1 justify-center">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`w-1 h-3 bg-red-400 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputPanel;
