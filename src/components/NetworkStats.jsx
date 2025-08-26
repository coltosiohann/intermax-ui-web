import React, { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Wifi, Globe, Activity } from 'lucide-react';

const NetworkStats = ({ theme }) => {
  const [networkData, setNetworkData] = useState(
    Array.from({ length: 20 }, (_, i) => ({ 
      time: i, 
      up: Math.random() * 50, 
      down: Math.random() * 100 
    }))
  );

  const [currentTraffic, setCurrentTraffic] = useState({
    up: 0,
    down: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const newUp = Math.random() * 50;
      const newDown = Math.random() * 100;
      
      setNetworkData(prev => [
        ...prev.slice(1),
        { 
          time: prev[19].time + 1, 
          up: newUp, 
          down: newDown 
        }
      ]);

      setCurrentTraffic({ up: newUp, down: newDown });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const themeColors = {
    cyan: { text: 'text-cyan-400', border: 'border-cyan-500', stroke: '#06b6d4', strokeSecondary: '#0891b2' },
    green: { text: 'text-green-400', border: 'border-green-500', stroke: '#10b981', strokeSecondary: '#059669' },
    blue: { text: 'text-blue-400', border: 'border-blue-500', stroke: '#3b82f6', strokeSecondary: '#2563eb' },
    purple: { text: 'text-purple-400', border: 'border-purple-500', stroke: '#8b5cf6', strokeSecondary: '#7c3aed' }
  };

  const colors = themeColors[theme];

  return (
    <div className={`p-4 border ${colors.border} bg-black/80 backdrop-blur-sm neon-border ${colors.text} transition-all duration-300`}>
      <div className="flex items-center gap-2 mb-4">
        <Wifi className="w-4 h-4" />
        <h3 className="text-xs font-mono uppercase tracking-wider">NETWORK</h3>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-2 text-xs font-mono bg-black/40 p-3 border border-gray-800">
          <div className="flex justify-between">
            <span className="text-gray-400">STATE</span>
            <span className={`${colors.text} flex items-center gap-1`}>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              ONLINE
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">IPv4</span>
            <span className={colors.text}>192.168.1.139</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">PING</span>
            <span className={colors.text}>14ms</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-3 h-3" />
            <h4 className="text-xs font-mono">TRAFFIC</h4>
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={networkData}>
              <Line type="monotone" dataKey="up" stroke={colors.stroke} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="down" stroke={colors.strokeSecondary} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-between text-xs font-mono mt-2">
            <span className="text-green-400">↑ {Math.round(currentTraffic.up)} KB/s</span>
            <span className="text-red-400">↓ {Math.round(currentTraffic.down)} KB/s</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-3 h-3" />
            <h4 className="text-xs font-mono">WORLD MAP</h4>
          </div>
          <div className="w-full h-32 bg-black/60 border border-gray-800 p-2 overflow-hidden">
            <div className="text-xs font-mono text-gray-600 leading-tight">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="h-2 flex items-center">
                  {Array.from({ length: 50 }, (_, j) => {
                    const char = Math.random() > 0.85 ? '█' : Math.random() > 0.7 ? '▓' : Math.random() > 0.5 ? '▒' : '░';
                    const isHot = Math.random() > 0.95;
                    return (
                      <span key={j} className={`text-xs ${isHot ? colors.text : 'text-gray-700'}`}>
                        {char}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>CONNECTIONS: 47</span>
            <span>LATENCY: 14ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkStats;