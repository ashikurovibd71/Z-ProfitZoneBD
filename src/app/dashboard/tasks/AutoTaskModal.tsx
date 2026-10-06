"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, ExternalLink, CheckCircle } from "lucide-react";
import Swal from 'sweetalert2';

export default function AutoTaskModal({ task, onClose, onComplete }: { task: any, onClose: () => void, onComplete: () => void }) {
  const [status, setStatus] = useState<"IDLE" | "RUNNING" | "COMPLETED">("IDLE");
  const [timeLeft, setTimeLeft] = useState(task.durationSeconds || 30);
  const [claiming, setClaiming] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTask = () => {
    setStatus("RUNNING");
    // Open link in new tab
    window.open(task.url, "_blank");
  };

  useEffect(() => {
    if (status !== "RUNNING") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause timer if they switch tabs
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        // Resume timer
        startTimer();
      }
    };

    const startTimer = () => {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev: number) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setStatus("COMPLETED");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    // Initial start
    startTimer();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status]);

  const claimReward = async () => {
    setClaiming(true);
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
      setClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111] border border-white/10 p-8 rounded-3xl max-w-md w-full relative">
        <h3 className="text-2xl font-bold mb-2">{task.title}</h3>
        <p className="text-gray-400 mb-8">You must keep this tab open for {task.durationSeconds || 30} seconds to earn the reward.</p>

        {status === "IDLE" && (
          <button onClick={startTask} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2">
            Start & Open Link <ExternalLink size={20} />
          </button>
        )}

        {status === "RUNNING" && (
          <div className="text-center py-8 bg-black/50 rounded-2xl border border-white/5">
            <Loader2 className="animate-spin mx-auto text-indigo-500 mb-4" size={48} />
            <div className="text-5xl font-bold text-white mb-2">{timeLeft}s</div>
            <p className="text-sm text-yellow-500 animate-pulse">Stay on this page. Timer pauses if you leave!</p>
          </div>
        )}

        {status === "COMPLETED" && (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h4 className="text-2xl font-bold text-white mb-6">Task Completed!</h4>
            <button onClick={claimReward} disabled={claiming} className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl font-bold text-lg transition-colors shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2">
              {claiming ? <Loader2 className="animate-spin" size={24} /> : `Claim ৳${Number(task.rewardAmount).toFixed(2)}`}
            </button>
          </div>
        )}

        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white">
          Close
        </button>
      </div>
    </div>
  );
}
