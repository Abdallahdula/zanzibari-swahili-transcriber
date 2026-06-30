import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  Copy, 
  Download, 
  ChevronDown,
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
import { AudioPreview, DialogueTurn, DialectGlossItem } from "../types";

type ExportFormat = "docx" | "txt" | "pdf" | "md";

interface InteractiveTranscriptProps {
  transcript: DialogueTurn[];
  glossary: DialectGlossItem[];
  audioPreview?: AudioPreview;
  sessionTitle: string;
  onSaveTurn: (id: string, updatedSpeaker: string, updatedText: string) => void;
}

export default function InteractiveTranscript({
  transcript,
  glossary,
  audioPreview,
  sessionTitle,
  onSaveTurn
}: InteractiveTranscriptProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSpeaker, setEditSpeaker] = useState("");
  const [editText, setEditText] = useState("");
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [activeSlangTooltip, setActiveSlangTooltip] = useState<string | null>(null);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);

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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const transcriptAsPlainText = () =>
    transcript
      .map((turn) => `[${turn.timestamp}] ${turn.speaker}: ${turn.text}`)
      .join("\n");

  const transcriptAsMarkdown = () =>
    [`# ${sessionTitle}`, "", ...transcript.map((turn) => `- **[${turn.timestamp}] ${turn.speaker}:** ${turn.text}`)].join("\n");

  const sanitizeFileName = (name: string) => {
    const cleaned = name
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
      .replace(/\s+/g, "_")
      .slice(0, 90);
    return cleaned || "ranskripti_kikao_zanzibar";
  };

  const downloadBlob = (blob: Blob, extension: ExportFormat) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${sanitizeFileName(sessionTitle)}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const escapeXml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const crcTable = (() => {
    const table: number[] = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c >>> 0;
    }
    return table;
  })();

  const crc32 = (data: Uint8Array) => {
    let crc = 0xffffffff;
    for (const byte of data) {
      crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  };

  const u16 = (value: number) => [value & 0xff, (value >>> 8) & 0xff];
  const u32 = (value: number) => [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];

  const createZip = (files: Array<{ name: string; data: Uint8Array }>) => {
    const encoder = new TextEncoder();
    const localParts: Uint8Array[] = [];
    const centralParts: Uint8Array[] = [];
    let offset = 0;

    files.forEach((file) => {
      const nameBytes = encoder.encode(file.name);
      const checksum = crc32(file.data);
      const localHeader = new Uint8Array([
        ...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
        ...u32(checksum), ...u32(file.data.length), ...u32(file.data.length),
        ...u16(nameBytes.length), ...u16(0)
      ]);
      localParts.push(localHeader, nameBytes, file.data);

      const centralHeader = new Uint8Array([
        ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
        ...u32(checksum), ...u32(file.data.length), ...u32(file.data.length),
        ...u16(nameBytes.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)
      ]);
      centralParts.push(centralHeader, nameBytes);
      offset += localHeader.length + nameBytes.length + file.data.length;
    });

    const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
    const endRecord = new Uint8Array([
      ...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length),
      ...u32(centralSize), ...u32(offset), ...u16(0)
    ]);

    return new Blob([...localParts, ...centralParts, endRecord], { type: "application/zip" });
  };

  const createDocxBlob = () => {
    const encoder = new TextEncoder();
    const paragraphs = [
      `<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${escapeXml(sessionTitle)}</w:t></w:r></w:p>`,
      ...transcript.map((turn) =>
        `<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${escapeXml(`[${turn.timestamp}] ${turn.speaker}: `)}</w:t></w:r><w:r><w:t>${escapeXml(turn.text)}</w:t></w:r></w:p>`
      )
    ].join("");
    const files = [
      {
        name: "[Content_Types].xml",
        data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`)
      },
      {
        name: "_rels/.rels",
        data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`)
      },
      {
        name: "word/document.xml",
        data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`)
      }
    ];
    return createZip(files);
  };

  const escapePdfText = (value: string) =>
    value
      .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, "")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");

  const createPdfBlob = () => {
    const lines = [sessionTitle, "", ...transcriptAsPlainText().split("\n")];
    const wrappedLines = lines.flatMap((line) => {
      const chunks: string[] = [];
      for (let i = 0; i < line.length || i === 0; i += 88) {
        chunks.push(line.slice(i, i + 88));
      }
      return chunks;
    }).slice(0, 180);
    const content = [
      "BT",
      "/F1 10 Tf",
      "50 790 Td",
      "14 TL",
      ...wrappedLines.map((line, index) => `${index === 0 ? "" : "T*"}(${escapePdfText(line)}) Tj`),
      "ET"
    ].join("\n");
    const objects = [
      "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
      "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
      "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
      "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
      `5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`
    ];
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((object) => {
      offsets.push(pdf.length);
      pdf += object;
    });
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
      pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return new Blob([pdf], { type: "application/pdf" });
  };

  const handleDownloadTranscript = (format: ExportFormat) => {
    setIsDownloadMenuOpen(false);
    switch (format) {
      case "txt":
        downloadBlob(new Blob([transcriptAsPlainText()], { type: "text/plain;charset=utf-8" }), format);
        break;
      case "pdf":
        downloadBlob(createPdfBlob(), format);
        break;
      case "md":
        downloadBlob(new Blob([transcriptAsMarkdown()], { type: "text/markdown;charset=utf-8" }), format);
        break;
      default:
        downloadBlob(createDocxBlob(), format);
    }
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
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl shadow-black z-20 text-xs animate-in fade-in slide-in-from-top-2">
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
      {audioPreview && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-500" />
                <span>Sauti ya Asili (Original Audio)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 truncate max-w-full sm:max-w-xl">
                {audioPreview.fileName} - {formatFileSize(audioPreview.size)}
              </p>
            </div>
          </div>
          <audio
            controls
            src={audioPreview.url}
            className="w-full h-10"
          >
            Your browser does not support audio playback.
          </audio>
        </div>
      )}

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
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <button
            id="btn-copy-transcript"
            onClick={handleCopyTranscript}
            className="py-2 px-3.5 rounded-lg text-xs font-bold gap-1.5 flex items-center bg-slate-850 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer border border-slate-800 active:scale-95"
            title="Nakili nakala yote"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Nakili (Copy)</span>
          </button>

          <div className="relative">
            <button
              id="btn-download-transcript"
              onClick={() => setIsDownloadMenuOpen((current) => !current)}
              className="py-2 px-3.5 rounded-lg text-xs font-bold gap-1.5 flex items-center bg-slate-850 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer border border-slate-800 active:scale-95"
              title="Pakua faili"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pakua DOCX</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isDownloadMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/40 p-1 z-40">
                {([
                  ["docx", "DOCX"],
                  ["txt", "TXT"],
                  ["pdf", "PDF"],
                  ["md", "Markdown"]
                ] as Array<[ExportFormat, string]>).map(([format, label]) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => handleDownloadTranscript(format)}
                    className="w-full px-3 py-2 text-left text-xs font-bold rounded-lg text-slate-300 hover:bg-slate-800 hover:text-slate-100 cursor-pointer flex items-center justify-between"
                  >
                    <span>{label}</span>
                    {format === "docx" && (
                      <span className="text-[9px] uppercase tracking-wider text-amber-500">default</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
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
