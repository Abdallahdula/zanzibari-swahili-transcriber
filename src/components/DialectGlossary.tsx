import React, { useState } from "react";
import { 
  BookOpen, 
  Search, 
  HelpCircle, 
  ChevronRight, 
  Compass, 
  Sparkles,
  Info
} from "lucide-react";
import { DialectGlossItem } from "../types";

interface DialectGlossaryProps {
  glossary: DialectGlossItem[];
}

export default function DialectGlossary({ glossary }: DialectGlossaryProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGlossary = glossary.filter((item) => {
    const searchString = searchTerm.toLowerCase();
    return (
      item.word.toLowerCase().includes(searchString) ||
      item.meaningSwahili.toLowerCase().includes(searchString) ||
      item.meaningEnglish.toLowerCase().includes(searchString) ||
      item.explanation.toLowerCase().includes(searchString)
    );
  });

  return (
    <div id="dialect-glossary" className="space-y-6 font-sans">
      {/* Intro visual banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Decorative background vectors */}
        <div className="absolute right-0 top-0 w-44 h-44 bg-amber-500/5 rounded-full blur-2xl -z-10" />
        
        <div className="space-y-1.5 max-w-xl">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: "12s" }} />
            <span>Kamusi ya Misemo ya Zanzibari (Zanzibari Dialect Glossary)</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
            Mambo yaliyorekodiwa hutumia Kiswahili asilia cha visiwani (Kiunguja), chenye athari kubwa ya lugha ya Kiarabu, nahau za baharini, na misemo mipya ya vijiweni kama vile <strong>'mambo yange'</strong> au <strong>'kuzengeana'</strong>.
          </p>
        </div>

        {/* Status element */}
        <div className="px-4 py-2 bg-slate-900 rounded-xl border border-slate-850 self-start md:self-auto">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-mono">Misemo Iliyotambuliwa</p>
          <p className="text-xl font-extrabold text-amber-500 font-mono mt-0.5">{glossary.length}</p>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="input-search-glossary"
            type="text"
            placeholder="Tafuta msemo au neno (e.g., viwalo, mambo yange, shehe)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 placeholder:text-slate-500 text-slate-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all font-sans"
          />
        </div>
      </div>

      {/* Glossary inventory list */}
      {filteredGlossary.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/45 border border-slate-850 rounded-2xl p-6">
          <BookOpen className="w-10 h-10 text-slate-700 mx-auto mb-2.5 opacity-55" />
          <h4 className="text-sm font-semibold text-slate-400">Hakuna neno limepatikana</h4>
          <p className="text-xs text-slate-500 mt-1">
            Msemo huo haukutambuliwa kwenye faili hili la sauti. Jaribu mwingine.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGlossary.map((item, idx) => (
            <div 
              key={idx}
              id={`glossary-card-${item.word.toLowerCase().replace(/\s+/g, "-")}`}
              className="bg-slate-900 hover:bg-slate-900/80 hover:border-amber-500/30 border border-slate-800 rounded-2xl p-5 transition-all flex flex-col justify-between font-sans relative overflow-hidden group"
            >
              {/* Highlight background glow on hover */}
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl translate-x-8 translate-y-8 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="space-y-3">
                {/* Term and pronunciation/origin label */}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-base font-bold text-amber-400 flex items-center gap-1.5">
                    <span>{item.word}</span>
                  </h4>
                  <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 bg-slate-950 px-2 py-0.5 border border-slate-850 rounded uppercase">
                    Unguja Dialect
                  </span>
                </div>

                {/* Meanings */}
                <div className="space-y-1.5 p-3 bg-slate-950/40 rounded-xl border border-slate-850/50">
                  <div className="flex gap-1.5 text-xs">
                    <span className="font-bold text-slate-400 select-none">Kiswahili:</span>
                    <span className="text-slate-200 font-medium">{item.meaningSwahili}</span>
                  </div>
                  <div className="flex gap-1.5 text-xs">
                    <span className="font-bold text-slate-400 select-none">Kiingereza:</span>
                    <span className="text-slate-300 italic">{item.meaningEnglish}</span>
                  </div>
                </div>

                {/* Cultural definition/explanation */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Maelezo ya Kiasili / Kisimu (Context to culture):</span>
                  <p className="text-xs text-slate-400 leading-relaxed leading-slate-400">
                    {item.explanation}
                  </p>
                </div>
              </div>

              {/* Example usage sentence */}
              <div className="mt-4 pt-3.5 border-t border-slate-800/80">
                <span className="text-[10px] font-semibold text-amber-500/70 uppercase tracking-wider block mb-1">Mfano toka kwenye kikao (Observed in Session):</span>
                <p className="text-xs text-slate-300 italic bg-amber-500/5 border-l-2 border-amber-500/40 p-2.5 rounded-r-lg font-sans">
                  &ldquo;{item.exampleSentence}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Coastal influence dictionary insight */}
      <div className="p-4 bg-indigo-950/15 border border-indigo-950/50 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-300">Vidokezo vya Kingoni na Kiarabu Zanzibar</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed leading-slate-400 font-sans">
            Msemo kama &apos;shehe&apos; unatokana na Kiarabu na unatumiwa sana Zanzibar kwa kuonyesha heshima. Maneno mengi ya kiunguja yanatumia herufi za kipwani kutokana na mwingiliano wa karne kadhaa wa kibiashara na asilia ya ustaarabu wa stone town. Kamusi hii inakuwezesha kuhakikisha maneno haya hayatofanyiwa muhtasari mzito wa sanifu kiasi cha kupoteza asili ya huba na hisia.
          </p>
        </div>
      </div>
    </div>
  );
}
