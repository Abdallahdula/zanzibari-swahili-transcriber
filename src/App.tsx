import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  HelpCircle, 
  Sparkles, 
  Volume2, 
  Layout, 
  ListTodo, 
  Compass, 
  Wrench,
  AlertTriangle,
  FolderOpen,
  Plus,
  Compass as CompassIcon,
  X,
  Radio,
  BookOpen,
  MessageSquare,
  Languages
} from "lucide-react";
import WorkspaceSidebar from "./components/WorkspaceSidebar";
import AudioTools from "./components/AudioTools";
import InteractiveTranscript from "./components/InteractiveTranscript";
import MeetingMinutes from "./components/MeetingMinutes";
import DialectGlossary from "./components/DialectGlossary";
import { SAMPLE_MEETINGS } from "./data/samples";
import { MeetingSession, DialogueTurn, ActionItem, AppLanguage, AppTheme, AudioPreview } from "./types";
import { normalizeTranscriptText } from "./utils/transcript";

const UI_TEXT = {
  sw: {
    chooseTitle: "Chagua lugha ya programu",
    chooseBody: "Uandishi wa sauti utaendelea kubaki kwa Kiswahili. Chaguo hili linabadilisha maandishi ya menyu na vitufe tu.",
    swahili: "Kiswahili",
    english: "English",
    selectedMeeting: "Kikao Kilichochaguliwa",
    officialSample: "Mfano Rasmi (Sample)",
    transcriptTab: "Mazungumzo",
    minutesTab: "Nyaraka na Kazi",
    glossaryTab: "Kamusi ya Misemo",
    welcomeTitle: "Karibu Kwenye Mkalimani wa Zanzibar!",
    welcomeBody: "Mfumo wa kisasa wa kutafrisi na kudurusu sauti za mikutano asilia kwa lugha ya Kiswahili visiwani (Kiunguja).",
    loadSample: "Fungua Data ya Mfano",
    newMeeting: "Kikao Kipya",
    micFeature: "Kipaza Sauti na Mifumo",
    micFeatureBody: "Rekodi moja kwa moja au pakia faili la sauti hadi 100MB.",
    glossaryFeature: "Misemo na Maneno ya Kamusi",
    glossaryFeatureBody: "Mfumo hutambua misemo ya Kiunguja na kuiweka kwenye kamusi maalum.",
    modalBadge: "Kikao Kipya Zanzibar",
    modalTitle: "Usajili na Uandishi wa Sauti Mpya",
    modalBody: "Rekodi mazungumzo moja kwa moja hapa, au pakia faili lililorekodiwa huko nyuma.",
    close: "Funga",
    errorTitle: "Hitilafu Imepatikana!",
    apiHelpTitle: "Hatua za kurekebisha ufunguo:",
    apiHelp1: "Tengeneza Gemini API key Google AI Studio.",
    apiHelp2: "Weka key yako kwenye faili .env.local kama GEMINI_API_KEY.",
    apiHelp3: "Anzisha upya app kisha jaribu tena.",
    apiHelpTip: "Kidokezo: Unaweza kufungua Kikao cha Mfano kabla hujaweka ufunguo.",
    readSample: "Nisomee Data ya Mfano",
    cancel: "Ghairi",
    tooLarge: "Faili la sauti ni kubwa sana kupokelewa na seva (max 100MB). Tafadhali libane/compress kwanza kisha upakie tena.",
    genericFail: "Mchakato wa kutafsiri umefeli. Tafadhali jaribu tena.",
    apiFail: "Imefeli kuchakata audio. Hakikisha GEMINI_API_KEY ipo kwenye .env.local au jaribu tena.",
    defaultContext: "Hakuna muktadha ulioongezwa"
  },
  en: {
    chooseTitle: "Choose app language",
    chooseBody: "The transcription will remain in Swahili. This only changes the app menus, labels, and helper text.",
    swahili: "Kiswahili",
    english: "English",
    selectedMeeting: "Selected Meeting",
    officialSample: "Official Sample",
    transcriptTab: "Transcript",
    minutesTab: "Minutes & Tasks",
    glossaryTab: "Dialect Glossary",
    welcomeTitle: "Welcome to Mkalimani Zanzibar",
    welcomeBody: "A meeting audio transcriber for Zanzibari Swahili (Kiunguja), with summaries, action items, and dialect notes.",
    loadSample: "Open Sample Data",
    newMeeting: "New Meeting",
    micFeature: "Microphone and Uploads",
    micFeatureBody: "Record directly or upload an audio file up to 100MB.",
    glossaryFeature: "Dialect Terms",
    glossaryFeatureBody: "The app detects Kiunguja expressions and keeps them in a dedicated glossary.",
    modalBadge: "New Zanzibar Meeting",
    modalTitle: "Register and Transcribe New Audio",
    modalBody: "Record a conversation here, or upload a previously recorded audio file.",
    close: "Close",
    errorTitle: "Something Went Wrong",
    apiHelpTitle: "How to fix the key:",
    apiHelp1: "Create a Gemini API key in Google AI Studio.",
    apiHelp2: "Put the key in .env.local as GEMINI_API_KEY.",
    apiHelp3: "Restart the app, then try again.",
    apiHelpTip: "Tip: You can open the sample meeting before adding the key.",
    readSample: "Open Sample Data",
    cancel: "Cancel",
    tooLarge: "The audio file is too large for the server (max 100MB). Please compress it first, then upload again.",
    genericFail: "Transcription failed. Please try again.",
    apiFail: "Audio processing failed. Make sure GEMINI_API_KEY exists in .env.local, then try again.",
    defaultContext: "No context added"
  }
} as const;

export default function App() {
  // Session list loaded from localstorage or preloaded sample
  const [sessions, setSessions] = useState<MeetingSession[]>(() => {
    const saved = localStorage.getItem("zanzibar_transcripts");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error("Failed to parse saved sessions from localStorage:", err);
      }
    }
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    const savedActive = localStorage.getItem("zanzibar_active_session_id");
    return savedActive || null;
  });

  const [activeTab, setActiveTab] = useState<"transcript" | "minutes" | "glossary">("transcript");
  const [isProcessing, setIsProcessing] = useState(false);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioPreviews, setAudioPreviews] = useState<Record<string, AudioPreview>>({});
  const audioPreviewsRef = useRef<Record<string, AudioPreview>>({});
  const [appLanguage, setAppLanguage] = useState<AppLanguage | null>(() => {
    const saved = localStorage.getItem("zanzibar_app_language");
    return saved === "sw" || saved === "en" ? saved : null;
  });
  const [appTheme, setAppTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem("zanzibar_app_theme");
    return saved === "light" || saved === "dark" ? saved : "dark";
  });

  const language = appLanguage || "sw";
  const text = UI_TEXT[language];

  const handleSetLanguage = (nextLanguage: AppLanguage) => {
    setAppLanguage(nextLanguage);
    localStorage.setItem("zanzibar_app_language", nextLanguage);
  };

  const handleSetTheme = (nextTheme: AppTheme) => {
    setAppTheme(nextTheme);
    localStorage.setItem("zanzibar_app_theme", nextTheme);
  };

  // Sync state to localStorage on modification
  useEffect(() => {
    localStorage.setItem("zanzibar_transcripts", JSON.stringify(sessions));
    if (sessions.length > 0 && !activeSessionId) {
      const firstId = sessions[0].id;
      setActiveSessionId(firstId);
      localStorage.setItem("zanzibar_active_session_id", firstId);
    }
  }, [sessions]);

  useEffect(() => {
    audioPreviewsRef.current = audioPreviews;
  }, [audioPreviews]);

  useEffect(() => {
    return () => {
      Object.values(audioPreviewsRef.current as Record<string, AudioPreview>).forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, []);

  // Set active session sync helper
  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    localStorage.setItem("zanzibar_active_session_id", id);
    setErrorMessage(null); // clear errors
  };

  const handleOpenNewModal = () => {
    setNewModalOpen(true);
    setErrorMessage(null);
  };

  const handleCloseNewModal = () => {
    if (!isProcessing) {
      setNewModalOpen(false);
    }
  };

  // Delete a session from local log
  const handleDeleteSession = (id: string) => {
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    setAudioPreviews((current) => {
      const preview = current[id];
      if (preview) {
        URL.revokeObjectURL(preview.url);
      }
      const { [id]: _removed, ...remaining } = current;
      return remaining;
    });
    
    if (activeSessionId === id) {
      const nextActiveId = filtered.length > 0 ? filtered[0].id : null;
      setActiveSessionId(nextActiveId);
      if (nextActiveId) {
        localStorage.setItem("zanzibar_active_session_id", nextActiveId);
      } else {
        localStorage.removeItem("zanzibar_active_session_id");
      }
    }
  };

  // Pre-load our rich, pre-baked Zanzibarian Swahili sample meeting
  const handleLoadSample = () => {
    const sample = SAMPLE_MEETINGS[0];
    // Check if sample already loaded to avoid duplicates
    if (!sessions.some((s) => s.id === sample.id)) {
      setSessions([sample, ...sessions]);
    }
    handleSelectSession(sample.id);
    setNewModalOpen(false);
    setErrorMessage(null);
  };

  // Handle API transcribing request toward server.ts
  const handleTranscribeAudio = async (
    audioBase64: string,
    fileName: string,
    mimeType: string,
    context: string,
    preferredTitle?: string,
    audioPreview?: AudioPreview
  ) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          audioData: audioBase64,
          fileName,
          mimeType,
          meetingContext: context
        })
      });

      let data: any;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textError = await response.text();
        if (response.status === 413 || textError.toLowerCase().includes("too large")) {
          throw new Error(text.tooLarge);
        }
        throw new Error(`Mchakato wa kutafsiri umefeli (Status ${response.status}). Tafadhali hakikisha kuwa Secrets panel ina ufunguo thabiti wa GEMINI_API_KEY au jaribu kutumia faili fupi zaidi.`);
      }

      if (!response.ok) {
        throw new Error(data.error || text.genericFail);
      }

      // Structure newly responded session
      const newSessionId = `session-${Date.now()}`;
      const newSession: MeetingSession = {
        id: newSessionId,
        title: preferredTitle || data.title || `Kikao cha ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString().split("T")[0],
        duration: data.duration || "N/A",
        context: context || text.defaultContext,
        summary: data.summary,
        // map unique dialogue turn IDs for inline edits
        transcript: data.transcript.map((turn: any, index: number) => ({
          id: `turn-${Date.now()}-${index}`,
          speaker: turn.speaker,
          text: normalizeTranscriptText(turn.text),
          timestamp: turn.timestamp
        })),
        dialectGloss: data.dialectGloss
      };

      setSessions([newSession, ...sessions]);
      if (audioPreview) {
        setAudioPreviews((current) => ({
          ...current,
          [newSessionId]: audioPreview
        }));
      }
      handleSelectSession(newSession.id);
      setNewModalOpen(false);

    } catch (err: any) {
      console.error("Transcribing API failed:", err);
      if (audioPreview) {
        URL.revokeObjectURL(audioPreview.url);
      }
      setErrorMessage(
        err.message || 
        text.apiFail
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Update meeting action items in-place (checkpoint checkboxes)
  const handleUpdateActionItems = (updatedActionItems: ActionItem[]) => {
    const updatedSessions = sessions.map((s) => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          summary: {
            ...s.summary,
            actionItems: updatedActionItems
          }
        };
      }
      return s;
    });
    setSessions(updatedSessions);
  };

  // Edit transcript Turn speaker name or transcript dialogue text directly inline
  const handleSaveTurn = (turnId: string, updatedSpeaker: string, updatedText: string) => {
    const updatedSessions = sessions.map((s) => {
      if (s.id === activeSessionId) {
        const updatedTranscript = s.transcript.map((turn) => {
          if (turn.id === turnId) {
            return {
              ...turn,
              speaker: updatedSpeaker,
              text: normalizeTranscriptText(updatedText)
            };
          }
          return turn;
        });
        return {
          ...s,
          transcript: updatedTranscript
        };
      }
      return s;
    });
    setSessions(updatedSessions);
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  if (!appLanguage) {
    return (
      <div className={`theme-${appTheme} min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex items-center justify-center p-4`}>
        <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <Languages className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-100 font-display">
                Choose app language
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Chagua lugha ya programu. The transcription will remain in Swahili; this only changes the interface.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
            <button
              type="button"
              onClick={() => handleSetLanguage("sw")}
              className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-left hover:bg-amber-500/15 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="block text-base font-bold text-amber-300">Kiswahili</span>
              <span className="block text-xs text-slate-400 mt-1">Menyu na maelekezo kwa Kiswahili.</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetLanguage("en")}
              className="p-4 rounded-xl border border-slate-700 bg-slate-950/50 text-left hover:bg-slate-800/70 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="block text-base font-bold text-slate-100">English</span>
              <span className="block text-xs text-slate-400 mt-1">Menus and guidance in English.</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="mkalimani-app" className={`theme-${appTheme} flex flex-col lg:flex-row min-h-screen lg:h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden lg:overflow-hidden`}>
      
      {/* Side orchestration manager panel */}
      <WorkspaceSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onLoadSample={handleLoadSample}
        onOpenNewModal={handleOpenNewModal}
        language={language}
        onLanguageChange={handleSetLanguage}
        theme={appTheme}
        onThemeChange={handleSetTheme}
      />

      {/* Main interactive area */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full lg:h-screen lg:overflow-y-auto">
        
        {/* Active workspace view */}
        {activeSession ? (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* Top Workspace Bar */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-900 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 font-mono">
                    {text.selectedMeeting}
                  </span>
                  {activeSession.id === "zanzibar-tourism-coop" && (
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 font-mono">
                      {text.officialSample}
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-100 font-display">
                  {activeSession.title}
                </h2>
                {activeSession.context && (
                  <p className="text-xs text-slate-400 leading-normal max-w-2xl font-sans">
                    {activeSession.context}
                  </p>
                )}
              </div>
            </div>

            {/* Tab navigation bars */}
            <div className="flex border-b border-slate-900 gap-1 overflow-x-auto pb-px">
              <button
                id="tab-trigger-transcript"
                onClick={() => setActiveTab("transcript")}
                className={`flex items-center gap-2 py-3 px-5 border-b-2 font-semibold text-xs sm:text-sm uppercase tracking-wide transition-all cursor-pointer select-none whitespace-nowrap outline-none ${
                  activeTab === "transcript"
                    ? "border-amber-500 text-amber-400 bg-amber-500/5"
                    : "border-transparent text-slate-400 hover:text-slate-350 hover:bg-slate-900/40"
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>{text.transcriptTab}</span>
              </button>

              <button
                id="tab-trigger-minutes"
                onClick={() => setActiveTab("minutes")}
                className={`flex items-center gap-2 py-3 px-5 border-b-2 font-semibold text-xs sm:text-sm uppercase tracking-wide transition-all cursor-pointer select-none whitespace-nowrap outline-none ${
                  activeTab === "minutes"
                    ? "border-amber-500 text-amber-400 bg-amber-500/5"
                    : "border-transparent text-slate-400 hover:text-slate-350 hover:bg-slate-900/40"
                }`}
              >
                <ListTodo className="w-4 h-4 shrink-0" />
                <span>{text.minutesTab}</span>
              </button>

              <button
                id="tab-trigger-glossary"
                onClick={() => setActiveTab("glossary")}
                className={`flex items-center gap-2 py-3 px-5 border-b-2 font-semibold text-xs sm:text-sm uppercase tracking-wide transition-all cursor-pointer select-none whitespace-nowrap outline-none ${
                  activeTab === "glossary"
                    ? "border-amber-500 text-amber-400 bg-amber-500/5"
                    : "border-transparent text-slate-400 hover:text-slate-350 hover:bg-slate-900/40"
                }`}
              >
                <Compass className="w-4 h-4 shrink-0" />
                <span>{text.glossaryTab}</span>
              </button>
            </div>

            {/* Selected segment contents */}
            <div className="bg-slate-950 rounded-2xl min-h-[360px]">
              {activeTab === "transcript" && (
                <InteractiveTranscript
                  transcript={activeSession.transcript}
                  glossary={activeSession.dialectGloss}
                  audioPreview={audioPreviews[activeSession.id]}
                  sessionTitle={activeSession.title}
                  onSaveTurn={handleSaveTurn}
                />
              )}

              {activeTab === "minutes" && (
                <MeetingMinutes
                  session={activeSession}
                  onUpdateActionItems={handleUpdateActionItems}
                />
              )}

              {activeTab === "glossary" && (
                <DialectGlossary glossary={activeSession.dialectGloss} />
              )}
            </div>

          </div>
        ) : (
          /* Empty onboarding state */
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl flex flex-col items-center justify-center text-center self-center max-w-2xl mx-auto my-6 lg:my-auto space-y-5 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-36 h-36 bg-amber-500/5 rounded-full blur-3xl -z-10" />
            
            <div className="p-4 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-400">
              <CompassIcon className="w-12 h-12 text-amber-500 animate-spin" style={{ animationDuration: "16s" }} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 font-display">
                {text.welcomeTitle}
              </h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed font-sans">
                {text.welcomeBody}
              </p>
            </div>

            {/* Empty onboarding quick buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm pt-4">
              <button
                id="btn-onboarding-sample"
                onClick={handleLoadSample}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold gap-2 flex items-center justify-center bg-slate-850 hover:bg-slate-800 text-slate-200 transition-colors border border-slate-800 cursor-pointer active:scale-95"
              >
                <FolderOpen className="w-4 h-4 text-amber-500" />
                <span>{text.loadSample}</span>
              </button>

              <button
                id="btn-onboarding-new"
                onClick={handleOpenNewModal}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold gap-2 flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 transition-colors cursor-pointer border border-amber-400/20 active:scale-95 shadow-lg shadow-amber-950/20"
              >
                <Plus className="w-4 h-4 font-black" />
                <span>{text.newMeeting}</span>
              </button>
            </div>

            {/* Quick specifications / instructions list */}
            <div className="pt-6 border-t border-slate-850 w-full mt-4 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-400 font-sans">
              <div className="space-y-1">
                <span className="font-bold text-slate-200 text-xs block">{text.micFeature}</span>
                <p className="text-[11px] leading-normal leading-slate-400 text-slate-400">
                  {text.micFeatureBody}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-200 text-xs block">{text.glossaryFeature}</span>
                <p className="text-[11px] leading-normal leading-slate-400 text-slate-400">
                  {text.glossaryFeatureBody}
                </p>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* New Meeting Setup Overlay Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200">
          <div 
            id="new-meeting-modal"
            className="bg-slate-900 border border-slate-850 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
          >
            {/* Modal close button */}
            {!isProcessing && (
              <button
                id="btn-close-modal"
                onClick={handleCloseNewModal}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                title={text.close}
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Modal Heading banner */}
            <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-850 shrink-0">
              <span className="text-[9px] font-mono font-bold tracking-widest text-amber-500 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                {text.modalBadge}
              </span>
              <h3 className="text-lg font-bold text-slate-100 font-display mt-2 flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-500 animate-pulse" />
                <span>{text.modalTitle}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {text.modalBody}
              </p>
            </div>

            {/* Error alerts inside the modal */}
            {errorMessage && (
              <div className="m-6 p-4 bg-rose-950/30 border border-rose-500/30 rounded-xl flex gap-3 text-slate-300">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs sm:text-sm">
                  <span className="font-bold text-rose-400">{text.errorTitle}</span>
                  <p className="text-xs text-slate-400 leading-normal leading-slate-400 mt-1 font-sans">{errorMessage}</p>
                  
                  {/* Assistive instructions if they lack an API KEY */}
                  {errorMessage.includes("GEMINI_API_KEY") && (
                    <div className="mt-3 p-2.5 bg-slate-950/50 rounded-lg border border-slate-850 text-[11px] text-slate-400 font-sans space-y-1.5 lines leading-relaxed">
                      <p className="font-semibold text-slate-300">
                        {text.apiHelpTitle}
                      </p>
                      <ol className="list-decimal list-inside space-y-1 pl-1">
                        <li>{text.apiHelp1}</li>
                        <li>{text.apiHelp2}</li>
                        <li>{text.apiHelp3}</li>
                      </ol>
                      <p className="text-amber-500/80 font-medium">
                        {text.apiHelpTip}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sub-components container */}
            <div className="p-4 sm:p-6 overflow-y-auto">
              <AudioTools
                onTranscribe={handleTranscribeAudio}
                isProcessing={isProcessing}
                language={language}
              />
            </div>
            
            {/* Modal foot actions */}
            {!isProcessing && (
              <div className="p-4 bg-slate-950/40 border-t border-slate-850 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between px-4 sm:px-6 shrink-0">
                <button
                  id="btn-modal-sample"
                  onClick={handleLoadSample}
                  className="py-2 px-4 rounded-xl text-xs font-semibold text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>{text.readSample}</span>
                </button>

                <button
                  id="btn-modal-cancel"
                  onClick={handleCloseNewModal}
                  className="py-2 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800/65 cursor-pointer active:scale-95 transition-all"
                >
                  {text.cancel}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
