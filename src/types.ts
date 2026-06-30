export interface ActionItem {
  id?: string;
  task: string;
  assignee: string;
  status: "Pending" | "In-Progress" | "Done";
}

export interface DialogueTurn {
  id: string; // unique Turn ID for react keys and editing
  speaker: string;
  text: string;
  timestamp: string;
}

export interface DialectGlossItem {
  word: string;
  meaningSwahili: string;
  meaningEnglish: string;
  explanation: string;
  exampleSentence: string;
}

export interface MeetingSummary {
  overview: string;
  agenda: string[];
  decisions: string[];
  actionItems: ActionItem[];
}

export interface MeetingSession {
  id: string;
  title: string;
  date: string;
  duration: string;
  summary: MeetingSummary;
  transcript: DialogueTurn[];
  dialectGloss: DialectGlossItem[];
  context?: string;
}
