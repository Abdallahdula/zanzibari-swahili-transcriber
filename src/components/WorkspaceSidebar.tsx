import React from "react";
import { 
  History, 
  Plus, 
  Trash2, 
  Sparkles, 
  FolderOpen, 
  CheckCircle,
  HelpCircle,
  MessageSquare,
  Languages,
  Moon,
  Sun
} from "lucide-react";
import { AppLanguage, AppTheme, MeetingSession } from "../types";

interface WorkspaceSidebarProps {
  sessions: MeetingSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onLoadSample: () => void;
  onOpenNewModal: () => void;
  language: AppLanguage;
  onLanguageChange: (language: AppLanguage) => void;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

const SIDEBAR_TEXT = {
  sw: {
    subtitle: "Kinukuu cha Kiswahili cha Zanzibar",
    newMeeting: "Sajili Kikao Kipya",
    loadSample: "Fungua Kikao cha Mfano",
    history: "Vikao Vilivyorekodiwa",
    emptyTitle: "Hakuna vikao bado",
    emptyBody: "Rekodi mazungumzo au pakia faili ya sauti ili kuanza.",
    deleteTitle: "Futa kikao hiki",
    language: "Lugha",
    theme: "Mwonekano",
    dark: "Giza",
    light: "Mwanga",
    infoTitle: "Lugha ya Kiswahili Zanzibar",
    infoBody: "Zanzibar (Mji Mkongwe/Unguja) ina Kiswahili cha kipekee (Kiunguja), chenye maneno ya Kiarabu na slang za kisasa."
  },
  en: {
    subtitle: "Zanzibari Swahili Transcriber",
    newMeeting: "New Meeting",
    loadSample: "Open Sample Meeting",
    history: "Recorded Meetings",
    emptyTitle: "No meetings yet",
    emptyBody: "Record a conversation or upload an audio file to begin.",
    deleteTitle: "Delete this meeting",
    language: "Language",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    infoTitle: "Zanzibari Swahili",
    infoBody: "Zanzibar (Stone Town/Unguja) has a distinct Swahili dialect with Arabic influence and modern local slang."
  }
} as const;

export default function WorkspaceSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onLoadSample,
  onOpenNewModal,
  language,
  onLanguageChange,
  theme,
  onThemeChange
}: WorkspaceSidebarProps) {
  const text = SIDEBAR_TEXT[language];

  return (
    <aside 
      id="workspace-sidebar"
      className="w-full lg:w-80 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col font-sans lg:h-screen lg:overflow-hidden"
    >
      {/* App brand banner */}
      <div className="p-6 border-b border-indigo-950 bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-1.5">
              <span>Mkalimani</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full">
                Zanzibar
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {text.subtitle}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{text.language}</span>
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/50 p-1">
            <Languages className="w-3.5 h-3.5 text-slate-500 ml-1" />
            {(["sw", "en"] as AppLanguage[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onLanguageChange(option)}
                className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                  language === option
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{text.theme}</span>
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/50 p-1">
            <button
              type="button"
              onClick={() => onThemeChange("dark")}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                theme === "dark"
                  ? "bg-amber-500 text-slate-950"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title={text.dark}
            >
              <Moon className="w-3 h-3" />
              <span>{text.dark}</span>
            </button>
            <button
              type="button"
              onClick={() => onThemeChange("light")}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                theme === "light"
                  ? "bg-amber-500 text-slate-950"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title={text.light}
            >
              <Sun className="w-3 h-3" />
              <span>{text.light}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="p-4 space-y-2">
        <button
          id="btn-new-meeting"
          onClick={onOpenNewModal}
          className="w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md shadow-amber-950/20 transition-all cursor-pointer border border-amber-400/20 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>{text.newMeeting}</span>
        </button>

        <button
          id="btn-load-sample"
          onClick={onLoadSample}
          className="w-full py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 transition-all border border-slate-700 cursor-pointer active:scale-[0.98]"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
          <span>{text.loadSample}</span>
        </button>
      </div>

      {/* History section */}
      <div className="flex-1 flex flex-col min-h-[220px]">
        <div className="px-5 py-3 flex items-center gap-2 border-b border-slate-800/60 font-medium text-xs text-slate-400 uppercase tracking-widest bg-slate-950/30">
          <History className="w-3.5 h-3.5" />
          <span>{text.history} ({sessions.length})</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-slate-950/20 max-h-[450px] lg:max-h-none">
          {sessions.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-55" />
              <p className="text-sm text-slate-500 font-medium">{text.emptyTitle}</p>
              <p className="text-xs text-slate-600 mt-1">
                {text.emptyBody}
              </p>
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  id={`session-item-${session.id}`}
                  className={`group relative flex items-center justify-between p-3 rounded-xl transition-all border cursor-pointer ${
                    isActive
                      ? "bg-slate-800 border-slate-700 ring-1 ring-amber-500/20"
                      : "bg-transparent border-transparent hover:bg-slate-800/40 hover:border-slate-800"
                  }`}
                  onClick={() => onSelectSession(session.id)}
                >
                  <div className="flex-1 min-w-0 pr-6">
                    <h3 className={`text-sm font-semibold truncate ${isActive ? 'text-amber-400' : 'text-slate-200'}`}>
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-slate-400 text-xs">
                      <span className="font-mono text-[11px] bg-slate-900 px-1.5 py-0.5 rounded text-amber-500/90">
                        {session.duration} min
                      </span>
                      <span>•</span>
                      <span>{session.date}</span>
                    </div>
                  </div>

                  <button
                    id={`btn-delete-${session.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="absolute right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 hover:text-rose-400 text-slate-500 transition-all cursor-pointer"
                    title={text.deleteTitle}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Info card footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-slate-400 text-xs">
        <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-900/30 flex gap-2.5">
          <HelpCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="space-y-1 font-sans">
            <h4 className="font-semibold text-slate-300">{text.infoTitle}</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {text.infoBody}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
