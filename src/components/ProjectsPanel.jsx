// src/components/ProjectsPanel.jsx - Fixed Layout Version
import React, { useState, useEffect } from 'react';
import { Folder, Plus, Trash2, FileText } from 'lucide-react';

const ProjectsPanel = ({ theme, activeProject, setActiveProject, projects, setProjects }) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);

  const createProject = () => {
    if (newProjectName.trim()) {
      setProjects(prev => [...prev, {
        id: Date.now(),
        title: newProjectName,
        notes: []
      }]);
      setNewProjectName('');
      setShowNewProject(false);
      setActiveProject(projects.length); // Set to new project
    }
  };

  const deleteProject = (id, index) => {
    if (projects.length > 1) {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (activeProject >= projects.length - 1) {
        setActiveProject(Math.max(0, index - 1));
      }
    }
  };

  const themeColors = {
    cyan: { text: 'text-cyan-400', border: 'border-cyan-500', bg: 'bg-cyan-400/10', hover: 'hover:bg-cyan-400/20' },
    green: { text: 'text-green-400', border: 'border-green-500', bg: 'bg-green-400/10', hover: 'hover:bg-green-400/20' },
    blue: { text: 'text-blue-400', border: 'border-blue-500', bg: 'bg-blue-400/10', hover: 'hover:bg-blue-400/20' },
    purple: { text: 'text-purple-400', border: 'border-purple-500', bg: 'bg-purple-400/10', hover: 'hover:bg-purple-400/20' }
  };

  const colors = themeColors[theme];

  return (
    <div className={`h-full flex flex-col border ${colors.border} bg-black/80 backdrop-blur-sm neon-border transition-all duration-300`}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Folder className={`w-4 h-4 ${colors.text}`} />
          <h3 className={`text-xs font-mono uppercase tracking-wider ${colors.text}`}>PROJECTS</h3>
        </div>
        <button
          onClick={() => setShowNewProject(true)}
          className={`text-xs px-2 py-1 border ${colors.border} ${colors.text} ${colors.hover} transition-colors flex items-center gap-1`}
        >
          <Plus className="w-3 h-3" />
          NEW
        </button>
      </div>

      {/* New Project Form */}
      {showNewProject && (
        <div className="flex-shrink-0 p-3 border-b border-gray-700 bg-black/60">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Enter project name..."
            className="w-full bg-black border border-gray-600 p-2 text-xs font-mono text-white placeholder-gray-500 focus:border-cyan-400 outline-none mb-2"
            onKeyPress={(e) => e.key === 'Enter' && createProject()}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={createProject}
              className={`text-xs px-3 py-1 border ${colors.border} ${colors.text} ${colors.hover} transition-colors`}
            >
              CREATE
            </button>
            <button
              onClick={() => {
                setShowNewProject(false);
                setNewProjectName('');
              }}
              className="text-xs px-3 py-1 border border-gray-600 text-gray-400 hover:bg-gray-600/20 transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-2 space-y-2">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`p-3 border cursor-pointer transition-all duration-200 ${
                index === activeProject 
                  ? `${colors.border} ${colors.bg} ${colors.text}` 
                  : 'border-gray-700 hover:border-gray-600 text-gray-300 hover:bg-black/40'
              }`}
              onClick={() => setActiveProject(index)}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="w-3 h-3 flex-shrink-0" />
                  <span className="text-xs font-mono font-bold truncate">{project.title}</span>
                </div>
                {projects.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id, index);
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors ml-2 flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <span>{Math.floor(project.notes.length / 2)} messages</span>
                {project.notes.length > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span>Active</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPanel;