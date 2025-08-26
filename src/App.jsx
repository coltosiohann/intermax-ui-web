// src/App.jsx - Complete Version with Admin System
import React, { useState, useEffect } from 'react';
import { Terminal, Settings as SettingsIcon, LogOut, Shield, Menu, X } from 'lucide-react';

// Import components
import LoginPage from './components/LoginPage';
import AdminLoginPage from './components/AdminLoginPage';
import AdminDashboard from './components/AdminDashboard';
import Clock from './components/Clock';
import SystemStats from './components/SystemStats';
import NetworkStats from './components/NetworkStats';
import ProjectsPanel from './components/ProjectsPanel';
import TerminalChat from './components/TerminalChat';
import Settings from './components/Settings';

// Storage utility functions
const StorageManager = {
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
  // App mode state
  const [appMode, setAppMode] = useState('user'); // 'user', 'admin-login', 'admin-dashboard'

  // User authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') {
      return { authenticated: false, user: null, loading: true };
    }

    const session = StorageManager.getItem('intermax-session');
    if (session && session.user && session.timestamp) {
      const now = new Date().getTime();
      if (now - session.timestamp < 86400000) {
        return { authenticated: true, user: session.user, loading: false };
      } else {
        StorageManager.removeItem('intermax-session');
      }
    }
    return { authenticated: false, user: null, loading: false };
  });

  // Admin authentication state (separate from user)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    
    const adminSession = StorageManager.getItem('intermax-admin-session');
    if (adminSession && adminSession.timestamp) {
      const now = new Date().getTime();
      // Admin sessions expire after 2 hours for security
      if (now - adminSession.timestamp < 7200000) {
        return true;
      } else {
        StorageManager.removeItem('intermax-admin-session');
      }
    }
    return false;
  });

  // App state
  const [theme, setTheme] = useState('green');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [activeProject, setActiveProject] = useState(0);
  const [projects, setProjects] = useState(createDefaultProjects);
  const [showSettings, setShowSettings] = useState(false);
  const [appInitialized, setAppInitialized] = useState(false);
  
  // Mobile state
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState('none');

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check URL for admin access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminMode = urlParams.get('admin') === 'true' || window.location.pathname.includes('/admin');
    
    if (isAdminMode) {
      if (isAdminAuthenticated) {
        setAppMode('admin-dashboard');
      } else {
        setAppMode('admin-login');
      }
    } else {
      setAppMode('user');
    }
  }, [isAdminAuthenticated]);

  // Initialize app data
  useEffect(() => {
    if (typeof window === 'undefined' || appInitialized) return;

    const savedTheme = StorageManager.getItem('intermax-theme', 'green');
    setTheme(savedTheme);

    const savedModel = StorageManager.getItem('intermax-model', 'gpt-4o-mini');
    setSelectedModel(savedModel);

    const savedProjects = StorageManager.getItem('intermax-projects');
    if (savedProjects && Array.isArray(savedProjects) && savedProjects.length > 0) {
      const validProjects = savedProjects.filter(project => 
        project && typeof project === 'object' && project.id && project.title && Array.isArray(project.notes)
      );
      
      if (validProjects.length > 0) {
        setProjects(validProjects);
        const savedActiveProject = StorageManager.getItem('intermax-active-project', 0);
        if (savedActiveProject < validProjects.length) {
          setActiveProject(savedActiveProject);
        }
      } else {
        const defaultProjects = createDefaultProjects();
        setProjects(defaultProjects);
        StorageManager.setItem('intermax-projects', defaultProjects);
      }
    } else {
      const defaultProjects = createDefaultProjects();
      setProjects(defaultProjects);
      StorageManager.setItem('intermax-projects', defaultProjects);
    }

    setAppInitialized(true);
  }, [appInitialized]);

  // Handle user login
  const handleLogin = (username) => {
    const sessionData = {
      user: username,
      timestamp: new Date().getTime(),
      version: '2.2.8'
    };
    
    StorageManager.setItem('intermax-session', sessionData);
    setIsAuthenticated({ authenticated: true, user: username, loading: false });
  };

  // Handle admin login (separate from user login)
  const handleAdminLogin = (adminUsername) => {
    const adminSessionData = {
      admin: adminUsername,
      timestamp: new Date().getTime(),
      version: '2.2.8'
    };
    
    StorageManager.setItem('intermax-admin-session', adminSessionData);
    setIsAdminAuthenticated(true);
    setAppMode('admin-dashboard');
  };

  // Handle user logout
  const handleLogout = () => {
    StorageManager.removeItem('intermax-session');
    setIsAuthenticated({ authenticated: false, user: null, loading: false });
    setShowMobileMenu(false);
    setMobileSidebarOpen('none');
  };

  // Handle admin logout
  const handleAdminLogout = () => {
    StorageManager.removeItem('intermax-admin-session');
    setIsAdminAuthenticated(false);
    setAppMode('user');
    window.history.replaceState({}, '', window.location.pathname);
  };

  // Admin access methods
  const goToAdminLogin = () => {
    setAppMode('admin-login');
    window.history.pushState({}, '', '?admin=true');
  };

  const backToMainApp = () => {
    setAppMode('user');
    window.history.replaceState({}, '', window.location.pathname);
  };

  // Save data to storage
  useEffect(() => {
    if (appInitialized && theme) {
      StorageManager.setItem('intermax-theme', theme);
    }
  }, [theme, appInitialized]);

  useEffect(() => {
    if (appInitialized && selectedModel) {
      StorageManager.setItem('intermax-model', selectedModel);
    }
  }, [selectedModel, appInitialized]);

  useEffect(() => {
    if (appInitialized && typeof activeProject === 'number') {
      StorageManager.setItem('intermax-active-project', activeProject);
    }
  }, [activeProject, appInitialized]);

  useEffect(() => {
    if (appInitialized && projects && projects.length > 0) {
      const projectsWithTimestamp = projects.map(project => ({
        ...project,
        lastModified: new Date().toISOString()
      }));
      
      StorageManager.setItem('intermax-projects', projectsWithTimestamp);
    }
  }, [projects, appInitialized]);

  const themeGradients = {
    cyan: 'from-cyan-900/30 via-black to-blue-900/30',
    green: 'from-green-900/30 via-black to-emerald-900/30',
    blue: 'from-blue-900/30 via-black to-indigo-900/30',
    purple: 'from-purple-900/30 via-black to-pink-900/30'
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

  // Loading state
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

  // Admin login page
  if (appMode === 'admin-login') {
    return (
      <AdminLoginPage
        onAdminLogin={handleAdminLogin}
        theme={theme}
        onBackToMain={backToMainApp}
      />
    );
  }

  // Admin dashboard
  if (appMode === 'admin-dashboard' && isAdminAuthenticated) {
    return (
      <AdminDashboard
        theme={theme}
        onBack={backToMainApp}
        onLogout={handleAdminLogout}
        currentUser={isAuthenticated.user || 'N/A'}
      />
    );
  }

  // User login page
  if (!isAuthenticated.authenticated) {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        onAdminLogin={handleAdminLogin}
        theme={theme} 
      />
    );
  }

  // Mobile Menu Component
  const MobileMenu = () => (
    <div className={`fixed inset-0 bg-black/90 backdrop-blur-sm z-50 ${showMobileMenu ? 'block' : 'hidden'}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Terminal className={`w-6 h-6 ${themeAccents[theme]}`} />
            <span className={`font-mono text-lg font-bold ${themeAccents[theme]}`}>InterMAX-UI</span>
          </div>
          <button
            onClick={() => setShowMobileMenu(false)}
            className="p-2 hover:bg-white/10 rounded"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 p-4 space-y-4">
          <button
            onClick={() => {
              setMobileSidebarOpen('left');
              setShowMobileMenu(false);
            }}
            className="w-full flex items-center gap-3 p-4 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <Terminal className="w-5 h-5" />
            <span>Projects & System</span>
          </button>
          
          <button
            onClick={() => {
              setMobileSidebarOpen('right');
              setShowMobileMenu(false);
            }}
            className="w-full flex items-center gap-3 p-4 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <Terminal className="w-5 h-5" />
            <span>Network Stats</span>
          </button>
          
          <button
            onClick={() => {
              setShowSettings(true);
              setShowMobileMenu(false);
            }}
            className="w-full flex items-center gap-3 p-4 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <SettingsIcon className="w-5 h-5" />
            <span>Settings</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 border border-red-600 text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
        
        {/* Hidden Admin Access in Mobile Menu */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => {
              goToAdminLogin();
              setShowMobileMenu(false);
            }}
            className="w-full flex items-center gap-3 p-4 border border-gray-700 hover:border-gray-600 transition-colors opacity-30 hover:opacity-100"
          >
            <Shield className="w-5 h-5" />
            <span className="text-xs">Admin Access</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Main User Application
  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <div className={`w-full h-full bg-gradient-to-br ${themeGradients[theme]} font-mono text-white relative flex flex-col`}>
        
        {/* Animated Background */}
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

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: isMobile ? 15 : 30 }).map((_, i) => (
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

        {/* Header */}
        <header className={`flex-shrink-0 h-16 flex justify-between items-center px-4 border-b border-gray-800/50 bg-black/40 backdrop-blur-md z-10`}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Terminal className={`w-6 h-6 ${themeAccents[theme]} animate-pulse-slow`} />
              <div className="flex flex-col">
                <span className={`font-mono text-lg font-bold ${themeAccents[theme]}`}>InterMAX-UI</span>
                <span className="font-mono text-xs text-gray-500 leading-none">ARIA v2.2.8</span>
              </div>
            </div>
            
            {!isMobile && (
              <nav className="flex gap-6 text-sm font-mono">
                <span className={`${themeAccents[theme]} border-b ${themeBorders[theme]} pb-1`}>TERMINAL</span>
                <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">SYSTEM</span>
                <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">NETWORK</span>
              </nav>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!isMobile && <Clock />}
            
            {/* Desktop Controls */}
            {!isMobile && (
              <>
                <div className="flex items-center gap-2 px-2 py-1 bg-black/40 border border-gray-700 rounded text-xs">
                  <span className="text-gray-400">USER:</span>
                  <span className={`font-mono ${themeAccents[theme]} font-bold`}>
                    {isAuthenticated.user}
                  </span>
                </div>
                
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

                {/* Hidden Admin Access for Desktop */}
                <button
                  onClick={goToAdminLogin}
                  className="p-2 hover:bg-white/10 rounded transition-all duration-300 opacity-10 hover:opacity-100"
                  title="Admin Access"
                >
                  <Shield className="w-5 h-5 text-gray-400" />
                </button>
              </>
            )}
            
            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                onClick={() => setShowMobileMenu(true)}
                className="p-2 hover:bg-white/10 rounded transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0">
          {/* Desktop Layout */}
          {!isMobile && (
            <>
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

              {/* Main Terminal */}
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
            </>
          )}

          {/* Mobile Layout */}
          {isMobile && (
            <>
              {/* Mobile Left Sidebar */}
              {mobileSidebarOpen === 'left' && (
                <div className="fixed inset-0 z-40 bg-black/90 backdrop-blur-sm">
                  <div className="w-80 h-full bg-black/90 border-r border-gray-800 overflow-y-auto">
                    <div className="flex items-center justify-between p-4 border-b border-gray-800">
                      <h2 className="font-mono font-bold">Projects & System</h2>
                      <button
                        onClick={() => setMobileSidebarOpen('none')}
                        className="p-2 hover:bg-white/10 rounded"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-3 space-y-3">
                      <ProjectsPanel 
                        theme={theme} 
                        activeProject={activeProject}
                        setActiveProject={setActiveProject}
                        projects={projects}
                        setProjects={setProjects}
                      />
                      <SystemStats theme={theme} />
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Right Sidebar */}
              {mobileSidebarOpen === 'right' && (
                <div className="fixed inset-0 z-40 bg-black/90 backdrop-blur-sm">
                  <div className="w-80 h-full ml-auto bg-black/90 border-l border-gray-800 overflow-y-auto">
                    <div className="flex items-center justify-between p-4 border-b border-gray-800">
                      <h2 className="font-mono font-bold">Network Stats</h2>
                      <button
                        onClick={() => setMobileSidebarOpen('none')}
                        className="p-2 hover:bg-white/10 rounded"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-3">
                      <NetworkStats theme={theme} />
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Terminal (Full Width) */}
              <div className="flex-1 p-2 bg-black/10 min-w-0">
                <TerminalChat
                  theme={theme}
                  activeProject={activeProject}
                  projects={projects}
                  setProjects={setProjects}
                  selectedModel={selectedModel}
                />
              </div>
            </>
          )}
        </div>

        {/* Status Bar */}
        <div className="flex-shrink-0 h-10 flex justify-between items-center px-4 border-t border-gray-800/50 bg-black/60 backdrop-blur-md text-xs font-mono z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">PROJECTS</span>
              <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full ${themeAccents[theme]} bg-current rounded-full`} style={{width: `${Math.min(100, (projects.length / 10) * 100)}%`}}></div>
              </div>
              <span className={`${themeAccents[theme]} text-xs`}>{projects.length}</span>
            </div>
            {!isMobile && (
              <div className="flex items-center gap-4">
                <span className="text-gray-400">CPU: <span className="text-green-400">23%</span></span>
                <span className="text-gray-400">RAM: <span className="text-yellow-400">16GB</span></span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs">AUTHENTICATED</span>
            </div>
            {!isMobile && <span className="text-gray-400">192.168.1.139</span>}
            <span className={`${themeAccents[theme]} font-bold text-xs`}>ARIA ACTIVE</span>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu />

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