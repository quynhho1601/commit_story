import React, { useState } from 'react';
import { Github, Search, Loader2, Wand2 } from 'lucide-react';
import { AppState } from '../types';

interface InputSectionProps {
  onAnalyze: (url: string) => void;
  appState: AppState;
}

export const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, appState }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url);
    }
  };

  const isLoading = appState !== AppState.IDLE && appState !== AppState.COMPLETE && appState !== AppState.ERROR;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-center bg-slate-900 rounded-lg border border-slate-700 p-2">
          <Github className="w-6 h-6 text-slate-400 ml-3" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
            className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 px-4 py-2 font-mono"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !url}
            className={`flex items-center gap-2 px-6 py-2 rounded-md font-semibold text-white transition-all
              ${isLoading || !url 
                ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/20'
              }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            <span>{isLoading ? 'Processing' : 'Generate Meme Story'}</span>
          </button>
        </div>
      </form>
      
      <div className="mt-4 flex flex-wrap gap-2 justify-center text-sm text-slate-400 font-mono">
        <span>Try:</span>
        <button onClick={() => setUrl('https://github.com/facebook/react')} className="hover:text-purple-400 underline decoration-dotted">facebook/react</button>
        <button onClick={() => setUrl('https://github.com/torvalds/linux')} className="hover:text-purple-400 underline decoration-dotted">torvalds/linux</button>
      </div>
    </div>
  );
};
