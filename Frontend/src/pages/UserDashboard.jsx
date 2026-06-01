import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import toast from "react-hot-toast";

export default function UserDashboard() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [animateStats, setAnimateStats] = useState(false);
  const [hoveredStat, setHoveredStat] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["myTasks"],
    queryFn: async () => {
      const res = await api.get("/tasks/my");
      return res.data.data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) =>
      api.patch(`/tasks/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["myTasks"]);
      toast.success("✓ Status updated", { duration: 2000 });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update"),
  });

  // Trigger stats animation on load
  useEffect(() => {
    setAnimateStats(true);
  }, []);

  // Calculate stats
  const stats = {
    total: data?.length || 0,
    completed: data?.filter(t => t.status === "DONE").length || 0,
    inProgress: data?.filter(t => t.status === "IN_PROGRESS").length || 0,
    pending: data?.filter(t => t.status === "PENDING").length || 0,
  };

  const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Filter tasks
  const filteredTasks = data?.filter(task => {
    if (filterStatus === "ALL") return true;
    return task.status === filterStatus;
  }) || [];

  const statCards = [
    { label: "Total", value: stats.total, color: "from-slate-600 to-slate-700", icon: "📋", key: "total" },
    { label: "Pending", value: stats.pending, color: "from-amber-600 to-amber-700", icon: "⏳", key: "pending" },
    { label: "Working", value: stats.inProgress, color: "from-cyan-600 to-teal-600", icon: "⚙️", key: "working" },
    { label: "Done", value: stats.completed, color: "from-emerald-600 to-emerald-700", icon: "✓", key: "done" },
  ];

  const filterOptions = [
    { label: "All Tasks", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Completed", value: "DONE" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header with Animation */}
        <div className="mb-12 fade-in">
          <h1 className="text-5xl font-bold text-slate-100 mb-3 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-400 text-lg flex items-center gap-2">
            <span className="inline-block animate-pulse">👋</span>
            Track and manage your tasks efficiently
          </p>
        </div>

        {/* Progress Section with Enhanced Animation */}
        {!isLoading && stats.total > 0 && (
          <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-800/30 rounded-2xl p-8 mb-10 backdrop-blur-sm hover:border-emerald-700/50 transition-all duration-300 slide-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-100 mb-1">Progress</h2>
                <p className="text-slate-400">
                  <span className="font-semibold text-emerald-400">{stats.completed}</span> of{" "}
                  <span className="font-semibold text-slate-300">{stats.total}</span> completed
                </p>
              </div>
              <div className="text-right">
                <div className="relative">
                  <div className={`text-5xl font-bold transition-all duration-700 ${
                    completionPercentage > 50 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {completionPercentage}%
                  </div>
                  <div className="text-xs text-slate-400 mt-1">completion</div>
                </div>
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-3 text-right">
              🎯 {stats.completed === stats.total ? "All tasks completed! 🎉" : `${stats.total - stats.completed} tasks remaining`}
            </p>
          </div>
        )}

        {/* Stats Cards with Stagger Animation */}
        {!isLoading && stats.total > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {statCards.map((stat, idx) => (
              <div
                key={stat.key}
                className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 hover:from-slate-800/70 hover:to-slate-900/70 transition-all duration-500 backdrop-blur-sm group cursor-pointer transform hover:scale-105 hover:-translate-y-1 ${
                  animateStats ? 'fade-in' : 'opacity-0'
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
                onMouseEnter={() => setHoveredStat(stat.key)}
                onMouseLeave={() => setHoveredStat(null)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-wide">{stat.label}</p>
                    <p
                      className={`text-4xl font-bold mt-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent transition-all duration-300 ${
                        hoveredStat === stat.key ? 'scale-110' : 'scale-100'
                      }`}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <span className={`text-5xl transition-all duration-300 transform ${
                    hoveredStat === stat.key ? 'scale-125 rotate-12' : 'scale-100'
                  }`}>
                    {stat.icon}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filter Buttons with Better Interaction */}
        {!isLoading && stats.total > 0 && (
          <div className="flex gap-3 mb-10 flex-wrap animate-fade-in">
            {filterOptions.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-6 py-2.5 rounded-lg font-bold uppercase text-xs tracking-wider transition-all duration-300 transform ${
                  filterStatus === filter.value
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/50 scale-105"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 hover:scale-102"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}

        {/* Tasks Section with Better Empty States */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block mb-6">
                <div className="w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-300 text-lg font-semibold">Loading tasks...</p>
              <p className="text-slate-500 text-sm mt-2">Please wait while we fetch your tasks</p>
            </div>
          </div>
        ) : data?.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-12 text-center backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300 transform hover:scale-102">
            <div className="text-7xl mb-4 animate-bounce">📭</div>
            <p className="text-slate-300 text-xl font-bold">No tasks assigned yet</p>
            <p className="text-slate-500 text-sm mt-3">Your assigned tasks will appear here</p>
            <div className="mt-6 inline-block px-4 py-2 bg-emerald-900/20 border border-emerald-700/50 rounded-lg">
              <p className="text-emerald-400 text-sm font-semibold">💡 Tip: Check back regularly for new assignments</p>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-12 text-center backdrop-blur-sm hover:border-slate-600/50 transition-all">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-slate-300 text-xl font-bold">No {filterStatus.toLowerCase()} tasks</p>
            <p className="text-slate-500 text-sm mt-2">Try selecting a different filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task, idx) => (
              <div
                key={task.id}
                className="fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <TaskCard
                  task={task}
                  isAdmin={false}
                  onStatusChange={(id, status) =>
                    updateStatus.mutate({ id, status })
                  }
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}