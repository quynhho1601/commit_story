import React, { useState } from 'react';
import { InputSection } from './components/InputSection';
import { AnalysisView } from './components/AnalysisView';
import { VideoResult } from './components/VideoResult';
import { analyzeRepo, generateMemeImages, generateNarration } from './services/geminiService';
import { renderVideo } from './services/videoGenerator';
import { AppState, AnalysisResult } from './types';
import { Activity, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (url: string) => {
    setError(null);
    setAppState(AppState.ANALYZING);
    setAnalysisResult(null);
    setMediaUrl(null);

    try {
      // 1. Analyze
      console.log("Analyzing...");
      const result = await analyzeRepo(url);
      setAnalysisResult(result);

      // 2. Assets
      setAppState(AppState.GENERATING_ASSETS);
      
      // Execute parallel generation
      console.log("Generating assets...");
      const [images, audio] = await Promise.all([
        generateMemeImages(result.scenes.map(s => s.visualPrompt)),
        generateNarration(result.script)
      ]);

      if (images.length === 0) throw new Error("Failed to generate images.");

      // 3. Render
      setAppState(AppState.RENDERING);
      console.log("Rendering video...");
      const videoUrl = await renderVideo({
        images,
        audio,
        captions: result.scenes.map(s => s.caption)
      });

      setMediaUrl(videoUrl);
      setAppState(AppState.COMPLETE);

    } catch (err: any) {
      console.error("Workflow error:", err);
      setError(err.message || "An unexpected error occurred.");
      setAppState(AppState.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center font-sans">
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }}></div>

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto pt-12 pb-8 px-6 text-center z-10 relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/20">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-pink-200">
            CommitStory
          </h1>
        </div>
        <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
          The <span className="text-purple-400 font-bold">Meme Generator</span> for your Codebase.
          <br/>
          We analyze your commits and use Gemini to build a narrated video story automatically.
        </p>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-6xl px-4 pb-20 z-10 relative flex-1">
        
        <InputSection onAnalyze={handleAnalyze} appState={appState} />

        {error && (
          <div className="max-w-2xl mx-auto mt-6 p-4 bg-red-900/20 border border-red-800/50 rounded-lg flex items-center gap-3 text-red-200 animate-[fadeIn_0.3s]">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <AnalysisView result={analysisResult} appState={appState} />
        
        <VideoResult mediaUrl={mediaUrl} />

      </main>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-slate-800 bg-slate-900/50 text-center text-slate-500 text-sm z-10 relative">
        <div className="flex items-center justify-center gap-2">
           <Sparkles className="w-4 h-4" />
           <span>Powered by Google Gemini 2.5 Flash (Images & Audio)</span>
        </div>
      </footer>
    </div>
  );
}
