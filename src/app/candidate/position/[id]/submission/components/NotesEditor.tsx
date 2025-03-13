import { Pencil } from "lucide-react";
import React from "react";

interface NotesEditorProps {
  activeQuestionId: string | null;
  questionNotes: Record<string, string>;
  setQuestionNotes: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
}

const NotesEditor: React.FC<NotesEditorProps> = ({
  activeQuestionId,
  questionNotes,
  setQuestionNotes,
}) => {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 px-3 py-2 sm:px-4">
        <div className="flex items-center space-x-2">
          <Pencil className="h-3 w-3 text-verbo-purple sm:h-4 sm:w-4" />
          <span className="text-xs font-medium text-gray-700 sm:text-sm">
            Notes
          </span>
        </div>
      </div>
      <textarea
        className="h-full min-h-[200px] w-full flex-1 resize-none overflow-auto p-3 font-mono text-xs text-gray-800 focus:outline-none sm:p-4 sm:text-sm"
        placeholder="If you need, you can take notes here..."
        value={activeQuestionId ? questionNotes[activeQuestionId] || "" : ""}
        onChange={(e) => {
          if (activeQuestionId) {
            setQuestionNotes((prev) => ({
              ...prev,
              [activeQuestionId]: e.target.value,
            }));
          }
        }}
      ></textarea>
    </div>
  );
};

export default NotesEditor;
