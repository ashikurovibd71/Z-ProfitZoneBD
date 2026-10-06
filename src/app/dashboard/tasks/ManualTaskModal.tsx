"use client";

import { useState } from "react";
import { Upload, ExternalLink } from "lucide-react";
import Swal from 'sweetalert2';

export default function ManualTaskModal({ task, onClose, onComplete }: { task: any, onClose: () => void, onComplete: () => void }) {
  const [proof, setProof] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proof) return;
    setSubmitting(true);
    
    // Simulate image upload (since it's an instant reward system per user request)
    // Then call completion API
    try {
      const res = await fetch('/api/user/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id })
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire(`Successfully claimed ৳${task.rewardAmount}`);
        onComplete();
      } else {
        Swal.fire(data.error || 'Failed to claim reward');
        onClose();
      }
    } catch (e) {
      Swal.fire('An error occurred');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111] border border-white/10 p-8 rounded-3xl max-w-md w-full relative">
        <h3 className="text-2xl font-bold mb-2">{task.title}</h3>
        <p className="text-gray-400 mb-6">Follow the link, complete the action, and upload a screenshot as proof.</p>

        <a href={task.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors mb-6 border border-white/5">
          <span className="font-medium">Go to Task Link</span>
          <ExternalLink size={20} className="text-indigo-400" />
        </a>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Upload Screenshot Proof</label>
            <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setProof(e.target.files?.[0] || null)}
                required
              />
              <Upload className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-400 font-medium">
                {proof ? proof.name : "Click or drag image here"}
              </p>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
            {submitting ? "Submitting..." : "Submit Proof & Claim Reward"}
          </button>
        </form>

        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white">
          Close
        </button>
      </div>
    </div>
  );
}
