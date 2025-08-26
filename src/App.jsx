// src/App.jsx - Fixed with Persistent Project Storage
import React, { useState, useEffect } from 'react';
import { Terminal, Settings as SettingsIcon, LogOut } from 'lucide-react';

// Import components
import LoginPage from './components/LoginPage';
import Clock from './components/Clock';
import SystemStats from './components/SystemStats';
import NetworkStats from './components/NetworkStats';
import ProjectsPanel from './components/ProjectsPanel';
import TerminalChat from './components/TerminalChat';
import Settings from './components/Settings';

// Storage utility functions
const StorageManager = {
  // Safe localStorage operations with error handling
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      }
    } catch (error) {
      console.warn('localStorage setItem failed:', error);
    }
    return false;
  },

  getItem: (key, defaultValue = null) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      }
    } catch (error) {
      console.warn('localStorage getItem failed:', error);
    }
    return defaultValue;
  },

  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
        return true;
      }
    } catch (error) {
      console.warn('localStorage removeItem failed:', error);
    }
    return false;
  },

  // Check if localStorage is available
  isAvailable: () => {
    try {
      if (typeof window === 'undefined') return false;
      const test = 'localStorage-test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
};

// Default projects factory
const createDefaultProjects = () => [
  { 
    id: Date.now(),
    title: 'Welcome Session', 
    notes: [
      'Initialize ARIA interface',
      `[GPT-4o Mini] ARIA systems online. Neural networks activated. Welcome to InterMAX-UI Terminal v2.2.8.\n\nI am ARIA (Advanced Reasoning Intelligence Agent), your cyberpunk AI assistant. File upload capabilities are active. How may I assist you with your digital operations today?\n\n[Usage: 15 + 45 = 60 tokens]`
    ],
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  }
];

export default function App() {
  // Session state with improved loading
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Only check session on client side
    if (typeof window === 'undefined') {
      return { authenticated: false, user: null, loading: true };
    }

    const session = StorageManager.getItem('intermax-session');
    if (session && session.user && session.timestamp) {
      const now = new Date().getTime();
      // Session expires after 24 hours (86400000 ms)
      if (now - session.timestamp < 86400000) {
        return { authenticated: true, user: session.user, loading: false };
      } else {
        StorageManager.removeItem('intermax-session');
      }
    }
    return { authenticated: false, user: null, loading: false };
  });

  // App state with proper initialization
  const [theme, setTheme] = useState('green');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [activeProject, setActiveProject] = useState(0);
  const [projects, setProjects] = useState(createDefaultProjects);
  const [showSettings, setShowSettings] = useState(false);
  const [appInitialized, setAppInitialized] = useState(false);

  // Initialize app data from storage
  useEffect(() => {
    if (typeof window === 'undefined' || appInitialized) return;

    // Load theme
    const savedTheme = StorageManager.getItem('intermax-theme', 'green');
    setTheme(savedTheme);

    // Load selected model
    const savedModel = StorageManager.getItem('intermax-model', 'gpt-4o-mini');
    setSelectedModel(savedModel);

    // Load projects - this is the critical part
    const savedProjects = StorageManager.getItem('intermax-projects');
    if (savedProjects && Array.isArray(savedProjects) && savedProjects.length > 0) {
      // Validate projects have required fields
      const validProjects = savedProjects.filter(project => 
        project && 
        typeof project === 'object' && 
        project.id && 
        project.title && 
        Array.isArray(project.notes)
      );
      
      if (validProjects.length > 0) {
        setProjects(validProjects);
        
        // Load active project index
        const savedActiveProject = StorageManager.getItem('intermax-active-project', 0);
        if (savedActiveProject < validProjects.length) {
          setActiveProject(savedActiveProject);
        }
      } else {
        // Invalid saved data, use defaults
        const defaultProjects = createDefaultProjects();
        setProjects(defaultProjects);
        StorageManager.setItem('intermax-projects', defaultProjects);
      }
    } else {
      // No saved projects or invalid data, use defaults
      const defaultProjects = createDefaultProjects();
      setProjects(defaultProjects);
      StorageManager.setItem('intermax-projects', defaultProjects);
    }

    // Migration from old eDEX-UI data
    const oldProjects = StorageManager.getItem('edx-projects');
    if (oldProjects && Array.isArray(oldProjects) && !StorageManager.getItem('intermax-projects')) {
      const migratedProjects = oldProjects.map(project => ({
        ...project,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }));
      setProjects(migratedProjects);
      StorageManager.setItem('intermax-projects', migratedProjects);
      StorageManager.removeItem('edx-projects');
    }

    // Migrate other old data
    const oldTheme = StorageManager.getItem('edx-theme');
    if (oldTheme && !StorageManager.getItem('intermax-theme')) {
      setTheme(oldTheme);
      StorageManager.setItem('intermax-theme', oldTheme);
      StorageManager.removeItem('edx-theme');
    }

    const oldModel = StorageManager.getItem('edx-model');
    if (oldModel && !StorageManager.getItem('intermax-model')) {
      setSelectedModel(oldModel);
      StorageManager.setItem('intermax-model', oldModel);
      StorageManager.removeItem('edx-model');
    }

    setAppInitialized(true);
  }, [appInitialized]);

  // Handle login with improved error handling
  const handleLogin = (username) => {
    const sessionData = {
      user: username,
      timestamp: new Date().getTime(),
      version: '2.2.8'
    };
    
    const success = StorageManager.setItem('intermax-session', sessionData);
    if (success) {
      setIsAuthenticated({ authenticated: true, user: username, loading: false });
    } else {
      console.error('Failed to save session data');
      // Still allow login but warn user
      setIsAuthenticated({ authenticated: true, user: username, loading: false });
    }
  };

  // Handle logout
  const handleLogout = () => {
    StorageManager.removeItem('intermax-session');
    setIsAuthenticated({ authenticated: false, user: null, loading: false });
    // Optionally keep projects for next login
    // StorageManager.removeItem('intermax-projects');
  };

  // Save theme to storage whenever it changes
  useEffect(() => {
    if (appInitialized && theme) {
      StorageManager.setItem('intermax-theme', theme);
    }
  }, [theme, appInitialized]);

  // Save selected model to storage whenever it changes
  useEffect(() => {
    if (appInitialized && selectedModel) {
      StorageManager.setItem('intermax-model', selectedModel);
    }
  }, [selectedModel, appInitialized]);

  // Save active project to storage whenever it changes
  useEffect(() => {
    if (appInitialized && typeof activeProject === 'number') {
      StorageManager.setItem('intermax-active-project', activeProject);
    }
  }, [activeProject, appInitialized]);

  // Save projects to storage whenever they change - CRITICAL
  useEffect(() => {
    if (appInitialized && projects && projects.length > 0) {
      // Add timestamp to projects when they change
      const projectsWithTimestamp = projects.map(project => ({
        ...project,
        lastModified: new Date().toISOString()
      }));
      
      const success = StorageManager.setItem('intermax-projects', projectsWithTimestamp);
      if (!success) {
        console.error('Failed to save projects to localStorage');
        // Could implement fallback storage here (e.g., IndexedDB)
      } else {
        console.log(`✅ Projects saved: ${projects.length} items`);
      }
    }
  }, [projects, appInitialized]);

  // Debug: Log storage availability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🔍 Storage Debug Info:');
      console.log('localStorage available:', StorageManager.isAvailable());
      console.log('Projects in storage:', StorageManager.getItem('intermax-projects')?.length || 0);
      console.log('Current projects state:', projects.length);
      console.log('Active project:', activeProject);
    }
  }, [projects, activeProject]);

  const themeGradients = {
    cyan: 'from-cyan-900/30 via-black to-blue-900/30',
    green: 'from-green-900/30 via-black to-emerald-900/30',
    blue: 'from-blue-900/30 via-black to-indigo-900/30',
    purple: 'from-purple-900/30 via-black to-pink-900/30'
  };

  const themeGlows = {
    cyan: 'shadow-cyan-400/20',
    green: 'shadow-green-400/20',
    blue: 'shadow-blue-400/20',
    purple: 'shadow-purple-400/20'
  };

  const themeAccents = {
    cyan: 'text-cyan-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400'
  };

  const themeBorders = {
    cyan: 'border-cyan-400',
    green: 'border-green-400',
    blue: 'border-blue-400',
    purple: 'border-purple-400'
  };

  // Show loading state during initialization
  if (isAuthenticated.loading || !appInitialized) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-black flex items-center justify-center">
        <div className="text-center">
          <Terminal className="w-12 h-12 text-green-400 animate-pulse mx-auto mb-4" />
          <div className="text-green-400 font-mono text-lg">Initializing InterMAX-UI...</div>
          <div className="text-gray-400 font-mono text-sm mt-2">Loading neural networks...</div>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated.authenticated) {
    return <LoginPage onLogin={handleLogin} theme={theme} />;
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      {/* Main Container - Fixed viewport */}
      <div className={`w-full h-full bg-gradient-to-br ${themeGradients[theme]} font-mono text-white relative flex flex-col`}>
        
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '25px 25px',
            animation: 'slide 20s linear infinite'
          }}></div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 ${themeAccents[theme]} opacity-20 animate-pulse`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Header - Fixed height */}
        <header className={`flex-shrink-0 h-16 flex justify-between items-center px-4 border-b border-gray-800/50 bg-black/40 backdrop-blur-md ${themeGlows[theme]} z-10`}>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Terminal className={`w-6 h-6 ${themeAccents[theme]} animate-pulse-slow`} />
              <div className="flex flex-col">
                <span className={`font-mono text-lg font-bold ${themeAccents[theme]}`}>InterMAX-UI</span>
                <span className="font-mono text-xs text-gray-500 leading-none">ARIA v2.2.8</span>
              </div>
            </div>
            <nav className="hidden md:flex gap-6 text-sm font-mono">
              <span className={`${themeAccents[theme]} border-b ${themeBorders[theme]} pb-1`}>TERMINAL</span>
              <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">SYSTEM</span>
              <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">NETWORK</span>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <Clock />
            </div>
            
            {/* Storage Status Indicator */}
            <div className="flex items-center gap-2 px-2 py-1 bg-black/40 border border-gray-700 rounded text-xs">
              <span className="text-gray-400">STORAGE:</span>
              <span className={`font-mono ${StorageManager.isAvailable() ? 'text-green-400' : 'text-red-400'} font-bold`}>
                {StorageManager.isAvailable() ? 'ACTIVE' : 'LIMITED'}
              </span>
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-2 px-2 py-1 bg-black/40 border border-gray-700 rounded text-xs">
              <span className="text-gray-400">USER:</span>
              <span className={`font-mono ${themeAccents[theme]} font-bold`}>
                {isAuthenticated.user}
              </span>
            </div>
            
            {/* AI Model Info */}
            <div className="flex items-center gap-2 px-2 py-1 bg-black/40 border border-gray-700 rounded text-xs">
              <span className="text-gray-400">AI:</span>
              <span className={`font-mono ${themeAccents[theme]} font-bold`}>
                {selectedModel.replace('gpt-', '').toUpperCase()}
              </span>
            </div>
            
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-white/10 rounded transition-all duration-300"
            >
              <SettingsIcon className={`w-5 h-5 text-gray-400 hover:${themeAccents[theme]} transition-colors`} />
            </button>
            
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-500/20 rounded transition-all duration-300 group"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </header>

        {/* Main Content - Flexible height */}
        <div className="flex-1 flex min-h-0">
          {/* Left Sidebar */}
          <div className="w-72 flex-shrink-0 flex flex-col gap-3 p-3 bg-black/20 backdrop-blur-sm border-r border-gray-800/50 overflow-hidden">
            <div className="flex-1 min-h-0">
              <ProjectsPanel 
                theme={theme} 
                activeProject={activeProject}
                setActiveProject={setActiveProject}
                projects={projects}
                setProjects={setProjects}
              />
            </div>
            <div className="flex-1 min-h-0">
              <SystemStats theme={theme} />
            </div>
          </div>

          {/* Main Terminal Area */}
          <div className="flex-1 p-3 bg-black/10 min-w-0">
            <TerminalChat
              theme={theme}
              activeProject={activeProject}
              projects={projects}
              setProjects={setProjects}
              selectedModel={selectedModel}
            />
          </div>

          {/* Right Sidebar */}
          <div className="w-72 flex-shrink-0 p-3 bg-black/20 backdrop-blur-sm border-l border-gray-800/50 overflow-hidden">
            <NetworkStats theme={theme} />
          </div>
        </div>

        {/* Status Bar - Fixed height */}
        <div className="flex-shrink-0 h-10 flex justify-between items-center px-4 border-t border-gray-800/50 bg-black/60 backdrop-blur-md text-xs font-mono z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">PROJECTS</span>
              <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full ${themeAccents[theme]} bg-current rounded-full`} style={{width: `${Math.min(100, (projects.length / 10) * 100)}%`}}></div>
              </div>
              <span className={`${themeAccents[theme]} text-xs`}>{projects.length}</span>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <span className="text-gray-400">CPU: <span className="text-green-400">23%</span></span>
              <span className="text-gray-400">RAM: <span className="text-yellow-400">16GB</span></span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs">AUTHENTICATED</span>
            </div>
            <span className="hidden sm:inline text-gray-400">192.168.1.139</span>
            <span className={`${themeAccents[theme]} font-bold text-xs`}>ARIA ACTIVE</span>
          </div>
        </div>

        {/* Settings Modal */}
        <Settings
          theme={theme}
          setTheme={setTheme}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />

        {/* Global Styles */}
        <style jsx>{`
          @keyframes slide {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-25px, -25px); }
          }
        `}</style>
      </div>
    </div>
  );
}