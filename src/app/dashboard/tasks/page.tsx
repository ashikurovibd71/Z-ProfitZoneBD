"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, Lock, ArrowRight, Loader2, Link as LinkIcon, DollarSign, CheckSquare } from "lucide-react";
import AutoTaskModal from "./AutoTaskModal";
import ManualTaskModal from "./ManualTaskModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TasksPage() {
  const router = useRouter();
  const [activeAutoTask, setActiveAutoTask] = useState<any>(null);
  const [activeManualTask, setActiveManualTask] = useState<any>(null);
  
  const [hasPackage, setHasPackage] = useState(true);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/user/tasks");
      const d = await res.json();
      if (res.ok) {
        if (d.locked) {
          setHasPackage(false);
        } else {
          setHasPackage(true);
          setData(d);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = () => {
    setActiveAutoTask(null);
    setActiveManualTask(null);
    // Hard refresh to update the wallet balance in the layout header instantly
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-indigo-500">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-gray-400">Loading tasks...</p>
      </div>
    );
  }

  if (!hasPackage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
          <Lock size={40} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Tasks Locked</h2>
        <p className="text-gray-400 max-w-md text-center mb-8">
          You don't have an active package. To complete tasks and earn money, please purchase a package first.
        </p>
        <Link 
          href="/dashboard/packages"
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
        >
          View Packages <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 p-6 rounded-3xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <CheckSquare size={24} />
            </div>
            <div>
              <p className="text-xs md:text-sm text-indigo-300">Total Tasks Completed</p>
              <h3 className="text-xl md:text-2xl font-bold text-white">{data.totalCompleted}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/20 p-6 rounded-3xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs md:text-sm text-green-300">Total Earned from Tasks</p>
              <h3 className="text-xl md:text-2xl font-bold text-white">৳ {Number(data.totalEarned).toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 md:mb-2">Available Tasks</h2>
          <p className="text-sm md:text-base text-gray-400">Complete tasks to earn money. Auto tasks credit instantly.</p>
        </div>
        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm">
          Daily Limit: <span className="font-bold text-white">{data.completedToday} / {data.dailyLimit}</span>
        </div>
      </div>

      {data.availableTasks.length === 0 ? (
        <div className="text-center p-12 bg-[#111] rounded-3xl border border-white/10">
          <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">No more tasks available</h3>
          <p className="text-gray-400">You have completed all available tasks or reached your daily limit.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.availableTasks.map((task: any) => (
            <div key={task.id} className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors flex flex-col justify-between h-full group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${task.type === 'auto' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                    {task.type === 'auto' ? <Clock size={24} /> : <LinkIcon size={24} /> }
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Reward</p>
                    <p className="font-bold text-xl text-green-400">৳ {Number(task.rewardAmount).toFixed(2)}</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{task.title}</h3>
                <div className="flex gap-2 text-xs font-medium mb-6">
                  <span className={`px-2 py-1 rounded bg-white/5 uppercase ${task.type === 'auto' ? 'text-blue-400' : 'text-orange-400'}`}>
                    {task.type} TASK
                  </span>
                  {task.type === 'auto' && (
                    <span className="px-2 py-1 rounded bg-white/5 text-gray-300">
                      {task.durationSeconds} SECONDS
                    </span>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => task.type === 'auto' ? setActiveAutoTask(task) : setActiveManualTask(task)}
                className="w-full py-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-xl font-medium transition-all group-hover:bg-indigo-600 group-hover:text-white"
              >
                Start Task
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Completed Today Section */}
      {data.completedTodayTasks && data.completedTodayTasks.length > 0 && (
        <div className="pt-8 border-t border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-green-500" /> Completed Today
          </h3>
          <div className="space-y-3">
            {data.completedTodayTasks.map((t: any) => (
              <div key={t.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="font-medium">{t.title}</span>
                <span className="text-green-400 font-bold">+ ৳ {Number(t.rewardAmount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeAutoTask && (
        <AutoTaskModal task={activeAutoTask} onClose={() => setActiveAutoTask(null)} onComplete={handleTaskComplete} />
      )}
      
      {activeManualTask && (
        <ManualTaskModal task={activeManualTask} onClose={() => setActiveManualTask(null)} onComplete={handleTaskComplete} />
      )}
    </div>
  );
}
