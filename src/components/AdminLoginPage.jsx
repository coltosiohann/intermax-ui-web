// src/components/AdminLoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Shield, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Terminal } from 'lucide-react';

const AdminLoginPage = ({ onAdminLogin, theme = 'green', onBackToMain }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [systemMessages, setSystemMessages] = useState([]);

  // Admin credentials - different from Paul's user credentials
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'intermax-admin-2025'
  };

  const themeColors = {
    cyan: {
      primary: 'text-cyan-400',
      border: 'border-cyan-400',
      bg: 'bg-cyan-400/10',
      glow: 'shadow-cyan-400/50',
      gradient: 'from-cyan-900/30 via-black to-blue-900/30'
    },
    green: {
      primary: 'text-green-400',
      border: 'border-green-400',
      bg: 'bg-green-400/10',
      glow: 'shadow-green-400/50',
      gradient: 'from-green-900/30 via-black to-emerald-900/30'
    },
    blue: {
      primary: 'text-blue-400',
      border: 'border-blue-400',
      bg: 'bg-blue-400/10',
      glow: 'shadow-blue-400/50',
      gradient: 'from-blue-900/30 via-black to-indigo-900/30'
    },
    purple: {
      primary: 'text-purple-400',
      border: 'border-purple-400',
      bg: 'bg-purple-400/10',
      glow: 'shadow-purple-400/50',
      gradient: 'from-purple-900/30 via-black to-pink-900/30'
    }
  };

  const colors = themeColors[theme];

  // Admin system messages
  useEffect(() => {
    const messages = [
      'Initializing InterMAX-UI Admin Console...',
      'Loading administrative protocols...',
      'Establishing secure admin connection...',
      'Admin authentication required...',
      'Enter admin credentials to access control panel...'
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < messages.length) {
        setSystemMessages(prev => [...prev, {
          id: Date.now() + currentIndex,
          text: messages[currentIndex],
          timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false })
        }]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      setError('All fields are required');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate authentication delay
    setTimeout(() => {
      if (
        credentials.username === ADMIN_CREDENTIALS.username &&
        credentials.password === ADMIN_CREDENTIALS.password
      ) {
        // Success
        setSystemMessages(prev => [...prev, {
          id: Date.now(),
          text: `Admin authentication successful. Welcome, Administrator!`,
          timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }),
          success: true
        }]);
        
        setTimeout(() => {
          onAdminLogin(credentials.username);
        }, 1000);
      } else {
        // Failure
        setLoginAttempts(prev => prev + 1);
        setError('Invalid admin credentials. Access denied.');
        setSystemMessages(prev => [...prev, {
          id: Date.now(),
          text: `Admin authentication failed. Attempt ${loginAttempts + 1}/5`,
          timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }),
          error: true
        }]);
        
        if (loginAttempts >= 4) {
          setError('Maximum admin login attempts reached. Console locked for 60 seconds.');
          setTimeout(() => {
            setLoginAttempts(0);
            setError('');
          }, 60000);
        }
      }
      
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <div className={`w-full h-full bg-gradient-to-br ${colors.gradient} font-mono text-white relative flex items-center justify-center`}>
        
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

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 ${colors.primary} opacity-20 animate-pulse`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Back to Main Button */}
        <button
          onClick={onBackToMain}
          className="fixed top-4 left-4 flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-white/10 rounded transition-colors text-sm z-10"
        >
          ← Back to Terminal
        </button>

        {/* Main Admin Login Container */}
        <div className="w-full max-w-6xl mx-4 flex gap-8 items-center justify-center">
          
          {/* Left Side - Admin System Terminal */}
          <div className="flex-1 max-w-md">
            <div className={`border ${colors.border} bg-black/80 backdrop-blur-sm p-6 ${colors.glow}`}>
              <div className="flex items-center gap-2 mb-6">
                <Shield className={`w-5 h-5 ${colors.primary}`} />
                <span className={`font-mono text-lg font-bold ${colors.primary}`}>ADMIN CONSOLE</span>
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                {systemMessages.map((msg) => (
                  <div key={msg.id} className="animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <span>[{msg.timestamp}]</span>
                      <span>ADMIN-SYS</span>
                    </div>
                    <div className={`text-sm font-mono pl-4 border-l-2 ${
                      msg.success ? 'border-green-400 text-green-400' :
                      msg.error ? 'border-red-400 text-red-400' :
                      `${colors.border} text-gray-300`
                    }`}>
                      {msg.success && <CheckCircle className="w-4 h-4 inline mr-2" />}
                      {msg.error && <AlertCircle className="w-4 h-4 inline mr-2" />}
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Admin Login Form */}
          <div className="flex-1 max-w-md">
            <div className={`border ${colors.border} bg-black/80 backdrop-blur-sm p-8 ${colors.glow}`}>
              
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Shield className={`w-8 h-8 ${colors.primary} animate-pulse-slow`} />
                  <div>
                    <h1 className={`font-mono text-2xl font-bold ${colors.primary}`}>ADMIN ACCESS</h1>
                    <p className="font-mono text-xs text-gray-500">InterMAX-UI Control Panel</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-mono">ADMINISTRATIVE CREDENTIALS REQUIRED</span>
                </div>
              </div>

              {/* Admin Login Form */}
              <form onSubmit={handleAdminLogin} className="space-y-6">
                
                {/* Username Field */}
                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    ADMIN USERNAME
                  </label>
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter admin username..."
                    className={`w-full bg-black/60 border ${error ? 'border-red-400' : 'border-gray-700'} p-3 font-mono text-sm text-white placeholder-gray-500 focus:${colors.border} outline-none transition-colors`}
                    disabled={isLoading || loginAttempts >= 5}
                    autoComplete="username"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    ADMIN PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter admin password..."
                      className={`w-full bg-black/60 border ${error ? 'border-red-400' : 'border-gray-700'} p-3 pr-12 font-mono text-sm text-white placeholder-gray-500 focus:${colors.border} outline-none transition-colors`}
                      disabled={isLoading || loginAttempts >= 5}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      disabled={isLoading || loginAttempts >= 5}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-400/10 border border-red-400 text-red-400 text-sm font-mono">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Admin Login Button */}
                <button
                  type="submit"
                  disabled={isLoading || loginAttempts >= 5 || !credentials.username || !credentials.password}
                  className={`w-full py-3 px-6 border ${colors.border} ${colors.primary} font-mono text-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:${colors.bg} ${isLoading ? 'animate-pulse' : ''}`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      AUTHENTICATING...
                    </div>
                  ) : loginAttempts >= 5 ? (
                    'ADMIN CONSOLE LOCKED'
                  ) : (
                    'ACCESS ADMIN PANEL'
                  )}
                </button>
              </form>

              {/* Admin Info */}
              <div className="mt-8 pt-6 border-t border-gray-800">
                <div className="text-center space-y-2">
                  <div className="text-xs font-mono text-gray-500">
                    Authorized Administrative Personnel Only
                  </div>
                  <div className="flex items-center justify-center gap-4 text-xs font-mono text-gray-600">
                    <span>ADMIN v2.2.8</span>
                    <span>•</span>
                    <span>SECURE ACCESS</span>
                    <span>•</span>
                    <span>{new Date().getFullYear()}</span>
                  </div>
                  <div className="text-xs font-mono text-gray-600 mt-4">
                    Admin credentials: admin / intermax-admin-2025
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Styles */}
        <style jsx>{`
          @keyframes slide {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-25px, -25px); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AdminLoginPage;