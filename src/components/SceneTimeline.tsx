import React from "react";
import { VideoScene } from "../types/scene";
import { Edit3, Clock, Image as ImageIcon, Sparkles, PhoneCall } from "lucide-react";

interface SceneTimelineProps {
  scenes: VideoScene[];
  currentSceneIndex: number;
  onSelectScene: (index: number) => void;
  onEditScene: (scene: VideoScene) => void;
  currentTime: number;
  totalDuration: number;
}

export const SceneTimeline: React.FC<SceneTimelineProps> = ({
  scenes,
  currentSceneIndex,
  onSelectScene,
  onEditScene,
  currentTime,
  totalDuration,
}) => {
  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span className="font-bold flex items-center gap-1.5 text-white">
          <Clock className="w-3.5 h-3.5 text-rose-400" />
          شريط المشاهد والجدول الزمني للإعلان (5 مشاهد متكاملة)
        </span>
        <span className="font-mono text-slate-400">
          المشهد {currentSceneIndex + 1} من {scenes.length} • {Math.round(currentTime)} ث / {Math.round(totalDuration)} ث
        </span>
      </div>

      {/* Scenes Timeline Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {scenes.map((scene, idx) => {
          const isActive = idx === currentSceneIndex;
          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(idx)}
              className={`group relative rounded-xl border p-2.5 cursor-pointer transition-all flex flex-col justify-between overflow-hidden ${
                isActive
                  ? "bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30 shadow-lg shadow-rose-950/60"
                  : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600"
              }`}
            >
              {/* Scene Badge & Order */}
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${
                    isActive ? "bg-rose-500 text-white" : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {idx + 1}
                </span>

                <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded">
                  {scene.duration} ث
                </span>
              </div>

              {/* Image Preview Thumbnail */}
              <div className="relative w-full h-20 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 mb-2">
                <img
                  src={scene.imageSrc}
                  alt={scene.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {scene.id === "scene-3" && (
                  <div className="absolute top-1 left-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow">
                    خصم 90%
                  </div>
                )}
                {scene.id === "scene-5" && (
                  <div className="absolute top-1 left-1 bg-emerald-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                    <PhoneCall className="w-2.5 h-2.5" />
                    حجز
                  </div>
                )}
              </div>

              {/* Scene Info */}
              <div className="space-y-1">
                <div className="font-bold text-xs text-white line-clamp-1">{scene.title}</div>
                <div className="text-[10px] text-slate-400 line-clamp-1">{scene.subheadline}</div>
              </div>

              {/* Edit button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditScene(scene);
                }}
                className="mt-2 text-[10px] py-1 px-2 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1 font-medium border border-slate-700"
              >
                <Edit3 className="w-3 h-3" />
                تعديل النص
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
