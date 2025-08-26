// src/components/TerminalChat.jsx - Enhanced with File Upload Support
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, Loader, Cpu, Zap, Paperclip, Upload, X, File, Image, FileText } from 'lucide-react';
import { sendMessageToOpenAI, simulateAIResponse, getModelById } from '../services/openai';

const TerminalChat = ({ theme, activeProject, projects, setProjects, selectedModel }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (projects[activeProject]?.notes) {
      const projectNotes = projects[activeProject].notes;
      const formattedMessages = [];
      
      for (let i = 0; i < projectNotes.length; i += 2) {
        if (projectNotes[i]) {
          formattedMessages.push({
            id: `user-${i}`,
            type: 'user',
            content: projectNotes[i],
            timestamp: new Date(),
            model: projectNotes[i + 2] ? 'legacy' : selectedModel
          });
        }
        if (projectNotes[i + 1]) {
          formattedMessages.push({
            id: `ai-${i}`,
            type: 'ai',
            content: projectNotes[i + 1],
            timestamp: new Date(),
            model: projectNotes[i + 2] ? 'legacy' : selectedModel
          });
        }
      }
      
      setMessages(formattedMessages);
    }
  }, [activeProject, projects, selectedModel]);

  // Drag and Drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragOver to false if we're leaving the drop zone completely
    if (!dropZoneRef.current?.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  // File handling
  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      // Accept common file types
      const validTypes = [
        'text/plain', 'text/csv', 'text/markdown', 'text/html', 'text/css', 'text/javascript',
        'application/json', 'application/xml', 'application/pdf',
        'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB max
      
      return validTypes.some(type => file.type.includes(type.split('/')[0])) && file.size <= maxSize;
    });

    if (validFiles.length !== files.length) {
      const errorMessage = {
        id: Date.now(),
        type: 'error',
        content: `[ERROR] Some files were rejected. Supported: text, images, PDF, Word docs. Max size: 10MB`,
        timestamp: new Date(),
        model: selectedModel
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    if (validFiles.length > 0) {
      const newFiles = validFiles.map(file => ({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: null
      }));

      // Generate previews for text files
      newFiles.forEach(fileObj => {
        if (fileObj.type.startsWith('text/') || fileObj.type.includes('json')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            fileObj.preview = e.target.result.substring(0, 200) + (e.target.result.length > 200 ? '...' : '');
            setUploadedFiles(prev => prev.map(f => f.id === fileObj.id ? fileObj : f));
          };
          reader.readAsText(fileObj.file);
        }
      });

      setUploadedFiles(prev => [...prev, ...newFiles]);
      setShowFilePreview(true);
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    e.target.value = ''; // Reset input
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    if (uploadedFiles.length === 1) {
      setShowFilePreview(false);
    }
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.startsWith('text/') || file.type.includes('json') || file.type.includes('csv')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const sendMessage = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;

    let messageContent = input;
    
    // Add file information to message if files are attached
    if (uploadedFiles.length > 0) {
      messageContent += `\n\n[FILES ATTACHED: ${uploadedFiles.length}]`;
      uploadedFiles.forEach(fileObj => {
        messageContent += `\n- ${fileObj.name} (${formatFileSize(fileObj.size)})`;
        if (fileObj.preview) {
          messageContent += `\n  Preview: ${fileObj.preview}`;
        }
      });
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageContent,
      timestamp: new Date(),
      model: selectedModel,
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : null
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentFiles = [...uploadedFiles];
    setInput('');
    setUploadedFiles([]);
    setShowFilePreview(false);
    setIsTyping(true);

    try {
      let response;
      
      // Prepare message for AI with file context
      let aiPrompt = currentInput;
      if (currentFiles.length > 0) {
        aiPrompt = `I have attached ${currentFiles.length} file(s):\n\n`;
        currentFiles.forEach(fileObj => {
          aiPrompt += `File: ${fileObj.name} (${formatFileSize(fileObj.size)}, ${fileObj.type})\n`;
          if (fileObj.preview) {
            aiPrompt += `Content preview: ${fileObj.preview}\n\n`;
          }
        });
        aiPrompt += `User message: ${currentInput}`;
      }
      
      // Check if we have API key
      if (process.env.REACT_APP_OPENAI_API_KEY) {
        response = await sendMessageToOpenAI(aiPrompt, selectedModel);
      } else {
        response = await simulateAIResponse(aiPrompt, selectedModel);
      }
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response,
        timestamp: new Date(),
        model: selectedModel
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update project notes
      setProjects(prevProjects => 
        prevProjects.map((project, index) => 
          index === activeProject 
            ? { ...project, notes: [...project.notes, messageContent, response] }
            : project
        )
      );
      
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: `[ERROR] ${error.message}`,
        timestamp: new Date(),
        model: selectedModel
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const themeColors = {
    cyan: { text: 'text-cyan-400', border: 'border-cyan-500', glow: 'shadow-cyan-400/50' },
    green: { text: 'text-green-400', border: 'border-green-500', glow: 'shadow-green-400/50' },
    blue: { text: 'text-blue-400', border: 'border-blue-500', glow: 'shadow-blue-400/50' },
    purple: { text: 'text-purple-400', border: 'border-purple-500', glow: 'shadow-purple-400/50' }
  };

  const colors = themeColors[theme];

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-GB', { hour12: false });
  };

  const getModelIcon = (model) => {
    if (model && model.includes('gpt-4')) {
      return <Zap className="w-3 h-3 text-yellow-400" />;
    }
    return <Cpu className="w-3 h-3 text-blue-400" />;
  };

  const getModelInfo = (modelId) => {
    if (modelId === 'legacy') return { name: 'Legacy' };
    return getModelById(modelId);
  };

  const currentModelInfo = getModelInfo(selectedModel);

  return (
    <div 
      ref={dropZoneRef}
      className={`flex flex-col h-full border ${colors.border} bg-black/80 backdrop-blur-sm neon-border transition-all duration-300 relative ${isDragOver ? 'border-cyan-400 bg-cyan-400/10' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-cyan-400/20 border-2 border-dashed border-cyan-400 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="text-center">
            <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <p className="text-cyan-400 font-mono text-lg font-bold">Drop files here to upload</p>
            <p className="text-gray-400 font-mono text-sm mt-2">Supported: text, images, PDF, Word docs (max 10MB)</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b border-gray-800 bg-black/60`}>
        <div className="flex items-center gap-3">
          <Terminal className={`w-4 h-4 ${colors.text}`} />
          <span className={`font-mono text-sm ${colors.text} font-bold`}>ARIA TERMINAL</span>
          <div className="flex items-center gap-2 px-2 py-1 bg-black/40 border border-gray-700 rounded">
            {getModelIcon(selectedModel)}
            <span className="font-mono text-xs text-gray-300">{currentModelInfo.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-gray-400">
            {projects[activeProject]?.title || 'Terminal'}
          </span>
          <span className="font-mono text-xs text-gray-500">
            {Math.floor(messages.length / 2)} exchanges
          </span>
        </div>
      </div>

      {/* File Preview Panel */}
      {showFilePreview && uploadedFiles.length > 0 && (
        <div className="border-b border-gray-800 bg-black/60 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-gray-400">ATTACHED FILES ({uploadedFiles.length})</span>
            <button
              onClick={() => {
                setUploadedFiles([]);
                setShowFilePreview(false);
              }}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
            {uploadedFiles.map(fileObj => (
              <div key={fileObj.id} className="flex items-start gap-3 bg-black/40 p-2 rounded border border-gray-700">
                <div className={`flex-shrink-0 ${colors.text}`}>
                  {getFileIcon(fileObj)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white truncate">{fileObj.name}</span>
                    <button
                      onClick={() => removeFile(fileObj.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-400">{formatFileSize(fileObj.size)}</div>
                  {fileObj.preview && (
                    <div className="text-xs text-gray-500 mt-1 truncate font-mono">
                      {fileObj.preview}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-black/40 custom-scrollbar">
        {/* System Banner */}
        <div className={`mb-6 p-4 border-l-4 ${colors.border} bg-black/30`}>
          <div className="text-gray-400 text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>InterMAX-UI Terminal v2.2.8 - ARIA Interface Active</span>
            </div>
            <div>AI Model: <span className={colors.text}>{currentModelInfo.name}</span></div>
            <div>API Status: <span className={process.env.REACT_APP_OPENAI_API_KEY ? 'text-green-400' : 'text-yellow-400'}>
              {process.env.REACT_APP_OPENAI_API_KEY ? 'LIVE CONNECTION' : 'SIMULATION MODE'}
            </span></div>
            <div>File Upload: <span className="text-green-400">ENABLED</span> (max 10MB)</div>
            <div>Session: {getCurrentTime()}</div>
          </div>
        </div>
        
        {messages.map((message) => {
          const messageModel = getModelInfo(message.model || selectedModel);
          return (
            <div key={message.id} className="mb-4 group">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold ${
                  message.type === 'user' ? 'text-yellow-400' : 
                  message.type === 'error' ? 'text-red-400' : colors.text
                }`}>
                  [{getCurrentTime()}] {message.type === 'user' ? 'USER' : message.type === 'error' ? 'ERROR' : 'ARIA'}
                </span>
                {message.type === 'ai' && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-black/40 border border-gray-800 rounded text-xs">
                    {getModelIcon(message.model)}
                    <span className="text-gray-400">{messageModel.name}</span>
                  </div>
                )}
                {message.files && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-400/20 border border-blue-400 rounded text-xs">
                    <Paperclip className="w-3 h-3" />
                    <span className="text-blue-400">{message.files.length} file{message.files.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              <div className={`pl-4 border-l-2 ${
                message.type === 'user' ? 'border-yellow-400/50 bg-yellow-400/5' : 
                message.type === 'error' ? 'border-red-400/50 bg-red-400/5' : 
                `${colors.border.replace('border-', 'border-')}/50 bg-black/20`
              } p-3 rounded-r transition-colors`}>
                <div className="break-words whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold ${colors.text}`}>
                [{getCurrentTime()}] ARIA
              </span>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-black/40 border border-gray-800 rounded text-xs">
                {getModelIcon(selectedModel)}
                <span className="text-gray-400">{currentModelInfo.name}</span>
              </div>
              <Loader className="w-3 h-3 animate-spin text-gray-400" />
            </div>
            <div className={`pl-4 border-l-2 ${colors.border}/50 bg-black/20 p-3 rounded-r`}>
              <span className="animate-pulse flex items-center gap-2">
                <span>Processing {uploadedFiles.length > 0 ? 'files and ' : ''}neural pathways</span>
                <span className="terminal-cursor">█</span>
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800 bg-black/60">
        <div className="flex gap-2 items-center">
          <span className={`font-mono text-sm ${colors.text} flex-shrink-0 flex items-center gap-1`}>
            <Terminal className="w-3 h-3" />
            root@intermax:~$
          </span>
          
          {/* File Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 border ${colors.border} ${colors.text} hover:bg-white/10 transition-all rounded flex-shrink-0`}
            title="Attach files"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className={`flex-1 bg-black border border-gray-700 px-3 py-2 font-mono text-sm ${colors.text} placeholder-gray-600 focus:border-cyan-400 outline-none transition-colors rounded`}
            placeholder={uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s) attached - Add message...` : `Chat with ${currentModelInfo.name} AI...`}
            disabled={isTyping}
            autoFocus
          />
          
          <button
            onClick={sendMessage}
            disabled={(!input.trim() && uploadedFiles.length === 0) || isTyping}
            className={`px-4 py-2 border ${colors.border} ${colors.text} hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 rounded font-mono text-sm`}
          >
            <Send className="w-4 h-4" />
            SEND
          </button>
        </div>
        
        {/* Model Info Footer */}
        <div className="mt-2 flex justify-between items-center text-xs text-gray-500 font-mono">
          <div className="flex items-center gap-4">
            <span>Model: {currentModelInfo.name}</span>
            <span>Status: {process.env.REACT_APP_OPENAI_API_KEY ? 'Live' : 'Simulation'}</span>
            {uploadedFiles.length > 0 && (
              <span className="text-blue-400">{uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} ready</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
            <span>{isTyping ? 'Processing...' : 'Ready'}</span>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInput}
        className="hidden"
        accept=".txt,.csv,.md,.html,.css,.js,.json,.xml,.pdf,.jpg,.jpeg,.png,.gif,.svg,.doc,.docx"
      />
    </div>
  );
};

export default TerminalChat;