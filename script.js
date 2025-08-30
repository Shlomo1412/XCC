// UI Designer for Basalt 2, PixelUI, and PrimeUI - Main JavaScript
class UIDesigner {
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
        
        // Undo/Redo functionality
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        
        // Clipboard functionality
        this.clipboard = null;
        
        // Property change debouncing
        this.propertyChangeTimeout = null;
        
        this.terminalWidth = 51;
        this.terminalHeight = 19;
        this.cellWidth = 12;
        this.cellHeight = 18;
        
        this.currentFramework = 'basalt';
        this.basaltElements = this.initializeBasaltElements();
        this.pixelUIElements = this.initializePixelUIElements();
        this.primeUIElements = this.initializePrimeUIElements();
        this.ccColors = this.initializeCCColors();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupFrameworkTabs();
        this.updateTerminalSize();
        this.createTerminalGrid();
        this.loadPreset('computer');
        this.updateElementPalette();
        // Save initial empty state
        this.saveState();
        // Check for project to load after initialization
        setTimeout(() => this.checkProjectLoad(), 100);
    }
    
    setupFrameworkTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const logoTitle = document.getElementById('logoTitle');
        
        tabButtons.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabButtons.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Switch framework
                this.currentFramework = tab.dataset.framework;
                
                // Update title
                if (this.currentFramework === 'basalt') {
                    logoTitle.textContent = 'Basalt 2 UI Designer';
                } else if (this.currentFramework === 'pixelui') {
                    logoTitle.textContent = 'PixelUI Designer';
                } else if (this.currentFramework === 'primeui') {
                    logoTitle.textContent = 'PrimeUI Designer';
                }
                
                // Clear canvas and update element palette
                this.clearCanvas();
                this.updateElementPalette();
            });
        });
    }
    
    updateElementPalette() {
        const elementPalette = document.querySelector('.element-palette');
        if (!elementPalette) return;
        
        const elements = this.currentFramework === 'basalt' ? this.basaltElements : 
                        this.currentFramework === 'pixelui' ? this.pixelUIElements : this.primeUIElements;
        
        elementPalette.innerHTML = '';
        
        // Group elements by category
        const categories = this.getElementCategories(elements);
        
        Object.entries(categories).forEach(([categoryName, categoryElements]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'element-category';
            categoryDiv.innerHTML = `
                <h4>${categoryName}</h4>
                <div class="element-grid">
                    ${categoryElements.map(element => `
                        <div class="element-item" data-type="${element.type}">
                            <div class="element-icon">${this.getElementIcon(element.type)}</div>
                            <span>${element.type}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            elementPalette.appendChild(categoryDiv);
        });
        
        // Re-attach drag listeners
        this.attachElementDragListeners();
    }
    
    getElementCategories(elements) {
        const categories = {};
        
        Object.values(elements).forEach(element => {
            let category = 'Basic';
            
            if (this.currentFramework === 'basalt') {
                if (['Frame', 'Container', 'Flexbox'].includes(element.type)) {
                    category = 'Containers';
                } else if (['Label', 'Button', 'Input', 'Checkbox', 'Radio', 'Switch'].includes(element.type)) {
                    category = 'Basic';
                } else if (['List', 'Dropdown', 'Menubar', 'Table', 'Tree'].includes(element.type)) {
                    category = 'Advanced';
                } else if (['Progressbar', 'Slider', 'Graph', 'Image'].includes(element.type)) {
                    category = 'Display';
                }
            } else {
                if (['Container'].includes(element.type)) {
                    category = 'Containers';
                } else if (['Label', 'Button', 'TextBox', 'CheckBox', 'RadioButton', 'ToggleSwitch', 'NumericUpDown'].includes(element.type)) {
                    category = 'Basic';
                } else if (['ListView', 'ComboBox', 'TabControl', 'TreeView', 'Accordion'].includes(element.type)) {
                    category = 'Advanced';
                } else if (['ProgressBar', 'Slider', 'RangeSlider', 'Chart', 'Canvas', 'ColorPicker', 'LoadingIndicator'].includes(element.type)) {
                    category = 'Display';
                } else if (['RichTextBox', 'CodeEditor'].includes(element.type)) {
                    category = 'Editors';
                }
            }
            
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(element);
        });
        
        return categories;
    }
    
    getElementIcon(type) {
        const icons = {
            // Basalt elements
            'Frame': '🖼️',
            'Container': '📦',
            'Flexbox': '📐',
            'Label': '🏷️',
            'Button': '🔘',
            'Input': '📝',
            'Checkbox': '☑️',
            'Radio': '🔘',
            'Switch': '🔀',
            'List': '📋',
            'Dropdown': '📜',
            'Menubar': '📊',
            'Table': '📊',
            'Tree': '🌲',
            'Progressbar': '📊',
            'Slider': '🎚️',
            'Graph': '📈',
            'Image': '🖼️',
            
            // PixelUI elements
            'Widget': '📦',
            'TextBox': '📝',
            'CheckBox': '☑️',
            'ListView': '📋',
            'ComboBox': '📜',
            'TabControl': '📑',
            'ProgressBar': '📊',
            'Chart': '📈',
            'Canvas': '🎨',
            'RichTextBox': '📄',
            'CodeEditor': '💻',
            'ColorPicker': '🎨',
            'RadioButton': '🔘',
            'ToggleSwitch': '🔀',
            'RangeSlider': '🎚️',
            'LoadingIndicator': '⏳',
            'Accordion': '📂',
            'TreeView': '🌳',
            'NumericUpDown': '🔢'
        };
        
        return icons[type] || '📦';
    }
    
    initializePixelUIElements() {
        return {
            Widget: {
                type: 'Widget',
                defaultProps: {
                    x: 1, y: 1, width: 10, height: 5,
                    visible: true, enabled: true,
                    color: 'white', background: 'black'
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled', 'zIndex'],
                    appearance: ['color', 'background']
                }
            },
            Label: {
                type: 'Label',
                defaultProps: {
                    x: 1, y: 1, width: 8, height: 1,
                    text: 'Label', color: 'white', background: 'black',
                    align: 'left', visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['color', 'background'],
                    text: ['text', 'align']
                }
            },
            Button: {
                type: 'Button',
                defaultProps: {
                    x: 1, y: 1, width: 8, height: 3,
                    text: 'Button', color: 'white', background: 'gray',
                    border: true, clickEffect: true, visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['color', 'background', 'border', 'clickEffect'],
                    text: ['text']
                }
            },
            TextBox: {
                type: 'TextBox',
                defaultProps: {
                    x: 1, y: 1, width: 12, height: 1,
                    text: '', placeholder: 'Enter text...',
                    color: 'white', background: 'black', border: true,
                    maxLength: 50, password: false, visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['color', 'background', 'border'],
                    text: ['text', 'placeholder', 'maxLength', 'password']
                }
            },
            CheckBox: {
                type: 'CheckBox',
                defaultProps: {
                    x: 1, y: 1, width: 8, height: 1,
                    text: 'CheckBox', checked: false,
                    color: 'white', background: 'black', visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['color', 'background'],
                    checkbox: ['text', 'checked']
                }
            },
            Slider: {
                type: 'Slider',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 1,
                    value: 0, min: 0, max: 100, step: 1,
                    trackColor: 'gray', fillColor: 'cyan', knobColor: 'white',
                    visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['trackColor', 'fillColor', 'knobColor'],
                    slider: ['value', 'min', 'max', 'step']
                }
            },
            ProgressBar: {
                type: 'ProgressBar',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 1,
                    value: 50, max: 100,
                    color: 'green', background: 'gray', visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['color', 'background'],
                    progress: ['value', 'max']
                }
            },
            Container: {
                type: 'Container',
                defaultProps: {
                    x: 1, y: 1, width: 15, height: 10,
                    background: 'black', border: true,
                    layout: 'absolute', padding: 0, visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['background', 'border'],
                    container: ['layout', 'padding']
                }
            },
            ListView: {
                type: 'ListView',
                defaultProps: {
                    x: 1, y: 1, width: 15, height: 10,
                    items: [], selectedIndex: 1,
                    scrollable: true, visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    list: ['items', 'selectedIndex', 'scrollable']
                }
            },
            ComboBox: {
                type: 'ComboBox',
                defaultProps: {
                    x: 1, y: 1, width: 12, height: 1,
                    items: [], selectedIndex: 1,
                    color: 'white', background: 'black', visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['color', 'background'],
                    list: ['items', 'selectedIndex']
                }
            },
            TabControl: {
                type: 'TabControl',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 10,
                    tabs: [], selectedIndex: 1,
                    color: 'white', background: 'black', visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['color', 'background'],
                    tabs: ['tabs', 'selectedIndex']
                }
            },
            Chart: {
                type: 'Chart',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 10,
                    chartType: 'line', data: [],
                    color: 'white', background: 'black', visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['color', 'background'],
                    chart: ['chartType', 'data']
                }
            },
            Canvas: {
                type: 'Canvas',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 10,
                    pixels: {}, border: true,
                    background: 'black', visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['background', 'border'],
                    canvas: ['pixels']
                }
            },
            RichTextBox: {
                type: 'RichTextBox',
                defaultProps: {
                    x: 1, y: 1, width: 30, height: 10,
                    text: '', showLineNumbers: true, wordWrap: true,
                    tabSize: 4, readonly: false, allowFormatting: false,
                    color: 'white', background: 'black', border: true,
                    visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['color', 'background', 'border'],
                    editor: ['text', 'showLineNumbers', 'wordWrap', 'tabSize', 'readonly', 'allowFormatting']
                }
            },
            CodeEditor: {
                type: 'CodeEditor',
                defaultProps: {
                    x: 1, y: 1, width: 30, height: 10,
                    text: '', language: 'lua', showLineNumbers: true,
                    autoIndent: true, syntaxHighlight: true, autoComplete: true,
                    tabSize: 4, color: 'white', background: 'black',
                    border: true, visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['color', 'background', 'border'],
                    editor: ['text', 'language', 'showLineNumbers', 'autoIndent', 'syntaxHighlight', 'autoComplete', 'tabSize']
                }
            },
            ColorPicker: {
                type: 'ColorPicker',
                defaultProps: {
                    x: 1, y: 1, width: 16, height: 8,
                    selectedColor: 'white', gridColumns: 4, colorSize: 2,
                    showPreview: true, showName: true,
                    visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    picker: ['selectedColor', 'gridColumns', 'colorSize', 'showPreview', 'showName']
                }
            },
            RadioButton: {
                type: 'RadioButton',
                defaultProps: {
                    x: 1, y: 1, width: 8, height: 1,
                    text: 'RadioButton', checked: false, group: 'default',
                    color: 'white', background: 'black', visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['color', 'background'],
                    radio: ['text', 'checked', 'group']
                }
            },
            ToggleSwitch: {
                type: 'ToggleSwitch',
                defaultProps: {
                    x: 1, y: 1, width: 6, height: 1,
                    toggled: false, text: 'Toggle',
                    onColor: 'green', offColor: 'red', knobColor: 'white',
                    visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['onColor', 'offColor', 'knobColor'],
                    toggle: ['toggled', 'text']
                }
            },
            RangeSlider: {
                type: 'RangeSlider',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 1,
                    minValue: 25, maxValue: 75, rangeMin: 0, rangeMax: 100,
                    step: 1, trackColor: 'gray', fillColor: 'cyan',
                    knobColor: 'white', visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['trackColor', 'fillColor', 'knobColor'],
                    range: ['minValue', 'maxValue', 'rangeMin', 'rangeMax', 'step']
                }
            },
            LoadingIndicator: {
                type: 'LoadingIndicator',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 1,
                    progress: 0, style: 'bar', text: 'Loading...',
                    showPercent: true, animated: true,
                    color: 'cyan', background: 'gray', visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['color', 'background'],
                    loading: ['progress', 'style', 'text', 'showPercent', 'animated']
                }
            },
            Accordion: {
                type: 'Accordion',
                defaultProps: {
                    x: 1, y: 1, width: 30, height: 15,
                    sections: [], mode: 'single',
                    color: 'white', background: 'black', border: true,
                    visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['color', 'background', 'border'],
                    accordion: ['sections', 'mode']
                }
            },
            TreeView: {
                type: 'TreeView',
                defaultProps: {
                    x: 1, y: 1, width: 25, height: 15,
                    data: [], showLines: true, showRoot: true,
                    expandable: true, selectable: true,
                    color: 'white', background: 'black', visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['color', 'background'],
                    tree: ['data', 'showLines', 'showRoot', 'expandable', 'selectable']
                }
            },
            NumericUpDown: {
                type: 'NumericUpDown',
                defaultProps: {
                    x: 1, y: 1, width: 12, height: 3,
                    value: 0, min: 0, max: 100, step: 1,
                    showButtons: true, increment: 1,
                    color: 'white', background: 'black', border: true,
                    buttonColor: 'gray', visible: true, enabled: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'visible', 'enabled'],
                    appearance: ['color', 'background', 'border', 'buttonColor'],
                    numeric: ['value', 'min', 'max', 'step', 'increment', 'showButtons']
                }
            }
        };
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
    
    initializePrimeUIElements() {
        return {
            // Core UI Components
            Button: {
                type: 'Button',
                defaultProps: {
                    x: 1, y: 1, width: 8, height: 3,
                    text: 'Button',
                    fgColor: 'white', bgColor: 'lightGray', clickedColor: 'gray',
                    visible: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'text'],
                    appearance: ['fgColor', 'bgColor', 'clickedColor'],
                    events: ['action']
                },
                category: 'Basic'
            },
            Label: {
                type: 'Label',
                defaultProps: {
                    x: 1, y: 1, width: 10, height: 1,
                    text: 'Label',
                    fgColor: 'white', bgColor: 'black',
                    visible: true
                },
                properties: {
                    basic: ['x', 'y', 'text'],
                    appearance: ['fgColor', 'bgColor']
                },
                category: 'Basic'
            },
            CenterLabel: {
                type: 'CenterLabel',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 1,
                    text: 'Centered Text',
                    fgColor: 'white', bgColor: 'black',
                    visible: true
                },
                properties: {
                    basic: ['x', 'y', 'width', 'text'],
                    appearance: ['fgColor', 'bgColor']
                },
                category: 'Basic'
            },
            InputBox: {
                type: 'InputBox',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 1,
                    fgColor: 'white', bgColor: 'black',
                    replacement: '', default: '',
                    visible: true
                },
                properties: {
                    basic: ['x', 'y', 'width'],
                    appearance: ['fgColor', 'bgColor'],
                    input: ['replacement', 'default', 'history', 'completion'],
                    events: ['action']
                },
                category: 'Input'
            },
            ProgressBar: {
                type: 'ProgressBar',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 1,
                    fgColor: 'white', bgColor: 'black',
                    useShade: false,
                    visible: true
                },
                properties: {
                    basic: ['x', 'y', 'width'],
                    appearance: ['fgColor', 'bgColor', 'useShade']
                },
                category: 'Controls'
            },
            SelectionBox: {
                type: 'SelectionBox',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 8,
                    entries: ['Option 1', 'Option 2', 'Option 3'],
                    fgColor: 'white', bgColor: 'black'
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height'],
                    appearance: ['fgColor', 'bgColor'],
                    data: ['entries'],
                    events: ['action', 'selectChangeAction']
                },
                category: 'Lists'
            },
            CheckSelectionBox: {
                type: 'CheckSelectionBox',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 8,
                    selections: {'Option 1': false, 'Option 2': false, 'Option 3': false},
                    fgColor: 'white', bgColor: 'black'
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height'],
                    appearance: ['fgColor', 'bgColor'],
                    data: ['selections'],
                    events: ['action']
                },
                category: 'Lists'
            },
            ScrollBox: {
                type: 'ScrollBox',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 10,
                    innerHeight: 20,
                    allowArrowKeys: true, showScrollIndicators: false,
                    fgColor: 'white', bgColor: 'black'
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'innerHeight'],
                    behavior: ['allowArrowKeys', 'showScrollIndicators'],
                    appearance: ['fgColor', 'bgColor']
                },
                category: 'Containers'
            },
            TextBox: {
                type: 'TextBox',
                defaultProps: {
                    x: 1, y: 1, width: 30, height: 10,
                    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                    fgColor: 'white', bgColor: 'black'
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height', 'text'],
                    appearance: ['fgColor', 'bgColor']
                },
                category: 'Basic'
            },
            BorderBox: {
                type: 'BorderBox',
                defaultProps: {
                    x: 1, y: 1, width: 20, height: 10,
                    fgColor: 'white', bgColor: 'black'
                },
                properties: {
                    basic: ['x', 'y', 'width', 'height'],
                    appearance: ['fgColor', 'bgColor']
                },
                category: 'Decoration'
            },
            HorizontalLine: {
                type: 'HorizontalLine',
                defaultProps: {
                    x: 1, y: 1, width: 20,
                    fgColor: 'white', bgColor: 'black'
                },
                properties: {
                    basic: ['x', 'y', 'width'],
                    appearance: ['fgColor', 'bgColor']
                },
                category: 'Decoration'
            },
            DrawText: {
                type: 'DrawText',
                defaultProps: {
                    x: 1, y: 1,
                    text: 'Multi-line text with word wrapping',
                    resizeToFit: false,
                    fgColor: 'white', bgColor: 'black'
                },
                properties: {
                    basic: ['text', 'resizeToFit'],
                    appearance: ['fgColor', 'bgColor']
                },
                category: 'Basic'
            },
            DrawImage: {
                type: 'DrawImage',
                defaultProps: {
                    x: 1, y: 1,
                    data: 'image.bimg',
                    index: 1, setPalette: true
                },
                properties: {
                    basic: ['x', 'y', 'data'],
                    image: ['index', 'setPalette']
                },
                category: 'Media'
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
        
        // Element palette drag listeners  
        this.attachElementDragListeners();
        
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

        // TreeView Designer event listeners
        const nodeTextInput = document.getElementById('nodeText');
        const nodeExpandedInput = document.getElementById('nodeExpanded');
        const nodeIconInput = document.getElementById('nodeIcon');
        
        if (nodeTextInput) {
            nodeTextInput.addEventListener('input', () => {
                this.updateSelectedNode();
            });
        }
        
        if (nodeExpandedInput) {
            nodeExpandedInput.addEventListener('change', () => {
                this.updateSelectedNode();
            });
        }
        
        if (nodeIconInput) {
            nodeIconInput.addEventListener('input', () => {
                this.updateSelectedNode();
            });
        }
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
        const elementDef = this.getCurrentElements()[type];
        if (!elementDef) return null;
        
        this.saveState();
        
        const id = 'element_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const properties = { ...elementDef.defaultProps, ...overrideProps };
        
        const element = {
            id,
            type,
            properties,
            children: []
        };
        
        this.elements.set(id, element);
        this.renderElement(element);
        this.selectElement(element);
        this.hideDropZone();
        
        // Auto-save project if editing
        setTimeout(() => this.autoSaveProject(), 500);
        
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
        const { x, y, width, height, background, foreground, visible, bgColor, fgColor } = element.properties;
        
        elementDiv.style.left = ((x - 1) * this.cellWidth) + 'px';
        elementDiv.style.top = ((y - 1) * this.cellHeight) + 'px';
        elementDiv.style.width = (width * this.cellWidth) + 'px';
        elementDiv.style.height = (height * this.cellHeight) + 'px';
        elementDiv.style.display = (visible !== false) ? 'block' : 'none';
        
        // Apply CC colors - handle both Basalt/PixelUI (background) and PrimeUI (bgColor) naming
        const bgColorValue = background || bgColor || 'black';
        elementDiv.className = `ui-element cc-color-${bgColorValue}`;
        if (this.selectedElement && this.selectedElement.id === element.id) {
            elementDiv.classList.add('selected');
        }
        
        // Render element content based on type
        this.renderElementContent(elementDiv, element);
    }
    
    renderElementContent(elementDiv, element) {
        const { type, properties } = element;
        
        elementDiv.innerHTML = '';
        
        switch (type) {
            case 'Label':
                elementDiv.innerHTML = `<span style="color: var(--fg-color, #fff); font-size: 11px; line-height: 1;">${properties.text}</span>`;
                break;
                
            case 'Button':
                elementDiv.innerHTML = `<div style="border: 1px solid #666; text-align: center; line-height: ${elementDiv.style.height}; color: var(--fg-color, #fff); font-size: 11px;">${properties.text}</div>`;
                break;
                
            case 'Input':
                const displayText = properties.text || properties.placeholder;
                elementDiv.innerHTML = `<input type="text" value="${properties.text}" placeholder="${properties.placeholder}" style="width: 100%; height: 100%; background: transparent; border: 1px solid #666; color: var(--fg-color, #fff); font-size: 11px; padding: 2px;">`;
                break;
                
            case 'Checkbox':
                const checkmark = properties.checked ? properties.checkedText : '';
                elementDiv.innerHTML = `<span style="color: var(--fg-color, #fff); font-size: 11px;">[${checkmark}] ${properties.text}</span>`;
                break;
                
            case 'List':
                elementDiv.innerHTML = `<div style="border: 1px solid #666; padding: 2px; overflow: hidden; color: var(--fg-color, #fff); font-size: 10px;">List (${properties.items.length} items)</div>`;
                break;
                
            case 'ProgressBar':
                const progressWidth = (properties.progress / 100) * 100;
                elementDiv.innerHTML = `<div style="border: 1px solid #666; position: relative; height: 100%;"><div style="background: var(--progress-color, lime); width: ${progressWidth}%; height: 100%;"></div></div>`;
                break;
                
            case 'Slider':
                const sliderPos = (properties.step / properties.max) * 100;
                if (properties.horizontal) {
                    elementDiv.innerHTML = `<div style="border: 1px solid #666; position: relative; height: 100%;"><div style="position: absolute; left: ${sliderPos}%; top: 0; width: 4px; height: 100%; background: var(--slider-color, blue);"></div></div>`;
                } else {
                    elementDiv.innerHTML = `<div style="border: 1px solid #666; position: relative; width: 100%;"><div style="position: absolute; top: ${100-sliderPos}%; left: 0; width: 100%; height: 4px; background: var(--slider-color, blue);"></div></div>`;
                }
                break;
                
            case 'Image':
                elementDiv.innerHTML = `<div style="border: 1px solid #666; text-align: center; line-height: ${elementDiv.style.height}; color: var(--fg-color, #666); font-size: 10px;">🖼️ Image</div>`;
                break;
                
            case 'BigFont':
                elementDiv.innerHTML = `<div style="text-align: center; line-height: ${elementDiv.style.height}; color: var(--fg-color, #fff); font-size: ${12 + properties.fontSize * 2}px; font-weight: bold;">${properties.text}</div>`;
                break;
                
            // PrimeUI Elements
            case 'CenterLabel':
                elementDiv.innerHTML = `<span style="color: var(--fg-color, #fff); font-size: 11px; line-height: 1; text-align: center; display: block; width: 100%;">${properties.text}</span>`;
                break;
                
            case 'InputBox':
                const inputDisplayText = properties.default || 'Input Box';
                elementDiv.innerHTML = `<input type="text" value="${inputDisplayText}" style="width: 100%; height: 100%; background: transparent; border: 1px solid #666; color: var(--fg-color, #fff); font-size: 11px; padding: 2px;">`;
                break;
                
            case 'SelectionBox':
                const entriesCount = Array.isArray(properties.entries) ? properties.entries.length : 3;
                elementDiv.innerHTML = `<div style="border: 1px solid #666; padding: 2px; overflow: hidden; color: var(--fg-color, #fff); font-size: 10px;">Selection (${entriesCount} items)</div>`;
                break;
                
            case 'CheckSelectionBox':
                const selectionsCount = properties.selections ? Object.keys(properties.selections).length : 3;
                elementDiv.innerHTML = `<div style="border: 1px solid #666; padding: 2px; overflow: hidden; color: var(--fg-color, #fff); font-size: 10px;">☑️ Checkboxes (${selectionsCount} items)</div>`;
                break;
                
            case 'ScrollBox':
                elementDiv.innerHTML = `<div style="border: 1px solid #666; padding: 2px; overflow: hidden; color: var(--fg-color, #fff); font-size: 10px; position: relative;">📜 Scroll Box<div style="position: absolute; right: 2px; top: 50%; transform: translateY(-50%); font-size: 8px;">▲▼</div></div>`;
                break;
                
            case 'TextBox':
                const textPreview = properties.text ? properties.text.substring(0, 50) + '...' : 'Text Box';
                elementDiv.innerHTML = `<div style="border: 1px solid #666; padding: 2px; overflow: hidden; color: var(--fg-color, #fff); font-size: 10px; word-wrap: break-word;">${textPreview}</div>`;
                break;
                
            case 'BorderBox':
                elementDiv.innerHTML = `<div style="border: 2px solid var(--fg-color, #fff); width: 100%; height: 100%; box-sizing: border-box;"></div>`;
                break;
                
            case 'HorizontalLine':
                elementDiv.innerHTML = `<div style="border-top: 1px solid var(--fg-color, #fff); width: 100%; height: 50%; box-sizing: border-box;"></div>`;
                break;
                
            case 'DrawText':
                const drawTextPreview = properties.text ? properties.text.substring(0, 30) + '...' : 'Draw Text';
                elementDiv.innerHTML = `<div style="color: var(--fg-color, #fff); font-size: 10px; word-wrap: break-word; overflow: hidden;">${drawTextPreview}</div>`;
                break;
                
            case 'DrawImage':
                elementDiv.innerHTML = `<div style="border: 1px solid #666; text-align: center; line-height: ${elementDiv.style.height}; color: var(--fg-color, #666); font-size: 10px;">🖼️ ${properties.data || 'BIMG'}</div>`;
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
        let elementStart = { x: element.properties.x, y: element.properties.y };
        
        elementDiv.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('resize-handle')) return;
            
            isDragging = true;
            elementDiv.classList.add('dragging');
            
            dragStart.x = e.clientX;
            dragStart.y = e.clientY;
            elementStart.x = element.properties.x;
            elementStart.y = element.properties.y;
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = Math.round((e.clientX - dragStart.x) / this.cellWidth);
            const deltaY = Math.round((e.clientY - dragStart.y) / this.cellHeight);
            
            const newX = Math.max(1, Math.min(this.terminalWidth - element.properties.width + 1, elementStart.x + deltaX));
            const newY = Math.max(1, Math.min(this.terminalHeight - element.properties.height + 1, elementStart.y + deltaY));
            
            // Update position directly without triggering state save during drag
            element.properties.x = newX;
            element.properties.y = newY;
            
            const elementDiv = document.querySelector(`[data-element-id="${element.id}"]`);
            if (elementDiv) {
                this.updateElementDiv(elementDiv, element);
            }
            
            if (this.selectedElement && this.selectedElement.id === element.id) {
                this.updatePropertiesPanel();
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                elementDiv.classList.remove('dragging');
                // Save state after drag is complete
                this.saveState();
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
                elementStart.width = this.selectedElement.properties.width;
                elementStart.height = this.selectedElement.properties.height;
                elementStart.x = this.selectedElement.properties.x;
                elementStart.y = this.selectedElement.properties.y;
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
                
                // Update properties directly during resize
                this.selectedElement.properties.width = newWidth;
                this.selectedElement.properties.height = newHeight;
                this.selectedElement.properties.x = newX;
                this.selectedElement.properties.y = newY;
                
                const elementDiv = document.querySelector(`[data-element-id="${this.selectedElement.id}"]`);
                if (elementDiv) {
                    this.updateElementDiv(elementDiv, this.selectedElement);
                }
                
                this.updatePropertiesPanel();
            });
            
            document.addEventListener('mouseup', () => {
                if (isResizing) {
                    isResizing = false;
                    // Save state after resize is complete
                    this.saveState();
                }
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
        element.properties[property] = value;
        
        const elementDiv = document.querySelector(`[data-element-id="${element.id}"]`);
        if (elementDiv) {
            this.updateElementDiv(elementDiv, element);
        }
        
        if (this.selectedElement && this.selectedElement.id === element.id) {
            this.updatePropertiesPanel();
        }
        
        // Save state after making changes (debounced)
        clearTimeout(this.propertyChangeTimeout);
        this.propertyChangeTimeout = setTimeout(() => {
            this.saveState();
        }, 500);
        
        // Auto-save project if editing
        setTimeout(() => this.autoSaveProject(), 500);
    }
    
    showProperties(element) {
        this.propertiesContent.innerHTML = '';
        
        const elementDef = this.getCurrentElements()[element.type];
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
        
        // Action buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'property-group';
        actionsDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
                <button class="btn btn-secondary" onclick="designer.copyElement()" title="Copy (Ctrl+C)">
                    📋 Copy
                </button>
                <button class="btn btn-secondary" onclick="designer.duplicateElement()" title="Duplicate (Ctrl+D)">
                    🔄 Duplicate
                </button>
            </div>
            <button class="btn btn-secondary" style="width: 100%; color: #e53e3e;" onclick="designer.deleteElement('${element.id}')">
                🗑️ Delete Element
            </button>
        `;
        this.propertiesContent.appendChild(actionsDiv);
    }
    
    createPropertyField(element, property) {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'property-field';
        
        const value = element.properties[property];
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
            } else if ((property === 'data' && element.type === 'TreeView') || (property === 'nodes' && element.type === 'Tree')) {
                // TreeView Designer for both PixelUI TreeView and Basalt Tree
                let displayValue = '';
                if (Array.isArray(value)) {
                    displayValue = this.formatTreeDataForDisplay(value);
                } else {
                    displayValue = 'No tree data configured';
                }
                
                inputHtml = `
                    <div class="tree-designer-controls">
                        <button class="btn btn-sm" onclick="designer.openTreeDesigner(designer.selectedElement, '${property}')" style="background: #38a169; color: white; margin-bottom: 8px; width: 100%;">
                            🌳 Open TreeView Designer
                        </button>
                        <textarea rows="3" readonly style="background: #f7fafc; color: #2d3748;" placeholder="Use TreeView Designer to configure tree structure">${displayValue}</textarea>
                    </div>
                `;
            } else if (property === 'series' && (element.type === 'Graph' || element.type === 'BarChart' || element.type === 'LineChart')) {
                inputHtml = this.createSeriesManager(element, property);
            } else if ((property === 'data' && element.type === 'Chart') || (property === 'series' && (element.type === 'Graph' || element.type === 'BarChart' || element.type === 'LineChart'))) {
                // Format the display value for chart data
                let displayValue = '';
                if (Array.isArray(value)) {
                    displayValue = value.join(', ');
                } else if (typeof value === 'object' && value !== null) {
                    // Handle object/series data
                    if (Object.keys(value).length === 0) {
                        displayValue = 'No data configured';
                    } else {
                        displayValue = Object.entries(value).map(([key, val]) => {
                            if (Array.isArray(val)) {
                                return `${key}: [${val.join(', ')}]`;
                            } else {
                                return `${key}: ${val}`;
                            }
                        }).join('\n');
                    }
                } else {
                    displayValue = String(value || 'No data configured');
                }
                
                inputHtml = `
                    <div class="chart-designer-controls">
                        <button class="btn btn-sm" onclick="designer.openChartDesigner('${element.id}', '${property}')" style="background: #3182ce; color: white; margin-bottom: 8px; width: 100%;">
                            📊 Open Chart Designer
                        </button>
                        <textarea rows="3" readonly style="background: #f7fafc; color: #2d3748;" placeholder="Use Chart Designer to configure data">${displayValue}</textarea>
                    </div>
                `;
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
        const items = element.properties[property] || [];
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
        const nodes = element.properties[property] || [];
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
    
    formatTreeDataForDisplay(data, depth = 0) {
        if (!Array.isArray(data) || data.length === 0) {
            return 'No tree data';
        }
        
        let result = '';
        const indent = '  '.repeat(depth);
        
        data.forEach((node, index) => {
            const icon = node.icon || '📄';
            const text = node.text || 'Unnamed Node';
            const expandedMarker = node.expanded ? '▼' : '▶';
            const hasChildren = node.children && node.children.length > 0;
            
            result += `${indent}${hasChildren ? expandedMarker : ' '} ${icon} ${text}\n`;
            
            if (hasChildren && node.expanded) {
                result += this.formatTreeDataForDisplay(node.children, depth + 1);
            }
        });
        
        return result.trim();
    }
    
    createSeriesManager(element, property) {
        const series = element.properties[property] || {};
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
        
        const items = element.properties[property] || [];
        items.push(element.type === 'Dropdown' || element.type === 'Menu' ? 
            { text: 'New Item', callback: null } : 'New Item');
        
        this.updateElementProperty(element, property, items);
        this.updatePropertiesPanel();
    }
    
    removeItem(elementId, property, index) {
        const element = this.elements.get(elementId);
        if (!element) return;
        
        const items = [...(element.properties[property] || [])];
        items.splice(index, 1);
        
        this.updateElementProperty(element, property, items);
        this.updatePropertiesPanel();
    }
    
    updateItem(elementId, property, index, value) {
        const element = this.elements.get(elementId);
        if (!element) return;
        
        const items = [...(element.properties[property] || [])];
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
        
        const nodes = [...(element.properties[property] || [])];
        nodes.push({ text: 'New Node', children: [] });
        
        this.updateElementProperty(element, property, nodes);
        this.updatePropertiesPanel();
    }
    
    removeNode(elementId, index) {
        const element = this.elements.get(elementId);
        if (!element) return;
        
        const nodes = [...(element.properties.nodes || [])];
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
        
        const nodes = [...(element.properties.nodes || [])];
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
        
        const nodes = [...(element.properties.nodes || [])];
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
        
        const series = { ...(element.properties[property] || {}) };
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
        
        const series = { ...(element.properties.series || {}) };
        delete series[seriesName];
        
        this.updateElementProperty(element, 'series', series);
        this.updatePropertiesPanel();
    }
    
    updateSeries(elementId, seriesName, field, value) {
        const element = this.elements.get(elementId);
        if (!element) return;
        
        const series = { ...(element.properties.series || {}) };
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
        
        this.saveState();
        
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
            this.saveState();
            this.clearCanvasForImport();
        }
    }
    
    clearCanvasForImport() {
        // Clear all elements
        this.elements.clear();
        this.selectedElement = null;
        
        // Clear the visual canvas - use correct selector
        document.querySelectorAll('.ui-element').forEach(el => el.remove());
        
        // Clear properties panel
        this.hideProperties();
        
        // Show drop zone
        this.showDropZone();
    }

    // Undo/Redo functionality
    saveState() {
        const state = {
            elements: new Map(),
            selectedElement: this.selectedElement
        };
        
        // Deep copy elements
        this.elements.forEach((element, key) => {
            state.elements.set(key, JSON.parse(JSON.stringify(element)));
        });
        
        // Remove future states if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // Add new state
        this.history.push(state);
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
        }
    }

    restoreState(state) {
        // Clear current elements
        document.querySelectorAll('.ui-element').forEach(el => el.remove());
        
        // Restore elements with deep copy
        this.elements = new Map();
        state.elements.forEach((element, key) => {
            this.elements.set(key, JSON.parse(JSON.stringify(element)));
        });
        
        this.selectedElement = state.selectedElement;
        
        // Recreate visual elements
        this.elements.forEach((element) => {
            this.renderElement(element);
        });
        
        // Update properties panel
        this.updatePropertiesPanel();
        
        // Show/hide drop zone
        if (this.elements.size === 0) {
            this.showDropZone();
        } else {
            this.hideDropZone();
        }
    }

    // Clipboard functionality
    copyElement() {
        if (this.selectedElement) {
            const element = this.elements.get(this.selectedElement.id);
            if (element) {
                // Create a deep copy
                this.clipboard = JSON.parse(JSON.stringify(element));
            }
        }
    }

    pasteElement() {
        if (this.clipboard) {
            this.saveState();
            
            // Create new element with offset position
            const newElement = JSON.parse(JSON.stringify(this.clipboard));
            newElement.id = 'element_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            newElement.properties.x = Math.min(newElement.properties.x + 2, this.terminalWidth - newElement.properties.width);
            newElement.properties.y = Math.min(newElement.properties.y + 2, this.terminalHeight - newElement.properties.height);
            
            this.elements.set(newElement.id, newElement);
            this.renderElement(newElement);
            this.selectElement(newElement);
            this.hideDropZone();
        }
    }

    duplicateElement() {
        if (this.selectedElement) {
            this.copyElement();
            this.pasteElement();
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
        // Update modal title based on framework
        const modalTitle = document.querySelector('#exportModal h3');
        if (modalTitle) {
            modalTitle.textContent = `Export ${this.currentFramework === 'basalt' ? 'Basalt' : 
                                             this.currentFramework === 'pixelui' ? 'PixelUI' : 'PrimeUI'} Code`;
        }
        
        this.showModal('exportModal');
        this.updateExportCode();
    }
    
    showImportModal() {
        // Update modal title and placeholder based on framework
        const modalTitle = document.querySelector('#importModal h3');
        const textarea = document.getElementById('importCode');
        
        if (modalTitle) {
            modalTitle.textContent = 'Import Design';
        }
        
        if (textarea) {
            const framework = this.currentFramework === 'basalt' ? 'Basalt' : 'PixelUI';
            textarea.placeholder = `Paste your ${framework} code or JSON here...`;
        }
        
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
            console.log('Attempting to import data from:', filename);
            
            // Try to parse as JSON first
            const jsonData = JSON.parse(data);
            
            // Check if it's XCC format
            if (jsonData.format === 'XCC' && jsonData.version) {
                console.log('Detected XCC format');
                this.importXCCData(jsonData);
            } else if (jsonData.elements && jsonData.terminal) {
                console.log('Detected legacy JSON format');
                // Valid Basalt UI Designer format
                this.clearCanvasForImport();
                
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
                    const element = this.createElement(elementData.type, elementData.properties || elementData.props);
                    element.id = elementData.id || element.id;
                });
                
                this.hideModal(document.getElementById('importModal'));
                
                // Clear the form
                document.getElementById('importFile').value = '';
                document.getElementById('importCode').value = '';
                
                alert('Design imported successfully!');
            } else {
                throw new Error('Invalid JSON format. Expected XCC or Basalt UI Designer format.');
            }
        } catch (jsonError) {
            console.log('JSON parsing failed, trying Lua code:', jsonError.message);
            // If JSON parsing fails, try to parse as Lua code
            if ((data.includes('basalt') && data.includes('createFrame')) || 
                (data.includes('PixelUI') && (data.includes('container') || data.includes('label') || data.includes('button')))) {
                this.importLuaCode(data);
            } else {
                throw new Error('Invalid format. Please provide XCC, JSON data, or Lua code.');
            }
        }
    }
    
    switchFramework() {
        // Update the title
        const logoTitle = document.getElementById('logoTitle');
        if (logoTitle) {
            if (this.currentFramework === 'basalt') {
                logoTitle.textContent = 'Basalt 2 UI Designer';
            } else {
                logoTitle.textContent = 'PixelUI Designer';
            }
        }
        
        // Update the tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.framework === this.currentFramework) {
                tab.classList.add('active');
            }
        });
        
        // Update the element palette to reflect the current framework
        this.updateElementPalette();
        
        // Update any framework-specific UI elements
        const frameworkDisplay = document.getElementById('currentFramework');
        if (frameworkDisplay) {
            frameworkDisplay.textContent = this.currentFramework === 'basalt' ? 'Basalt' : 'PixelUI';
        }
        
        // Clear and rebuild the properties panel for the selected element
        if (this.selectedElement) {
            this.updatePropertiesPanel();
        }
    }
    
    importXCCData(xccData) {
        try {
            console.log('Importing XCC data:', xccData);
            
            // Clear canvas without confirmation dialog
            this.clearCanvasForImport();
            
            // Validate XCC format version
            if (xccData.version !== '1.0') {
                console.warn(`Importing XCC format version ${xccData.version}, expected 1.0`);
            }
            
            // Switch to the correct framework if needed
            if (xccData.framework && xccData.framework !== this.currentFramework) {
                console.log(`Switching from ${this.currentFramework} to ${xccData.framework}`);
                this.currentFramework = xccData.framework;
                this.switchFramework();
            }
            
            // Set terminal size
            this.terminalWidth = xccData.terminal.width;
            this.terminalHeight = xccData.terminal.height;
            
            // Update UI
            document.getElementById('terminalWidth').value = this.terminalWidth;
            document.getElementById('terminalHeight').value = this.terminalHeight;
            document.getElementById('terminalPreset').value = 'custom';
            this.updateTerminalSize();
            
            console.log(`Importing ${xccData.elements.length} elements`);
            
            // Import elements with enhanced XCC data
            xccData.elements.forEach((elementData, index) => {
                try {
                    console.log(`Creating element ${index + 1}:`, elementData.type, elementData.properties);
                    
                    // Create element object manually to preserve the original ID
                    const elementDef = this.getCurrentElements()[elementData.type];
                    if (!elementDef) {
                        console.warn(`Unknown element type: ${elementData.type}`);
                        return;
                    }
                    
                    const element = {
                        id: elementData.id,
                        type: elementData.type,
                        properties: { ...elementDef.defaultProps, ...elementData.properties },
                        children: elementData.children || []
                    };
                    
                    // Add to elements map
                    this.elements.set(element.id, element);
                    
                    // Render the element with proper interactivity
                    this.renderElement(element);
                    
                    console.log(`Successfully created element:`, element);
                } catch (elementError) {
                    console.error(`Error creating element ${index + 1}:`, elementError);
                    throw elementError;
                }
            });
            
            // Hide drop zone since we have elements
            this.hideDropZone();
            
            this.hideModal(document.getElementById('importModal'));
            
            // Clear the form
            document.getElementById('importFile').value = '';
            document.getElementById('importCode').value = '';
            
            // Show enhanced success message with project info
            const projectName = xccData.project ? xccData.project.name : 'Untitled Project';
            const elementCount = xccData.elements.length;
            alert(`XCC Project "${projectName}" imported successfully!\n${elementCount} elements loaded.`);
            
        } catch (error) {
            console.error('XCC import error:', error);
            throw new Error('Error importing XCC data: ' + error.message);
        }
    }
    
    importLuaCode(luaCode) {
        try {
            this.clearCanvasForImport();
            
            // Detect if this is PixelUI or Basalt code
            const isPixelUI = luaCode.includes('PixelUI');
            const isBasalt = luaCode.includes('basalt') && luaCode.includes('createFrame');
            
            if (isPixelUI) {
                this.importPixelUICode(luaCode);
            } else if (isBasalt) {
                this.importBasaltCode(luaCode);
            } else {
                throw new Error('Unrecognized Lua code format');
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
    
    importPixelUICode(luaCode) {
        // Extract terminal size from PixelUI.container({width = X, height = Y})
        const containerMatch = luaCode.match(/PixelUI\.container\(\{\s*width\s*=\s*(\d+),\s*height\s*=\s*(\d+)/);
        if (containerMatch) {
            this.terminalWidth = parseInt(containerMatch[1]);
            this.terminalHeight = parseInt(containerMatch[2]);
            
            // Update UI
            document.getElementById('terminalWidth').value = this.terminalWidth;
            document.getElementById('terminalHeight').value = this.terminalHeight;
            document.getElementById('terminalPreset').value = 'custom';
            this.updateTerminalSize();
        }
        
        // Extract elements - pattern: local varName = PixelUI.elementType({...})
        // Use a more robust approach to handle nested braces and multi-line properties
        const elementRegex = /local\s+(\w+)\s*=\s*PixelUI\.(\w+)\s*\(\s*\{/g;
        let match;
        
        while ((match = elementRegex.exec(luaCode)) !== null) {
            const varName = match[1];
            const elementType = match[2];
            const startPos = match.index + match[0].length - 1; // Position of opening brace
            
            // Find the matching closing brace
            let braceCount = 1;
            let endPos = startPos + 1;
            
            while (endPos < luaCode.length && braceCount > 0) {
                if (luaCode[endPos] === '{') {
                    braceCount++;
                } else if (luaCode[endPos] === '}') {
                    braceCount--;
                }
                endPos++;
            }
            
            if (braceCount === 0) {
                // Extract properties string (excluding the outer braces)
                const propertiesStr = luaCode.substring(startPos + 1, endPos - 1);
                
                // Convert PixelUI element type to XCC element type
                const xccElementType = this.convertPixelUIToXCCType(elementType);
                
                if (xccElementType) {
                    // Create element
                    const element = this.createElement(xccElementType);
                    
                    // Parse properties from the properties string
                    this.parsePixelUIProperties(element, propertiesStr);
                    
                    // Update element visual
                    this.updateElementProperty(element, 'x', element.properties.x);
                    this.updateElementProperty(element, 'y', element.properties.y);
                    this.updateElementProperty(element, 'width', element.properties.width);
                    this.updateElementProperty(element, 'height', element.properties.height);
                }
            }
        }
    }
    
    importBasaltCode(luaCode) {
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
                        element.properties[propName] = parsedValue;
                    } else if (propName === 'background' || propName === 'foreground' || propName.includes('color')) {
                        // Convert colors.colorName to just colorName
                        if (typeof parsedValue === 'string' && parsedValue.startsWith('colors.')) {
                            parsedValue = parsedValue.replace('colors.', '');
                        }
                        element.properties[propName] = parsedValue;
                    } else {
                        element.properties[propName] = parsedValue;
                    }
                }
            }
            
            // Update element position and properties
            this.updateElementProperty(element, 'x', element.properties.x);
            this.updateElementProperty(element, 'y', element.properties.y);
            this.updateElementProperty(element, 'width', element.properties.width);
            this.updateElementProperty(element, 'height', element.properties.height);
        }
    }
    
    convertPixelUIToXCCType(pixelUIType) {
        // Convert PixelUI camelCase function names to XCC PascalCase element types
        const typeMap = {
            'label': 'Label',
            'button': 'Button',
            'input': 'Input',
            'textBox': 'TextBox',
            'checkbox': 'CheckBox',
            'checkBox': 'CheckBox',
            'list': 'List',
            'listView': 'ListView',
            'slider': 'Slider',
            'rangeSlider': 'RangeSlider',
            'progressBar': 'ProgressBar',
            'radioButton': 'RadioButton',
            'toggleSwitch': 'ToggleSwitch',
            'comboBox': 'ComboBox',
            'loadingIndicator': 'LoadingIndicator',
            'accordion': 'Accordion',
            'treeView': 'TreeView',
            'numericUpDown': 'NumericUpDown',
            'tabControl': 'TabControl',
            'richTextBox': 'RichTextBox',
            'codeEditor': 'CodeEditor',
            'colorPicker': 'ColorPicker',
            'chart': 'Chart',
            'barChart': 'BarChart',
            'lineChart': 'LineChart'
        };
        
        return typeMap[pixelUIType] || null;
    }
    
    parsePixelUIProperties(element, propertiesStr) {
        // Parse PixelUI properties format: key = value, key = value
        // Handle nested structures properly
        
        let pos = 0;
        while (pos < propertiesStr.length) {
            // Skip whitespace and commas
            while (pos < propertiesStr.length && /[\s,]/.test(propertiesStr[pos])) {
                pos++;
            }
            
            if (pos >= propertiesStr.length) break;
            
            // Find property name
            const keyMatch = propertiesStr.substring(pos).match(/^(\w+)\s*=/);
            if (!keyMatch) break;
            
            const key = keyMatch[1];
            pos += keyMatch[0].length;
            
            // Skip whitespace after =
            while (pos < propertiesStr.length && /\s/.test(propertiesStr[pos])) {
                pos++;
            }
            
            // Find value - handle nested structures
            let value = '';
            let braceCount = 0;
            let inString = false;
            let stringChar = '';
            let startPos = pos;
            
            while (pos < propertiesStr.length) {
                const char = propertiesStr[pos];
                
                if (!inString) {
                    if (char === '"' || char === "'") {
                        inString = true;
                        stringChar = char;
                    } else if (char === '{') {
                        braceCount++;
                    } else if (char === '}') {
                        braceCount--;
                    } else if (char === ',' && braceCount === 0) {
                        // End of this property value
                        break;
                    }
                } else {
                    if (char === stringChar && propertiesStr[pos - 1] !== '\\') {
                        inString = false;
                    }
                }
                
                pos++;
            }
            
            value = propertiesStr.substring(startPos, pos).trim();
            
            // Parse the value
            const parsedValue = this.parseLuaValue(value);
            
            // Handle color values
            if (key.includes('color') || key === 'background') {
                let colorValue = parsedValue;
                if (typeof colorValue === 'string' && colorValue.startsWith('colors.')) {
                    colorValue = colorValue.replace('colors.', '');
                }
                element.properties[key] = colorValue;
            } else {
                element.properties[key] = parsedValue;
            }
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
        
        // Handle arrays/tables like {"item1", "item2"} or {key1 = value1, key2 = value2}
        if (value.startsWith('{') && value.endsWith('}')) {
            try {
                const content = value.slice(1, -1).trim();
                if (content === '') {
                    return []; // Empty array
                }
                
                // Check if it's an array-style table or object-style table
                if (content.includes('=')) {
                    // Object-style table: {key1 = value1, key2 = value2}
                    const obj = {};
                    const pairs = this.parseCommaSeparated(content);
                    for (const pair of pairs) {
                        const eqIndex = pair.indexOf('=');
                        if (eqIndex > 0) {
                            const key = pair.substring(0, eqIndex).trim();
                            const val = pair.substring(eqIndex + 1).trim();
                            obj[key] = this.parseLuaValue(val);
                        }
                    }
                    return obj;
                } else {
                    // Array-style table: {"item1", "item2", "item3"}
                    const items = this.parseCommaSeparated(content);
                    return items.map(item => this.parseLuaValue(item.trim())).filter(item => item !== '');
                }
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
    
    parseCommaSeparated(content) {
        // Parse comma-separated values while respecting nested structures and strings
        const items = [];
        let current = '';
        let braceCount = 0;
        let inString = false;
        let stringChar = '';
        
        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            
            if (!inString) {
                if (char === '"' || char === "'") {
                    inString = true;
                    stringChar = char;
                    current += char;
                } else if (char === '{') {
                    braceCount++;
                    current += char;
                } else if (char === '}') {
                    braceCount--;
                    current += char;
                } else if (char === ',' && braceCount === 0) {
                    // End of current item
                    if (current.trim()) {
                        items.push(current.trim());
                    }
                    current = '';
                } else {
                    current += char;
                }
            } else {
                current += char;
                if (char === stringChar && content[i - 1] !== '\\') {
                    inString = false;
                }
            }
        }
        
        // Add the last item
        if (current.trim()) {
            items.push(current.trim());
        }
        
        return items;
    }
    
    clearCanvas() {
        // Clear all elements
        this.elements.clear();
        this.selectedElement = null;
        
        // Clear the visual canvas
        const elementsOnCanvas = this.canvas.querySelectorAll('.canvas-element');
        elementsOnCanvas.forEach(element => element.remove());
        
        // Clear properties panel
        this.propertiesContent.innerHTML = '<p class="no-selection">Select an element to edit its properties</p>';
    }
    
    attachElementDragListeners() {
        const elementItems = document.querySelectorAll('.element-item');
        elementItems.forEach(item => {
            item.setAttribute('draggable', 'true');
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.type);
                this.draggedElement = item.dataset.type;
            });
        });
    }
    
    getCurrentElements() {
        return this.currentFramework === 'basalt' ? this.basaltElements : 
               this.currentFramework === 'pixelui' ? this.pixelUIElements : this.primeUIElements;
    }
    
    generateCode() {
        if (this.currentFramework === 'basalt') {
            return this.generateBasaltCode();
        } else if (this.currentFramework === 'pixelui') {
            return this.generatePixelUICode();
        } else if (this.currentFramework === 'primeui') {
            return this.generatePrimeUICode();
        }
    }

    // Chart Designer Methods
    openChartDesigner(elementId, property) {
        console.log('Opening chart designer for element:', elementId, 'property:', property);
        
        this.currentChartElement = this.elements.get(elementId);
        this.currentChartProperty = property;
        
        if (!this.currentChartElement) {
            console.error('Chart element not found:', elementId);
            return;
        }
        
        console.log('Chart element found:', this.currentChartElement);
        
        // Check if modal exists
        const modal = document.getElementById('chartDesignerModal');
        if (!modal) {
            console.error('Chart designer modal not found in DOM');
            alert('Chart Designer modal not found. Please refresh the page.');
            return;
        }
        
        // Show the modal first
        console.log('Showing chart designer modal');
        this.showModal('chartDesignerModal');
        
        // Initialize chart designer UI after a short delay to ensure modal is visible
        setTimeout(() => {
            this.initializeChartDesigner();
        }, 100);
    }
    
    initializeChartDesigner() {
        console.log('Initializing chart designer');
        
        const element = this.currentChartElement;
        const property = this.currentChartProperty;
        
        console.log('Element:', element, 'Property:', property);
        
        // Check if required DOM elements exist
        const chartTypeSelect = document.getElementById('chartTypeSelect');
        const chartTitle = document.getElementById('chartTitle');
        const chartXLabel = document.getElementById('chartXLabel');
        const chartYLabel = document.getElementById('chartYLabel');
        
        if (!chartTypeSelect || !chartTitle || !chartXLabel || !chartYLabel) {
            console.error('Chart designer DOM elements not found');
            console.log('chartTypeSelect:', chartTypeSelect);
            console.log('chartTitle:', chartTitle);
            console.log('chartXLabel:', chartXLabel);
            console.log('chartYLabel:', chartYLabel);
            return;
        }
        
        // Set chart type based on element type and current data
        if (element.type === 'Chart') {
            chartTypeSelect.value = element.properties.chartType || 'line';
        } else if (element.type === 'BarChart') {
            chartTypeSelect.value = 'bar';
        } else if (element.type === 'LineChart') {
            chartTypeSelect.value = 'line';
        } else {
            chartTypeSelect.value = 'line';
        }
        
        // Clear previous data
        chartTitle.value = '';
        chartXLabel.value = '';
        chartYLabel.value = '';
        
        // Load existing data
        this.currentChartData = this.getChartData(element, property);
        this.renderChartSeries();
        this.updateChartPreview();
        
        console.log('Chart designer initialized successfully');
    }
    
    getChartData(element, property) {
        const data = element.properties[property];
        
        if (element.type === 'Chart') {
            // PixelUI Chart format
            if (Array.isArray(data)) {
                // Single series as array
                return [{
                    name: 'Data Series',
                    data: data.map((item, index) => ({
                        x: index + 1,
                        y: typeof item === 'object' ? item.value || 0 : item
                    })),
                    color: 'blue'
                }];
            } else if (typeof data === 'object' && data !== null) {
                // Multiple series as object (same format as Basalt)
                return Object.entries(data).map(([name, values]) => ({
                    name: name,
                    data: Array.isArray(values) ? values.map((v, i) => ({ x: i + 1, y: v })) : [],
                    color: 'blue'
                }));
            }
        } else {
            // Basalt chart format (series object)
            if (typeof data === 'object' && data !== null) {
                return Object.entries(data).map(([name, values]) => ({
                    name: name,
                    data: Array.isArray(values) ? values.map((v, i) => ({ x: i + 1, y: v })) : [],
                    color: 'blue'
                }));
            }
        }
        
        // Default empty series
        return [{
            name: 'Series 1',
            data: [{ x: 1, y: 10 }, { x: 2, y: 20 }, { x: 3, y: 15 }],
            color: 'blue'
        }];
    }
    
    renderChartSeries() {
        const seriesList = document.getElementById('seriesList');
        seriesList.innerHTML = '';
        
        this.currentChartData.forEach((series, index) => {
            const seriesDiv = document.createElement('div');
            seriesDiv.className = 'series-item';
            seriesDiv.innerHTML = `
                <div class="series-header">
                    <span class="series-name">Series ${index + 1}: ${series.name}</span>
                    <div class="series-controls-inline">
                        <button class="btn btn-xs" onclick="designer.editSeriesName(${index})" style="background: #38a169; color: white;">✏️</button>
                        <button class="btn btn-xs" onclick="designer.removeChartSeries(${index})" style="background: #e53e3e; color: white;">🗑️</button>
                    </div>
                </div>
                <div class="series-data" id="seriesData${index}">
                    ${this.renderSeriesDataPoints(series, index)}
                </div>
                <button class="btn btn-xs" onclick="designer.addDataPoint(${index})" style="background: #3182ce; color: white; margin-top: 8px;">+ Add Point</button>
            `;
            seriesList.appendChild(seriesDiv);
        });
    }
    
    renderSeriesDataPoints(series, seriesIndex) {
        return series.data.map((point, pointIndex) => `
            <div class="data-points">
                <input type="number" value="${point.x}" placeholder="X" onchange="designer.updateDataPoint(${seriesIndex}, ${pointIndex}, 'x', this.value)">
                <input type="number" value="${point.y}" placeholder="Y" onchange="designer.updateDataPoint(${seriesIndex}, ${pointIndex}, 'y', this.value)">
                <button class="btn btn-xs" onclick="designer.removeDataPoint(${seriesIndex}, ${pointIndex})" style="background: #e53e3e; color: white;">×</button>
            </div>
        `).join('');
    }
    
    addChartSeries() {
        this.currentChartData.push({
            name: `Series ${this.currentChartData.length + 1}`,
            data: [{ x: 1, y: 10 }, { x: 2, y: 20 }],
            color: 'blue'
        });
        this.renderChartSeries();
        this.updateChartPreview();
    }
    
    removeChartSeries(index) {
        if (this.currentChartData.length > 1) {
            this.currentChartData.splice(index, 1);
            this.renderChartSeries();
            this.updateChartPreview();
        }
    }
    
    editSeriesName(index) {
        const newName = prompt('Enter series name:', this.currentChartData[index].name);
        if (newName) {
            this.currentChartData[index].name = newName;
            this.renderChartSeries();
        }
    }
    
    addDataPoint(seriesIndex) {
        const series = this.currentChartData[seriesIndex];
        const lastPoint = series.data[series.data.length - 1] || { x: 0, y: 0 };
        series.data.push({ x: lastPoint.x + 1, y: 10 });
        this.renderChartSeries();
        this.updateChartPreview();
    }
    
    removeDataPoint(seriesIndex, pointIndex) {
        const series = this.currentChartData[seriesIndex];
        if (series.data.length > 1) {
            series.data.splice(pointIndex, 1);
            this.renderChartSeries();
            this.updateChartPreview();
        }
    }
    
    updateDataPoint(seriesIndex, pointIndex, axis, value) {
        const numValue = parseFloat(value) || 0;
        this.currentChartData[seriesIndex].data[pointIndex][axis] = numValue;
        this.updateChartPreview();
    }
    
    generateSampleData() {
        this.currentChartData = [
            {
                name: 'Sales',
                data: [
                    { x: 1, y: 120 }, { x: 2, y: 190 }, { x: 3, y: 300 }, 
                    { x: 4, y: 500 }, { x: 5, y: 200 }, { x: 6, y: 300 }
                ],
                color: 'blue'
            },
            {
                name: 'Revenue',
                data: [
                    { x: 1, y: 80 }, { x: 2, y: 140 }, { x: 3, y: 200 }, 
                    { x: 4, y: 300 }, { x: 5, y: 150 }, { x: 6, y: 250 }
                ],
                color: 'green'
            }
        ];
        this.renderChartSeries();
        this.updateChartPreview();
    }
    
    updateChartPreview() {
        const preview = document.getElementById('chartPreview');
        const chartType = document.getElementById('chartTypeSelect').value;
        
        preview.innerHTML = `
            <div class="chart-axis chart-axis-x"></div>
            <div class="chart-axis chart-axis-y"></div>
            <div class="chart-label" style="bottom: 5px; left: 50%; transform: translateX(-50%);">X-Axis</div>
            <div class="chart-label" style="left: 5px; top: 50%; transform: rotate(-90deg) translateX(50%);">Y-Axis</div>
        `;
        
        // Find data bounds
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        this.currentChartData.forEach(series => {
            series.data.forEach(point => {
                minX = Math.min(minX, point.x);
                maxX = Math.max(maxX, point.x);
                minY = Math.min(minY, point.y);
                maxY = Math.max(maxY, point.y);
            });
        });
        
        const width = 240; // preview width minus margins
        const height = 200; // preview height minus margins
        
        // Render data based on chart type
        this.currentChartData.forEach((series, seriesIndex) => {
            const colors = ['#3182ce', '#38a169', '#e53e3e', '#d69e2e', '#9f7aea'];
            const color = colors[seriesIndex % colors.length];
            
            if (chartType === 'line') {
                this.renderLineChart(series, color, minX, maxX, minY, maxY, width, height);
            } else if (chartType === 'bar') {
                this.renderBarChart(series, color, minX, maxX, minY, maxY, width, height, seriesIndex);
            }
        });
    }
    
    renderLineChart(series, color, minX, maxX, minY, maxY, width, height) {
        const preview = document.getElementById('chartPreview');
        
        for (let i = 0; i < series.data.length - 1; i++) {
            const point1 = series.data[i];
            const point2 = series.data[i + 1];
            
            const x1 = 50 + ((point1.x - minX) / (maxX - minX)) * width;
            const y1 = 280 - 20 - ((point1.y - minY) / (maxY - minY)) * height;
            const x2 = 50 + ((point2.x - minX) / (maxX - minX)) * width;
            const y2 = 280 - 20 - ((point2.y - minY) / (maxY - minY)) * height;
            
            const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            
            const line = document.createElement('div');
            line.className = 'chart-preview-line';
            line.style.left = x1 + 'px';
            line.style.top = y1 + 'px';
            line.style.width = length + 'px';
            line.style.background = color;
            line.style.transform = `rotate(${angle}deg)`;
            line.style.transformOrigin = '0 50%';
            preview.appendChild(line);
        }
        
        // Add points
        series.data.forEach(point => {
            const x = 50 + ((point.x - minX) / (maxX - minX)) * width;
            const y = 280 - 20 - ((point.y - minY) / (maxY - minY)) * height;
            
            const pointDiv = document.createElement('div');
            pointDiv.className = 'chart-preview-point';
            pointDiv.style.left = x + 'px';
            pointDiv.style.top = y + 'px';
            pointDiv.style.background = color;
            preview.appendChild(pointDiv);
        });
    }
    
    renderBarChart(series, color, minX, maxX, minY, maxY, width, height, seriesIndex) {
        const preview = document.getElementById('chartPreview');
        const barWidth = Math.max(10, width / (series.data.length * this.currentChartData.length + 1));
        
        series.data.forEach((point, pointIndex) => {
            const x = 50 + ((point.x - minX + 0.1 + seriesIndex * 0.8 / this.currentChartData.length) / (maxX - minX + 1)) * width;
            const barHeight = ((point.y - minY) / (maxY - minY)) * height;
            
            const bar = document.createElement('div');
            bar.className = 'chart-preview-bar';
            bar.style.left = x + 'px';
            bar.style.width = barWidth + 'px';
            bar.style.height = barHeight + 'px';
            bar.style.background = color;
            preview.appendChild(bar);
        });
    }
    
    applyChartDesign() {
        const element = this.currentChartElement;
        const property = this.currentChartProperty;
        
        if (element.type === 'Chart') {
            // PixelUI format - convert to array of {x, y} objects
            const chartType = document.getElementById('chartTypeSelect').value;
            element.properties.chartType = chartType;
            
            // For PixelUI, use the first series and convert to {x, y} format
            if (this.currentChartData.length > 0) {
                const firstSeries = this.currentChartData[0];
                const pixelUIData = firstSeries.data.map((point, index) => ({
                    x: index + 1, // Use 1-based indexing for X values
                    y: point.y
                }));
                element.properties[property] = pixelUIData;
            } else {
                // Default data if no series
                element.properties[property] = [
                    {x: 1, y: 10}, {x: 2, y: 25}, {x: 3, y: 15}, 
                    {x: 4, y: 30}, {x: 5, y: 20}
                ];
            }
        } else {
            // Basalt format (series object)
            const seriesData = {};
            this.currentChartData.forEach(series => {
                seriesData[series.name] = series.data.map(point => point.y);
            });
            element.properties[property] = seriesData;
        }
        
        // Update element on canvas
        const elementDiv = document.querySelector(`[data-element-id="${element.id}"]`);
        if (elementDiv) {
            this.updateElementDiv(elementDiv, element);
        }
        
        // Update properties panel
        if (this.selectedElement && this.selectedElement.id === element.id) {
            this.updatePropertiesPanel();
        }
        
        this.hideModal('chartDesignerModal');
    }
    
    cancelChartDesign() {
        this.hideModal('chartDesignerModal');
    }
    
    resetChartData() {
        this.currentChartData = [{
            name: 'Series 1',
            data: [{ x: 1, y: 10 }, { x: 2, y: 20 }, { x: 3, y: 15 }],
            color: 'blue'
        }];
        this.renderChartSeries();
        this.updateChartPreview();
    }

    // TreeView Designer Methods
    openTreeDesigner(element, property) {
        this.currentTreeElement = element;
        this.currentTreeProperty = property;
        this.selectedTreeNode = null;
        
        // Initialize tree data if empty
        if (!element.properties[property] || element.properties[property].length === 0) {
            this.currentTreeData = [
                {
                    text: 'Root Node',
                    expanded: true,
                    icon: '📁',
                    children: [
                        { text: 'Child 1', expanded: false, icon: '📄' },
                        { text: 'Child 2', expanded: false, icon: '📄' }
                    ]
                }
            ];
        } else {
            // Load existing data
            this.currentTreeData = this.parseTreeData(element.properties[property]);
        }
        
        this.renderTreePreview();
        this.showModal('treeDesignerModal');
    }
    
    parseTreeData(data) {
        // Handle different data formats
        if (typeof data === 'string') {
            try {
                return JSON.parse(data);
            } catch (e) {
                return this.getDefaultTreeData();
            }
        } else if (Array.isArray(data)) {
            return data;
        } else {
            return this.getDefaultTreeData();
        }
    }
    
    getDefaultTreeData() {
        return [
            {
                text: 'Documents',
                expanded: true,
                icon: '📁',
                children: [
                    { text: 'file1.txt', expanded: false, icon: '📄' },
                    { text: 'file2.txt', expanded: false, icon: '📄' }
                ]
            }
        ];
    }
    
    addTreeNode() {
        const newNode = {
            text: 'New Node',
            expanded: false,
            icon: '📄',
            children: []
        };
        
        if (this.selectedTreeNode) {
            // Add as sibling to selected node
            const parentArray = this.findParentArray(this.currentTreeData, this.selectedTreeNode);
            if (parentArray) {
                const index = parentArray.indexOf(this.selectedTreeNode);
                parentArray.splice(index + 1, 0, newNode);
            }
        } else {
            // Add to root level
            this.currentTreeData.push(newNode);
        }
        
        this.renderTreePreview();
        this.selectTreeNode(newNode);
    }
    
    addChildNode() {
        if (!this.selectedTreeNode) return;
        
        const newChild = {
            text: 'New Child',
            expanded: false,
            icon: '📄',
            children: []
        };
        
        if (!this.selectedTreeNode.children) {
            this.selectedTreeNode.children = [];
        }
        
        this.selectedTreeNode.children.push(newChild);
        this.selectedTreeNode.expanded = true;
        
        this.renderTreePreview();
        this.selectTreeNode(newChild);
    }
    
    deleteTreeNode() {
        if (!this.selectedTreeNode) return;
        
        const parentArray = this.findParentArray(this.currentTreeData, this.selectedTreeNode);
        if (parentArray) {
            const index = parentArray.indexOf(this.selectedTreeNode);
            parentArray.splice(index, 1);
            this.selectedTreeNode = null;
            this.hideNodeEditor();
            this.renderTreePreview();
        }
    }
    
    moveNodeUp() {
        if (!this.selectedTreeNode) return;
        
        const parentArray = this.findParentArray(this.currentTreeData, this.selectedTreeNode);
        if (parentArray) {
            const index = parentArray.indexOf(this.selectedTreeNode);
            if (index > 0) {
                [parentArray[index], parentArray[index - 1]] = [parentArray[index - 1], parentArray[index]];
                this.renderTreePreview();
            }
        }
    }
    
    moveNodeDown() {
        if (!this.selectedTreeNode) return;
        
        const parentArray = this.findParentArray(this.currentTreeData, this.selectedTreeNode);
        if (parentArray) {
            const index = parentArray.indexOf(this.selectedTreeNode);
            if (index < parentArray.length - 1) {
                [parentArray[index], parentArray[index + 1]] = [parentArray[index + 1], parentArray[index]];
                this.renderTreePreview();
            }
        }
    }
    
    findParentArray(data, targetNode) {
        for (let i = 0; i < data.length; i++) {
            if (data[i] === targetNode) {
                return data;
            }
            if (data[i].children) {
                const result = this.findParentArray(data[i].children, targetNode);
                if (result) return result;
            }
        }
        return null;
    }
    
    selectTreeNode(node) {
        this.selectedTreeNode = node;
        this.showNodeEditor();
        this.renderTreePreview();
        
        // Update node editor fields
        document.getElementById('nodeText').value = node.text || '';
        document.getElementById('nodeExpanded').checked = node.expanded || false;
        document.getElementById('nodeIcon').value = node.icon || '';
    }
    
    showNodeEditor() {
        document.getElementById('nodeEditor').style.display = 'block';
    }
    
    hideNodeEditor() {
        document.getElementById('nodeEditor').style.display = 'none';
    }
    
    updateSelectedNode() {
        if (!this.selectedTreeNode) return;
        
        this.selectedTreeNode.text = document.getElementById('nodeText').value;
        this.selectedTreeNode.expanded = document.getElementById('nodeExpanded').checked;
        this.selectedTreeNode.icon = document.getElementById('nodeIcon').value;
        
        this.renderTreePreview();
    }
    
    renderTreePreview() {
        const preview = document.getElementById('treePreview');
        preview.innerHTML = '';
        
        this.renderTreeNodes(this.currentTreeData, preview, 0);
    }
    
    renderTreeNodes(nodes, container, level) {
        nodes.forEach(node => {
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'tree-node';
            if (node === this.selectedTreeNode) {
                nodeDiv.classList.add('selected');
            }
            
            nodeDiv.style.marginLeft = (level * 20) + 'px';
            
            const toggle = document.createElement('button');
            toggle.className = 'tree-node-toggle';
            toggle.textContent = node.children && node.children.length > 0 ? 
                (node.expanded ? '▼' : '▶') : ' ';
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                node.expanded = !node.expanded;
                this.renderTreePreview();
            });
            
            const content = document.createElement('div');
            content.className = 'tree-node-content';
            
            const icon = document.createElement('span');
            icon.className = 'tree-node-icon';
            icon.textContent = node.icon || '📄';
            
            const text = document.createElement('span');
            text.className = 'tree-node-text';
            text.textContent = node.text || 'Unnamed';
            
            content.appendChild(icon);
            content.appendChild(text);
            
            nodeDiv.appendChild(toggle);
            nodeDiv.appendChild(content);
            
            nodeDiv.addEventListener('click', () => {
                this.selectTreeNode(node);
            });
            
            container.appendChild(nodeDiv);
            
            if (node.expanded && node.children && node.children.length > 0) {
                this.renderTreeNodes(node.children, container, level + 1);
            }
        });
    }
    
    generateSampleTree() {
        this.currentTreeData = [
            {
                text: 'Documents',
                expanded: true,
                icon: '📁',
                children: [
                    {
                        text: 'Projects',
                        expanded: false,
                        icon: '📁',
                        children: [
                            { text: 'PixelUI', expanded: true, icon: '📁', children: [
                                { text: 'pixelui.lua', icon: '📄' },
                                { text: 'example.lua', icon: '📄' },
                                { text: 'README.md', icon: '📄' }
                            ]},
                            { text: 'OtherProject.lua', icon: '📄' }
                        ]
                    },
                    { text: 'Reports.txt', icon: '📄' },
                    { text: 'Notes.md', icon: '📄' }
                ]
            },
            {
                text: 'Pictures',
                expanded: false,
                icon: '📁',
                children: [
                    { text: 'vacation.jpg', icon: '🖼️' },
                    { text: 'screenshot.png', icon: '🖼️' }
                ]
            }
        ];
        
        this.renderTreePreview();
    }
    
    applyTreeDesign() {
        const element = this.currentTreeElement;
        const property = this.currentTreeProperty;
        
        // Apply tree settings
        const showLines = document.getElementById('treeShowLines').checked;
        const showRoot = document.getElementById('treeShowRoot').checked;
        const expandable = document.getElementById('treeExpandable').checked;
        const selectable = document.getElementById('treeSelectable').checked;
        
        element.properties.showLines = showLines;
        element.properties.showRoot = showRoot;
        element.properties.expandable = expandable;
        element.properties.selectable = selectable;
        
        // Set the tree data
        element.properties[property] = this.currentTreeData;
        
        // Update element on canvas
        const elementDiv = document.querySelector(`[data-element-id="${element.id}"]`);
        if (elementDiv) {
            this.updateElementDiv(elementDiv, element);
        }
        
        // Update properties panel
        if (this.selectedElement && this.selectedElement.id === element.id) {
            this.updatePropertiesPanel();
        }
        
        this.hideModal('treeDesignerModal');
    }
    
    cancelTreeDesign() {
        this.hideModal('treeDesignerModal');
    }
    
    resetTreeData() {
        this.currentTreeData = this.getDefaultTreeData();
        this.selectedTreeNode = null;
        this.hideNodeEditor();
        this.renderTreePreview();
    }

    generatePixelUICode() {
        let code = '-- PixelUI Generated Code\n';
        code += 'local PixelUI = require("pixelui")\n\n';
        code += '-- Create main container\n';
        code += 'local main = PixelUI.container({\n';
        code += `    width = ${this.terminalWidth},\n`;
        code += `    height = ${this.terminalHeight}\n`;
        code += '})\n\n';
        
        // Add elements
        const sortedElements = Array.from(this.elements.values()).sort((a, b) => {
            const aZ = a.properties.z || 0;
            const bZ = b.properties.z || 0;
            return aZ - bZ;
        });
        
        sortedElements.forEach((element, index) => {
            const varName = `element${index + 1}`;
            const elementDef = this.pixelUIElements[element.type];
            
            code += `-- ${element.type} element\n`;
            
            // Convert element type to correct PixelUI function name
            let pixelUIFunctionName = element.type.toLowerCase();
            if (element.type === 'CheckBox') {
                pixelUIFunctionName = 'checkBox';
            } else if (element.type === 'ListView') {
                pixelUIFunctionName = 'listView';
            } else if (element.type === 'TextBox') {
                pixelUIFunctionName = 'textBox';
            } else if (element.type === 'ProgressBar') {
                pixelUIFunctionName = 'progressBar';
            } else if (element.type === 'ComboBox') {
                pixelUIFunctionName = 'comboBox';
            } else if (element.type === 'TabControl') {
                pixelUIFunctionName = 'tabControl';
            } else if (element.type === 'RichTextBox') {
                pixelUIFunctionName = 'richTextBox';
            } else if (element.type === 'CodeEditor') {
                pixelUIFunctionName = 'codeEditor';
            } else if (element.type === 'ColorPicker') {
                pixelUIFunctionName = 'colorPicker';
            } else if (element.type === 'RadioButton') {
                pixelUIFunctionName = 'radioButton';
            } else if (element.type === 'ToggleSwitch') {
                pixelUIFunctionName = 'toggleSwitch';
            } else if (element.type === 'RangeSlider') {
                pixelUIFunctionName = 'rangeSlider';
            } else if (element.type === 'LoadingIndicator') {
                pixelUIFunctionName = 'loadingIndicator';
            } else if (element.type === 'TreeView') {
                pixelUIFunctionName = 'treeView';
            } else if (element.type === 'NumericUpDown') {
                pixelUIFunctionName = 'numericUpDown';
            }
            
            code += `local ${varName} = PixelUI.${pixelUIFunctionName}({\n`;
            
            // Add properties
            Object.entries(element.properties).forEach(([key, value]) => {
                // Always include essential properties like width and height, even if they match defaults
                const isEssentialProperty = ['width', 'height', 'x', 'y'].includes(key);
                
                if (isEssentialProperty || elementDef.defaultProps[key] !== value) {
                    if (typeof value === 'string' && key.includes('Color') || key === 'background' || key === 'color') {
                        if (value.startsWith('colors.')) {
                            code += `    ${key} = ${value},\n`;
                        } else {
                            code += `    ${key} = colors.${value},\n`;
                        }
                    } else if (typeof value === 'string') {
                        code += `    ${key} = "${value}",\n`;
                    } else if (Array.isArray(value)) {
                        if (value.length === 0) {
                            code += `    ${key} = {},\n`;
                        } else {
                            // Use convertToLuaTable for each array item to handle objects properly
                            const items = value.map(v => this.convertToLuaTable(v));
                            code += `    ${key} = {${items.join(', ')}},\n`;
                        }
                    } else if (typeof value === 'object' && value !== null) {
                        // Handle objects (like chart data)
                        if (key === 'data' && element.type === 'Chart') {
                            // For chart data, convert to proper Lua table format
                            const luaTable = this.convertToLuaTable(value);
                            code += `    ${key} = ${luaTable},\n`;
                        } else {
                            // For other objects, convert to Lua table
                            const luaTable = this.convertToLuaTable(value);
                            code += `    ${key} = ${luaTable},\n`;
                        }
                    } else {
                        code += `    ${key} = ${value},\n`;
                    }
                }
            });
            
            code += '})\n';
            code += `main:addChild(${varName})\n\n`;
        });
        
        code += '-- Start the UI\n';
        // code += 'PixelUI.render()\n';
        code += 'PixelUI.run()';
        
        return code;
    }
    
    // Helper method to convert JavaScript objects to Lua table format
    convertToLuaTable(obj) {
        if (obj === null || obj === undefined) {
            return 'nil';
        }
        
        if (typeof obj === 'string') {
            return `"${obj}"`;
        }
        
        if (typeof obj === 'number' || typeof obj === 'boolean') {
            return String(obj);
        }
        
        if (Array.isArray(obj)) {
            if (obj.length === 0) {
                return '{}';
            }
            const items = obj.map(item => this.convertToLuaTable(item));
            return `{${items.join(', ')}}`;
        }
        
        if (typeof obj === 'object') {
            const pairs = [];
            for (const [key, value] of Object.entries(obj)) {
                const luaKey = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) ? key : `["${key}"]`;
                const luaValue = this.convertToLuaTable(value);
                pairs.push(`${luaKey} = ${luaValue}`);
            }
            return `{${pairs.join(', ')}}`;
        }
        
        return 'nil';
    }
    
    generateBasaltCode() {
        // Use existing Basalt code generation method
        let code = '-- Basalt 2 Generated Code\n';
        code += 'local basalt = require("basalt")\n\n';
        code += '-- Create main frame\n';
        code += 'local main = basalt.createFrame()\n';
        code += `    :setSize(${this.terminalWidth}, ${this.terminalHeight})\n\n`;
        
        // Add elements with existing logic
        const sortedElements = Array.from(this.elements.values()).sort((a, b) => {
            const aZ = a.properties.z || 0;
            const bZ = b.properties.z || 0;
            return aZ - bZ;
        });
        
        sortedElements.forEach((element, index) => {
            const varName = `element${index + 1}`;
            const elementDef = this.getCurrentElements()[element.type];
            
            code += `-- ${element.type} element\n`;
            code += `local ${varName} = main:add${element.type}()\n`;
            
            // Handle position (x, y) together
            const x = element.properties.x;
            const y = element.properties.y;
            if (x !== elementDef.defaultProps.x || y !== elementDef.defaultProps.y) {
                code += `    :setPosition(${x}, ${y})\n`;
            }
            
            // Handle size (width, height) together
            const width = element.properties.width;
            const height = element.properties.height;
            if (width !== elementDef.defaultProps.width || height !== elementDef.defaultProps.height) {
                code += `    :setSize(${width}, ${height})\n`;
            }
            
            // Add other properties
            Object.entries(element.properties).forEach(([key, value]) => {
                // Skip x, y, width, height as they're handled above
                if (['x', 'y', 'width', 'height'].includes(key)) return;
                
                if (elementDef.defaultProps[key] !== value) {
                    const propertyMethod = this.getBasaltPropertyMethod(key);
                    if (propertyMethod) {
                        if (typeof value === 'string' && (key.includes('Color') || key === 'background' || key === 'foreground')) {
                            if (value.startsWith('colors.')) {
                                code += `    :${propertyMethod}(${value})\n`;
                            } else {
                                code += `    :${propertyMethod}(colors.${value})\n`;
                            }
                        } else if (typeof value === 'string') {
                            code += `    :${propertyMethod}("${value}")\n`;
                        } else if (Array.isArray(value)) {
                            if (value.length === 0) {
                                code += `    :${propertyMethod}({})\n`;
                            } else {
                                const items = value.map(v => {
                                    if (typeof v === 'string') {
                                        return `"${v}"`;
                                    } else if (typeof v === 'object' && v.text) {
                                        return `"${v.text}"`;
                                    }
                                    return `"${v}"`;
                                }).join(', ');
                                code += `    :${propertyMethod}({${items}})\n`;
                            }
                        } else {
                            code += `    :${propertyMethod}(${value})\n`;
                        }
                    }
                }
            });
            
            code += '\n';
        });
        
        code += '-- Start the UI\n';
        code += 'basalt.run()';
        
        return code;
    }
    
    getBasaltPropertyMethod(key) {
        const methodMap = {
            text: 'setText',
            background: 'setBackground',
            foreground: 'setForeground',
            visible: 'setVisible',
            zIndex: 'setZIndex',
            placeholder: 'setPlaceholder',
            checked: 'setChecked',
            checkedText: 'setCheckedText',
            autoSize: 'setAutoSize',
            items: 'setItems',
            progress: 'setProgress',
            showPercentage: 'setShowPercentage',
            progressColor: 'setProgressColor',
            step: 'setStep',
            max: 'setMax',
            horizontal: 'setHorizontal',
            barColor: 'setBarColor',
            sliderColor: 'setSliderColor',
            maxLength: 'setMaxLength',
            focusedBackground: 'setFocusedBackground',
            focusedForeground: 'setFocusedForeground',
            placeholderColor: 'setPlaceholderColor'
        };
        return methodMap[key] || `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
    }
    
    generatePrimeUICode() {
        // Get selected components first
        const usedComponents = new Set();
        const sortedElements = Array.from(this.elements.values()).sort((a, b) => {
            const aZ = a.properties.z || 0;
            const bZ = b.properties.z || 0;
            return aZ - bZ;
        });
        
        // Collect all used component types
        sortedElements.forEach(element => {
            usedComponents.add(element.type.toLowerCase());
        });
        
        let code = '-- PrimeUI Generated Code\n';
        code += '-- Generated by XCC Designer\n';
        code += '-- Note: You need to manually include PrimeUI library\n\n';
        
        code += '-- Initialize and clear screen\n';
        code += 'term.clear()\n';
        code += 'term.setCursorPos(1, 1)\n\n';
        
        code += '-- Create main window\n';
        code += 'local win = term.current()\n\n';
        
        // Add element creation
        sortedElements.forEach((element, index) => {
            const varName = `element${index + 1}`;
            const elementType = element.type;
            
            // Helper function to ensure valid coordinates
            const sanitizeCoord = (coord) => {
                const num = Number(coord);
                return (isNaN(num) || num < 1) ? 1 : Math.floor(num);
            };
            
            const safeX = sanitizeCoord(element.properties.x);
            const safeY = sanitizeCoord(element.properties.y);
            const safeWidth = sanitizeCoord(element.properties.width) || 1;
            const safeHeight = sanitizeCoord(element.properties.height) || 1;
            
            code += `-- ${elementType} element\n`;
            
            // Generate function call based on element type
            switch (elementType) {
                case 'Button':
                    code += `local ${varName} = PrimeUI.button(win, ${safeX}, ${safeY}, "${element.properties.text}", function() end`;
                    if (element.properties.fgColor !== 'white') code += `, colors.${element.properties.fgColor}`;
                    if (element.properties.bgColor !== 'lightGray') code += `, colors.${element.properties.bgColor}`;
                    if (element.properties.clickedColor !== 'gray') code += `, colors.${element.properties.clickedColor}`;
                    code += ')\n';
                    break;
                    
                case 'Label':
                    code += `PrimeUI.label(win, ${safeX}, ${safeY}, "${element.properties.text}"`;
                    if (element.properties.fgColor !== 'white') code += `, colors.${element.properties.fgColor}`;
                    if (element.properties.bgColor !== 'black') code += `, colors.${element.properties.bgColor}`;
                    code += ')\n';
                    break;
                    
                case 'CenterLabel':
                    code += `PrimeUI.centerLabel(win, ${safeX}, ${safeY}, ${safeWidth}, "${element.properties.text}"`;
                    if (element.properties.fgColor !== 'white') code += `, colors.${element.properties.fgColor}`;
                    if (element.properties.bgColor !== 'black') code += `, colors.${element.properties.bgColor}`;
                    code += ')\n';
                    break;
                    
                case 'InputBox':
                    code += `PrimeUI.inputBox(win, ${safeX}, ${safeY}, ${safeWidth}, function(text) end`;
                    // Add optional color parameters
                    if (element.properties.fgColor !== 'white' || element.properties.bgColor !== 'black' || element.properties.replacement) {
                        code += `, colors.${element.properties.fgColor || 'white'}`;
                        if (element.properties.bgColor !== 'black' || element.properties.replacement) {
                            code += `, colors.${element.properties.bgColor || 'black'}`;
                            if (element.properties.replacement) {
                                code += `, "${element.properties.replacement}"`;
                            }
                        }
                    }
                    code += ')\n';
                    break;
                    
                case 'ProgressBar':
                    code += `local ${varName} = PrimeUI.progressBar(win, ${safeX}, ${safeY}, ${safeWidth}`;
                    // Always include colors if useShade is specified, to maintain parameter order
                    if (element.properties.fgColor !== 'white' || element.properties.bgColor !== 'black' || element.properties.useShade === true) {
                        code += `, colors.${element.properties.fgColor || 'white'}`;
                        if (element.properties.bgColor !== 'black' || element.properties.useShade === true) {
                            code += `, colors.${element.properties.bgColor || 'black'}`;
                            if (element.properties.useShade === true) {
                                code += `, true`;
                            }
                        }
                    }
                    code += ')\n';
                    break;
                    
                case 'SelectionBox':
                    const entries = Array.isArray(element.properties.entries) ? 
                        element.properties.entries.map(e => `"${e}"`).join(', ') : '"Option 1", "Option 2"';
                    code += `PrimeUI.selectionBox(win, ${safeX}, ${safeY}, ${safeWidth}, ${safeHeight}, {${entries}}, function(selection) end`;
                    if (element.properties.fgColor !== 'white') code += `, nil, colors.${element.properties.fgColor}`;
                    if (element.properties.bgColor !== 'black') code += `, colors.${element.properties.bgColor}`;
                    code += ')\n';
                    break;
                    
                case 'CheckSelectionBox':
                    const selections = element.properties.selections || {};
                    const selectionsStr = Object.entries(selections).map(([k, v]) => `["${k}"] = ${v}`).join(', ');
                    code += `PrimeUI.checkSelectionBox(win, ${safeX}, ${safeY}, ${safeWidth}, ${safeHeight}, {${selectionsStr}}, function(selections) end`;
                    if (element.properties.fgColor !== 'white') code += `, colors.${element.properties.fgColor}`;
                    if (element.properties.bgColor !== 'black') code += `, colors.${element.properties.bgColor}`;
                    code += ')\n';
                    break;
                    
                case 'ScrollBox':
                    code += `local ${varName} = PrimeUI.scrollBox(win, ${safeX}, ${safeY}, ${safeWidth}, ${safeHeight}, ${element.properties.innerHeight || safeHeight * 2}`;
                    if (element.properties.allowArrowKeys !== true) code += `, ${element.properties.allowArrowKeys}`;
                    if (element.properties.showScrollIndicators !== false) code += `, ${element.properties.showScrollIndicators}`;
                    if (element.properties.fgColor !== 'white') code += `, colors.${element.properties.fgColor}`;
                    if (element.properties.bgColor !== 'black') code += `, colors.${element.properties.bgColor}`;
                    code += ')\n';
                    break;
                    
                case 'TextBox':
                    code += `local ${varName} = PrimeUI.textBox(win, ${safeX}, ${safeY}, ${safeWidth}, ${safeHeight}, "${element.properties.text}"`;
                    if (element.properties.fgColor !== 'white') code += `, colors.${element.properties.fgColor}`;
                    if (element.properties.bgColor !== 'black') code += `, colors.${element.properties.bgColor}`;
                    code += ')\n';
                    break;
                    
                case 'BorderBox':
                    code += `PrimeUI.borderBox(win, ${safeX}, ${safeY}, ${safeWidth}, ${safeHeight}`;
                    if (element.properties.fgColor !== 'white') code += `, colors.${element.properties.fgColor}`;
                    if (element.properties.bgColor !== 'black') code += `, colors.${element.properties.bgColor}`;
                    code += ')\n';
                    break;
                    
                case 'HorizontalLine':
                    code += `PrimeUI.horizontalLine(win, ${safeX}, ${safeY}, ${safeWidth}`;
                    if (element.properties.fgColor !== 'white') code += `, colors.${element.properties.fgColor}`;
                    if (element.properties.bgColor !== 'black') code += `, colors.${element.properties.bgColor}`;
                    code += ')\n';
                    break;
                    
                case 'DrawText':
                    code += `PrimeUI.drawText(win, "${element.properties.text}", ${element.properties.resizeToFit}`;
                    if (element.properties.fgColor !== 'white') code += `, colors.${element.properties.fgColor}`;
                    if (element.properties.bgColor !== 'black') code += `, colors.${element.properties.bgColor}`;
                    code += ')\n';
                    break;
                    
                case 'DrawImage':
                    code += `PrimeUI.drawImage(win, ${safeX}, ${safeY}, "${element.properties.data}", ${element.properties.index}, ${element.properties.setPalette})\n`;
                    break;
                    
                default:
                    code += `-- ${elementType} (custom implementation needed)\n`;
                    break;
            }
            
            code += '\n';
        });
        
        code += '-- Start the main loop\n';
        code += 'PrimeUI.run()\n';
        
        return code;
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
            case 'xcc':
                code = this.generateXCCCode();
                language = 'json';
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
        return this.generateCode();
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
                properties: element.properties,
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
            
            Object.entries(element.properties).forEach(([prop, value]) => {
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
    
    generateXCCCode() {
        /*
         * XCC Format Specification v1.0
         * 
         * The .xcc format is a JSON-based file format specifically designed for
         * the XCC (ComputerCraft GUI Designer) application. It includes:
         * 
         * - Format identification and version information
         * - Project metadata (name, description, author)
         * - Framework specification (basalt/pixelui)
         * - Enhanced element data with metadata
         * - Design information and timestamps
         * 
         * This format is optimized for round-trip editing in XCC and includes
         * additional metadata not present in standard JSON exports.
         */
        
        const data = {
            // XCC Format Header
            format: 'XCC',
            version: '1.0',
            created: new Date().toISOString(),
            framework: this.currentFramework,
            
            // Project Information
            project: {
                name: 'Untitled Project',
                description: 'Created with XCC Designer',
                author: 'XCC User'
            },
            
            // Terminal Configuration
            terminal: {
                width: this.terminalWidth,
                height: this.terminalHeight,
                title: `${this.currentFramework === 'basalt' ? 'Basalt' : 'PixelUI'} UI`
            },
            
            // Element Data with Enhanced Information
            elements: Array.from(this.elements.values()).map(element => {
                const elementDef = this.currentFramework === 'basalt' ? 
                    this.basaltElements[element.type] : 
                    this.pixelUIElements[element.type];
                
                return {
                    id: element.id,
                    type: element.type,
                    framework: this.currentFramework,
                    properties: element.properties,
                    children: element.children || [],
                    // Add metadata for easier import
                    metadata: {
                        category: this.getElementCategory(element.type),
                        defaultProps: elementDef ? elementDef.defaultProps : {},
                        propertyGroups: elementDef ? elementDef.properties : {}
                    }
                };
            }),
            
            // Design Metadata
            design: {
                elementCount: this.elements.size,
                lastModified: new Date().toISOString(),
                canvasSize: {
                    width: this.terminalWidth,
                    height: this.terminalHeight
                }
            }
        };
        
        return JSON.stringify(data, null, 2);
    }
    
    getElementCategory(elementType) {
        if (this.currentFramework === 'basalt') {
            if (['Frame', 'Container', 'Flexbox'].includes(elementType)) {
                return 'Containers';
            } else if (['Label', 'Button', 'Input', 'Checkbox', 'Radio', 'Switch'].includes(elementType)) {
                return 'Basic';
            } else if (['List', 'Dropdown', 'Menubar', 'Table', 'Tree'].includes(elementType)) {
                return 'Advanced';
            } else if (['Progressbar', 'Slider', 'Graph', 'Image'].includes(elementType)) {
                return 'Display';
            }
        } else {
            if (['Container'].includes(elementType)) {
                return 'Containers';
            } else if (['Label', 'Button', 'TextBox', 'CheckBox', 'RadioButton', 'ToggleSwitch', 'NumericUpDown'].includes(elementType)) {
                return 'Basic';
            } else if (['ListView', 'ComboBox', 'TabControl', 'TreeView', 'Accordion'].includes(elementType)) {
                return 'Advanced';
            } else if (['ProgressBar', 'Slider', 'RangeSlider', 'Chart', 'Canvas', 'ColorPicker', 'LoadingIndicator'].includes(elementType)) {
                return 'Display';
            } else if (['RichTextBox', 'CodeEditor'].includes(elementType)) {
                return 'Editors';
            }
        }
        return 'Basic';
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
        
        const extensions = { lua: 'lua', json: 'json', xml: 'xml', xcc: 'xcc' };
        const extension = extensions[exportType];
        
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        const baseFilename = this.currentFramework === 'basalt' ? 'basalt-ui' : 
                            this.currentFramework === 'pixelui' ? 'pixelui-ui' : 'primeui-ui';
        a.download = `${baseFilename}.${extension}`;
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
            if (!element.properties.visible) return;
            
            const previewEl = document.createElement('div');
            previewEl.style.position = 'absolute';
            previewEl.style.left = ((element.properties.x - 1) * 8) + 'px';
            previewEl.style.top = ((element.properties.y - 1) * 12) + 'px';
            previewEl.style.width = (element.properties.width * 8) + 'px';
            previewEl.style.height = (element.properties.height * 12) + 'px';
            previewEl.className = `cc-color-${element.properties.background}`;
            
            // Simple content rendering
            switch (element.type) {
                case 'Label':
                    previewEl.textContent = element.properties.text;
                    break;
                case 'Button':
                    previewEl.textContent = element.properties.text;
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
            
            item.innerHTML = `📄 ${element.type} (${element.properties.x}, ${element.properties.y})`;
            
            item.addEventListener('click', () => {
                this.selectElement(element);
                this.hideModal('hierarchyModal');
            });
            
            container.appendChild(item);
        });
    }

    // ================================
    // PROJECT MANAGEMENT FUNCTIONS
    // ================================

    // Save current project to localStorage
    saveProject(name, description = '') {
        if (!name) {
            name = prompt('Enter project name:');
            if (!name) return;
        }

        const projectId = 'xcc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const now = new Date().toISOString();
        
        const projectData = {
            id: projectId,
            name: name,
            framework: this.currentFramework,
            description: description,
            elements: Array.from(this.elements.values()).map(element => ({
                id: element.id,
                type: element.type,
                properties: { ...element.properties }
            })),
            properties: {
                width: this.terminalWidth,
                height: this.terminalHeight,
                title: name
            },
            created: now,
            modified: now,
            version: '1.0.0'
        };

        // Get existing projects
        const projects = JSON.parse(localStorage.getItem('xcc_projects') || '{}');
        projects[projectId] = projectData;
        localStorage.setItem('xcc_projects', JSON.stringify(projects));

        this.showNotification(`Project "${name}" saved successfully!`);
        return projectId;
    }

    // Load project from localStorage
    loadProject(projectId) {
        const projects = JSON.parse(localStorage.getItem('xcc_projects') || '{}');
        const project = projects[projectId];
        
        if (!project) {
            this.showNotification('Project not found!', 'error');
            return false;
        }

        // Clear current design
        this.elements.clear();
        this.selectedElement = null;
        this.canvas.innerHTML = '';

        // Set framework
        this.currentFramework = project.framework;
        this.updateFrameworkTab();

        // Set terminal size
        if (project.properties) {
            this.terminalWidth = project.properties.width || 51;
            this.terminalHeight = project.properties.height || 19;
            this.updateTerminalSize();
        }

        // Load elements
        if (project.elements) {
            project.elements.forEach(elementData => {
                this.createElement(elementData.type, elementData.properties);
            });
        }

        this.updatePropertiesPanel();
        this.showNotification(`Project "${project.name}" loaded successfully!`);
        return true;
    }

    // Auto-save project if it's being edited
    autoSaveProject() {
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        
        if (editId) {
            const projects = JSON.parse(localStorage.getItem('xcc_projects') || '{}');
            const project = projects[editId];
            
            if (project) {
                project.elements = Array.from(this.elements.values()).map(element => ({
                    id: element.id,
                    type: element.type,
                    properties: { ...element.properties }
                }));
                project.modified = new Date().toISOString();
                project.properties = {
                    width: this.terminalWidth,
                    height: this.terminalHeight,
                    title: project.name
                };

                projects[editId] = project;
                localStorage.setItem('xcc_projects', JSON.stringify(projects));
            }
        }
    }

    // Check for project to load from session storage or URL
    checkProjectLoad() {
        // Check session storage for project data from project manager
        const sessionProject = sessionStorage.getItem('xcc_load_project');
        if (sessionProject) {
            try {
                const project = JSON.parse(sessionProject);
                sessionStorage.removeItem('xcc_load_project');
                
                // Clear current design
                this.elements.clear();
                this.selectedElement = null;
                this.canvas.innerHTML = '';

                // Set framework
                this.currentFramework = project.framework;
                this.updateFrameworkTab();

                // Set terminal size
                if (project.properties) {
                    this.terminalWidth = project.properties.width || 51;
                    this.terminalHeight = project.properties.height || 19;
                    this.updateTerminalSize();
                }

                // Load elements
                if (project.elements) {
                    project.elements.forEach(elementData => {
                        this.createElement(elementData.type, elementData.properties);
                    });
                }

                this.updatePropertiesPanel();
                this.showNotification(`Project "${project.name}" loaded for editing!`);
            } catch (error) {
                console.error('Error loading project from session storage:', error);
            }
        }

        // Check URL for edit parameter
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        if (editId && !sessionProject) {
            this.loadProject(editId);
        }
    }

    // Update framework tab to match current framework
    updateFrameworkTab() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.framework === this.currentFramework) {
                tab.classList.add('active');
            }
        });
        this.updateElementPalette();
        this.updateLogoAndTitle();
    }

    // Show notification
    showNotification(message, type = 'success') {
        // Remove existing notification
        const existingNotification = document.querySelector('.designer-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `designer-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${type === 'error' ? '#f44336' : '#4CAF50'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Quick save function for keyboard shortcut
    quickSave() {
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        
        if (editId) {
            this.autoSaveProject();
            this.showNotification('Project auto-saved!');
        } else {
            const name = prompt('Enter project name:');
            if (name) {
                this.saveProject(name);
            }
        }
    }
}

// Initialize the designer when the page loads
let designer;
document.addEventListener('DOMContentLoaded', () => {
    designer = new UIDesigner();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ignore if user is typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
            case 's':
                e.preventDefault();
                designer.quickSave();
                break;
            case 'o':
                e.preventDefault();
                designer.showImportModal();
                break;
            case 'z':
                e.preventDefault();
                if (e.shiftKey) {
                    designer.redo();
                } else {
                    designer.undo();
                }
                break;
            case 'y':
                e.preventDefault();
                designer.redo();
                break;
            case 'c':
                e.preventDefault();
                designer.copyElement();
                break;
            case 'v':
                e.preventDefault();
                designer.pasteElement();
                break;
            case 'd':
                e.preventDefault();
                designer.duplicateElement();
                break;
        }
    } else {
        switch (e.key) {
            case 'Delete':
            case 'Backspace':
                if (designer.selectedElement) {
                    e.preventDefault();
                    designer.deleteElement(designer.selectedElement.id);
                }
                break;
            case 'Escape':
                designer.selectElement(null);
                break;
        }
    }
});

// Export designer to global scope for HTML event handlers
window.designer = designer;
