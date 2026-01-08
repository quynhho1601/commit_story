import React from 'react';
import { Download, Video, Info } from 'lucide-react';

interface VideoResultProps {
  mediaUrl: string | null;
}

export const VideoResult: React.FC<VideoResultProps> = ({ mediaUrl }) => {
  if (!mediaUrl) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-16 animate-[slideUp_0.5s_ease-out]">
      <div className="bg-gradient-to-b from-purple-900/20 to-black p-1 rounded-2xl border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
        <div className="relative group rounded-xl overflow-hidden bg-black aspect-video">
           <video 
             controls 
             autoPlay 
             className="w-full h-full object-contain"
             src={mediaUrl}
           >
             Your browser does not support the video tag.
           </video>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4 px-2">
        <div className="flex items-center gap-2 text-slate-500 text-xs">
           <Info className="w-4 h-4" />
           <p>Generated entirely in-browser using Canvas & Web Audio.</p>
        </div>
        
        <a 
          href={mediaUrl} 
          download="commit-story-meme.webm"
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-bold shadow-lg shadow-purple-900/40 transition-all hover:scale-105"
        >
          <Download className="w-5 h-5" />
          Download .webm Video
        </a>
      </div>
    </div>
  );
};
