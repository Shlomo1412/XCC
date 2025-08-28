// XCC Project Manager JavaScript
class ProjectManager {
    constructor() {
        this.projects = this.loadProjects();
        this.currentProjectToDelete = null;
        this.init();
    }

    init() {
        this.updateStats();
        this.renderProjects();
        this.checkUrlParams();
    }

    // Load projects from localStorage
    loadProjects() {
        try {
            const projects = localStorage.getItem('xcc_projects');
            return projects ? JSON.parse(projects) : {};
        } catch (error) {
            console.error('Error loading projects:', error);
            return {};
        }
    }

    // Save projects to localStorage
    saveProjects() {
        try {
            localStorage.setItem('xcc_projects', JSON.stringify(this.projects));
            this.updateStats();
        } catch (error) {
            console.error('Error saving projects:', error);
            this.showToast('Error saving projects', 'error');
        }
    }

    // Create a new project
    createProject(name, framework = 'basalt', description = '') {
        const id = this.generateId();
        const now = new Date().toISOString();
        
        this.projects[id] = {
            id,
            name,
            framework,
            description,
            elements: [],
            properties: {
                width: 51,
                height: 19,
                title: name
            },
            created: now,
            modified: now,
            version: '1.0.0'
        };

        this.saveProjects();
        return id;
    }

    // Update project
    updateProject(id, projectData) {
        if (this.projects[id]) {
            this.projects[id] = {
                ...this.projects[id],
                ...projectData,
                modified: new Date().toISOString()
            };
            this.saveProjects();
            return true;
        }
        return false;
    }

    // Delete project
    deleteProject(id) {
        if (this.projects[id]) {
            delete this.projects[id];
            this.saveProjects();
            this.renderProjects();
            this.showToast('Project deleted successfully');
            return true;
        }
        return false;
    }

    // Get project by ID
    getProject(id) {
        return this.projects[id] || null;
    }

    // Get all projects as array
    getAllProjects() {
        return Object.values(this.projects);
    }

    // Generate unique ID
    generateId() {
        return 'xcc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Update statistics
    updateStats() {
        const projects = this.getAllProjects();
        const frameworks = new Set(projects.map(p => p.framework));
        
        document.getElementById('totalProjects').textContent = projects.length;
        document.getElementById('totalFrameworks').textContent = frameworks.size;
    }

    // Render projects grid
    renderProjects() {
        const grid = document.getElementById('projectsGrid');
        const emptyState = document.getElementById('emptyState');
        const projects = this.getFilteredProjects();

        if (projects.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        grid.innerHTML = projects.map(project => this.renderProjectCard(project)).join('');
    }

    // Render individual project card
    renderProjectCard(project) {
        const frameworkClass = `framework-${project.framework}`;
        const formattedDate = new Date(project.modified).toLocaleDateString();
        const elementsCount = project.elements ? project.elements.length : 0;

        return `
            <div class="project-card">
                <div class="project-title">
                    ${this.escapeHtml(project.name)}
                    <span class="framework-badge ${frameworkClass}">${project.framework}</span>
                </div>
                <div class="project-meta">
                    <span>📅 ${formattedDate}</span>
                    <span>🧩 ${elementsCount} elements</span>
                </div>
                <div class="project-description">
                    ${this.escapeHtml(project.description || 'No description provided')}
                </div>
                <div class="project-actions-card">
                    <button onclick="projectManager.editProject('${project.id}')" class="btn-small btn-edit">
                        ✏️ Edit
                    </button>
                    <button onclick="projectManager.exportProject('${project.id}')" class="btn-small btn-export">
                        📁 Export
                    </button>
                    <button onclick="projectManager.shareProject('${project.id}')" class="btn-small btn-share">
                        🔗 Share
                    </button>
                    <button onclick="projectManager.showDeleteModal('${project.id}')" class="btn-small btn-delete">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }

    // Get filtered and sorted projects
    getFilteredProjects() {
        let projects = this.getAllProjects();
        
        // Search filter
        const searchTerm = document.getElementById('searchBox').value.toLowerCase();
        if (searchTerm) {
            projects = projects.filter(project => 
                project.name.toLowerCase().includes(searchTerm) ||
                (project.description && project.description.toLowerCase().includes(searchTerm))
            );
        }

        // Framework filter
        const frameworkFilter = document.getElementById('frameworkFilter').value;
        if (frameworkFilter) {
            projects = projects.filter(project => project.framework === frameworkFilter);
        }

        // Sort
        const sortBy = document.getElementById('sortBy').value;
        projects.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'framework':
                    return a.framework.localeCompare(b.framework);
                case 'created':
                    return new Date(b.created) - new Date(a.created);
                case 'modified':
                default:
                    return new Date(b.modified) - new Date(a.modified);
            }
        });

        return projects;
    }

    // Edit project - redirect to designer
    editProject(id) {
        const project = this.getProject(id);
        if (project) {
            // Store project data for the designer to load
            sessionStorage.setItem('xcc_load_project', JSON.stringify(project));
            window.location.href = 'basalt-generator.html?edit=' + id;
        }
    }

    // Export project as .xcc file
    exportProject(id) {
        const project = this.getProject(id);
        if (project) {
            const data = JSON.stringify(project, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xcc`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Project exported successfully');
        }
    }

    // Share project - generate shareable link
    shareProject(id) {
        const project = this.getProject(id);
        if (project) {
            const projectData = encodeURIComponent(JSON.stringify(project));
            const shareUrl = `${window.location.origin}${window.location.pathname}?import=${projectData}`;
            
            document.getElementById('shareLink').textContent = shareUrl;
            this.showModal('shareModal');
        }
    }

    // Show delete confirmation modal
    showDeleteModal(id) {
        const project = this.getProject(id);
        if (project) {
            this.currentProjectToDelete = id;
            document.getElementById('deleteProjectName').textContent = project.name;
            this.showModal('deleteModal');
        }
    }

    // Confirm deletion
    confirmDelete() {
        if (this.currentProjectToDelete) {
            this.deleteProject(this.currentProjectToDelete);
            this.currentProjectToDelete = null;
            this.closeModal('deleteModal');
        }
    }

    // Import project from file or text
    importProject() {
        const fileInput = document.getElementById('importFile');
        const textInput = document.getElementById('importText');
        
        if (fileInput.files.length > 0) {
            // Import from file
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const projectData = JSON.parse(e.target.result);
                    this.processImport(projectData);
                } catch (error) {
                    this.showToast('Invalid file format', 'error');
                }
            };
            reader.readAsText(file);
        } else if (textInput.value.trim()) {
            // Import from text
            try {
                const projectData = JSON.parse(textInput.value);
                this.processImport(projectData);
            } catch (error) {
                this.showToast('Invalid JSON format', 'error');
            }
        } else {
            this.showToast('Please select a file or paste project data', 'error');
        }
    }

    // Process imported project data
    processImport(projectData) {
        try {
            // Validate project data
            if (!projectData.name || !projectData.framework) {
                throw new Error('Invalid project data');
            }

            // Generate new ID to avoid conflicts
            const newId = this.generateId();
            const importedProject = {
                ...projectData,
                id: newId,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                name: projectData.name + ' (Imported)'
            };

            this.projects[newId] = importedProject;
            this.saveProjects();
            this.renderProjects();
            this.closeModal('importModal');
            this.showToast('Project imported successfully');

            // Clear form
            document.getElementById('importFile').value = '';
            document.getElementById('importText').value = '';
        } catch (error) {
            this.showToast('Error importing project', 'error');
        }
    }

    // Handle file import from input
    handleFileImport(event) {
        const file = event.target.files[0];
        if (file) {
            document.getElementById('importText').value = '';
        }
    }

    // Export all projects
    exportAllProjects() {
        const allProjects = this.projects;
        const data = JSON.stringify(allProjects, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `xcc_all_projects_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('All projects exported successfully');
    }

    // Clear all projects
    clearAllProjects() {
        if (confirm('Are you sure you want to delete ALL projects? This action cannot be undone!')) {
            this.projects = {};
            this.saveProjects();
            this.renderProjects();
            this.showToast('All projects cleared');
        }
    }

    // Check URL parameters for import
    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const importData = urlParams.get('import');
        
        if (importData) {
            try {
                const projectData = JSON.parse(decodeURIComponent(importData));
                this.processImport(projectData);
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                this.showToast('Invalid import link', 'error');
            }
        }
    }

    // Copy share link to clipboard
    copyShareLink() {
        const link = document.getElementById('shareLink').textContent;
        navigator.clipboard.writeText(link).then(() => {
            this.showToast('Link copied to clipboard');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = link;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Link copied to clipboard');
        });
    }

    // Show modal
    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    // Close modal
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        if (modalId === 'deleteModal') {
            this.currentProjectToDelete = null;
        }
    }

    // Show toast notification
    showToast(message, type = 'success') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for onclick handlers
let projectManager;

function showImportModal() {
    projectManager.showModal('importModal');
}

function closeModal(modalId) {
    projectManager.closeModal(modalId);
}

function handleFileImport(event) {
    projectManager.handleFileImport(event);
}

function importProject() {
    projectManager.importProject();
}

function exportAllProjects() {
    projectManager.exportAllProjects();
}

function clearAllProjects() {
    projectManager.clearAllProjects();
}

function filterProjects() {
    projectManager.renderProjects();
}

function copyShareLink() {
    projectManager.copyShareLink();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    projectManager = new ProjectManager();

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Close modals with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
});
