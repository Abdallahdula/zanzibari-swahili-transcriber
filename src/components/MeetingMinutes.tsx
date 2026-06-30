import React, { useState } from "react";
import { 
  FileSpreadsheet, 
  ListTodo, 
  Gavel, 
  User, 
  CheckSquare, 
  Square, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { MeetingSession, ActionItem } from "../types";

interface MeetingMinutesProps {
  session: MeetingSession;
  onUpdateActionItems: (items: ActionItem[]) => void;
}

export default function MeetingMinutes({ session, onUpdateActionItems }: MeetingMinutesProps) {
  const { summary } = session;
  const [newActionText, setNewActionText] = useState("");
  const [newActionAssignee, setNewActionAssignee] = useState("");

  // Toggle action item status
  const handleToggleStatus = (index: number) => {
    const updatedItems = [...summary.actionItems];
    const currentStatus = updatedItems[index].status;
    
    // Cycle: Pending -> In-Progress -> Done -> Pending
    if (currentStatus === "Pending") {
      updatedItems[index].status = "In-Progress";
    } else if (currentStatus === "In-Progress") {
      updatedItems[index].status = "Done";
    } else {
      updatedItems[index].status = "Pending";
    }
    onUpdateActionItems(updatedItems);
  };

  // Add custom action item
  const handleAddActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim()) return;

    const newItem: ActionItem = {
      task: newActionText.trim(),
      assignee: newActionAssignee.trim() || "TBD",
      status: "Pending"
    };

    onUpdateActionItems([...summary.actionItems, newItem]);
    setNewActionText("");
    setNewActionAssignee("");
  };

  // Helper for action item colors
  const getStatusBadgeStyles = (status: "Pending" | "In-Progress" | "Done") => {
    switch (status) {
      case "Done":
        return "bg-emerald-950/40 text-emerald-400 border-emerald-500/20";
      case "In-Progress":
        return "bg-amber-950/40 text-amber-400 border-amber-500/20";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div id="meeting-minutes" className="space-y-6 font-sans">
      {/* Header Stat row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium tracking-wider">Tarehe ya Kikao</p>
            <p className="text-sm font-semibold text-slate-100">{session.date}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium tracking-wider">Urefu wa Sauti</p>
            <p className="text-sm font-semibold text-slate-100">{session.duration} dakika</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium tracking-wider">Makatibio ya Kazi</p>
            <p className="text-sm font-semibold text-slate-100">
              {summary.actionItems.filter(item => item.status === "Done").length} kati ya {summary.actionItems.length} zimekamilika
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Summary & Agenda & Decisions */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Overview Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/20 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
            
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
              Muhtasari wa Kikao (Meeting Summary)
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {summary.overview}
            </p>
          </div>

          {/* Agenda points */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 mb-4">
              <ListTodo className="w-4 h-4 text-amber-500" />
              Agenda Zilizojadiliwa ({summary.agenda.length})
            </h3>
            <div className="space-y-2.5">
              {summary.agenda.map((agendaPoint, idx) => (
                <div key={idx} className="flex gap-3 items-start text-sm bg-slate-950/30 p-3 rounded-xl border border-slate-800/40">
                  <span className="font-mono text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-slate-300 leading-normal">{agendaPoint}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decisions Made */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Gavel className="w-4 h-4 text-emerald-400" />
              Maazimio na Makubaliano Makubwa
            </h3>
            <div className="space-y-3">
              {summary.decisions.map((decision, idx) => (
                <div key={idx} className="flex gap-3.5 items-start text-sm">
                  <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500 shadow shadow-emerald-500/50" />
                  <p className="text-slate-300 leading-relaxed font-sans font-medium">{decision}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Action Items Checklist */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <FileSpreadsheet className="w-4.5 h-4.5 text-amber-500" />
                <span>Makatibio na Majukumu (Action Items)</span>
              </h3>
              <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md font-mono border border-slate-800">
                Gusa kubadilisha halati
              </span>
            </div>

            {/* Checklist items */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] pr-1">
              {summary.actionItems.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  Hakuna majukumu yaliyoandikwa bado.
                </div>
              ) : (
                summary.actionItems.map((item, idx) => {
                  const isDone = item.status === "Done";
                  const isInProgress = item.status === "In-Progress";
                  
                  return (
                    <div 
                      key={idx}
                      id={`action-item-${idx}`}
                      className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isDone 
                          ? "bg-slate-950/40 border-slate-850 opacity-65"
                          : "bg-slate-950/20 border-slate-800 hover:bg-slate-950/40"
                      }`}
                      onClick={() => handleToggleStatus(idx)}
                    >
                      {/* Interactive checkbox icon */}
                      <div className="mt-0.5 shrink-0 text-amber-500 transition-transform active:scale-95">
                        {isDone ? (
                          <CheckSquare className="w-5 h-5 text-emerald-400" />
                        ) : isInProgress ? (
                          <CheckSquare className="w-5 h-5 text-amber-500 animate-pulse" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 font-sans">
                        <p className={`text-sm leading-normal ${isDone ? "line-through text-slate-500" : "text-slate-300 font-medium"}`}>
                          {item.task}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                            <User className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[120px]">{item.assignee}</span>
                          </div>

                          <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${getStatusBadgeStyles(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick-add form */}
            <form onSubmit={handleAddActionItem} className="mt-6 pt-4 border-t border-slate-800/80 space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ongeza Jukumu Jipya</h4>
              
              <div className="space-y-2">
                <input
                  id="input-action-task"
                  type="text"
                  placeholder="Andika jukumu..."
                  value={newActionText}
                  onChange={(e) => setNewActionText(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-amber-500 transition-colors"
                />

                <div className="flex gap-2">
                  <input
                    id="input-action-assignee"
                    type="text"
                    placeholder="Mtekelezaji (Mshiriki)"
                    value={newActionAssignee}
                    onChange={(e) => setNewActionAssignee(e.target.value)}
                    className="flex-1 text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-amber-500 transition-colors"
                  />
                  <button
                    id="btn-add-action"
                    type="submit"
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors border border-slate-700 cursor-pointer"
                  >
                    Weka
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
