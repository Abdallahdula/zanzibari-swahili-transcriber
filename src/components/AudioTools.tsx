import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  Mic, 
  Square, 
  Radio, 
  Sparkles, 
  HelpCircle, 
  FileAudio, 
  Volume2, 
  X,
  RefreshCw,
  Clock,
  Waves
} from "lucide-react";
import { AppLanguage, AudioPreview } from "../types";

interface AudioToolsProps {
  onTranscribe: (
    audioBase64: string,
    fileName: string,
    mimeType: string,
    context: string,
    preferredTitle?: string,
    audioPreview?: AudioPreview
  ) => Promise<void>;
  isProcessing: boolean;
  language: AppLanguage;
}

const MAX_AUDIO_FILE_MB = 100;
const MAX_AUDIO_FILE_BYTES = MAX_AUDIO_FILE_MB * 1024 * 1024;

const AUDIO_TEXT = {
  sw: {
    oversized: `Faili la sauti ni kubwa sana (max ${MAX_AUDIO_FILE_MB}MB). Tafadhali libane/compress kwanza kisha upakie tena.`,
    loadingTitle: "Inatafsiri Sauti...",
    loadingHint: "Sekunde chache... Gemini inapitia upya lafudhi ya dondoo hili ili kuhakikisha usahihi mzuri wa misemo yote.",
    loadingMessages: [
      "Inapakia sauti yako salama...",
      "Gemini inapitia lafudhi ya Kiunguja ya wazungumzaji...",
      "Kubainisha misemo ya asili ya Stone Town...",
      "Kugawanya dondoo za mazungumzo na kuweka muda...",
      "Kukamilisha muhtasari na majukumu..."
    ],
    audioSource: "Sajili Chanzo cha Sauti",
    recording: "INAREKODI",
    stopSave: "Zima na Hifadhi",
    dragTitle: "Kokota na upakie faili ya sauti hapa",
    formats: `MP3, WAV, M4A, OGG. Max ${MAX_AUDIO_FILE_MB}MB.`,
    chooseFile: "Bofya kuchagua kwenye kifaa",
    removeFile: "Futa faili hili",
    orRecord: "au piga sauti hapa",
    liveRecord: "Rekodi Moja kwa Moja",
    fileTypeFallback: "Sauti",
    lengthAdviceTitle: "Ushauri wa faili",
    lengthAdvice: `Kwa mafaili makubwa, tumia MP3 au M4A badala ya WAV. Faili likizidi ${MAX_AUDIO_FILE_MB}MB, libane/compress kwanza.`,
    contextTitle: "Habari ya Kikao",
    titleLabel: "Kichwa cha Kikao (si lazima)",
    titlePlaceholder: "Kikao cha soko la Stone Town...",
    contextLabel: "Muktadha / Wazungumzaji (si lazima)",
    contextPlaceholder: "Andika majina ya wazungumzaji au mada ili kuongeza ufanisi wa tafsiri.",
    submit: "Geuza Sauti Kuwa Maandishi",
    needAudio: "Pakia faili au rekodi sauti kwanza ili kuanza.",
    micError: "Haikuweza kupata kipaza sauti. Tafadhali ruhusu Microphone au pakia faili lililorekodiwa."
  },
  en: {
    oversized: `The audio file is too large (max ${MAX_AUDIO_FILE_MB}MB). Please compress it first, then upload again.`,
    loadingTitle: "Transcribing Audio...",
    loadingHint: "A moment... Gemini is checking the dialect and structure of the recording.",
    loadingMessages: [
      "Uploading your audio securely...",
      "Gemini is listening for Kiunguja pronunciation...",
      "Detecting Stone Town expressions and local terms...",
      "Segmenting speakers and timestamps...",
      "Preparing the summary and action items..."
    ],
    audioSource: "Audio Source",
    recording: "RECORDING",
    stopSave: "Stop and Save",
    dragTitle: "Drag and upload an audio file here",
    formats: `MP3, WAV, M4A, OGG. Max ${MAX_AUDIO_FILE_MB}MB.`,
    chooseFile: "Click to choose from device",
    removeFile: "Remove this file",
    orRecord: "or record here",
    liveRecord: "Record Live",
    fileTypeFallback: "Audio",
    lengthAdviceTitle: "File advice",
    lengthAdvice: `For large files, use MP3 or M4A instead of WAV. If the file is over ${MAX_AUDIO_FILE_MB}MB, compress it first.`,
    contextTitle: "Meeting Details",
    titleLabel: "Meeting Title (optional)",
    titlePlaceholder: "Stone Town market meeting...",
    contextLabel: "Context / Speakers (optional)",
    contextPlaceholder: "Add speaker names or the topic to improve transcription accuracy.",
    submit: "Analyze Swahili Audio",
    needAudio: "Upload a file or record audio first.",
    micError: "Could not access your microphone. Please allow microphone access or upload a recorded file."
  }
} as const;

export default function AudioTools({ onTranscribe, isProcessing, language }: AudioToolsProps) {
  const text = AUDIO_TEXT[language];
  // Input form state
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingContext, setMeetingContext] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Drag and drop feedback
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Loading view cycles
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = text.loadingMessages;

  // Increment loading steps during processing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 4500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Format recording timer: MM:SS
  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainingSecs).padStart(2, "0")}`;
  };

  const isAudioFileTooLarge = (file: Blob) => file.size > MAX_AUDIO_FILE_BYTES;

  const warnOversizedAudio = () => {
    alert(text.oversized);
  };

  // Drag handles
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("audio/")) {
        if (isAudioFileTooLarge(file)) {
          warnOversizedAudio();
          return;
        }
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isAudioFileTooLarge(file)) {
        warnOversizedAudio();
        e.target.value = "";
        return;
      }
      setSelectedFile(file);
    }
  };

  // Live recording controller
  const startRecording = async () => {
    setSelectedFile(null); // clear uploaded file
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm", // standard browser format, supported by Gemini
        audioBitsPerSecond: 16000 // strongly optimized standard for transcriptions
      });

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (isAudioFileTooLarge(audioBlob)) {
          warnOversizedAudio();
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const base64Payload = base64data.split(",")[1];
          
          // Set simulated File representation for UI
          const fakeFile = new File([audioBlob], `Sauti_Iliyorekodiwa_${new Date().toLocaleTimeString()}.webm`, {
            type: "audio/webm"
          });
          setSelectedFile(fakeFile);
        };

        // stop microphone tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      setIsRecording(true);
      setRecordingSeconds(0);
      mediaRecorder.start();

      // Launch timer tick
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Recording Mic access failed:", err);
      alert(text.micError);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  // Trigger submission to server API
  const handleSubmit = async () => {
    if (!selectedFile) return;
    if (isAudioFileTooLarge(selectedFile)) {
      warnOversizedAudio();
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const cleanBase64 = base64String.split(",")[1];
      
      const fileName = meetingTitle.trim() 
        ? `${meetingTitle.trim()}_${selectedFile.name}` 
        : selectedFile.name;
      const mimeType = selectedFile.type || "audio/mp3";
      const audioPreview = {
        url: URL.createObjectURL(selectedFile),
        fileName: selectedFile.name,
        mimeType,
        size: selectedFile.size
      };

      await onTranscribe(
        cleanBase64,
        fileName,
        mimeType,
        meetingContext.trim(),
        meetingTitle.trim() || undefined,
        audioPreview
      );
      
      // Cleanup inputs
      setSelectedFile(null);
      setMeetingTitle("");
      setMeetingContext("");
    };
  };

  return (
    <div id="audio-tools" className="font-sans">
      {isProcessing ? (
        /* Reassuring cyclic loading view */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-6 min-h-[320px]">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-950 border-t-amber-500 animate-spin" />
            <Sparkles className="w-6 h-6 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="text-base font-bold text-slate-100 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
              <span>{text.loadingTitle}</span>
            </h3>
            
            {/* Reassuring cyclic step speech */}
            <p className="text-sm font-medium text-amber-500/90 h-10 animate-pulse font-sans">
              {loadingMessages[loadingStep]}
            </p>
            
            <p className="text-xs text-slate-500 pt-4 border-t border-slate-850">
              {text.loadingHint}
            </p>
          </div>
        </div>
      ) : (
        /* Core action uploader interface */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[360px]">
          
          {/* Left partition: File Upload & Microphone record */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 mb-4">
                <Volume2 className="w-4.5 h-4.5 text-amber-500" />
                {text.audioSource}
              </h3>

              {isRecording ? (
                /* Interactive Recording Monitor panel */
                <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-400 font-mono text-xs font-bold rounded-full animate-pulse border border-rose-500/20">
                    <Radio className="w-3.5 h-3.5" />
                    <span>{text.recording}</span>
                  </div>

                  <div className="text-3xl font-extrabold text-slate-100 font-mono tracking-wider">
                    {formatTimer(recordingSeconds)}
                  </div>

                  {/* Pulsing visual wave frequency shapes */}
                  <div className="flex items-center justify-center gap-1 h-8 px-4 py-1">
                    {[...Array(14)].map((_, i) => (
                      <span 
                        key={i} 
                        className="w-1 bg-gradient-to-t from-rose-500 to-rose-400 rounded-full animate-pulse"
                        style={{ 
                          height: `${Math.max(10, Math.sin(recordingSeconds + i) * 100)}%`,
                          animationDelay: `${i * 0.08}s` 
                        }}
                      />
                    ))}
                  </div>

                  <button
                    id="btn-stop-recording"
                    onClick={stopRecording}
                    className="py-3 px-6 bg-rose-600 hover:bg-rose-700 active:scale-95 text-slate-100 font-bold text-sm flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer shadow-md shadow-rose-950/25 border border-rose-500/20"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>{text.stopSave}</span>
                  </button>
                </div>
              ) : (
                /* Dual choice panel: Drag file or tap Microphone */
                <div className="space-y-4 font-sans">
                  
                  {/* File upload drag boundary */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all ${
                      isDragActive 
                        ? "border-amber-500 bg-amber-500/5 text-amber-400 scale-[0.99]" 
                        : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:bg-slate-950/20"
                    }`}
                  >
                    <input
                      id="input-file-upload"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />

                    {selectedFile ? (
                      /* File already selected visual */
                      <div className="space-y-3 z-20">
                        <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500 mx-auto w-fit">
                          <FileAudio className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-200 truncate max-w-sm mx-auto">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || text.fileTypeFallback}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedFile(null);
                          }}
                          className="px-3 py-1 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-slate-400 hover:text-slate-200 font-bold flex items-center gap-1.5 mx-auto active:scale-95 cursor-pointer relative z-30"
                        >
                          <X className="w-3 h-3" />
                          {text.removeFile}
                        </button>
                      </div>
                    ) : (
                      /* Placeholder drag instructions */
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-900 rounded-full border border-slate-800 text-slate-400 mx-auto w-fit group-hover:text-amber-500 transition-colors">
                          <Upload className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200">
                            {text.dragTitle}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {text.formats}
                          </p>
                        </div>
                        <div className="inline-block px-3 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] uppercase font-bold tracking-wider text-amber-500">
                          {text.chooseFile}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* OR Divider */}
                  <div className="text-center font-bold text-slate-500 text-xs tracking-wide uppercase select-none flex items-center justify-center gap-3">
                    <span className="h-px bg-slate-800 flex-1" />
                    <span>{text.orRecord}</span>
                    <span className="h-px bg-slate-800 flex-1" />
                  </div>

                  {/* Mic action button */}
                  <button
                    id="btn-start-mic"
                    type="button"
                    onClick={startRecording}
                    className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-900 text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer border border-slate-800 active:scale-[0.98]"
                  >
                    <Mic className="w-4 h-4 text-rose-500" />
                    <span>{text.liveRecord}</span>
                  </button>

                </div>
              )}
            </div>

            {/* Constraints notice card */}
            <div className="mt-8 p-3.5 bg-indigo-950/20 border border-indigo-950/30 rounded-xl flex gap-3 text-[11px] text-slate-400">
              <Clock className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed leading-slate-400">
                <strong>{text.lengthAdviceTitle}</strong>: {text.lengthAdvice}
              </p>
            </div>

          </div>

          {/* Right partition: Metadata config & submit trigger */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-amber-400" />
                {text.contextTitle}
              </h3>

              {/* Title input */}
              <div className="space-y-1.5 font-sans">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{text.titleLabel}</label>
                <input
                  id="input-meeting-title"
                  type="text"
                  placeholder={text.titlePlaceholder}
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 rounded-lg p-3 text-slate-200 outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Context / speakers guidance input */}
              <div className="space-y-1.5 font-sans">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{text.contextLabel}</label>
                <textarea
                  id="textarea-meeting-context"
                  placeholder={text.contextPlaceholder}
                  value={meetingContext}
                  onChange={(e) => setMeetingContext(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 rounded-lg p-3 text-slate-200 outline-none focus:border-amber-500 transition-colors h-32 resize-none"
                />
              </div>
            </div>

            {/* Launch trigger action button */}
            <div className="pt-6 border-t border-slate-800/80">
              <button
                id="btn-run-transcribe"
                onClick={handleSubmit}
                disabled={!selectedFile}
                className={`w-full py-4 text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all ${
                  selectedFile 
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 cursor-pointer shadow-amber-950/20 border border-amber-400/20 active:scale-[0.98]" 
                    : "bg-slate-800 text-slate-500 cursor-not-allowed border border-transparent"
                }`}
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>{text.submit}</span>
              </button>
              
              {!selectedFile && (
                <p className="text-center text-[10px] text-slate-500 mt-2 font-mono">
                  {text.needAudio}
                </p>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
