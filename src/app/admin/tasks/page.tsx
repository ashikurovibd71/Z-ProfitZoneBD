"use client";

import { useState, useEffect } from "react";
import { ListTodo, Plus, Loader2, Trash2, Link as LinkIcon } from "lucide-react";

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

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} item(s)? This action cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity: "Task", ids })
      });
      if (res.ok) {
        setTasks(prev => prev.filter((item: any) => !ids.includes(item.id)));
        setSelectedIds([]);
      } else {
        const data = await res.json();
        alert("Failed to delete: " + data.error);
      }
    } catch (err) {
      alert("Error deleting items");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === tasks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tasks.map((item: any) => item.id));
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
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create task');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
            <ListTodo className="text-orange-400" /> Manage Tasks
          </h2>
          <p className="text-gray-400">Create daily tasks (YouTube, Facebook, etc) for users.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={20} /> Create Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-orange-500">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-gray-400">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="col-span-full text-center p-12 bg-[#111] rounded-2xl border border-dashed border-white/20 text-gray-400">
            No tasks created yet. Click "Create Task" to add one.
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="bg-[#111] border border-white/10 p-6 rounded-3xl relative group">
              <button 
                onClick={() => handleDelete([task.id])}
                className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
              
              <div className="flex gap-2 text-xs font-bold mb-3">
                <span className="px-2 py-1 bg-white/5 text-gray-300 rounded uppercase">{task.type}</span>
                <span className="px-2 py-1 bg-orange-500/10 text-orange-400 rounded">{task.durationSeconds} SECONDS</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{task.title}</h3>
              <p className="text-2xl font-black text-green-400 mb-4">৳ {Number(task.rewardAmount).toFixed(2)}</p>
              
              <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex items-center gap-2 overflow-hidden">
                <LinkIcon size={16} className="text-gray-500 shrink-0" />
                <span className="text-sm text-gray-400 truncate">{task.url}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 p-8 rounded-3xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-white mb-6">Create New Task</h3>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Task Title</label>
                <input 
                  type="text" required
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Subscribe to YouTube Channel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Target URL</label>
                <input 
                  type="url" required
                  value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                  placeholder="https://youtube.com/..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                  <select 
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="auto">Auto Task</option>
                    <option value="manual">Manual Task</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Reward (৳)</label>
                  <input 
                    type="number" required min="0" step="0.01"
                    value={formData.rewardAmount} onChange={e => setFormData({...formData, rewardAmount: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Duration (Seconds)</label>
                <input 
                  type="number" required min="1"
                  value={formData.durationSeconds} onChange={e => setFormData({...formData, durationSeconds: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
