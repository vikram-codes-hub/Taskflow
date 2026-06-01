import { useState } from "react";

const priorityStyles = {
  LOW: "bg-emerald-900/30 text-emerald-400 border-emerald-700/50",
  MEDIUM: "bg-amber-900/30 text-amber-400 border-amber-700/50",
  HIGH: "bg-rose-900/30 text-rose-400 border-rose-700/50",
};

const statusStyles = {
  PENDING: "bg-slate-800/30 text-slate-400 border-slate-600/50",
  IN_PROGRESS: "bg-cyan-900/30 text-cyan-400 border-cyan-700/50",
  DONE: "bg-emerald-900/30 text-emerald-400 border-emerald-700/50",
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, isAdmin }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
  const daysUntilDue = task.dueDate 
    ? Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 flex flex-col gap-4 hover:border-slate-600/50 hover:from-slate-800/70 hover:to-slate-900/70 transition-all duration-300 group backdrop-blur-sm cursor-pointer transform hover:scale-105 hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-900/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header with Title and Priority */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-slate-100 font-bold text-base leading-snug group-hover:text-emerald-400 transition-all duration-300 line-clamp-2">
            {task.title}
          </h3>
          <div className={`h-1 w-0 bg-gradient-to-r from-emerald-500 to-teal-500 mt-2 transition-all duration-500 ${
            isHovered ? 'w-full' : 'w-0'
          }`} />
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-lg border flex items-center gap-1 shrink-0 font-bold uppercase tracking-wide transition-all duration-300 ${priorityStyles[task.priority]} ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        >
          {task.priority}
        </span>
      </div>

      {/* Description with Expand Animation */}
      {task.description && (
        <p className={`text-slate-400 text-sm leading-relaxed transition-all duration-300 overflow-hidden ${
          isExpanded ? 'max-h-24 opacity-100' : 'max-h-10 opacity-80 line-clamp-1'
        }`}>
          {task.description}
        </p>
      )}

      {/* Status and Due Date */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`text-xs px-3 py-1 rounded-lg border font-bold uppercase tracking-wide transition-all duration-300 ${statusStyles[task.status]} ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
        >
          {task.status.replace("_", " ")}
        </span>
        
        {task.dueDate && (
          <span className={`text-xs px-3 py-1 rounded-lg border font-bold uppercase tracking-wide transition-all duration-300 ${
            isOverdue 
              ? "bg-rose-900/30 text-rose-400 border-rose-700/50 animate-pulse" 
              : "bg-slate-800/30 text-slate-400 border-slate-600/50"
          }`}>
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {daysUntilDue && daysUntilDue > 0 && ` (${daysUntilDue}d)`}
            {isOverdue && " ⚠️"}
          </span>
        )}
      </div>

      {/* Assigned User */}
      {task.user && isAdmin && (
        <div className="text-xs text-slate-500 flex items-center gap-2 font-semibold">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs">
            {task.user.name?.charAt(0).toUpperCase()}
          </div>
          {task.user.name}
        </div>
      )}

      {/* Action Buttons with Smooth Transitions */}
      <div className={`flex items-center gap-2 pt-2 border-t border-slate-700/50 transition-all duration-300 ${
        isHovered ? 'mt-4' : 'mt-0'
      }`}>
        {!isAdmin && task.status !== "DONE" && (
          <select
            value={task.status}
            onChange={(e) => {
              e.stopPropagation();
              onStatusChange(task.id, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            className="text-xs bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1 hover:bg-slate-800 transition-all duration-300 font-bold cursor-pointer hover:border-slate-600"
          >
            <option value="PENDING">📌 Pending</option>
            <option value="IN_PROGRESS">⚙️ Working</option>
            <option value="DONE">✅ Done</option>
          </select>
        )}
        {isAdmin && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="flex-1 text-xs bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-700/50 hover:border-emerald-600/70 rounded-lg px-3 py-2 transition-all duration-300 font-bold uppercase tracking-wide transform hover:scale-105 active:scale-95"
            >
              ✏️ Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="flex-1 text-xs bg-rose-900/30 text-rose-400 hover:bg-rose-900/60 border border-rose-700/50 hover:border-rose-600/70 rounded-lg px-3 py-2 transition-all duration-300 font-bold uppercase tracking-wide transform hover:scale-105 active:scale-95"
            >
              🗑️ Delete
            </button>
          </>
        )}
        {!isAdmin && task.status === "DONE" && (
          <div
            className="flex-1 text-center text-xs text-emerald-400 font-bold uppercase tracking-wide py-2 bg-emerald-900/20 rounded-lg border border-emerald-700/50 animate-pulse"
            onClick={(e) => e.stopPropagation()}
          >
            ✓ Completed!
          </div>
        )}
      </div>

      {/* Hover Indicator */}
      {isHovered && (
        <div className="absolute inset-0 rounded-xl pointer-events-none border-2 border-emerald-500/50 animate-pulse" />
      )}
    </div>
  );
}