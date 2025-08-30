# XCC - ComputerCraft Cross-Compiler

XCC is a comprehensive web-based development toolkit for ComputerCraft and CC: Tweaked programming. The platform provides multiple specialized tools including visual interface designers, image editors, code generators, and project management utilities to streamline ComputerCraft development workflows.

## Development Tools

### Visual Interface Designer
A browser-based drag-and-drop interface builder that generates production-ready Lua code for ComputerCraft GUI applications. The designer supports real-time preview and component property editing across multiple UI frameworks.

- Visual component placement and configuration
- Live preview with framework-accurate rendering  
- Automatic Lua code generation with proper syntax
- Component property editors and validation

### NFP Image Editor
A pixel art editor specifically designed for ComputerCraft's NFP (Image) format. Create and edit images that can be directly used in ComputerCraft programs for displays, sprites, and graphical interfaces.

- Pixel-perfect editing with ComputerCraft color palette
- Drawing tools including brush, fill, line, rectangle, and circle
- Import and export NFP files with preview functionality
- Grid overlay and zoom controls for precision editing

### Project Management
XCC implements a custom project format (.xcc) for storing interface designs, component hierarchies, and build configurations. Projects can be exported to various formats for distribution and version control.

- Project serialization and deserialization
- Import/export functionality for collaboration
- Version tracking and backup management
- Cross-tool project compatibility

### Code Generation Engine
Advanced code generation system that produces clean, maintainable Lua following ComputerCraft best practices. The engine supports multiple output formats and framework-specific optimizations.

- Framework-agnostic component definitions
- Automatic event handling and memory optimization
- Custom code templates and snippets
- Batch processing and build automation

## Supported Frameworks
The platform supports three major ComputerCraft UI frameworks, automatically generating framework-specific code without requiring manual API translation.

**Basalt Framework**
- Advanced component library with modern widgets
- Event-driven architecture support
- Layout management and responsive design

**PixelUI Framework** 
- Lightweight rendering engine
- Custom drawing capabilities
- Performance-optimized for older ComputerCraft versions

**PrimeUI Framework**
- Minimalist component set
- Direct terminal manipulation
- Reduced memory footprint

### Project Management
XCC implements a custom project format (.xcc) for storing interface designs, component hierarchies, and build configurations. Projects can be exported to various formats for distribution and version control.

- Project serialization and deserialization
- Import/export functionality for collaboration
- Version tracking and backup management

## Technical Specifications

### Tool Integration
XCC provides seamless integration between different development tools, allowing assets and code to be shared across the entire development workflow.

- NFP images can be directly imported into UI designs
- Generated UI code includes proper asset loading
- Unified project format across all tools
- Cross-reference validation and dependency tracking

### Supported Components
- **Data Display**: TreeView, Charts, Progress indicators
- **Input Controls**: Text input, Selection boxes, Checkboxes, Buttons
- **Layout Elements**: Borders, Panels, Containers, Grid systems
- **Navigation**: Menu bars, Tab controls, Breadcrumbs
- **Graphics**: NFP images, Custom drawings, Sprite management

### Output Formats
The toolkit supports multiple export formats to accommodate different development workflows and deployment requirements.

- **NFP Format**: Native ComputerCraft image format
- **Lua Tables**: Structured data for programmatic access  
- **Framework Code**: Complete UI implementations
- **Raw Assets**: Direct file exports for manual integration

### Browser Requirements  
- Modern JavaScript engine (ES6+)
- HTML5 Canvas support
- Local storage capability for project persistence

## Getting Started

XCC runs entirely in the browser and requires no local installation. Access the toolkit through any modern web browser at the hosted URL or download the source for self-hosting.

### Quick Start
1. **Choose Your Tool**: Select from UI Designer, NFP Editor, or other available tools
2. **Create or Import**: Start a new project or import existing assets
3. **Design and Edit**: Use visual tools to create your ComputerCraft content
4. **Generate Code**: Export ready-to-use Lua code and assets
5. **Deploy**: Copy generated files to your ComputerCraft environment

### Workflow Examples
- **UI Development**: Design interface → Generate Lua → Test in ComputerCraft
- **Graphics Creation**: Create NFP images → Import to UI → Combine assets
- **Project Assembly**: Use multiple tools → Export unified project → Deploy bundle

## License

This project is distributed under the MIT License. See LICENSE file for complete terms and conditions.