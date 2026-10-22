"use client";

import { useState, useEffect } from "react";
import { ListTodo, Plus, Loader2, Trash2, Link as LinkIcon, ExternalLink, CheckSquare, Square } from "lucide-react";
import Swal from 'sweetalert2';

type Task = {
  id: string;
  title: string;
  url: string;
  type: string;
  rewardAmount: string;
  durationSeconds: number;
};

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    type: 'auto',
    rewardAmount: '',
    durationSeconds: '30'
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/admin/tasks');
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ids: string[], taskTitle?: string) => {
    const isSingle = ids.length === 1;
    const confirmText = isSingle
      ? `Are you sure you want to delete "${taskTitle || 'this task'}"? This action cannot be undone.`
      : `Are you sure you want to delete ${ids.length} selected tasks? This action cannot be undone.`;

    const result = await Swal.fire({
      title: 'Delete Task?',
      text: confirmText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity: "Task", ids })
      });

      if (res.ok) {
        setTasks(prev => prev.filter((item) => !ids.includes(item.id)));
        setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Task deleted successfully.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        const data = await res.json();
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: data.error || 'Failed to delete task'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while deleting task'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === tasks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tasks.map((item) => item.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ title: '', url: '', type: 'auto', rewardAmount: '', durationSeconds: '30' });
        fetchTasks();
        Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'Task created successfully.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        const data = await res.json();
        Swal.fire(data.error || 'Failed to create task');
      }
    } catch (error) {
      Swal.fire('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header and Action Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-2 text-white">
            <ListTodo className="text-orange-400" /> Manage Tasks
          </h2>
          <p className="text-gray-400 text-sm">Create and manage daily tasks (YouTube, Facebook, etc.) for users.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {tasks.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 flex items-center gap-2 transition-all"
            >
              {selectedIds.length === tasks.length ? <CheckSquare size={16} className="text-orange-400" /> : <Square size={16} />}
              <span>{selectedIds.length === tasks.length ? "Deselect All" : "Select All"}</span>
            </button>
          )}

          {selectedIds.length > 0 && (
            <button
              onClick={() => handleDelete(selectedIds)}
              disabled={isDeleting}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-red-600/30"
            >
              {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-600/20"
          >
            <Plus size={18} /> Create Task
          </button>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center p-16 text-orange-500">
            <Loader2 className="animate-spin mb-3" size={36} />
            <p className="text-gray-400 text-sm">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="col-span-full text-center p-16 bg-[#111] rounded-3xl border border-dashed border-white/20 text-gray-400 space-y-3">
            <ListTodo size={40} className="mx-auto text-gray-600" />
            <p className="text-base font-semibold text-white">No tasks created yet.</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">Click "Create Task" button above to add daily reward tasks for your users.</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              <Plus size={16} /> Create First Task
            </button>
          </div>
        ) : (
          tasks.map((task) => {
            const isSelected = selectedIds.includes(task.id);
            return (
              <div 
                key={task.id} 
                className={`bg-[#111] border p-6 rounded-3xl relative transition-all flex flex-col justify-between ${
                  isSelected ? "border-orange-500 bg-orange-500/[0.04]" : "border-white/10 hover:border-white/20"
                }`}
              >
                <div>
                  {/* Top Bar: Checkbox + Badges + Clear Delete Button */}
                  <div className="flex items-center justify-between mb-4 gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSelect(task.id)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title={isSelected ? "Deselect" : "Select"}
                      >
                        {isSelected ? <CheckSquare size={18} className="text-orange-400" /> : <Square size={18} />}
                      </button>
                      <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-gray-300 rounded-full text-xs font-bold uppercase tracking-wider">
                        {task.type}
                      </span>
                      <span className="px-2.5 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-xs font-bold">
                        {task.durationSeconds}s
                      </span>
                    </div>

                    {/* ALWAYS VISIBLE DELETE BUTTON */}
                    <button 
                      type="button"
                      onClick={() => handleDelete([task.id], task.title)}
                      disabled={isDeleting}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-xl border border-red-500/20 transition-all text-xs font-bold shadow-sm"
                      title="Delete this task"
                    >
                      <Trash2 size={15} />
                      <span>Delete</span>
                    </button>
                  </div>
                  
                  {/* Title & Reward */}
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{task.title}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xs text-gray-500 uppercase font-semibold">Reward:</span>
                    <p className="text-2xl font-black text-green-400">৳ {Number(task.rewardAmount).toFixed(2)}</p>
                  </div>
                </div>

                {/* Bottom URL preview & Action */}
                <div className="pt-3 border-t border-white/5 space-y-3">
                  <div className="bg-black/60 p-2.5 rounded-xl border border-white/5 flex items-center justify-between gap-2 overflow-hidden">
                    <div className="flex items-center gap-2 min-w-0">
                      <LinkIcon size={14} className="text-gray-500 shrink-0" />
                      <span className="text-xs text-gray-400 truncate">{task.url}</span>
                    </div>
                    {task.url && (
                      <a 
                        href={task.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors shrink-0"
                        title="Open Link in new tab"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 p-6 sm:p-8 rounded-3xl w-full max-w-md animate-in zoom-in-95 duration-200 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="text-orange-500" size={24} /> Create New Task
            </h3>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Task Title *</label>
                <input 
                  type="text" required
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Subscribe to YouTube Channel"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Target URL *</label>
                <input 
                  type="url" required
                  value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500"
                  placeholder="https://youtube.com/..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Type</label>
                  <select 
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="auto">Auto Task</option>
                    <option value="manual">Manual Task</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Reward (৳) *</label>
                  <input 
                    type="number" required min="0" step="0.01"
                    value={formData.rewardAmount} onChange={e => setFormData({...formData, rewardAmount: e.target.value})}
                    placeholder="e.g. 5.00"
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Duration (Seconds) *</label>
                <input 
                  type="number" required min="1"
                  value={formData.durationSeconds} onChange={e => setFormData({...formData, durationSeconds: e.target.value})}
                  placeholder="e.g. 30"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
