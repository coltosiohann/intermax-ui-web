import React, { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Cpu, HardDrive, Zap } from 'lucide-react';

const SystemStats = ({ theme }) => {
  const [stats, setStats] = useState({
    cpu: Array.from({ length: 20 }, (_, i) => ({ time: i, value: Math.random() * 100 })),
    memory: Array.from({ length: 20 }, (_, i) => ({ time: i, value: Math.random() * 100 })),
    uptime: '4 hours, 30 minutes',
    temp: '39°C',
    processes: [
      { pid: 15184, name: 'electron', cpu: '25%', mem: '2.8%' },
      { pid: 16715, name: 'Discord', cpu: '12%', mem: '2.0%' },
      { pid: 14968, name: 'electron', cpu: '10%', mem: '1.5%' },
      { pid: 1586, name: 'gnome-shell', cpu: '4%', mem: '3.8%' },
      { pid: 14934, name: 'electron', cpu: '3%', mem: '1.4%' }
    ]
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        cpu: [...prev.cpu.slice(1), { time: prev.cpu[19].time + 1, value: Math.random() * 100 }],
        memory: [...prev.memory.slice(1), { time: prev.memory[19].time + 1, value: Math.random() * 100 }]
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const themeColors = {
    cyan: { text: 'text-cyan-400', border: 'border-cyan-500', stroke: '#06b6d4', glow: 'glow-cyan' },
    green: { text: 'text-green-400', border: 'border-green-500', stroke: '#10b981', glow: 'glow-green' },
    blue: { text: 'text-blue-400', border: 'border-blue-500', stroke: '#3b82f6', glow: 'glow-blue' },
    purple: { text: 'text-purple-400', border: 'border-purple-500', stroke: '#8b5cf6', glow: 'glow-purple' }
  };

  const colors = themeColors[theme];

  return (
    <div className={`p-4 border ${colors.border} bg-black/80 backdrop-blur-sm neon-border ${colors.text} transition-all duration-300`}>
      <div className="flex items-center gap-2 mb-4">
        <Cpu className="w-4 h-4" />
        <h3 className="text-xs font-mono uppercase tracking-wider">SYSTEM</h3>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="flex flex-col">
            <span className="text-gray-400">UPTIME</span>
            <span className={colors.text}>{stats.uptime}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400">TEMP</span>
            <span className={colors.text}>{stats.temp}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3 h-3" />
            <h4 className="text-xs font-mono">CPU USAGE</h4>
          </div>
          <ResponsiveContainer width="100%" height={50}>
            <LineChart data={stats.cpu}>
              <Line type="monotone" dataKey="value" stroke={colors.stroke} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-xs text-gray-400 mt-1">
            Avg: {Math.round(stats.cpu[stats.cpu.length - 1].value)}%
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-3 h-3" />
            <h4 className="text-xs font-mono">MEMORY</h4>
          </div>
          <ResponsiveContainer width="100%" height={50}>
            <LineChart data={stats.memory}>
              <Line type="monotone" dataKey="value" stroke={colors.stroke} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-xs text-gray-400 mt-1">
            Used: 16.0 GB / 32.0 GB
          </div>
        </div>

        <div>
          <h4 className="text-xs font-mono mb-2">TOP PROCESSES</h4>
          <div className="space-y-1 text-xs font-mono bg-black/40 p-2 border border-gray-800">
            <div className="flex justify-between text-gray-400">
              <span>NAME</span>
              <span>CPU</span>
              <span>MEM</span>
            </div>
            {stats.processes.map(process => (
              <div key={process.pid} className="flex justify-between hover:bg-black/40 px-1">
                <span className="truncate w-20">{process.name}</span>
                <span className={colors.text}>{process.cpu}</span>
                <span className={colors.text}>{process.mem}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;