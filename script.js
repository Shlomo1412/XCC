// Basalt 2 UI Designer - Main JavaScript
class BasaltUIDesigner {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.terminalPreview = document.getElementById('terminalPreview');
        this.dropZone = document.getElementById('dropZone');
        this.propertiesContent = document.getElementById('propertiesContent');
        
        this.elements = new Map();
        this.selectedElement = null;
        this.draggedElement = null;
        this.isDragging = false;
        this.isResizing = false;
        this.gridVisible = false;
        
        this.terminalWidth = 51;
        this.terminalHeight = 19;
        this.cellWidth = 12;
        this.cellHeight = 18;
        
        this.basaltElements = this.initializeBasaltElements();
        this.ccColors = this.initializeCCColors();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateTerminalSize();
        this.createTerminalGrid();
        this.loadPreset('computer');
    }
    
    initializeBasaltElements() {
        return {
            Frame: {
                type: 'Frame',
                defaultProps: {
                    x: 1, y: 1, width: 10, height: 5,
                    background: 'black', foreground: 'white',
                    visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground'],
                    container: ['term']
                }
            },
            Container: {
                type: 'Container',
                defaultProps: {
                    x: 1, y: 1, width: 10, height: 5,
                    background: 'black', foreground: 'white',
                    visible: true, offsetX: 0, offsetY: 0
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground'],
                    container: ['offsetX', 'offsetY']
                }
            },
            Flexbox: {
                type: 'Flexbox',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 5,
                    background: 'black', foreground: 'white',
                    flexDirection: 'row', flexSpacing: 1,
                    flexJustifyContent: 'flex-start', flexWrap: false
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground'],
                    flexbox: ['flexDirection', 'flexSpacing', 'flexJustifyContent', 'flexWrap']
                }
            },
            Label: {
                type: 'Label',
                defaultProps: {
                    x: 1, y: 1, width: 8, height: 1,
                    text: 'Label', background: 'black', foreground: 'white',
                    autoSize: true, visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground'],
                    text: ['text', 'autoSize']
                }
            },
            Button: {
                type: 'Button',
                defaultProps: {
                    x: 1, y: 1, width: 8, height: 3,
                    text: 'Button', background: 'gray', foreground: 'white',
                    visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground'],
                    text: ['text']
                }
            },
            Input: {
                type: 'Input',
                defaultProps: {
                    x: 1, y: 1, width: 15, height: 1,
                    text: '', placeholder: '...', background: 'black', foreground: 'white',
                    focusedBackground: 'blue', focusedForeground: 'white',
                    placeholderColor: 'gray', maxLength: null, pattern: null,
                    replaceChar: null, visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground', 'focusedBackground', 'focusedForeground'],
                    input: ['text', 'placeholder', 'placeholderColor', 'maxLength', 'pattern', 'replaceChar']
                }
            },
            Checkbox: {
                type: 'Checkbox',
                defaultProps: {
                    x: 1, y: 1, width: 10, height: 1,
                    checked: false, text: '', checkedText: 'X',
                    background: 'black', foreground: 'white',
                    autoSize: true, visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground'],
                    checkbox: ['checked', 'text', 'checkedText', 'autoSize']
                }
            },
            List: {
                type: 'List',
                defaultProps: {
                    x: 1, y: 1, width: 15, height: 8,
                    items: [], selectable: true, multiSelection: false,
                    selectedBackground: 'blue', selectedForeground: 'white',
                    background: 'black', foreground: 'white', visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground', 'selectedBackground', 'selectedForeground'],
                    list: ['items', 'selectable', 'multiSelection']
                }
            },
            Table: {
                type: 'Table',
                defaultProps: {
                    x: 1, y: 1, width: 25, height: 10,
                    columns: [], data: [], headerColor: 'blue',
                    selectedColor: 'lightBlue', gridColor: 'gray',
                    background: 'black', foreground: 'white', visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground', 'headerColor', 'selectedColor', 'gridColor'],
                    table: ['columns', 'data']
                }
            },
            Tree: {
                type: 'Tree',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 10,
                    nodes: [], nodeColor: 'white', selectedColor: 'lightBlue',
                    background: 'black', foreground: 'white', visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground', 'nodeColor', 'selectedColor'],
                    tree: ['nodes']
                }
            },
            TextBox: {
                type: 'TextBox',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 8,
                    lines: [''], editable: true,
                    background: 'black', foreground: 'white', visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground'],
                    textbox: ['editable']
                }
            },
            Dropdown: {
                type: 'Dropdown',
                defaultProps: {
                    x: 1, y: 1, width: 15, height: 1,
                    items: [], isOpen: false, dropdownHeight: 5,
                    selectedText: '', dropSymbol: '▼',
                    background: 'black', foreground: 'white', visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground'],
                    dropdown: ['items', 'dropdownHeight', 'selectedText', 'dropSymbol']
                }
            },
            Menu: {
                type: 'Menu',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 1,
                    items: [], separatorColor: 'gray',
                    background: 'black', foreground: 'white', visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground', 'separatorColor'],
                    menu: ['items']
                }
            },
            Slider: {
                type: 'Slider',
                defaultProps: {
                    x: 1, y: 1, width: 15, height: 1,
                    step: 1, max: 100, horizontal: true,
                    barColor: 'gray', sliderColor: 'blue',
                    background: 'black', foreground: 'white', visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground', 'barColor', 'sliderColor'],
                    slider: ['step', 'max', 'horizontal']
                }
            },
            ProgressBar: {
                type: 'ProgressBar',
                defaultProps: {
                    x: 1, y: 1, width: 15, height: 1,
                    progress: 0, showPercentage: false,
                    progressColor: 'lime', direction: 'right',
                    background: 'black', foreground: 'white', visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground', 'progressColor'],
                    progress: ['progress', 'showPercentage', 'direction']
                }
            },
            Graph: {
                type: 'Graph',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 10,
                    minValue: 0, maxValue: 100, series: {},
                    background: 'black', foreground: 'white', visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground'],
                    graph: ['minValue', 'maxValue', 'series']
                }
            },
            BarChart: {
                type: 'BarChart',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 10,
                    minValue: 0, maxValue: 100, series: {},
                    background: 'black', foreground: 'white', visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground'],
                    chart: ['minValue', 'maxValue', 'series']
                }
            },
            LineChart: {
                type: 'LineChart',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 10,
                    minValue: 0, maxValue: 100, series: {},
                    background: 'black', foreground: 'white', visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground'],
                    chart: ['minValue', 'maxValue', 'series']
                }
            },
            Display: {
                type: 'Display',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 10,
                    background: 'black', foreground: 'white', visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground'],
                    display: [] 
                }
            },
            BigFont: {
                type: 'BigFont',
                defaultProps: {
                    x: 1, y: 1, width: 15, height: 5,
                    text: 'BigFont', fontSize: 1,
                    background: 'black', foreground: 'white', visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground'],
                    bigfont: ['text', 'fontSize']
                }
            },
            Image: {
                type: 'Image',
                defaultProps: {
                    x: 1, y: 1, width: 10, height: 8,
                    bimg: {}, currentFrame: 1, autoResize: false,
                    offsetX: 0, offsetY: 0,
                    background: 'black', foreground: 'white', visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground'],
                    image: ['currentFrame', 'autoResize', 'offsetX', 'offsetY']
                }
            },
            Program: {
                type: 'Program',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 15,
                    path: '', running: false,
                    background: 'black', foreground: 'white', visible: true
                },
                properties: {
                    basic: ['x', 'y', 'z', 'width', 'height', 'visible'],
                    appearance: ['background', 'foreground'],
                    program: ['path', 'running']
                }
            }
        };
    }
    
    initializeCCColors() {
        return {
            'white': 0x1, 'orange': 0x2, 'magenta': 0x4, 'lightBlue': 0x8,
            'yellow': 0x10, 'lime': 0x20, 'pink': 0x40, 'gray': 0x80,
            'lightGray': 0x100, 'cyan': 0x200, 'purple': 0x400, 'blue': 0x800,
            'brown': 0x1000, 'green': 0x2000, 'red': 0x4000, 'black': 0x8000
        };
    }
    
    setupEventListeners() {
        // Terminal size controls
        document.getElementById('terminalPreset').addEventListener('change', (e) => {
            this.loadPreset(e.target.value);
        });
        
        document.getElementById('terminalWidth').addEventListener('input', (e) => {
            this.terminalWidth = parseInt(e.target.value) || 51;
            this.updateTerminalSize();
        });
        
        document.getElementById('terminalHeight').addEventListener('input', (e) => {
            this.terminalHeight = parseInt(e.target.value) || 19;
            this.updateTerminalSize();
        });
        
        // Canvas controls
        document.getElementById('gridToggle').addEventListener('click', () => {
            this.toggleGrid();
        });
        
        document.getElementById('clearCanvas').addEventListener('click', () => {
            this.clearCanvas();
        });
        
        // Header buttons
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.showExportModal();
        });
        
        document.getElementById('importBtn').addEventListener('click', () => {
            this.showImportModal();
        });
        
        document.getElementById('performImport').addEventListener('click', () => {
            this.performImport();
        });
        
        document.getElementById('previewBtn').addEventListener('click', () => {
            this.showPreviewModal();
        });
        
        document.getElementById('hierarchyBtn').addEventListener('click', () => {
            this.showHierarchyModal();
        });
        
        // Drag and drop
        this.setupDragAndDrop();
        
        // Modal controls
        this.setupModals();
        
        // Canvas interactions
        this.canvas.addEventListener('click', (e) => {
            if (e.target === this.canvas || e.target === this.terminalPreview) {
                this.selectElement(null);
            }
        });
    }
    
    setupDragAndDrop() {
        // Element palette drag
        document.querySelectorAll('.element-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.type);
                this.draggedElement = item.dataset.type;
            });
            
            item.setAttribute('draggable', 'true');
        });
        
        // Canvas drop
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('drag-over');
        });
        
        this.canvas.addEventListener('dragleave', (e) => {
            if (!this.canvas.contains(e.relatedTarget)) {
                this.dropZone.classList.remove('drag-over');
            }
        });
        
        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-over');
            
            const elementType = e.dataTransfer.getData('text/plain');
            if (elementType) {
                const rect = this.canvas.getBoundingClientRect();
                const x = Math.floor((e.clientX - rect.left) / this.cellWidth) + 1;
                const y = Math.floor((e.clientY - rect.top) / this.cellHeight) + 1;
                
                this.createElement(elementType, { x, y });
            }
        });
    }
    
    setupModals() {
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal);
            });
        });
        
        // Modal background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal);
                }
            });
        });
        
        // Export modal
        document.querySelectorAll('input[name="exportType"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateExportCode();
            });
        });
        
        document.getElementById('copyCodeBtn').addEventListener('click', () => {
            this.copyExportCode();
        });
        
        document.getElementById('downloadCodeBtn').addEventListener('click', () => {
            this.downloadExportCode();
        });
    }
    
    loadPreset(preset) {
        const presets = {
            computer: { width: 51, height: 19 },
            pocket: { width: 26, height: 20 },
            advanced: { width: 51, height: 19 },
            monitor: { width: 7, height: 5 },
            monitor3x2: { width: 10, height: 6 },
            monitor5x4: { width: 16, height: 12 },
            custom: { width: this.terminalWidth, height: this.terminalHeight }
        };
        
        if (presets[preset]) {
            this.terminalWidth = presets[preset].width;
            this.terminalHeight = presets[preset].height;
            
            document.getElementById('terminalWidth').value = this.terminalWidth;
            document.getElementById('terminalHeight').value = this.terminalHeight;
            
            this.updateTerminalSize();
        }
    }
    
    updateTerminalSize() {
        const canvasWidth = this.terminalWidth * this.cellWidth;
        const canvasHeight = this.terminalHeight * this.cellHeight;
        
        // Set the canvas container size to match the calculated dimensions
        const canvas = document.querySelector('.canvas');
        canvas.style.width = canvasWidth + 'px';
        canvas.style.height = canvasHeight + 'px';
        canvas.style.minHeight = canvasHeight + 'px';
        
        this.terminalPreview.style.width = canvasWidth + 'px';
        this.terminalPreview.style.height = canvasHeight + 'px';
        
        // Update canvas info
        const presetSelect = document.getElementById('terminalPreset');
        const selectedPreset = presetSelect.options[presetSelect.selectedIndex].text;
        document.getElementById('canvasInfo').textContent = 
            `${this.terminalWidth}×${this.terminalHeight} ${selectedPreset}`;
        
        this.createTerminalGrid();
        this.updateElementPositions();
    }
    
    createTerminalGrid() {
        // Remove existing grid
        const existingGrid = this.terminalPreview.querySelector('.terminal-grid');
        if (existingGrid) {
            existingGrid.remove();
        }
        
        const grid = document.createElement('div');
        grid.className = 'terminal-grid';
        if (this.gridVisible) {
            grid.classList.add('visible');
        }
        
        for (let y = 0; y < this.terminalHeight; y++) {
            for (let x = 0; x < this.terminalWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'terminal-cell';
                cell.style.left = (x * this.cellWidth) + 'px';
                cell.style.top = (y * this.cellHeight) + 'px';
                cell.style.setProperty('--cell-width', this.cellWidth + 'px');
                cell.style.setProperty('--cell-height', this.cellHeight + 'px');
                grid.appendChild(cell);
            }
        }
        
        this.terminalPreview.appendChild(grid);
    }
    
    toggleGrid() {
        this.gridVisible = !this.gridVisible;
        const grid = this.terminalPreview.querySelector('.terminal-grid');
        if (grid) {
            grid.classList.toggle('visible', this.gridVisible);
        }
        
        const btn = document.getElementById('gridToggle');
        btn.classList.toggle('active', this.gridVisible);
    }
    
    createElement(type, overrideProps = {}) {
        const elementDef = this.basaltElements[type];
        if (!elementDef) return null;
        
        const id = 'element_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const props = { ...elementDef.defaultProps, ...overrideProps };
        
        const element = {
            id,
            type,
            props,
            children: []
        };
        
        this.elements.set(id, element);
        this.renderElement(element);
        this.selectElement(element);
        this.hideDropZone();
        
        return element;
    }
    
    renderElement(element) {
        const elementDiv = document.createElement('div');
        elementDiv.className = 'ui-element';
        elementDiv.dataset.elementId = element.id;
        elementDiv.dataset.elementType = element.type;
        
        this.updateElementDiv(elementDiv, element);
        this.addElementInteractivity(elementDiv, element);
        
        this.terminalPreview.appendChild(elementDiv);
    }
    
    updateElementDiv(elementDiv, element) {
        const { x, y, width, height, background, foreground, visible } = element.props;
        
        elementDiv.style.left = ((x - 1) * this.cellWidth) + 'px';
        elementDiv.style.top = ((y - 1) * this.cellHeight) + 'px';
        elementDiv.style.width = (width * this.cellWidth) + 'px';
        elementDiv.style.height = (height * this.cellHeight) + 'px';
        elementDiv.style.display = visible ? 'block' : 'none';
        
        // Apply CC colors
        elementDiv.className = `ui-element cc-color-${background}`;
        if (this.selectedElement && this.selectedElement.id === element.id) {
            elementDiv.classList.add('selected');
        }
        
        // Render element content based on type
        this.renderElementContent(elementDiv, element);
    }
    
    renderElementContent(elementDiv, element) {
        const { type, props } = element;
        
        elementDiv.innerHTML = '';
        
        switch (type) {
            case 'Label':
                elementDiv.innerHTML = `<span style="color: var(--fg-color, #fff); font-size: 11px; line-height: 1;">${props.text}</span>`;
                break;
                
            case 'Button':
                elementDiv.innerHTML = `<div style="border: 1px solid #666; text-align: center; line-height: ${elementDiv.style.height}; color: var(--fg-color, #fff); font-size: 11px;">${props.text}</div>`;
                break;
                
            case 'Input':
                const displayText = props.text || props.placeholder;
                elementDiv.innerHTML = `<input type="text" value="${props.text}" placeholder="${props.placeholder}" style="width: 100%; height: 100%; background: transparent; border: 1px solid #666; color: var(--fg-color, #fff); font-size: 11px; padding: 2px;">`;
                break;
                
            case 'Checkbox':
                const checkmark = props.checked ? props.checkedText : '';
                elementDiv.innerHTML = `<span style="color: var(--fg-color, #fff); font-size: 11px;">[${checkmark}] ${props.text}</span>`;
                break;
                
            case 'List':
                elementDiv.innerHTML = `<div style="border: 1px solid #666; padding: 2px; overflow: hidden; color: var(--fg-color, #fff); font-size: 10px;">List (${props.items.length} items)</div>`;
                break;
                
            case 'ProgressBar':
                const progressWidth = (props.progress / 100) * 100;
                elementDiv.innerHTML = `<div style="border: 1px solid #666; position: relative; height: 100%;"><div style="background: var(--progress-color, lime); width: ${progressWidth}%; height: 100%;"></div></div>`;
                break;
                
            case 'Slider':
                const sliderPos = (props.step / props.max) * 100;
                if (props.horizontal) {
                    elementDiv.innerHTML = `<div style="border: 1px solid #666; position: relative; height: 100%;"><div style="position: absolute; left: ${sliderPos}%; top: 0; width: 4px; height: 100%; background: var(--slider-color, blue);"></div></div>`;
                } else {
                    elementDiv.innerHTML = `<div style="border: 1px solid #666; position: relative; width: 100%;"><div style="position: absolute; top: ${100-sliderPos}%; left: 0; width: 100%; height: 4px; background: var(--slider-color, blue);"></div></div>`;
                }
                break;
                
            case 'Image':
                elementDiv.innerHTML = `<div style="border: 1px solid #666; text-align: center; line-height: ${elementDiv.style.height}; color: var(--fg-color, #666); font-size: 10px;">🖼️ Image</div>`;
                break;
                
            case 'BigFont':
                elementDiv.innerHTML = `<div style="text-align: center; line-height: ${elementDiv.style.height}; color: var(--fg-color, #fff); font-size: ${12 + props.fontSize * 2}px; font-weight: bold;">${props.text}</div>`;
                break;
                
            default:
                elementDiv.innerHTML = `<div style="border: 1px solid #666; text-align: center; line-height: ${elementDiv.style.height}; color: var(--fg-color, #666); font-size: 10px;">${type}</div>`;
        }
        
        // Add resize handles if selected
        if (this.selectedElement && this.selectedElement.id === element.id) {
            this.addResizeHandles(elementDiv);
        }
    }
    
    addElementInteractivity(elementDiv, element) {
        // Click to select
        elementDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(element);
        });
        
        // Drag to move
        let isDragging = false;
        let dragStart = { x: 0, y: 0 };
        let elementStart = { x: element.props.x, y: element.props.y };
        
        elementDiv.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('resize-handle')) return;
            
            isDragging = true;
            elementDiv.classList.add('dragging');
            
            dragStart.x = e.clientX;
            dragStart.y = e.clientY;
            elementStart.x = element.props.x;
            elementStart.y = element.props.y;
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = Math.round((e.clientX - dragStart.x) / this.cellWidth);
            const deltaY = Math.round((e.clientY - dragStart.y) / this.cellHeight);
            
            const newX = Math.max(1, Math.min(this.terminalWidth - element.props.width + 1, elementStart.x + deltaX));
            const newY = Math.max(1, Math.min(this.terminalHeight - element.props.height + 1, elementStart.y + deltaY));
            
            this.updateElementProperty(element, 'x', newX);
            this.updateElementProperty(element, 'y', newY);
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                elementDiv.classList.remove('dragging');
            }
        });
    }
    
    addResizeHandles(elementDiv) {
        const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'];
        
        handles.forEach(handle => {
            const handleDiv = document.createElement('div');
            handleDiv.className = `resize-handle ${handle}`;
            
            let isResizing = false;
            let resizeStart = { x: 0, y: 0 };
            let elementStart = { width: 0, height: 0, x: 0, y: 0 };
            
            handleDiv.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                isResizing = true;
                
                resizeStart.x = e.clientX;
                resizeStart.y = e.clientY;
                elementStart.width = this.selectedElement.props.width;
                elementStart.height = this.selectedElement.props.height;
                elementStart.x = this.selectedElement.props.x;
                elementStart.y = this.selectedElement.props.y;
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;
                
                const deltaX = Math.round((e.clientX - resizeStart.x) / this.cellWidth);
                const deltaY = Math.round((e.clientY - resizeStart.y) / this.cellHeight);
                
                let newWidth = elementStart.width;
                let newHeight = elementStart.height;
                let newX = elementStart.x;
                let newY = elementStart.y;
                
                // Calculate new dimensions based on handle
                if (handle.includes('e')) newWidth = Math.max(1, elementStart.width + deltaX);
                if (handle.includes('w')) {
                    newWidth = Math.max(1, elementStart.width - deltaX);
                    newX = Math.max(1, elementStart.x + deltaX);
                }
                if (handle.includes('s')) newHeight = Math.max(1, elementStart.height + deltaY);
                if (handle.includes('n')) {
                    newHeight = Math.max(1, elementStart.height - deltaY);
                    newY = Math.max(1, elementStart.y + deltaY);
                }
                
                // Clamp to terminal bounds
                newWidth = Math.min(newWidth, this.terminalWidth - newX + 1);
                newHeight = Math.min(newHeight, this.terminalHeight - newY + 1);
                
                this.updateElementProperty(this.selectedElement, 'width', newWidth);
                this.updateElementProperty(this.selectedElement, 'height', newHeight);
                this.updateElementProperty(this.selectedElement, 'x', newX);
                this.updateElementProperty(this.selectedElement, 'y', newY);
            });
            
            document.addEventListener('mouseup', () => {
                isResizing = false;
            });
            
            elementDiv.appendChild(handleDiv);
        });
    }
    
    selectElement(element) {
        // Clear previous selection
        document.querySelectorAll('.ui-element.selected').forEach(el => {
            el.classList.remove('selected');
            el.querySelectorAll('.resize-handle').forEach(handle => handle.remove());
        });
        
        this.selectedElement = element;
        
        if (element) {
            const elementDiv = document.querySelector(`[data-element-id="${element.id}"]`);
            if (elementDiv) {
                elementDiv.classList.add('selected');
                this.addResizeHandles(elementDiv);
            }
            this.showProperties(element);
        } else {
            this.hideProperties();
        }
    }
    
    updateElementProperty(element, property, value) {
        element.props[property] = value;
        
        const elementDiv = document.querySelector(`[data-element-id="${element.id}"]`);
        if (elementDiv) {
            this.updateElementDiv(elementDiv, element);
        }
        
        if (this.selectedElement && this.selectedElement.id === element.id) {
            this.updatePropertiesPanel();
        }
    }
    
    showProperties(element) {
        this.propertiesContent.innerHTML = '';
        
        const elementDef = this.basaltElements[element.type];
        if (!elementDef) return;
        
        // Element info
        const infoDiv = document.createElement('div');
        infoDiv.className = 'property-group';
        infoDiv.innerHTML = `
            <h4>Element Info</h4>
            <div class="property-field">
                <label>Type</label>
                <input type="text" value="${element.type}" readonly>
            </div>
            <div class="property-field">
                <label>ID</label>
                <input type="text" value="${element.id}" readonly>
            </div>
        `;
        this.propertiesContent.appendChild(infoDiv);
        
        // Create property groups
        Object.entries(elementDef.properties).forEach(([groupName, properties]) => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'property-group';
            
            const groupTitle = groupName.charAt(0).toUpperCase() + groupName.slice(1);
            groupDiv.innerHTML = `<h4>${groupTitle}</h4>`;
            
            properties.forEach(prop => {
                const fieldDiv = this.createPropertyField(element, prop);
                groupDiv.appendChild(fieldDiv);
            });
            
            this.propertiesContent.appendChild(groupDiv);
        });
        
        // Delete button
        const deleteDiv = document.createElement('div');
        deleteDiv.className = 'property-group';
        deleteDiv.innerHTML = `
            <button class="btn btn-secondary" style="width: 100%; color: #e53e3e;" onclick="designer.deleteElement('${element.id}')">
                🗑️ Delete Element
            </button>
        `;
        this.propertiesContent.appendChild(deleteDiv);
    }
    
    createPropertyField(element, property) {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'property-field';
        
        const value = element.props[property];
        const label = property.charAt(0).toUpperCase() + property.slice(1);
        
        fieldDiv.innerHTML = `<label>${label}</label>`;
        
        let inputHtml = '';
        
        // Determine input type based on property and value
        if (typeof value === 'boolean') {
            inputHtml = `<input type="checkbox" ${value ? 'checked' : ''} onchange="designer.updateElementProperty(designer.selectedElement, '${property}', this.checked)">`;
        } else if (typeof value === 'number' || (value === null && (property === 'maxLength' || property === 'z'))) {
            const displayValue = value === null ? '' : value;
            const changeHandler = property === 'maxLength' ? 
                `designer.updateElementProperty(designer.selectedElement, '${property}', this.value === '' ? null : parseInt(this.value) || 0)` :
                `designer.updateElementProperty(designer.selectedElement, '${property}', parseInt(this.value) || 0)`;
            inputHtml = `<input type="number" value="${displayValue}" placeholder="${property === 'maxLength' ? 'No limit' : ''}" onchange="${changeHandler}">`;
        } else if (property.includes('Color') || property === 'background' || property === 'foreground' || 
                   property === 'focusedBackground' || property === 'focusedForeground' || 
                   property === 'selectedBackground' || property === 'selectedForeground' ||
                   property === 'headerColor' || property === 'selectedColor' || property === 'gridColor' ||
                   property === 'nodeColor' || property === 'barColor' || property === 'sliderColor' ||
                   property === 'progressColor' || property === 'separatorColor') {
            // Color picker
            const colorOptions = Object.keys(this.ccColors).map(color => 
                `<option value="${color}" ${value === color ? 'selected' : ''}>${color}</option>`
            ).join('');
            inputHtml = `
                <div class="color-input">
                    <div class="cc-color-${value}" style="width: 32px; height: 32px; border-radius: 4px; border: 1px solid #ccc;"></div>
                    <select onchange="designer.updateElementProperty(designer.selectedElement, '${property}', this.value)">
                        ${colorOptions}
                    </select>
                </div>
            `;
        } else if (property === 'flexDirection') {
            inputHtml = `
                <select onchange="designer.updateElementProperty(designer.selectedElement, '${property}', this.value)">
                    <option value="row" ${value === 'row' ? 'selected' : ''}>Row</option>
                    <option value="column" ${value === 'column' ? 'selected' : ''}>Column</option>
                </select>
            `;
        } else if (property === 'direction') {
            inputHtml = `
                <select onchange="designer.updateElementProperty(designer.selectedElement, '${property}', this.value)">
                    <option value="right" ${value === 'right' ? 'selected' : ''}>Right</option>
                    <option value="left" ${value === 'left' ? 'selected' : ''}>Left</option>
                    <option value="up" ${value === 'up' ? 'selected' : ''}>Up</option>
                    <option value="down" ${value === 'down' ? 'selected' : ''}>Down</option>
                </select>
            `;
        } else if (Array.isArray(value)) {
            if (property === 'items' && (element.type === 'Dropdown' || element.type === 'List' || element.type === 'Menu')) {
                inputHtml = this.createItemsManager(element, property);
            } else if (property === 'nodes' && element.type === 'Tree') {
                inputHtml = this.createNodesManager(element, property);
            } else if (property === 'series' && (element.type === 'Graph' || element.type === 'BarChart' || element.type === 'LineChart')) {
                inputHtml = this.createSeriesManager(element, property);
            } else {
                inputHtml = `<textarea rows="3" onchange="designer.updateElementProperty(designer.selectedElement, '${property}', this.value.split('\\n').filter(x => x.trim()))">${value.join('\n')}</textarea>`;
            }
        } else if (typeof value === 'object' && value !== null) {
            if (property === 'series' && (element.type === 'Graph' || element.type === 'BarChart' || element.type === 'LineChart')) {
                inputHtml = this.createSeriesManager(element, property);
            } else {
                inputHtml = `<textarea rows="3" onchange="designer.updateElementProperty(designer.selectedElement, '${property}', JSON.parse(this.value))">${JSON.stringify(value, null, 2)}</textarea>`;
            }
        } else {
            inputHtml = `<input type="text" value="${value}" onchange="designer.updateElementProperty(designer.selectedElement, '${property}', this.value)">`;
        }
        
        fieldDiv.innerHTML += inputHtml;
        return fieldDiv;
    }
    
    createItemsManager(element, property) {
        const items = element.props[property] || [];
        const managerId = `manager_${element.id}_${property}`;
        
        let html = `<div class="items-manager" id="${managerId}">`;
        html += `<div class="items-list">`;
        
        items.forEach((item, index) => {
            const itemText = typeof item === 'string' ? item : (item.text || 'Item');
            html += `
                <div class="item-entry" data-index="${index}">
                    <input type="text" value="${itemText}" onchange="designer.updateItem('${element.id}', '${property}', ${index}, this.value)" style="flex: 1; margin-right: 8px;">
                    <button class="btn btn-sm" onclick="designer.removeItem('${element.id}', '${property}', ${index})" style="background: #e53e3e; color: white; padding: 4px 8px;">×</button>
                </div>
            `;
        });
        
        html += `</div>`;
        html += `<button class="btn btn-sm" onclick="designer.addItem('${element.id}', '${property}')" style="width: 100%; margin-top: 8px; background: #38a169; color: white;">+ Add Item</button>`;
        html += `</div>`;
        
        return html;
    }
    
    createNodesManager(element, property) {
        const nodes = element.props[property] || [];
        const managerId = `manager_${element.id}_${property}`;
        
        let html = `<div class="nodes-manager" id="${managerId}">`;
        html += `<div class="nodes-list">`;
        
        const renderNode = (node, index, depth = 0) => {
            const indent = '  '.repeat(depth);
            const nodeText = node.text || 'Node';
            html += `
                <div class="node-entry" data-index="${index}" style="margin-left: ${depth * 20}px;">
                    <div style="display: flex; align-items: center; margin-bottom: 4px;">
                        <span style="margin-right: 8px;">${indent}📄</span>
                        <input type="text" value="${nodeText}" onchange="designer.updateNode('${element.id}', ${index}, 'text', this.value)" style="flex: 1; margin-right: 8px;">
                        <button class="btn btn-sm" onclick="designer.addChildNode('${element.id}', ${index})" style="background: #3182ce; color: white; padding: 2px 6px; margin-right: 4px;">+</button>
                        <button class="btn btn-sm" onclick="designer.removeNode('${element.id}', ${index})" style="background: #e53e3e; color: white; padding: 2px 6px;">×</button>
                    </div>
                </div>
            `;
            
            if (node.children && node.children.length > 0) {
                node.children.forEach((child, childIndex) => {
                    renderNode(child, `${index}_${childIndex}`, depth + 1);
                });
            }
        };
        
        nodes.forEach((node, index) => {
            renderNode(node, index);
        });
        
        html += `</div>`;
        html += `<button class="btn btn-sm" onclick="designer.addNode('${element.id}', '${property}')" style="width: 100%; margin-top: 8px; background: #38a169; color: white;">+ Add Root Node</button>`;
        html += `</div>`;
        
        return html;
    }
    
    createSeriesManager(element, property) {
        const series = element.props[property] || {};
        const managerId = `manager_${element.id}_${property}`;
        
        let html = `<div class="series-manager" id="${managerId}">`;
        html += `<div class="series-list">`;
        
        Object.entries(series).forEach(([seriesName, seriesData]) => {
            html += `
                <div class="series-entry" data-name="${seriesName}">
                    <div style="display: flex; align-items: center; margin-bottom: 8px; padding: 8px; background: rgba(0,0,0,0.05); border-radius: 4px;">
                        <strong style="flex: 1;">${seriesName}</strong>
                        <button class="btn btn-sm" onclick="designer.removeSeries('${element.id}', '${seriesName}')" style="background: #e53e3e; color: white; padding: 2px 6px;">Remove</button>
                    </div>
                    <div style="margin-left: 16px; margin-bottom: 8px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 4px;">
                            <div>
                                <label style="font-size: 10px;">Symbol</label>
                                <input type="text" value="${seriesData.symbol || ' '}" onchange="designer.updateSeries('${element.id}', '${seriesName}', 'symbol', this.value)" style="width: 100%;">
                            </div>
                            <div>
                                <label style="font-size: 10px;">Point Count</label>
                                <input type="number" value="${seriesData.pointCount || 10}" onchange="designer.updateSeries('${element.id}', '${seriesName}', 'pointCount', parseInt(this.value))" style="width: 100%;">
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            <div>
                                <label style="font-size: 10px;">BG Color</label>
                                <select onchange="designer.updateSeries('${element.id}', '${seriesName}', 'bgCol', this.value)" style="width: 100%;">
                                    ${Object.keys(this.ccColors).map(color => 
                                        `<option value="${color}" ${(seriesData.bgCol === color) ? 'selected' : ''}>${color}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 10px;">FG Color</label>
                                <select onchange="designer.updateSeries('${element.id}', '${seriesName}', 'fgCol', this.value)" style="width: 100%;">
                                    ${Object.keys(this.ccColors).map(color => 
                                        `<option value="${color}" ${(seriesData.fgCol === color) ? 'selected' : ''}>${color}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        html += `
            <div style="margin-top: 8px; padding: 8px; background: rgba(0,0,0,0.05); border-radius: 4px;">
                <input type="text" id="newSeriesName_${element.id}" placeholder="Series name" style="width: 100%; margin-bottom: 8px;">
                <button class="btn btn-sm" onclick="designer.addSeries('${element.id}', '${property}')" style="width: 100%; background: #38a169; color: white;">+ Add Series</button>
            </div>
        `;
        html += `</div>`;
        
        return html;
    }
    
    // Item management methods
    addItem(elementId, property) {
        const element = this.elements.get(elementId);
        if (!element) return;
        
        const items = element.props[property] || [];
        items.push(element.type === 'Dropdown' || element.type === 'Menu' ? 
            { text: 'New Item', callback: null } : 'New Item');
        
        this.updateElementProperty(element, property, items);
        this.updatePropertiesPanel();
    }
    
    removeItem(elementId, property, index) {
        const element = this.elements.get(elementId);
        if (!element) return;
        
        const items = [...(element.props[property] || [])];
        items.splice(index, 1);
        
        this.updateElementProperty(element, property, items);
        this.updatePropertiesPanel();
    }
    
    updateItem(elementId, property, index, value) {
        const element = this.elements.get(elementId);
        if (!element) return;
        
        const items = [...(element.props[property] || [])];
        if (element.type === 'Dropdown' || element.type === 'Menu') {
            items[index] = { ...items[index], text: value };
        } else {
            items[index] = value;
        }
        
        this.updateElementProperty(element, property, items);
    }
    
    // Node management methods
    addNode(elementId, property) {
        const element = this.elements.get(elementId);
        if (!element) return;
        
        const nodes = [...(element.props[property] || [])];
        nodes.push({ text: 'New Node', children: [] });
        
        this.updateElementProperty(element, property, nodes);
        this.updatePropertiesPanel();
    }
    
    removeNode(elementId, index) {
        const element = this.elements.get(elementId);
        if (!element) return;
        
        const nodes = [...(element.props.nodes || [])];
        const indexParts = index.toString().split('_');
        
        if (indexParts.length === 1) {
            nodes.splice(parseInt(indexParts[0]), 1);
        } else {
            // Handle nested node removal
            let current = nodes[parseInt(indexParts[0])];
            for (let i = 1; i < indexParts.length - 1; i++) {
                current = current.children[parseInt(indexParts[i])];
            }
            current.children.splice(parseInt(indexParts[indexParts.length - 1]), 1);
        }
        
        this.updateElementProperty(element, 'nodes', nodes);
        this.updatePropertiesPanel();
    }
    
    addChildNode(elementId, parentIndex) {
        const element = this.elements.get(elementId);
        if (!element) return;
        
        const nodes = [...(element.props.nodes || [])];
        const indexParts = parentIndex.toString().split('_');
        
        let current = nodes[parseInt(indexParts[0])];
        for (let i = 1; i < indexParts.length; i++) {
            current = current.children[parseInt(indexParts[i])];
        }
        
        if (!current.children) current.children = [];
        current.children.push({ text: 'Child Node', children: [] });
        
        this.updateElementProperty(element, 'nodes', nodes);
        this.updatePropertiesPanel();
    }
    
    updateNode(elementId, index, field, value) {
        const element = this.elements.get(elementId);
        if (!element) return;
        
        const nodes = [...(element.props.nodes || [])];
        const indexParts = index.toString().split('_');
        
        let current = nodes[parseInt(indexParts[0])];
        for (let i = 1; i < indexParts.length; i++) {
            current = current.children[parseInt(indexParts[i])];
        }
        
        current[field] = value;
        
        this.updateElementProperty(element, 'nodes', nodes);
    }
    
    // Series management methods
    addSeries(elementId, property) {
        const element = this.elements.get(elementId);
        if (!element) return;
        
        const nameInput = document.getElementById(`newSeriesName_${elementId}`);
        const seriesName = nameInput.value.trim();
        
        if (!seriesName) {
            alert('Please enter a series name');
            return;
        }
        
        const series = { ...(element.props[property] || {}) };
        series[seriesName] = {
            symbol: ' ',
            bgCol: 'green',
            fgCol: 'green',
            pointCount: 10
        };
        
        this.updateElementProperty(element, property, series);
        nameInput.value = '';
        this.updatePropertiesPanel();
    }
    
    removeSeries(elementId, seriesName) {
        const element = this.elements.get(elementId);
        if (!element) return;
        
        const series = { ...(element.props.series || {}) };
        delete series[seriesName];
        
        this.updateElementProperty(element, 'series', series);
        this.updatePropertiesPanel();
    }
    
    updateSeries(elementId, seriesName, field, value) {
        const element = this.elements.get(elementId);
        if (!element) return;
        
        const series = { ...(element.props.series || {}) };
        if (!series[seriesName]) return;
        
        series[seriesName][field] = value;
        
        this.updateElementProperty(element, 'series', series);
    }
    
    updatePropertiesPanel() {
        if (this.selectedElement) {
            this.showProperties(this.selectedElement);
        }
    }
    
    hideProperties() {
        this.propertiesContent.innerHTML = `
            <div class="no-selection">
                <div class="no-selection-icon">🎯</div>
                <p>Select an element to edit its properties</p>
            </div>
        `;
    }
    
    deleteElement(elementId) {
        const element = this.elements.get(elementId);
        if (!element) return;
        
        const elementDiv = document.querySelector(`[data-element-id="${elementId}"]`);
        if (elementDiv) {
            elementDiv.remove();
        }
        
        this.elements.delete(elementId);
        
        if (this.selectedElement && this.selectedElement.id === elementId) {
            this.selectElement(null);
        }
        
        if (this.elements.size === 0) {
            this.showDropZone();
        }
    }
    
    clearCanvas() {
        if (confirm('Are you sure you want to clear the canvas? This will delete all elements.')) {
            this.elements.clear();
            document.querySelectorAll('.ui-element').forEach(el => el.remove());
            this.selectElement(null);
            this.showDropZone();
        }
    }
    
    updateElementPositions() {
        this.elements.forEach(element => {
            const elementDiv = document.querySelector(`[data-element-id="${element.id}"]`);
            if (elementDiv) {
                this.updateElementDiv(elementDiv, element);
            }
        });
    }
    
    showDropZone() {
        this.dropZone.classList.remove('hidden');
    }
    
    hideDropZone() {
        this.dropZone.classList.add('hidden');
    }
    
    // Modal functions
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    hideModal(modal) {
        if (typeof modal === 'string') {
            modal = document.getElementById(modal);
        }
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    showExportModal() {
        this.showModal('exportModal');
        this.updateExportCode();
    }
    
    showImportModal() {
        this.showModal('importModal');
    }
    
    performImport() {
        const fileInput = document.getElementById('importFile');
        const codeInput = document.getElementById('importCode');
        
        // Check if a file was selected
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    this.importData(e.target.result, file.name);
                } catch (error) {
                    alert('Error reading file: ' + error.message);
                }
            };
            
            reader.readAsText(file);
        } else if (codeInput.value.trim()) {
            // Use pasted code
            try {
                this.importData(codeInput.value.trim(), 'pasted_code');
            } catch (error) {
                alert('Error importing code: ' + error.message);
            }
        } else {
            alert('Please select a file or paste code to import.');
            return;
        }
    }
    
    importData(data, filename) {
        try {
            // Try to parse as JSON first
            const jsonData = JSON.parse(data);
            
            if (jsonData.elements && jsonData.terminal) {
                // Valid Basalt UI Designer format
                this.clearCanvas();
                
                // Set terminal size
                this.terminalWidth = jsonData.terminal.width;
                this.terminalHeight = jsonData.terminal.height;
                
                // Update UI
                document.getElementById('terminalWidth').value = this.terminalWidth;
                document.getElementById('terminalHeight').value = this.terminalHeight;
                document.getElementById('terminalPreset').value = 'custom';
                this.updateTerminalSize();
                
                // Import elements
                jsonData.elements.forEach(elementData => {
                    const element = this.createElement(elementData.type, elementData.props);
                    element.id = elementData.id || element.id;
                });
                
                this.hideModal(document.getElementById('importModal'));
                
                // Clear the form
                document.getElementById('importFile').value = '';
                document.getElementById('importCode').value = '';
                
                alert('Design imported successfully!');
            } else {
                throw new Error('Invalid JSON format. Expected Basalt UI Designer format.');
            }
        } catch (jsonError) {
            // If JSON parsing fails, try to parse as Lua code
            if (data.includes('basalt') && data.includes('createFrame')) {
                this.importLuaCode(data);
            } else {
                throw new Error('Invalid format. Please provide JSON data or Lua code.');
            }
        }
    }
    
    importLuaCode(luaCode) {
        try {
            this.clearCanvas();
            
            // Extract terminal size from main:setSize(width, height)
            const sizeMatch = luaCode.match(/main:setSize\((\d+),\s*(\d+)\)/);
            if (sizeMatch) {
                this.terminalWidth = parseInt(sizeMatch[1]);
                this.terminalHeight = parseInt(sizeMatch[2]);
                
                // Update UI
                document.getElementById('terminalWidth').value = this.terminalWidth;
                document.getElementById('terminalHeight').value = this.terminalHeight;
                document.getElementById('terminalPreset').value = 'custom';
                this.updateTerminalSize();
            }
            
            // Extract elements - pattern: local varName = main:addElementType()
            const elementMatches = luaCode.matchAll(/local\s+(\w+)\s*=\s*main:add(\w+)\(\)/g);
            const elements = {};
            
            for (const match of elementMatches) {
                const varName = match[1];
                const elementType = match[2];
                
                // Create element
                const element = this.createElement(elementType);
                elements[varName] = element;
                
                // Extract properties for this element
                const propRegex = new RegExp(`${varName}:(\\w+)\\(([^)]+)\\)`, 'g');
                let propMatch;
                
                while ((propMatch = propRegex.exec(luaCode)) !== null) {
                    const methodName = propMatch[1];
                    const value = propMatch[2].trim();
                    
                    // Convert method name to property name (setX -> x, setWidth -> width)
                    if (methodName.startsWith('set')) {
                        const propName = methodName.slice(3).toLowerCase();
                        let parsedValue = this.parseLuaValue(value);
                        
                        // Handle special cases
                        if (propName === 'x' || propName === 'y' || propName === 'width' || propName === 'height') {
                            element.props[propName] = parsedValue;
                        } else if (propName === 'background' || propName === 'foreground' || propName.includes('color')) {
                            // Convert colors.colorName to just colorName
                            if (typeof parsedValue === 'string' && parsedValue.startsWith('colors.')) {
                                parsedValue = parsedValue.replace('colors.', '');
                            }
                            element.props[propName] = parsedValue;
                        } else {
                            element.props[propName] = parsedValue;
                        }
                    }
                }
                
                // Update element position and properties
                this.updateElementProperty(element, 'x', element.props.x);
                this.updateElementProperty(element, 'y', element.props.y);
                this.updateElementProperty(element, 'width', element.props.width);
                this.updateElementProperty(element, 'height', element.props.height);
            }
            
            this.hideModal(document.getElementById('importModal'));
            
            // Clear the form
            document.getElementById('importFile').value = '';
            document.getElementById('importCode').value = '';
            
            alert('Lua code imported successfully!');
            
        } catch (error) {
            throw new Error('Error parsing Lua code: ' + error.message);
        }
    }
    
    parseLuaValue(value) {
        // Remove quotes and parse the value
        value = value.trim();
        
        // Handle strings (remove quotes)
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
            return value.slice(1, -1);
        }
        
        // Handle numbers
        if (/^\d+(\.\d+)?$/.test(value)) {
            return parseFloat(value);
        }
        
        // Handle booleans
        if (value === 'true') return true;
        if (value === 'false') return false;
        
        // Handle arrays/tables like {"item1", "item2"}
        if (value.startsWith('{') && value.endsWith('}')) {
            try {
                // Simple array parsing for strings
                const items = value.slice(1, -1).split(',').map(item => {
                    item = item.trim();
                    if ((item.startsWith('"') && item.endsWith('"')) || 
                        (item.startsWith("'") && item.endsWith("'"))) {
                        return item.slice(1, -1);
                    }
                    return item;
                }).filter(item => item.length > 0);
                return items;
            } catch (e) {
                return value; // Return as string if parsing fails
            }
        }
        
        // Handle colors.colorName
        if (value.startsWith('colors.')) {
            return value;
        }
        
        // Return as string by default
        return value;
    }
    
    showPreviewModal() {
        this.showModal('previewModal');
        this.generatePreview();
    }
    
    showHierarchyModal() {
        this.showModal('hierarchyModal');
        this.generateHierarchy();
    }
    
    updateExportCode() {
        const exportType = document.querySelector('input[name="exportType"]:checked').value;
        const codeElement = document.getElementById('exportCode');
        
        let code = '';
        let language = 'lua';
        
        switch (exportType) {
            case 'lua':
                code = this.generateLuaCode();
                language = 'lua';
                break;
            case 'json':
                code = this.generateJSONCode();
                language = 'json';
                break;
            case 'xml':
                code = this.generateXMLCode();
                language = 'xml';
                break;
        }
        
        codeElement.textContent = code;
        codeElement.className = `language-${language}`;
        
        // Re-highlight with Prism
        if (window.Prism) {
            Prism.highlightElement(codeElement);
        }
    }
    
    generateLuaCode() {
        let code = `local basalt = require("basalt")\n\n`;
        code += `-- Create main frame\n`;
        code += `local main = basalt.createFrame()\n`;
        code += `main:setSize(${this.terminalWidth}, ${this.terminalHeight})\n\n`;
        
        const sortedElements = Array.from(this.elements.values()).sort((a, b) => a.id.localeCompare(b.id));
        
        sortedElements.forEach((element, index) => {
            const varName = `${element.type.toLowerCase()}${index + 1}`;
            code += `-- Create ${element.type}\n`;
            code += `local ${varName} = main:add${element.type}()\n`;
            
            // Set properties
            Object.entries(element.props).forEach(([prop, value]) => {
                if (prop === 'visible' && value === true) return; // Skip default visible
                if (value === null || value === undefined) return; // Skip null/undefined values
                
                const methodName = `set${prop.charAt(0).toUpperCase() + prop.slice(1)}`;
                
                if (typeof value === 'string' && value !== '') {
                    if (prop.includes('Color') || prop === 'background' || prop === 'foreground' || 
                        prop === 'focusedBackground' || prop === 'focusedForeground' || 
                        prop === 'selectedBackground' || prop === 'selectedForeground' ||
                        prop === 'headerColor' || prop === 'selectedColor' || prop === 'gridColor' ||
                        prop === 'nodeColor' || prop === 'barColor' || prop === 'sliderColor' ||
                        prop === 'progressColor' || prop === 'separatorColor') {
                        code += `${varName}:${methodName}(colors.${value})\n`;
                    } else {
                        code += `${varName}:${methodName}("${value}")\n`;
                    }
                } else if (typeof value === 'boolean') {
                    code += `${varName}:${methodName}(${value})\n`;
                } else if (Array.isArray(value) && value.length > 0) {
                    // Handle different array types
                    if (prop === 'items') {
                        // For dropdown/menu items - handle both strings and objects
                        const itemsStr = value.map(item => {
                            if (typeof item === 'string') {
                                return `"${item}"`;
                            } else if (typeof item === 'object' && item.text) {
                                return `{text = "${item.text}"}`;
                            }
                            return `"${item}"`;
                        }).join(', ');
                        code += `${varName}:${methodName}({${itemsStr}})\n`;
                    } else if (prop === 'nodes') {
                        // For tree nodes - handle nested structure
                        const formatNode = (node) => {
                            if (typeof node === 'string') return `"${node}"`;
                            let nodeStr = `{text = "${node.text || 'Node'}"`;
                            if (node.children && node.children.length > 0) {
                                const childrenStr = node.children.map(formatNode).join(', ');
                                nodeStr += `, children = {${childrenStr}}`;
                            }
                            nodeStr += '}';
                            return nodeStr;
                        };
                        const nodesStr = value.map(formatNode).join(', ');
                        code += `${varName}:${methodName}({${nodesStr}})\n`;
                    } else {
                        // For simple arrays like List items
                        code += `${varName}:${methodName}({${value.map(v => `"${v}"`).join(', ')}})\n`;
                    }
                } else if (typeof value === 'object' && value !== null) {
                    // Handle series for charts
                    if (prop === 'series') {
                        const seriesEntries = Object.entries(value).map(([name, data]) => {
                            return `["${name}"] = {symbol = "${data.symbol || ' '}", bgCol = colors.${data.bgCol || 'green'}, fgCol = colors.${data.fgCol || 'green'}, pointCount = ${data.pointCount || 10}}`;
                        }).join(', ');
                        code += `${varName}:${methodName}({${seriesEntries}})\n`;
                    }
                } else if (typeof value === 'number') {
                    code += `${varName}:${methodName}(${value})\n`;
                }
            });
            
            code += `\n`;
        });
        
        code += `-- Start the UI\n`;
        code += `basalt.run()`;
        
        return code;
    }
    
    generateJSONCode() {
        const data = {
            terminal: {
                width: this.terminalWidth,
                height: this.terminalHeight
            },
            elements: Array.from(this.elements.values()).map(element => ({
                id: element.id,
                type: element.type,
                props: element.props,
                children: element.children
            }))
        };
        
        return JSON.stringify(data, null, 2);
    }
    
    generateXMLCode() {
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<basalt>\n`;
        xml += `  <Frame width="${this.terminalWidth}" height="${this.terminalHeight}">\n`;
        
        Array.from(this.elements.values()).forEach(element => {
            xml += `    <${element.type}`;
            
            Object.entries(element.props).forEach(([prop, value]) => {
                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                    xml += ` ${prop}="${value}"`;
                }
            });
            
            xml += ` />\n`;
        });
        
        xml += `  </Frame>\n`;
        xml += `</basalt>`;
        
        return xml;
    }
    
    copyExportCode() {
        const code = document.getElementById('exportCode').textContent;
        navigator.clipboard.writeText(code).then(() => {
            const btn = document.getElementById('copyCodeBtn');
            const originalText = btn.textContent;
            btn.textContent = '✅ Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        });
    }
    
    downloadExportCode() {
        const exportType = document.querySelector('input[name="exportType"]:checked').value;
        const code = document.getElementById('exportCode').textContent;
        
        const extensions = { lua: 'lua', json: 'json', xml: 'xml' };
        const extension = extensions[exportType];
        
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `basalt-ui.${extension}`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    generatePreview() {
        const container = document.getElementById('terminalSimulation');
        container.innerHTML = '';
        
        // Create terminal preview
        const terminal = document.createElement('div');
        terminal.style.width = (this.terminalWidth * 8) + 'px';
        terminal.style.height = (this.terminalHeight * 12) + 'px';
        terminal.style.background = '#000';
        terminal.style.color = '#fff';
        terminal.style.fontFamily = 'monospace';
        terminal.style.fontSize = '8px';
        terminal.style.position = 'relative';
        terminal.style.border = '1px solid #333';
        
        // Render elements in preview
        Array.from(this.elements.values()).forEach(element => {
            if (!element.props.visible) return;
            
            const previewEl = document.createElement('div');
            previewEl.style.position = 'absolute';
            previewEl.style.left = ((element.props.x - 1) * 8) + 'px';
            previewEl.style.top = ((element.props.y - 1) * 12) + 'px';
            previewEl.style.width = (element.props.width * 8) + 'px';
            previewEl.style.height = (element.props.height * 12) + 'px';
            previewEl.className = `cc-color-${element.props.background}`;
            
            // Simple content rendering
            switch (element.type) {
                case 'Label':
                    previewEl.textContent = element.props.text;
                    break;
                case 'Button':
                    previewEl.textContent = element.props.text;
                    previewEl.style.border = '1px solid #666';
                    previewEl.style.textAlign = 'center';
                    break;
                default:
                    previewEl.textContent = element.type;
                    previewEl.style.fontSize = '6px';
            }
            
            terminal.appendChild(previewEl);
        });
        
        container.appendChild(terminal);
    }
    
    generateHierarchy() {
        const container = document.getElementById('hierarchyTree');
        container.innerHTML = '';
        
        if (this.elements.size === 0) {
            container.innerHTML = '<p>No elements in the design</p>';
            return;
        }
        
        const sortedElements = Array.from(this.elements.values()).sort((a, b) => a.id.localeCompare(b.id));
        
        sortedElements.forEach(element => {
            const item = document.createElement('div');
            item.className = 'hierarchy-item';
            if (this.selectedElement && this.selectedElement.id === element.id) {
                item.classList.add('selected');
            }
            
            item.innerHTML = `📄 ${element.type} (${element.props.x}, ${element.props.y})`;
            
            item.addEventListener('click', () => {
                this.selectElement(element);
                this.hideModal('hierarchyModal');
            });
            
            container.appendChild(item);
        });
    }
}

// Initialize the designer when the page loads
let designer;
document.addEventListener('DOMContentLoaded', () => {
    designer = new BasaltUIDesigner();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
        switch (e.key) {
            case 's':
                e.preventDefault();
                designer.showExportModal();
                break;
            case 'o':
                e.preventDefault();
                designer.showImportModal();
                break;
            case 'Delete':
            case 'Backspace':
                if (designer.selectedElement) {
                    e.preventDefault();
                    designer.deleteElement(designer.selectedElement.id);
                }
                break;
        }
    }
    
    if (e.key === 'Escape') {
        designer.selectElement(null);
    }
});

// Export designer to global scope for HTML event handlers
window.designer = designer;
