import React, { useEffect, useState } from 'react';
import { AnalysisResult, AppState } from '../types';
import { Terminal, Image as ImageIcon, Sparkles, Loader2, Music, Clapperboard, Hash, GitCommit } from 'lucide-react';

interface AnalysisViewProps {
  result: AnalysisResult | null;
  appState: AppState;
}

const LOADING_MESSAGES = [
  "Reading the receipts 🧾...",
  "Judging your variable names 🤨...",
  "Asking Gemini for the tea ☕...",
  "Manifesting meme potential ✨...",
  "Compiling vibes 💿...",
  "It's giving spaghetti code 🍝..."
];

export const AnalysisView: React.FC<AnalysisViewProps> = ({ result, appState }) => {
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const isLoading = appState !== AppState.IDLE && appState !== AppState.COMPLETE && appState !== AppState.ERROR;

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Loading Screen
  if (isLoading && !result) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-16 p-8 border-2 border-black bg-white brutalist-shadow text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-100 via-white to-white opacity-50"></div>
        <Loader2 className="w-16 h-16 text-black animate-spin mx-auto mb-6" />
        <h3 className="text-3xl font-black italic uppercase text-black mb-2">{loadingMsg}</h3>
        <p className="text-gray-500 font-mono text-sm font-bold">HOLD TIGHT BESTIE</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 animate-[slideUp_0.5s_ease-out]">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Script Summary */}
        <div className="bg-white border-2 border-black p-8 brutalist-shadow relative group hover:translate-x-[2px] hover:translate-y-[2px] transition-transform">
          <div className="absolute -top-3 -right-3 bg-[#ccff00] border-2 border-black text-black px-4 py-1 font-black transform rotate-2 shadow-[2px_2px_0_#000]">
            THE PLOT
          </div>
          <div className="flex items-center gap-3 mb-4 text-purple-600">
            <Terminal className="w-6 h-6" />
            <h3 className="font-mono font-bold uppercase tracking-widest text-lg">TL;DR</h3>
          </div>
          <p className="text-xl font-bold leading-relaxed text-black">
            "{result.summary}"
          </p>
        </div>

        {/* Commits List (The Receipts) */}
        {result.commits && result.commits.length > 0 && (
          <div className="bg-white border-2 border-black p-6 brutalist-shadow-purple relative max-h-[300px] overflow-y-auto">
            <div className="absolute -top-3 -left-3 bg-black text-white px-4 py-1 font-black transform -rotate-1 shadow-[2px_2px_0_#ccff00] z-10">
              THE RECEIPTS 🧾
            </div>
            <div className="flex items-center gap-3 mb-4 mt-2 text-black sticky top-0 bg-white z-0">
              <GitCommit className="w-6 h-6" />
              <h3 className="font-mono font-bold uppercase tracking-widest text-lg">Git Log</h3>
            </div>
            <div className="space-y-4 font-mono text-sm">
              {result.commits.map((commit, i) => (
                <div key={i} className="border-l-2 border-black pl-3 hover:border-[#ccff00] transition-colors">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <span className="font-bold text-black text-base">"{commit.message}"</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-xs bg-gray-100 px-2 py-0.5 border border-black inline-block font-bold">
                       {commit.author}
                    </div>
                    <span className="text-xs text-gray-500 font-bold">{commit.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progress / Status during generation */}
      {isLoading && (
        <div className="flex flex-col md:flex-row gap-4 mb-12">
           <div className={`flex-1 p-4 border-2 flex items-center gap-4 transition-all ${appState === AppState.GENERATING_ASSETS ? 'bg-[#ccff00] border-black text-black shadow-[4px_4px_0_#000]' : 'bg-white border-black text-gray-400'}`}>
              <ImageIcon className={`w-6 h-6 ${appState === AppState.GENERATING_ASSETS ? 'animate-bounce' : ''}`} />
              <span className="font-black uppercase tracking-wider">Cooking Memes</span>
           </div>
           <div className={`flex-1 p-4 border-2 flex items-center gap-4 transition-all ${appState === AppState.GENERATING_ASSETS ? 'bg-[#ff00ff] border-black text-white shadow-[4px_4px_0_#000]' : 'bg-white border-black text-gray-400'}`}>
              <Music className={`w-6 h-6 ${appState === AppState.GENERATING_ASSETS ? 'animate-pulse' : ''}`} />
              <span className="font-black uppercase tracking-wider">Spitting Bars</span>
           </div>
           <div className={`flex-1 p-4 border-2 flex items-center gap-4 transition-all ${appState === AppState.RENDERING ? 'bg-cyan-400 border-black text-black shadow-[4px_4px_0_#000]' : 'bg-white border-black text-gray-400'}`}>
              <Clapperboard className={`w-6 h-6 ${appState === AppState.RENDERING ? 'animate-spin' : ''}`} />
              <span className="font-black uppercase tracking-wider">Makin' Movie</span>
           </div>
        </div>
      )}

      {/* Scenes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {result.scenes.map((scene, i) => (
          <div key={i} className="group bg-white border-2 border-black p-4 transition-all hover:-translate-y-2 hover:shadow-[8px_8px_0_#000] duration-300">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black bg-black text-white px-2 py-1 uppercase tracking-widest">Scene 0{i + 1}</span>
              <Hash className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="aspect-video bg-gray-100 border-2 border-black mb-4 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-90 transition-opacity flex items-center justify-center p-4 z-20">
                 <p className="text-center text-black text-xs font-bold italic">
                   "{scene.visualPrompt}"
                 </p>
               </div>
               <div className="text-gray-300 font-black text-4xl select-none z-0">?</div>
            </div>

            <div className="bg-black p-3 border-2 border-black transform -rotate-1">
              <p className="text-white font-impact uppercase text-lg leading-none tracking-wide text-center">
                {scene.caption}
              </p>
            </div>
            
            <p className="mt-4 text-sm text-gray-700 font-mono leading-relaxed border-t-2 border-gray-100 pt-2 font-medium">
              {scene.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
