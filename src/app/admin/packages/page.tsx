"use client";

import { useState, useEffect } from "react";
import { Package as PackageIcon, Plus, Loader2, Trash2 } from "lucide-react";
import Swal from 'sweetalert2';

type Package = {
  id: string;
  name: string;
  description: string;
  price: string;
  durationDays: number;
  dailyTasks: number;
};

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    durationDays: '',
    dailyTasks: ''
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/admin/packages');
      const data = await res.json();
      if (res.ok) {
        setPackages(data.packages || []);
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
        body: JSON.stringify({ entity: "Package", ids })
      });
      if (res.ok) {
        setPackages(prev => prev.filter((item: any) => !ids.includes(item.id)));
        setSelectedIds([]);
      } else {
        const data = await res.json();
        Swal.fire("Failed to delete: " + data.error);
      }
    } catch (err) {
      Swal.fire("Error deleting items");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === packages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(packages.map((item: any) => item.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', description: '', price: '', durationDays: '', dailyTasks: '' });
        fetchPackages();
      } else {
        const data = await res.json();
        Swal.fire(data.error || 'Failed to create package');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
            <PackageIcon className="text-blue-400" /> Manage Packages
          </h2>
          <p className="text-gray-400">Create and manage task packages for users.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={20} /> Create Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-blue-500">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-gray-400">Loading packages...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="col-span-full text-center p-12 bg-[#111] rounded-2xl border border-dashed border-white/20 text-gray-400">
            No packages created yet. Click "Create Package" to add one.
          </div>
        ) : (
          packages.map((pkg) => (
            <div key={pkg.id} className="bg-[#111] border border-white/10 p-6 rounded-3xl relative group">
              <button 
                onClick={() => handleDelete([pkg.id])}
                className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
              
              <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
              <p className="text-2xl font-black text-blue-400 mb-4">৳ {Number(pkg.price).toFixed(2)}</p>
              
              <div className="space-y-2 mb-4 text-sm text-gray-300">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Duration:</span>
                  <span className="font-bold text-white">{pkg.durationDays} Days</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Daily Tasks:</span>
                  <span className="font-bold text-white">{pkg.dailyTasks} Tasks</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 line-clamp-3">{pkg.description}</p>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 p-8 rounded-3xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-white mb-6">Create New Package</h3>
            
            <form onSubmit={handleCreatePackage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Package Name</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Starter Pack"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Price (৳)</label>
                  <input 
                    type="number" required min="0" step="0.01"
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Duration (Days)</label>
                  <input 
                    type="number" required min="1"
                    value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Daily Tasks Limit</label>
                <input 
                  type="number" required min="1"
                  value={formData.dailyTasks} onChange={e => setFormData({...formData, dailyTasks: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Short description..."
                ></textarea>
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
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
