import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  Copy, 
  Download, 
  Edit3, 
  Save, 
  X, 
  Check, 
  User2, 
  Volume2, 
  Info,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { DialogueTurn, DialectGlossItem } from "../types";

interface InteractiveTranscriptProps {
  transcript: DialogueTurn[];
  glossary: DialectGlossItem[];
  onSaveTurn: (id: string, updatedSpeaker: string, updatedText: string) => void;
}

export default function InteractiveTranscript({
  transcript,
  glossary,
  onSaveTurn
}: InteractiveTranscriptProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSpeaker, setEditSpeaker] = useState("");
  const [editText, setEditText] = useState("");
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [activeSlangTooltip, setActiveSlangTooltip] = useState<string | null>(null);

  // Filter dialogue turns based on search keyword
  const filteredTranscript = transcript.filter((turn) => {
    return (
      turn.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turn.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Assign distinct aesthetic color hashes to individual speakers
  const getSpeakerColorClasses = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      { bg: "bg-teal-500/10 text-teal-400 border-teal-500/20", ring: "ring-teal-500/10" },
      { bg: "bg-amber-500/10 text-amber-400 border-amber-500/20", ring: "ring-amber-500/10" },
      { bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", ring: "ring-indigo-500/10" },
      { bg: "bg-rose-500/10 text-rose-400 border-rose-500/20", ring: "ring-rose-500/10" },
      { bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", ring: "ring-emerald-500/10" },
    ];
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const startEditing = (turn: DialogueTurn) => {
    setEditingId(turn.id);
    setEditSpeaker(turn.speaker);
    setEditText(turn.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    if (!editSpeaker.trim() || !editText.trim()) return;
    onSaveTurn(id, editSpeaker.trim(), editText.trim());
    setEditingId(null);
  };

  // Export functions
  const handleCopyTranscript = () => {
    const textToCopy = transcript
      .map((turn) => `[${turn.timestamp}] ${turn.speaker}: ${turn.text}`)
      .join("\n");
    navigator.clipboard.writeText(textToCopy);
    setShowCopyNotification(true);
    setTimeout(() => setShowCopyNotification(false), 2500);
  };

  const handleDownloadTxt = () => {
    const textBlob = transcript
      .map((turn) => `[${turn.timestamp}] ${turn.speaker}: ${turn.text}`)
      .join("\n");
    const blob = new Blob([textBlob], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ranskripti_kikao_zanzibar.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Check if a piece of text contains any of the known Zanzibari slang terms,
  // and render clickable highlighted buttons for them in line
  const renderTextWithSlangHighlights = (text: string) => {
    if (glossary.length === 0) return text;

    // Create a regex to match slang terms (case-insensitive)
    const sortedSlangWords = [...glossary].sort((a, b) => b.word.length - a.word.length);
    const regexParts = sortedSlangWords.map((item) => {
      // Escape special characters in the slang, if any
      return item.word.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    });
    
    if (regexParts.length === 0) return text;
    
    const regex = new RegExp(`\\b(${regexParts.join("|")})\\b`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const match = sortedSlangWords.find(
        (item) => item.word.toLowerCase() === part.toLowerCase()
      );
      if (match) {
        return (
          <span key={index} className="relative inline-block group">
            <button
              onClick={() => {
                setActiveSlangTooltip(activeSlangTooltip === match.word ? null : match.word);
              }}
              className="px-1.5 py-0.5 my-0.5 rounded-md font-bold text-xs bg-amber-500/10 text-amber-400 hover:bg-amber-500/25 border border-amber-500/20 shadow-sm cursor-pointer transition-colors inline-flex items-center gap-1 active:scale-95 select-none"
              title={`Msemo: ${match.word}. Gusa kuona tafsiri.`}
            >
              <span>{part}</span>
              <Volume2 className="w-2.5 h-2.5 shrink-0" />
            </button>

            {/* Quick-gloss floating translation popover tooltip */}
            {activeSlangTooltip === match.word && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl shadow-black z-20 text-xs animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-1.5 border-b border-slate-900 pb-1.5">
                  <span className="font-bold text-amber-400">{match.word}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlangTooltip(null);
                    }}
                    className="p-0.5 text-slate-500 hover:text-slate-300 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1.5 text-slate-300 font-sans">
                  <p><strong className="text-slate-400">Kiswahili:</strong> {match.meaningSwahili}</p>
                  <p><strong className="text-slate-400">English:</strong> {match.meaningEnglish}</p>
                  <p className="text-[11px] text-slate-400 italic line-clamp-2 mt-1 border-l border-amber-500/40 pl-1.5">{match.explanation}</p>
                </div>
              </div>
            )}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div id="interactive-transcript" className="space-y-5 font-sans">
      {/* Search and control Actions panel */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="w-full sm:w-80 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="input-search-transcript"
            type="text"
            placeholder="Tafuta kwenye mazungumzo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 placeholder:text-slate-500 text-slate-200 outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Action button panel */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <button
            id="btn-copy-transcript"
            onClick={handleCopyTranscript}
            className="py-2 px-3.5 rounded-lg text-xs font-bold gap-1.5 flex items-center bg-slate-850 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer border border-slate-800 active:scale-95"
            title="Nakili nakala yote"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Nakili (Copy)</span>
          </button>

          <button
            id="btn-download-txt"
            onClick={handleDownloadTxt}
            className="py-2 px-3.5 rounded-lg text-xs font-bold gap-1.5 flex items-center bg-slate-850 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer border border-slate-800 active:scale-95"
            title="Pakua faili la TXT"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pakua TXT</span>
          </button>
        </div>

      </div>

      {/* Copy notification popup */}
      {showCopyNotification && (
        <div className="bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg max-w-sm mx-auto justify-center absolute top-24 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>Mazungumzo yamenakiliwa kwenye ubao! (Copies Copied)</span>
        </div>
      )}

      {/* Dialogue Stream */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 bg-slate-950/20 p-4 border border-slate-850/40 rounded-xl">
        {filteredTranscript.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <p className="text-sm font-semibold">Mtafutano haukupata matokeo</p>
            <p className="text-xs text-slate-600 mt-1">Sajili herufi au jina lingine la mzungumzaji.</p>
          </div>
        ) : (
          filteredTranscript.map((turn) => {
            const isEditing = editingId === turn.id;
            const speakerStyle = getSpeakerColorClasses(turn.speaker);

            return (
              <div 
                key={turn.id}
                id={`transcript-turn-${turn.id}`}
                className={`group flex gap-4 p-4 rounded-xl transition-all border ${
                  isEditing 
                    ? "bg-slate-900 border-indigo-500/40 ring-1 ring-indigo-500/10" 
                    : "bg-slate-900 hover:bg-slate-900/80 border-slate-850/60"
                }`}
              >
                {/* Speaker Avatar Icon */}
                <div className={`w-9 sm:w-10 h-9 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none border ${speakerStyle.bg}`}>
                  {turn.speaker.slice(0, 2).toUpperCase()}
                </div>

                {/* Content body info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    {/* Speaker name & timing */}
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <input
                          id={`input-edit-speaker-${turn.id}`}
                          type="text"
                          value={editSpeaker}
                          onChange={(e) => setEditSpeaker(e.target.value)}
                          className="text-xs font-bold leading-normal bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-200 outline-none focus:border-amber-500 w-36"
                          placeholder="Mzungumzaji"
                        />
                      ) : (
                        <span className="text-sm font-bold text-slate-200">{turn.speaker}</span>
                      )}
                      
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-950 border border-slate-850 rounded px-1.5 py-0.2">
                        {turn.timestamp}
                      </span>
                    </div>

                    {/* Edit toolbar buttons */}
                    <div className="flex items-center gap-1.5">
                      {isEditing ? (
                        <>
                          <button
                            id={`btn-save-edit-${turn.id}`}
                            onClick={() => saveEdit(turn.id)}
                            className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded border border-emerald-500/20 cursor-pointer"
                            title="Hifadhi mabadiliko"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 text-slate-400 hover:bg-slate-800 rounded border border-slate-800 cursor-pointer"
                            title="Batilisha"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          id={`btn-trigger-edit-${turn.id}`}
                          onClick={() => startEditing(turn)}
                          className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-transparent hover:border-slate-800"
                          title="Hariri dondoo hili"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Speech turn content */}
                  {isEditing ? (
                    <textarea
                      id={`textarea-edit-text-${turn.id}`}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full text-xs text-slate-300 leading-relaxed bg-slate-950 border border-slate-800 rounded-lg p-2.5 mt-1 outline-none resize-none focus:border-amber-500 h-24"
                      placeholder="Andika mazungumzo..."
                    />
                  ) : (
                    <div className="text-sm sm:text-sm text-slate-300 leading-relaxed font-sans">
                      {renderTextWithSlangHighlights(turn.text)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Guide/tip box */}
      <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3 text-slate-400 text-xs">
        <HelpCircle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed leading-slate-400 leading-relaxed">
          <strong>Ushauri / Tips</strong>: Maneno ya rangi ya <span className="text-amber-400 font-bold">dhahabu/manjano yenye mshale</span> ni misemo ya asili ya Zanzibari iliyotafsiriwa kikamilifu! Gusa neno lolote ili kusoma maana yake papo hapo bila kuhama ukurasa.
        </p>
      </div>
    </div>
  );
}
