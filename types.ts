export interface Scene {
  description: string;
  visualPrompt: string;
  caption: string;
}

export interface CommitInfo {
  message: string;
  author: string;
  date: string;
}

export interface AnalysisResult {
  script: string;
  scenes: Scene[];
  summary: string;
  commits: CommitInfo[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_ASSETS = 'GENERATING_ASSETS',
  RENDERING = 'RENDERING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export type GenerationType = 'meme-story';

export interface VideoAsset {
  images: string[]; // Base64 strings
  audio: AudioBuffer; // Decoded audio
  captions: string[];
}
