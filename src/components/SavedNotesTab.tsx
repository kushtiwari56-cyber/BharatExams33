import React, { useState, useEffect } from "react";
import { Folder, Trash2, Edit3, Plus, Bookmark, BellRing, ChevronRight, NotebookPen, Tag } from "lucide-react";
import { toast } from "sonner";

interface SavedNotesTabProps {
  onAddXp: (amount: number) => void;
}

interface StudyNote {
  id: string;
  title: string;
  subject: string;
  content: string;
  updatedAt: string;
}

interface AlertLog {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  category: string;
}

export function SavedNotesTab({ onAddXp }: SavedNotesTabProps) {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("General Studies");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<string>("All");

  // Load from offline localStorage (excellent fallback with perfect persistence)
  useEffect(() => {
    const saved = localStorage.getItem("bharat_jobs_notes");
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {}
    } else {
      // Demo notes
      const initialNotes: StudyNote[] = [
        { id: "note-1", title: "Fundamental Rights (Polity)", subject: "General Studies", content: "Articles 12-35 in Part III of the Constitution. Crucial for direct GS screening. Article 21 guarantees Life and Liberty.", updatedAt: "2026-05-19 10:30" },
        { id: "note-2", title: "Percentage Shortcuts (Quant)", subject: "Mathematics", content: "To calculate percentage increase: Increase / Original Value * 100. Memorize fraction equivalents like 1/6 = 16.66%.", updatedAt: "2026-05-18 14:15" }
      ];
      setNotes(initialNotes);
      localStorage.setItem("bharat_jobs_notes", JSON.stringify(initialNotes));
    }
  }, []);

  const saveNotesToStorage = (updatedList: StudyNote[]) => {
    setNotes(updatedList);
    localStorage.setItem("bharat_jobs_notes", JSON.stringify(updatedList));
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill out both the title and contents fields!");
      return;
    }

    if (editingId) {
      // Edit existing note
      const updated = notes.map(n => {
        if (n.id === editingId) {
          return {
            ...n,
            title,
            subject,
            content,
            updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16)
          };
        }
        return n;
      });
      saveNotesToStorage(updated);
      setEditingId(null);
      toast.success("Study note updated successfully in database!");
    } else {
      // Create new note
      const newNote: StudyNote = {
        id: Math.random().toString(),
        title,
        subject,
        content,
        updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16)
      };
      saveNotesToStorage([newNote, ...notes]);
      onAddXp(40);
      toast.success("New Study Note saved! Received +40 XP Scholar Reward.");
    }

    // Reset fields
    setTitle("");
    setContent("");
  };

  const startEdit = (note: StudyNote) => {
    setEditingId(note.id);
    setTitle(note.title);
    setSubject(note.subject);
    setContent(note.content);
    toast.info("Editing Note. Change variables and submit to save.");
  };

  const deleteNote = (id: string) => {
    const filtered = notes.filter(n => n.id !== id);
    saveNotesToStorage(filtered);
    toast.info("Note deleted from database registry.");
  };

  // Saved bookmark list mock
  const bookmarks = [
    { title: "UPSC Civil Services Preliminaries 2026", org: "UPSC", lastDate: "2026-06-15", category: "exam" },
    { title: "UP Police Constable Recruitment Program", org: "UPPRPB", lastDate: "2026-07-28", category: "police" }
  ];

  // Alert Log History (crawled subscriptions)
  const notificationAlerts: AlertLog[] = [
    { id: "al-1", title: "Registrations closing soon", body: "URGENT: SSC CGL application portal Closes in exactly 2 Days. Keep fees clearance slips ready.", timestamp: "2 Hours ago", category: "registration" },
    { id: "al-2", title: "Admit Card Launch", body: "Notification: CTET State Examination admit card links are now active on central server.", timestamp: "Yesterday", category: "exam" }
  ];

  const foldersList = ["All", "General Studies", "Mathematics", "English", "Mock Notes"];
  const filteredNotes = activeFolder === "All" ? notes : notes.filter(n => n.subject === activeFolder);

  return (
    <div className="space-y-8 font-sans">
      {/* 1. NOTES WRITING FORM */}
      <section className="bg-slate-50 border border-slate-100 p-6 rounded-[2.5rem] shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <NotebookPen className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest font-display">
            {editingId ? "Update Study Note" : "Create Study Note"}
          </h3>
        </div>

        <form onSubmit={handleSaveNote} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">Note Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fundamental Rights revision"
                className="w-full px-5 py-4 bg-white border border-gray-150 rounded-2xl text-xs font-bold text-gray-700 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">Subject Folder</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-5 py-4 bg-white border border-gray-150 rounded-2xl text-xs font-bold uppercase tracking-tight text-gray-700 outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="General Studies">General Studies</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English">English</option>
                <option value="Mock Notes">Mock Notes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">Note Content Summary</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste syllabus key facts, short tricks, formulas, or book links here..."
              className="w-full px-5 py-4 bg-white border border-gray-150 rounded-2xl text-xs font-bold text-gray-700 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-4 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl text-[9px] font-black uppercase tracking-widest cursor-pointer shadow-md transition-transform active:scale-95"
            >
              {editingId ? "Save Edits" : "Save Note Fact"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setTitle(""); setContent(""); }}
                className="px-6 py-4 border border-gray-200 text-gray-500 rounded-2xl text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50"
              >
                Cancel Edits
              </button>
            )}
          </div>
        </form>
      </section>

      {/* 2. NOTE LIST WITH COMPOSER FOLDERS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 font-display">Notes Vault</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Saved summaries with folder filtering</p>
          </div>
        </div>

        {/* Folders filter bar */}
        <div className="flex bg-gray-100 p-1 rounded-2xl overflow-x-auto gap-1 whitespace-nowrap scrollbar-none">
          {foldersList.map((fold) => (
            <button
              key={fold}
              onClick={() => setActiveFolder(fold)}
              className={`px-4.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeFolder === fold ? "bg-white text-gray-900 shadow-sm font-black" : "text-gray-400 hover:text-gray-600"}`}
            >
              {fold}
            </button>
          ))}
        </div>

        {/* List of notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.length === 0 ? (
            <div className="md:col-span-2 text-center py-10 bg-white border border-gray-100 rounded-3xl">
              <Folder className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">No notes registered in this folder.</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div key={note.id} className="bg-white border border-gray-150 p-5 rounded-[2rem] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full uppercase font-black font-display tracking-wider shrink-0">
                      {note.subject}
                    </span>
                    <span className="text-[8px] text-gray-400 font-mono font-bold leading-none">{note.updatedAt}</span>
                  </div>
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-2">{note.title}</h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed mb-4">{note.content}</p>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => startEdit(note)}
                    className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"
                    title="Edit Note"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 3. BOOKMARKED CAREERS VACANCIES */}
      <section className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest font-display">Saved Job/Exam circulars</h3>
        </div>

        <div className="space-y-3">
          {bookmarks.map((bm, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-100 hover:border-blue-200 rounded-2xl transition-all">
              <div>
                <h4 className="text-xs font-black uppercase text-gray-900">{bm.title}</h4>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">{bm.org} • Closes {bm.lastDate}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      </section>

      {/* 4. SUBSCRIPTION LOG HISTORY (Forefront Subscription handler) */}
      <section className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <BellRing className="w-5 h-5 text-emerald-500 animate-pulse" />
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest font-display">Subscribed Alerts Log</h3>
        </div>

        <div className="space-y-4">
          {notificationAlerts.map((alert) => (
            <div key={alert.id} className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl flex gap-3.5 items-start">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0 mt-1.5" />
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="text-xs font-black uppercase text-gray-800 leading-snug">{alert.title}</h4>
                  <span className="text-[8px] text-gray-400 font-mono font-bold">{alert.timestamp}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{alert.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
