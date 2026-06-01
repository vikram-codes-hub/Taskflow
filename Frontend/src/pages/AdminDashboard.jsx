import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [animateStats, setAnimateStats] = useState(false);
  const [hoveredStat, setHoveredStat] = useState(null);

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["allTasks"],
    queryFn: async () => {
      const res = await api.get("/tasks");
      return res.data.data;
    },
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data.data;
    },
  });

  const createTask = useMutation({
    mutationFn: (data) => api.post("/tasks", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["allTasks"]);
      setModalOpen(false);
      setEditTask(null);
      toast.success("✓ Task created successfully", { duration: 2000 });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create"),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["allTasks"]);
      setModalOpen(false);
      setEditTask(null);
      toast.success("✓ Task updated successfully", { duration: 2000 });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update"),
  });

  const deleteTask = useMutation({
    mutationFn: (id) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["allTasks"]);
      toast.success("✓ Task deleted successfully", { duration: 2000 });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete"),
  });

  // Trigger animations on load
  useEffect(() => {
    setAnimateStats(true);
  }, []);

  const handleSubmit = (formData) => {
    if (editTask) {
      updateTask.mutate({ id: editTask.id, ...formData });
    } else {
      createTask.mutate(formData);
    }
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditTask(null);
    setModalOpen(true);
  };

  const stats = {
    total: tasks?.length || 0,
    pending: tasks?.filter((t) => t.status === "PENDING").length || 0,
    inProgress: tasks?.filter((t) => t.status === "IN_PROGRESS").length || 0,
    done: tasks?.filter((t) => t.status === "DONE").length || 0,
    users: users?.length || 0,
  };

  const completionPercentage = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  // Filter tasks
  const filteredTasks = tasks?.filter(task => {
    if (filterStatus === "ALL") return true;
    return task.status === filterStatus;
  }) || [];

  const statCards = [
    { label: "Total Tasks", value: stats.total, color: "from-slate-600 to-slate-700", icon: "📋", key: "total" },
    { label: "Pending", value: stats.pending, color: "from-amber-600 to-amber-700", icon: "⏳", key: "pending" },
    { label: "In Progress", value: stats.inProgress, color: "from-cyan-600 to-teal-600", icon: "⚙️", key: "working" },
    { label: "Completed", value: stats.done, color: "from-emerald-600 to-emerald-700", icon: "✓", key: "done" },
    { label: "Team Members", value: stats.users, color: "from-purple-600 to-violet-600", icon: "👥", key: "users" },
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
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header with Animation */}
        <div className="mb-12 fade-in">
          <h1 className="text-5xl font-bold text-slate-100 mb-3 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 text-lg flex items-center gap-2">
            <span className="inline-block animate-pulse">👑</span>
            Manage all team tasks and assignments
          </p>
        </div>

        {/* Progress Section */}
        {!tasksLoading && stats.total > 0 && (
          <div className="bg-gradient-to-r from-purple-900/20 to-violet-900/20 border border-purple-800/30 rounded-2xl p-8 mb-10 backdrop-blur-sm hover:border-purple-700/50 transition-all duration-300 slide-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-100 mb-1">Task Completion</h2>
                <p className="text-slate-400">
                  <span className="font-semibold text-purple-400">{stats.done}</span> of{" "}
                  <span className="font-semibold text-slate-300">{stats.total}</span> completed
                </p>
              </div>
              <div className="text-right">
                <div className={`text-5xl font-bold transition-all duration-700 ${
                  completionPercentage > 50 ? 'text-purple-400' : 'text-amber-400'
                }`}>
                  {completionPercentage}%
                </div>
                <div className="text-xs text-slate-400 mt-1">overall progress</div>
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-3 text-right">
              {stats.done === stats.total ? "🎉 All team tasks completed!" : `${stats.total - stats.done} tasks remaining`}
            </p>
          </div>
        )}

        {/* Stats Cards with Stagger Animation */}
        {!tasksLoading && stats.total > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
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

        {/* Action Header */}
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div>
            {!tasksLoading && stats.total > 0 && (
              <div className="flex gap-3 flex-wrap">
                {filterOptions.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterStatus(filter.value)}
                    className={`px-6 py-2.5 rounded-lg font-bold uppercase text-xs tracking-wider transition-all duration-300 transform ${
                      filterStatus === filter.value
                        ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/50 scale-105"
                        : "bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 hover:scale-102"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30 uppercase tracking-wide"
          >
            + Create Task
          </button>
        </div>

        {/* Tasks Grid with Better Empty States */}
        {tasksLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block mb-6">
                <div className="w-16 h-16 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-300 text-lg font-semibold">Loading tasks...</p>
              <p className="text-slate-500 text-sm mt-2">Gathering team task data</p>
            </div>
          </div>
        ) : tasks?.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-12 text-center backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300">
            <div className="text-7xl mb-4 animate-bounce">📭</div>
            <p className="text-slate-300 text-xl font-bold">No tasks created yet</p>
            <p className="text-slate-500 text-sm mt-3">Start by creating your first task assignment</p>
            <div className="mt-6 inline-block px-4 py-2 bg-purple-900/20 border border-purple-700/50 rounded-lg">
              <p className="text-purple-400 text-sm font-semibold">💡 Tip: Create and assign tasks to team members</p>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-12 text-center backdrop-blur-sm">
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
                  isAdmin={true}
                  onEdit={handleEdit}
                  onDelete={(id) => deleteTask.mutate(id)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Team Members Section */}
        {!usersLoading && users?.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-700/50">
            <h2 className="text-3xl font-bold text-slate-100 mb-8 flex items-center gap-3">
              <span>👥 Team Members</span>
              <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-900/30 border border-purple-700/50 rounded-full text-xs font-bold text-purple-400">
                {users.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user, idx) => {
                const userTasks = tasks?.filter(t => t.assignedTo === user.id) || [];
                const userCompleted = userTasks.filter(t => t.status === "DONE").length;
                const userProgress = userTasks.length > 0 ? Math.round((userCompleted / userTasks.length) * 100) : 0;

                return (
                  <div
                    key={user.id}
                    className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 hover:from-slate-800/70 hover:to-slate-900/70 transition-all duration-300 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-2 ${
                      animateStats ? 'fade-in' : 'opacity-0'
                    }`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-100 font-bold text-sm">{user.name}</p>
                          <p className="text-slate-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide ${
                        user.role === "ADMIN"
                          ? "bg-amber-900/30 text-amber-400 border border-amber-700/50"
                          : "bg-emerald-900/30 text-emerald-400 border border-emerald-700/50"
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-xs text-slate-400 font-semibold">Task Progress</p>
                          <p className="text-xs font-bold text-purple-400">{userProgress}%</p>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all duration-500"
                            style={{ width: `${userProgress}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 text-xs text-slate-400">
                        <span>📋 {userTasks.length} tasks</span>
                        <span>✓ {userCompleted} done</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Task Modal */}
      {modalOpen && (
        <TaskModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditTask(null);
          }}
          onSubmit={handleSubmit}
          initialTask={editTask}
          users={users || []}
          isLoading={createTask.isPending || updateTask.isPending}
        />
      )}
    </div>
  );
}