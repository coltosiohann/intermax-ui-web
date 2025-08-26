// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, MessageSquare, Folder, Calendar, Clock, Search, 
  Filter, Download, Eye, Trash2, BarChart3, Activity, Database,
  ArrowLeft, RefreshCw, ExternalLink, FileText, User, Settings, LogOut
} from 'lucide-react';

const AdminDashboard = ({ theme, onBack, onLogout, currentUser }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [userProjects, setUserProjects] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  // Load all user data from localStorage
  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = () => {
    setLoading(true);
    
    // Get all localStorage keys related to InterMAX
    const allKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('intermax-') || key.startsWith('edx-')
    );

    const projects = [];
    const sessions = [];
    let totalMessages = 0;
    let totalUsers = new Set();

    // Parse all stored data
    allKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        
        if (key.includes('projects')) {
          if (Array.isArray(data)) {
            data.forEach(project => {
              projects.push({
                ...project,
                user: extractUserFromKey(key),
                storageKey: key,
                messageCount: Math.floor(project.notes?.length / 2) || 0
              });
              totalMessages += project.notes?.length || 0;
            });
          }
        }
        
        if (key.includes('session')) {
          sessions.push({
            ...data,
            key: key,
            lastActive: new Date(data.timestamp || Date.now()).toISOString()
          });
          if (data.user) totalUsers.add(data.user);
        }
      } catch (error) {
        console.warn('Failed to parse data for key:', key);
      }
    });

    setUserProjects(projects);
    setStats({
      totalProjects: projects.length,
      totalMessages: Math.floor(totalMessages / 2), // Divide by 2 since notes contain both user and AI messages
      totalUsers: totalUsers.size,
      activeSessions: sessions.filter(s => isSessionActive(s.timestamp)).length,
      storageUsed: calculateStorageUsage(),
      lastUpdated: new Date().toISOString()
    });
    
    setLoading(false);
  };

  const extractUserFromKey = (key) => {
    // Try to extract user info from storage patterns
    if (key.includes('session')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        return data.user || 'Unknown';
      } catch {
        return 'Unknown';
      }
    }
    return 'System';
  };

  const isSessionActive = (timestamp) => {
    if (!timestamp) return false;
    const now = new Date().getTime();
    const sessionTime = new Date(timestamp).getTime();
    return (now - sessionTime) < 86400000; // 24 hours
  };

  const calculateStorageUsage = () => {
    let totalSize = 0;
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('intermax-') || key.startsWith('edx-')) {
        totalSize += localStorage.getItem(key).length;
      }
    });
    return formatBytes(totalSize);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredProjects = userProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'today' && isToday(project.lastModified || project.createdAt)) ||
                       (dateFilter === 'week' && isThisWeek(project.lastModified || project.createdAt));
    
    return matchesSearch && matchesDate;
  });

  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isThisWeek = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  };

  const exportData = () => {
    const exportData = {
      stats,
      projects: userProjects,
      exportDate: new Date().toISOString(),
      version: '2.2.8'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intermax-admin-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearOldData = () => {
    if (window.confirm('Are you sure you want to clear data older than 30 days? This cannot be undone.')) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('intermax-') && key.includes('projects')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(data)) {
              const recentProjects = data.filter(project => {
                const projectDate = new Date(project.lastModified || project.createdAt || 0);
                return projectDate > thirtyDaysAgo;
              });
              
              if (recentProjects.length !== data.length) {
                localStorage.setItem(key, JSON.stringify(recentProjects));
              }
            }
          } catch (error) {
            console.warn('Failed to clean data for key:', key);
          }
        }
      });
      
      loadAdminData(); // Refresh data
      alert('Old data cleaned successfully!');
    }
  };

  const themeColors = {
    cyan: { primary: 'text-cyan-400', border: 'border-cyan-400', bg: 'bg-cyan-400/10' },
    green: { primary: 'text-green-400', border: 'border-green-400', bg: 'bg-green-400/10' },
    blue: { primary: 'text-blue-400', border: 'border-blue-400', bg: 'bg-blue-400/10' },
    purple: { primary: 'text-purple-400', border: 'border-purple-400', bg: 'bg-purple-400/10' }
  };

  const colors = themeColors[theme] || themeColors.green;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Shield className={`w-12 h-12 ${colors.primary} animate-pulse mx-auto mb-4`} />
          <div className={`${colors.primary} font-mono text-lg`}>Loading Admin Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
      <header className={`border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded transition-colors md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <Shield className={`w-6 h-6 ${colors.primary}`} />
              <div>
                <h1 className={`text-lg font-bold ${colors.primary}`}>Admin Dashboard</h1>
                <p className="text-xs text-gray-400">InterMAX-UI Control Center</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={loadAdminData}
              className="p-2 hover:bg-white/10 rounded transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-400 hover:bg-red-400/10 rounded transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Admin Logout
            </button>
          </div>
        </div>

        {/* Mobile/Desktop Navigation */}
        <div className="flex overflow-x-auto border-t border-gray-800">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'projects', label: 'Projects', icon: Folder },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? `${colors.border} ${colors.primary}` 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-7xl mx-auto">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 border ${colors.border} bg-black/40 backdrop-blur-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <Folder className={`w-5 h-5 ${colors.primary}`} />
                  <span className="text-2xl font-bold">{stats.totalProjects}</span>
                </div>
                <p className="text-sm text-gray-400">Total Projects</p>
              </div>
              
              <div className={`p-4 border ${colors.border} bg-black/40 backdrop-blur-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <MessageSquare className={`w-5 h-5 ${colors.primary}`} />
                  <span className="text-2xl font-bold">{stats.totalMessages}</span>
                </div>
                <p className="text-sm text-gray-400">Messages</p>
              </div>
              
              <div className={`p-4 border ${colors.border} bg-black/40 backdrop-blur-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <Users className={`w-5 h-5 ${colors.primary}`} />
                  <span className="text-2xl font-bold">{stats.totalUsers}</span>
                </div>
                <p className="text-sm text-gray-400">Total Users</p>
              </div>
              
              <div className={`p-4 border ${colors.border} bg-black/40 backdrop-blur-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <Database className={`w-5 h-5 ${colors.primary}`} />
                  <span className="text-2xl font-bold">{stats.storageUsed}</span>
                </div>
                <p className="text-sm text-gray-400">Storage Used</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`p-6 border ${colors.border} bg-black/40`}>
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={exportData}
                  className={`flex items-center gap-2 px-4 py-2 border ${colors.border} ${colors.primary} hover:${colors.bg} transition-colors`}
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
                <button
                  onClick={clearOldData}
                  className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clean Old Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects or users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black border border-gray-600 pl-10 pr-4 py-2 text-sm focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>
              
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-black border border-gray-600 px-4 py-2 text-sm focus:border-cyan-400 outline-none"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
              </select>
            </div>

            {/* Projects List */}
            <div className="space-y-3">
              {filteredProjects.map(project => (
                <div
                  key={`${project.storageKey}-${project.id}`}
                  className="border border-gray-700 bg-black/40 p-4 hover:border-gray-600 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <h3 className="font-bold">{project.title}</h3>
                        <span className={`px-2 py-1 text-xs border ${colors.border} ${colors.primary}`}>
                          {project.messageCount} msgs
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {project.user}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {project.lastModified ? new Date(project.lastModified).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedProject(project)}
                      className={`flex items-center gap-2 px-4 py-2 border ${colors.border} ${colors.primary} hover:${colors.bg} transition-colors text-sm`}
                    >
                      <Eye className="w-4 h-4" />
                      View Chat
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredProjects.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No projects found matching your filters</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className={`p-6 border ${colors.border} bg-black/40`}>
              <h3 className="text-lg font-bold mb-4">User Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-700">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-bold">{currentUser}</p>
                      <p className="text-sm text-gray-400">Current Session</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className={`p-6 border ${colors.border} bg-black/40`}>
              <h3 className="text-lg font-bold mb-4">System Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold mb-2">Storage Usage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Projects Data</span>
                      <span>{stats.storageUsed}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded">
                      <div className={`h-full ${colors.bg} rounded`} style={{width: '65%'}}></div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold mb-2">Activity Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Conversations:</span>
                      <span className={colors.primary}>{stats.totalMessages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Projects:</span>
                      <span className={colors.primary}>{stats.totalProjects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span className="text-gray-400">
                        {new Date(stats.lastUpdated).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-bold">{selectedProject.title}</h2>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 hover:bg-white/10 rounded transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="space-y-4">
                {selectedProject.notes && selectedProject.notes.map((note, index) => (
                  <div key={index} className={`p-3 border-l-2 ${
                    index % 2 === 0 ? 'border-yellow-400 bg-yellow-400/5' : `${colors.border} ${colors.bg}`
                  }`}>
                    <div className="text-xs text-gray-400 mb-1">
                      {index % 2 === 0 ? 'USER' : 'ARIA'}
                    </div>
                    <div className="whitespace-pre-wrap">{note}</div>
                  </div>
                ))}
                
                {(!selectedProject.notes || selectedProject.notes.length === 0) && (
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No messages in this project</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;