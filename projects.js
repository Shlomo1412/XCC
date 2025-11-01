// XCC Project Manager JavaScript
class ProjectManager {
    constructor() {
        this.projects = this.loadProjects();
        this.folders = this.loadFolders();
        this.currentFolder = null; // null = root folder
        this.currentProjectToDelete = null;
        this.currentFolderToDelete = null;
        this.init();
    }

    init() {
        this.updateStats();
        this.renderProjects();
        this.checkUrlParams();
        this.setupGlobalDragHandlers();
    }

    // Setup global drag handlers for cleanup
    setupGlobalDragHandlers() {
        // Clean up drag states when dragging outside the window
        document.addEventListener('dragleave', (event) => {
            // Only trigger if leaving the document entirely
            if (event.clientX <= 0 || event.clientY <= 0 || 
                event.clientX >= window.innerWidth || event.clientY >= window.innerHeight) {
                this.clearAllDragStates();
            }
        });

        // Clean up on drag end globally
        document.addEventListener('dragend', () => {
            this.clearAllDragStates();
        });
    }

    // Clear all drag-related visual states
    clearAllDragStates() {
        // Remove all drag-over classes
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });
        
        // Remove breadcrumb drag-over classes
        document.querySelectorAll('.breadcrumb-drag-over').forEach(el => {
            el.classList.remove('breadcrumb-drag-over');
        });
        
        // Remove grid drag-over class
        const grid = document.getElementById('projectsGrid');
        if (grid) {
            grid.classList.remove('grid-drag-over');
        }
        
        // Remove dragging class from any projects
        document.querySelectorAll('.dragging').forEach(el => {
            el.classList.remove('dragging');
        });
        
        this.draggedProjectId = null;
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

    // Load folders from localStorage
    loadFolders() {
        try {
            const folders = localStorage.getItem('xcc_folders');
            return folders ? JSON.parse(folders) : {};
        } catch (error) {
            console.error('Error loading folders:', error);
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

    // Save folders to localStorage
    saveFolders() {
        try {
            localStorage.setItem('xcc_folders', JSON.stringify(this.folders));
        } catch (error) {
            console.error('Error saving folders:', error);
            this.showToast('Error saving folders', 'error');
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
            folder: this.currentFolder, // Assign to current folder
            created: now,
            modified: now,
            version: '1.0.0'
        };

        this.saveProjects();
        return id;
    }

    // Create a new folder
    createFolder(name, description = '') {
        const id = this.generateId();
        const now = new Date().toISOString();
        
        this.folders[id] = {
            id,
            name,
            description,
            parent: this.currentFolder, // Parent folder
            created: now,
            modified: now
        };

        this.saveFolders();
        this.renderProjects();
        return id;
    }

    // Delete folder (and move contents to parent)
    deleteFolder(id) {
        const folder = this.folders[id];
        if (!folder) return false;

        // Move all projects in this folder to parent
        Object.values(this.projects).forEach(project => {
            if (project.folder === id) {
                project.folder = folder.parent;
            }
        });

        // Move all subfolders to parent
        Object.values(this.folders).forEach(subfolder => {
            if (subfolder.parent === id) {
                subfolder.parent = folder.parent;
            }
        });

        delete this.folders[id];
        this.saveFolders();
        this.saveProjects();
        this.renderProjects();
        this.showToast('Folder deleted successfully');
        return true;
    }

    // Move project to folder
    moveProjectToFolder(projectId, folderId) {
        if (this.projects[projectId]) {
            this.projects[projectId].folder = folderId;
            this.projects[projectId].modified = new Date().toISOString();
            this.saveProjects();
            return true;
        }
        return false;
    }

    // Navigate to folder
    navigateToFolder(folderId) {
        this.currentFolder = folderId;
        this.renderProjects();
        this.updateBreadcrumb();
    }

    // Get current folder path for breadcrumb
    getFolderPath() {
        const path = [];
        let currentId = this.currentFolder;
        
        while (currentId) {
            const folder = this.folders[currentId];
            if (folder) {
                path.unshift(folder);
                currentId = folder.parent;
            } else {
                break;
            }
        }
        
        return path;
    }

    // Update breadcrumb navigation
    updateBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;

        const path = this.getFolderPath();
        let html = `<span class="breadcrumb-item breadcrumb-drop-zone" 
                         data-folder-id="" 
                         onclick="projectManager.navigateToFolder(null)"
                         ondragover="projectManager.handleBreadcrumbDragOver(event)"
                         ondrop="projectManager.handleBreadcrumbDrop(event)"
                         ondragenter="projectManager.handleBreadcrumbDragEnter(event)"
                         ondragleave="projectManager.handleBreadcrumbDragLeave(event)">🏠 Home</span>`;
        
        path.forEach((folder, index) => {
            // Only add drop zones to parent folders, not the current one
            if (index < path.length - 1) {
                html += ` / <span class="breadcrumb-item breadcrumb-drop-zone" 
                               data-folder-id="${folder.id}"
                               onclick="projectManager.navigateToFolder('${folder.id}')"
                               ondragover="projectManager.handleBreadcrumbDragOver(event)"
                               ondrop="projectManager.handleBreadcrumbDrop(event)"
                               ondragenter="projectManager.handleBreadcrumbDragEnter(event)"
                               ondragleave="projectManager.handleBreadcrumbDragLeave(event)">${this.escapeHtml(folder.name)}</span>`;
            } else {
                html += ` / <span class="breadcrumb-item" onclick="projectManager.navigateToFolder('${folder.id}')">${this.escapeHtml(folder.name)}</span>`;
            }
        });

        breadcrumb.innerHTML = html;
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
        const folders = this.getCurrentFolders();
        const projects = this.getFilteredProjects();

        this.updateBreadcrumb();

        if (folders.length === 0 && projects.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        // Render folders first, then projects
        const folderCards = folders.map(folder => this.renderFolderCard(folder));
        const projectCards = projects.map(project => this.renderProjectCard(project));
        
        grid.innerHTML = [...folderCards, ...projectCards].join('');
        
        // Setup root drop zone after rendering
        setTimeout(() => this.setupRootDropZone(), 0);
    }

    // Get folders in current directory
    getCurrentFolders() {
        return Object.values(this.folders).filter(folder => 
            folder.parent === this.currentFolder
        );
    }

    // Render individual folder card
    renderFolderCard(folder) {
        const formattedDate = new Date(folder.modified).toLocaleDateString();
        const projectCount = Object.values(this.projects).filter(p => p.folder === folder.id).length;
        const subfolderCount = Object.values(this.folders).filter(f => f.parent === folder.id).length;

        return `
            <div class="project-card folder-card" 
                 data-folder-id="${folder.id}"
                 ondragover="projectManager.handleDragOver(event)"
                 ondrop="projectManager.handleDrop(event)"
                 ondragenter="projectManager.handleDragEnter(event)"
                 ondragleave="projectManager.handleDragLeave(event)">
                <div class="project-title">
                    📁 ${this.escapeHtml(folder.name)}
                </div>
                <div class="project-meta">
                    <span>📅 ${formattedDate}</span>
                    <span>📂 ${subfolderCount} folders</span>
                    <span>🧩 ${projectCount} projects</span>
                </div>
                <div class="project-description">
                    ${this.escapeHtml(folder.description || 'No description provided')}
                </div>
                <div class="project-actions-card">
                    <button onclick="projectManager.navigateToFolder('${folder.id}')" class="btn-small btn-open">
                        📂 Open
                    </button>
                    <button onclick="projectManager.showRenameFolderModal('${folder.id}')" class="btn-small btn-edit">
                        ✏️ Rename
                    </button>
                    <button onclick="projectManager.showDeleteFolderModal('${folder.id}')" class="btn-small btn-delete">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }

    // Render individual project card
    renderProjectCard(project) {
        const frameworkClass = `framework-${project.framework}`;
        const formattedDate = new Date(project.modified).toLocaleDateString();
        const elementsCount = project.elements ? project.elements.length : 0;

        return `
            <div class="project-card" draggable="true" 
                 data-project-id="${project.id}" 
                 ondragstart="projectManager.handleDragStart(event)"
                 ondragend="projectManager.handleDragEnd(event)">
                <div class="project-title">
                    <span class="drag-handle">⋮⋮</span>
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
                    <button onclick="projectManager.showMoveProjectModal('${project.id}')" class="btn-small btn-move">
                        📋 Move
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
        
        // Filter by current folder
        projects = projects.filter(project => 
            (project.folder || null) === this.currentFolder
        );
        
        // Search filter
        const searchTerm = document.getElementById('searchBox')?.value?.toLowerCase();
        if (searchTerm) {
            projects = projects.filter(project => 
                project.name.toLowerCase().includes(searchTerm) ||
                (project.description && project.description.toLowerCase().includes(searchTerm))
            );
        }

        // Framework filter
        const frameworkFilter = document.getElementById('frameworkFilter')?.value;
        if (frameworkFilter) {
            projects = projects.filter(project => project.framework === frameworkFilter);
        }

        // Sort
        const sortBy = document.getElementById('sortBy')?.value || 'modified';
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

    // Show delete folder confirmation modal
    showDeleteFolderModal(id) {
        const folder = this.folders[id];
        if (folder) {
            this.currentFolderToDelete = id;
            document.getElementById('deleteFolderName').textContent = folder.name;
            this.showModal('deleteFolderModal');
        }
    }

    // Show create folder modal
    showCreateFolderModal() {
        document.getElementById('folderName').value = '';
        document.getElementById('folderDescription').value = '';
        this.showModal('createFolderModal');
    }

    // Show rename folder modal
    showRenameFolderModal(id) {
        const folder = this.folders[id];
        if (folder) {
            this.currentFolderToEdit = id;
            document.getElementById('editFolderName').value = folder.name;
            document.getElementById('editFolderDescription').value = folder.description || '';
            this.showModal('editFolderModal');
        }
    }

    // Show move project modal
    showMoveProjectModal(id) {
        const project = this.getProject(id);
        if (project) {
            this.currentProjectToMove = id;
            this.populateFolderSelect();
            document.getElementById('moveProjectName').textContent = project.name;
            this.showModal('moveProjectModal');
        }
    }

    // Populate folder select dropdown
    populateFolderSelect() {
        const select = document.getElementById('targetFolder');
        if (!select) return;

        select.innerHTML = '<option value="">📁 Root Folder</option>';
        
        const addFolderOptions = (folders, level = 0) => {
            folders.forEach(folder => {
                const indent = '&nbsp;&nbsp;'.repeat(level);
                select.innerHTML += `<option value="${folder.id}">${indent}📁 ${this.escapeHtml(folder.name)}</option>`;
                
                const subfolders = Object.values(this.folders).filter(f => f.parent === folder.id);
                if (subfolders.length > 0) {
                    addFolderOptions(subfolders, level + 1);
                }
            });
        };

        const rootFolders = Object.values(this.folders).filter(f => !f.parent);
        addFolderOptions(rootFolders);
    }

    // Confirm deletion
    confirmDelete() {
        if (this.currentProjectToDelete) {
            this.deleteProject(this.currentProjectToDelete);
            this.currentProjectToDelete = null;
            this.closeModal('deleteModal');
        }
    }

    // Confirm folder deletion
    confirmDeleteFolder() {
        if (this.currentFolderToDelete) {
            this.deleteFolder(this.currentFolderToDelete);
            this.currentFolderToDelete = null;
            this.closeModal('deleteFolderModal');
        }
    }

    // Create new folder
    handleCreateFolder() {
        const name = document.getElementById('folderName').value.trim();
        const description = document.getElementById('folderDescription').value.trim();
        
        if (!name) {
            this.showToast('Folder name is required', 'error');
            return;
        }

        this.createFolder(name, description);
        this.closeModal('createFolderModal');
        this.showToast('Folder created successfully');
    }

    // Update folder
    handleEditFolder() {
        if (!this.currentFolderToEdit) return;

        const name = document.getElementById('editFolderName').value.trim();
        const description = document.getElementById('editFolderDescription').value.trim();
        
        if (!name) {
            this.showToast('Folder name is required', 'error');
            return;
        }

        const folder = this.folders[this.currentFolderToEdit];
        if (folder) {
            folder.name = name;
            folder.description = description;
            folder.modified = new Date().toISOString();
            this.saveFolders();
            this.renderProjects();
            this.closeModal('editFolderModal');
            this.showToast('Folder updated successfully');
        }

        this.currentFolderToEdit = null;
    }

    // Move project to selected folder
    handleMoveProject() {
        if (!this.currentProjectToMove) return;

        const targetFolder = document.getElementById('targetFolder').value || null;
        this.moveProjectToFolder(this.currentProjectToMove, targetFolder);
        this.renderProjects();
        this.closeModal('moveProjectModal');
        this.showToast('Project moved successfully');
        this.currentProjectToMove = null;
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
        } else if (modalId === 'deleteFolderModal') {
            this.currentFolderToDelete = null;
        } else if (modalId === 'editFolderModal') {
            this.currentFolderToEdit = null;
        } else if (modalId === 'moveProjectModal') {
            this.currentProjectToMove = null;
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

    // Drag and Drop Event Handlers
    handleDragStart(event) {
        const projectId = event.currentTarget.getAttribute('data-project-id');
        event.dataTransfer.setData('text/plain', projectId);
        event.dataTransfer.effectAllowed = 'move';
        
        // Add dragging class for visual feedback
        event.currentTarget.classList.add('dragging');
        
        // Store the dragged project ID
        this.draggedProjectId = projectId;
    }

    handleDragEnd(event) {
        // Use centralized cleanup function
        this.clearAllDragStates();
    }

    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(event) {
        event.preventDefault();
        const folderCard = event.currentTarget;
        
        // Only highlight if dragging a project
        if (this.draggedProjectId) {
            folderCard.classList.add('drag-over');
        }
    }

    handleDragLeave(event) {
        // Only remove highlight if leaving the folder card entirely
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX;
        const y = event.clientY;
        
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            event.currentTarget.classList.remove('drag-over');
        }
    }

    handleDrop(event) {
        event.preventDefault();
        const projectId = event.dataTransfer.getData('text/plain');
        const folderCard = event.currentTarget;
        const folderId = folderCard.getAttribute('data-folder-id');
        
        // Remove drag-over class
        folderCard.classList.remove('drag-over');
        
        if (projectId && folderId) {
            // Move the project to the folder
            if (this.moveProjectToFolder(projectId, folderId)) {
                this.renderProjects();
                
                const project = this.getProject(projectId);
                const folder = this.folders[folderId];
                this.showToast(`"${project.name}" moved to "${folder.name}"`);
            }
        }
    }

    // Add drop zone for root folder (when not in any folder)
    setupRootDropZone() {
        const grid = document.getElementById('projectsGrid');
        if (grid) {
            // Remove existing listeners to avoid duplicates
            grid.removeEventListener('dragover', this.gridDragOverHandler);
            grid.removeEventListener('drop', this.gridDropHandler);
            grid.removeEventListener('dragenter', this.gridDragEnterHandler);
            grid.removeEventListener('dragleave', this.gridDragLeaveHandler);
            
            // Create bound handlers to maintain 'this' context
            this.gridDragOverHandler = (event) => {
                // Only allow drop if not over a folder card or project card
                if (!event.target.closest('.folder-card') && !event.target.closest('.project-card')) {
                    event.preventDefault();
                    grid.classList.add('grid-drag-over');
                }
            };
            
            this.gridDropHandler = (event) => {
                // Only handle drop if not over a folder card or project card
                if (!event.target.closest('.folder-card') && !event.target.closest('.project-card')) {
                    event.preventDefault();
                    grid.classList.remove('grid-drag-over');
                    
                    const projectId = event.dataTransfer.getData('text/plain');
                    
                    if (projectId) {
                        // Move to current folder (or root if currentFolder is null)
                        if (this.moveProjectToFolder(projectId, this.currentFolder)) {
                            this.renderProjects();
                            
                            const project = this.getProject(projectId);
                            const targetName = this.currentFolder ? this.folders[this.currentFolder].name : 'root folder';
                            this.showToast(`"${project.name}" moved to ${targetName}`);
                        }
                    }
                }
            };
            
            this.gridDragEnterHandler = (event) => {
                if (this.draggedProjectId && !event.target.closest('.folder-card') && !event.target.closest('.project-card')) {
                    grid.classList.add('grid-drag-over');
                }
            };
            
            this.gridDragLeaveHandler = (event) => {
                // Check if we're actually leaving the grid
                const rect = grid.getBoundingClientRect();
                const x = event.clientX;
                const y = event.clientY;
                
                if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                    grid.classList.remove('grid-drag-over');
                }
            };
            
            // Add the event listeners
            grid.addEventListener('dragover', this.gridDragOverHandler);
            grid.addEventListener('drop', this.gridDropHandler);
            grid.addEventListener('dragenter', this.gridDragEnterHandler);
            grid.addEventListener('dragleave', this.gridDragLeaveHandler);
        }
    }

    // Breadcrumb Drag and Drop Handlers
    handleBreadcrumbDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    handleBreadcrumbDragEnter(event) {
        event.preventDefault();
        if (this.draggedProjectId) {
            event.currentTarget.classList.add('breadcrumb-drag-over');
        }
    }

    handleBreadcrumbDragLeave(event) {
        event.currentTarget.classList.remove('breadcrumb-drag-over');
    }

    handleBreadcrumbDrop(event) {
        event.preventDefault();
        const projectId = event.dataTransfer.getData('text/plain');
        const breadcrumbItem = event.currentTarget;
        const folderId = breadcrumbItem.getAttribute('data-folder-id') || null;
        
        // Remove drag-over class
        breadcrumbItem.classList.remove('breadcrumb-drag-over');
        
        if (projectId) {
            // Move the project to the folder
            if (this.moveProjectToFolder(projectId, folderId)) {
                this.renderProjects();
                
                const project = this.getProject(projectId);
                const targetName = folderId ? this.folders[folderId].name : 'Home';
                this.showToast(`"${project.name}" moved to "${targetName}"`);
            }
        }
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

function showCreateFolderModal() {
    projectManager.showCreateFolderModal();
}

function handleCreateFolder() {
    projectManager.handleCreateFolder();
}

function handleEditFolder() {
    projectManager.handleEditFolder();
}

function handleMoveProject() {
    projectManager.handleMoveProject();
}

function confirmDelete() {
    projectManager.confirmDelete();
}

function confirmDeleteFolder() {
    projectManager.confirmDeleteFolder();
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

        // Close dropdown when clicking outside
        const dropdown = document.querySelector('.new-project-dropdown');
        if (dropdown && !dropdown.contains(event.target)) {
            dropdown.classList.remove('open');
        }
    });

    // Close modals with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
            
            // Close dropdown with Escape key
            const dropdown = document.querySelector('.new-project-dropdown');
            if (dropdown) {
                dropdown.classList.remove('open');
            }
        }
    });
});

// Dropdown toggle function
function toggleNewProjectDropdown() {
    const dropdown = document.querySelector('.new-project-dropdown');
    dropdown.classList.toggle('open');
}
