
import React, { useState, useRef, useEffect } from 'react';

interface InputPanelProps {
  onProcess: (content: string) => void;
  isLoading: boolean;
}

const InputPanel: React.FC<InputPanelProps> = ({ onProcess, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

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

  const handleSubmit = async () => {
    if (!inputText.trim() || isLoading) return;
    const success = await (onProcess(inputText) as unknown as Promise<boolean>);
    if (success) {
      setInputText('');
    }
  };

  return (
    <div className="fixed bottom-6 inset-x-0 mx-auto max-w-2xl px-4 z-50">
      <div className="glass-morphism rounded-3xl p-3 shadow-2xl flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="记录下刚才的想法或发生的事..."
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
            <button
              onClick={handleSubmit}
              disabled={!inputText.trim() || isLoading}
              className={`p-3 rounded-full transition-all duration-300 ${!inputText.trim() || isLoading ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'}`}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              )}
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
