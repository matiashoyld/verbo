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
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Notes</span>
        </div>
      </div>
      <textarea
        className="w-full flex-1 resize-none p-4 font-mono text-sm text-gray-800 focus:outline-none"
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
