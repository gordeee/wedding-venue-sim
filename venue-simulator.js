// Wedding Venue Simulator - Main JavaScript
// Scale: 1 foot = 20 pixels

const SCALE = 20; // pixels per foot

class VenueSimulator {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // Venue dimensions (in feet, from the diagram)
        this.venue = {
            width: 62,  // 31ft on each side from center
            height: 67, // 24ft above + 25ft dais + 18ft below
            daisRadius: 12.5, // 25ft diameter = 12.5ft radius
            daisX: 24,  // 24ft from left edge
            daisY: 36.5 // 24ft from top + 12.5ft radius = center at 36.5ft
        };

        // Default tree positions
        const defaultTrees = [
            { x: 5, y: 40 },     // Left tree
            { x: 50, y: 15 },    // Top right tree
            { x: 57, y: 15 },    // Top right tree 2
            { x: 50, y: 38 },    // Middle right tree 1
            { x: 57, y: 38 },    // Middle right tree 2
            { x: 50, y: 50 }     // Bottom right tree
        ];

        // Load saved state from localStorage or use defaults
        this.trees = this.loadFromStorage('trees', defaultTrees);
        this.tables = this.loadFromStorage('tables', []);

        this.selectedTable = null;
        this.draggedTable = null;
        this.selectedTree = null;
        this.draggedTree = null;
        this.dragOffset = { x: 0, y: 0 };

        // Zoom and pan controls
        this.zoom = 1.0;
        this.minZoom = 0.3;
        this.maxZoom = 3.0;
        this.panOffset = { x: 0, y: 0 };
        this.isPanning = false;
        this.lastPanPoint = { x: 0, y: 0 };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
        this.updateStats();
    }

    loadFromStorage(key, defaultValue) {
        try {
            const stored = localStorage.getItem(`venueSimulator_${key}`);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (e) {
            console.warn(`Failed to load ${key} from localStorage:`, e);
            return defaultValue;
        }
    }

    saveToStorage(key, value) {
        try {
            localStorage.setItem(`venueSimulator_${key}`, JSON.stringify(value));
        } catch (e) {
            console.warn(`Failed to save ${key} to localStorage:`, e);
        }
    }

    saveLayout() {
        this.saveToStorage('trees', this.trees);
        this.saveToStorage('tables', this.tables);
    }

    setupEventListeners() {
        // Canvas mouse events for dragging tables
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));

        // Zoom with mouse wheel
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Handle table shortcuts
            if (this.selectedTable) {
                switch(e.key) {
                    case 'Delete':
                    case 'Backspace':
                        this.tables = this.tables.filter(t => t !== this.selectedTable);
                        this.selectedTable = null;
                        this.render();
                        this.updateStats();
                        this.saveLayout();
                        e.preventDefault();
                        break;
                    case 'r':
                    case 'R':
                        this.selectedTable.rotation += 90;
                        if (this.selectedTable.rotation >= 360) this.selectedTable.rotation = 0;
                        this.render();
                        this.saveLayout();
                        break;
                    case 'ArrowUp':
                        this.selectedTable.y -= e.shiftKey ? 0.5 : 1;
                        this.render();
                        this.saveLayout();
                        e.preventDefault();
                        break;
                    case 'ArrowDown':
                        this.selectedTable.y += e.shiftKey ? 0.5 : 1;
                        this.render();
                        this.saveLayout();
                        e.preventDefault();
                        break;
                    case 'ArrowLeft':
                        this.selectedTable.x -= e.shiftKey ? 0.5 : 1;
                        this.render();
                        this.saveLayout();
                        e.preventDefault();
                        break;
                    case 'ArrowRight':
                        this.selectedTable.x += e.shiftKey ? 0.5 : 1;
                        this.render();
                        this.saveLayout();
                        e.preventDefault();
                        break;
                    case 'Escape':
                        this.selectedTable = null;
                        this.render();
                        break;
                }
            }

            // Handle tree shortcuts
            if (this.selectedTree) {
                switch(e.key) {
                    case 'ArrowUp':
                        this.selectedTree.y -= e.shiftKey ? 0.5 : 1;
                        this.render();
                        this.saveLayout();
                        e.preventDefault();
                        break;
                    case 'ArrowDown':
                        this.selectedTree.y += e.shiftKey ? 0.5 : 1;
                        this.render();
                        this.saveLayout();
                        e.preventDefault();
                        break;
                    case 'ArrowLeft':
                        this.selectedTree.x -= e.shiftKey ? 0.5 : 1;
                        this.render();
                        this.saveLayout();
                        e.preventDefault();
                        break;
                    case 'ArrowRight':
                        this.selectedTree.x += e.shiftKey ? 0.5 : 1;
                        this.render();
                        this.saveLayout();
                        e.preventDefault();
                        break;
                    case 'Escape':
                        this.selectedTree = null;
                        this.render();
                        break;
                }
            }
        });

        // Table palette - add tables
        document.querySelectorAll('.table-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tableType = e.currentTarget.dataset.tableType;
                this.addTable(tableType);
            });
        });

        // Control buttons
        document.getElementById('professionalLayout').addEventListener('click', () => {
            this.createProfessionalLayout();
        });

        document.getElementById('clearTables').addEventListener('click', () => {
            this.tables = [];
            this.selectedTable = null;
            this.render();
            this.updateStats();
            this.saveLayout();
        });

        document.getElementById('rotateSelected').addEventListener('click', () => {
            if (this.selectedTable) {
                this.selectedTable.rotation += 90;
                if (this.selectedTable.rotation >= 360) this.selectedTable.rotation = 0;
                this.render();
                this.saveLayout();
            }
        });

        document.getElementById('deleteSelected').addEventListener('click', () => {
            if (this.selectedTable) {
                this.tables = this.tables.filter(t => t !== this.selectedTable);
                this.selectedTable = null;
                this.render();
                this.updateStats();
                this.saveLayout();
            }
        });

        document.getElementById('resetLayout').addEventListener('click', () => {
            if (confirm('Reset trees and tables to default positions? This will clear your current layout.')) {
                this.resetToDefaults();
            }
        });

        document.getElementById('exportImage').addEventListener('click', () => {
            this.exportAsImage();
        });
    }

    resetToDefaults() {
        // Clear localStorage
        localStorage.removeItem('venueSimulator_trees');
        localStorage.removeItem('venueSimulator_tables');

        // Reset to default positions
        this.trees = [
            { x: 5, y: 40 },     // Left tree
            { x: 50, y: 15 },    // Top right tree
            { x: 57, y: 15 },    // Top right tree 2
            { x: 50, y: 38 },    // Middle right tree 1
            { x: 57, y: 38 },    // Middle right tree 2
            { x: 50, y: 50 }     // Bottom right tree
        ];
        this.tables = [];
        this.selectedTable = null;
        this.selectedTree = null;

        this.render();
        this.updateStats();
        this.saveLayout();
    }

    addTable(type, x = null, y = null, rotation = 0) {
        const table = {
            type: type,
            x: x !== null ? x : this.venue.daisX + 20,
            y: y !== null ? y : this.venue.daisY,
            rotation: rotation,
            id: Date.now() + Math.random()
        };

        // Set dimensions and seating based on type
        switch(type) {
            case 'banquet8':
                table.width = 8;
                table.height = 2.5;
                table.seats = 8;
                table.shape = 'rectangle';
                break;
            case 'banquet6':
                table.width = 6;
                table.height = 2.5;
                table.seats = 6;
                table.shape = 'rectangle';
                break;
            case 'serpentine':
                table.width = 6;
                table.height = 6;
                table.seats = 4;
                table.shape = 'serpentine';
                break;
        }

        this.tables.push(table);
        this.render();
        this.updateStats();
        this.saveLayout();
        return table;
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;

        // Convert to world coordinates
        const worldCoords = this.screenToWorld(screenX, screenY);
        const mouseX = worldCoords.x;
        const mouseY = worldCoords.y;

        // Check if clicking on a table (check in reverse order for top-most)
        for (let i = this.tables.length - 1; i >= 0; i--) {
            const table = this.tables[i];
            if (this.isPointInTable(mouseX, mouseY, table)) {
                this.draggedTable = table;
                this.selectedTable = table;
                this.selectedTree = null;
                this.dragOffset.x = mouseX - table.x;
                this.dragOffset.y = mouseY - table.y;
                this.canvas.style.cursor = 'grabbing';
                this.render();
                return;
            }
        }

        // Check if clicking on a tree
        for (let i = this.trees.length - 1; i >= 0; i--) {
            const tree = this.trees[i];
            if (this.isPointInTree(mouseX, mouseY, tree)) {
                this.draggedTree = tree;
                this.selectedTree = tree;
                this.selectedTable = null;
                this.dragOffset.x = mouseX - tree.x;
                this.dragOffset.y = mouseY - tree.y;
                this.canvas.style.cursor = 'grabbing';
                this.render();
                return;
            }
        }

        // If not clicking on a table or tree, start panning
        this.isPanning = true;
        this.lastPanPoint = { x: screenX, y: screenY };
        this.canvas.style.cursor = 'grabbing';
        this.selectedTable = null;
        this.selectedTree = null;
        this.render();
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;

        // Handle panning
        if (this.isPanning) {
            const dx = screenX - this.lastPanPoint.x;
            const dy = screenY - this.lastPanPoint.y;

            this.panOffset.x += dx;
            this.panOffset.y += dy;

            this.lastPanPoint = { x: screenX, y: screenY };
            this.render();
            return;
        }

        // Handle table dragging
        if (this.draggedTable) {
            const worldCoords = this.screenToWorld(screenX, screenY);
            this.draggedTable.x = worldCoords.x - this.dragOffset.x;
            this.draggedTable.y = worldCoords.y - this.dragOffset.y;
            this.render();
            return;
        }

        // Handle tree dragging
        if (this.draggedTree) {
            const worldCoords = this.screenToWorld(screenX, screenY);
            this.draggedTree.x = worldCoords.x - this.dragOffset.x;
            this.draggedTree.y = worldCoords.y - this.dragOffset.y;
            this.render();
        }
    }

    handleMouseUp(e) {
        // Save layout if we were dragging something
        if (this.draggedTable || this.draggedTree) {
            this.saveLayout();
        }

        this.draggedTable = null;
        this.draggedTree = null;
        this.isPanning = false;
        this.canvas.style.cursor = 'grab';
    }

    handleDoubleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;

        const worldCoords = this.screenToWorld(screenX, screenY);
        const mouseX = worldCoords.x;
        const mouseY = worldCoords.y;

        // Check if double-clicking on a table
        for (let i = this.tables.length - 1; i >= 0; i--) {
            const table = this.tables[i];
            if (this.isPointInTable(mouseX, mouseY, table)) {
                table.rotation += 90;
                if (table.rotation >= 360) table.rotation = 0;
                this.render();
                this.saveLayout();
                return;
            }
        }
    }

    handleWheel(e) {
        e.preventDefault();

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Get world position before zoom
        const worldBefore = this.screenToWorld(mouseX, mouseY);

        // Update zoom
        const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = this.zoom * zoomDelta;
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));

        // Get world position after zoom
        const worldAfter = this.screenToWorld(mouseX, mouseY);

        // Adjust pan to keep mouse position steady
        this.panOffset.x += (worldAfter.x - worldBefore.x) * SCALE * this.zoom;
        this.panOffset.y += (worldAfter.y - worldBefore.y) * SCALE * this.zoom;

        this.render();
    }

    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.panOffset.x) / (SCALE * this.zoom),
            y: (screenY - this.panOffset.y) / (SCALE * this.zoom)
        };
    }

    isPointInTable(px, py, table) {
        if (table.shape === 'serpentine') {
            // For serpentine tables, check if point is within the arc region
            // Need to account for rotation
            const dx = px - table.x;
            const dy = py - table.y;

            // Rotate the point back by the table's rotation to check in local space
            const rotation = (table.rotation || 0) * Math.PI / 180;
            const cos = Math.cos(-rotation);
            const sin = Math.sin(-rotation);
            const localX = dx * cos - dy * sin;
            const localY = dx * sin + dy * cos;

            const outerRadius = table.width;
            const innerRadius = table.width - 2.5;
            const distance = Math.sqrt(localX * localX + localY * localY);

            // Check if within the arc radii
            if (distance < innerRadius || distance > outerRadius) {
                return false;
            }

            // Check if within the 90-degree arc (first quadrant in local space)
            const angle = Math.atan2(localY, localX);
            return angle >= 0 && angle <= Math.PI / 2;
        } else {
            // Rectangle bounding box check (good enough for now)
            const halfWidth = table.width / 2;
            const halfHeight = table.height / 2;

            return px >= table.x - halfWidth &&
                   px <= table.x + halfWidth &&
                   py >= table.y - halfHeight &&
                   py <= table.y + halfHeight;
        }
    }

    isPointInTree(px, py, tree) {
        // Check if point is within tree's circular area (radius ~15px = 0.75ft)
        const treeRadius = 0.75; // feet
        const dx = px - tree.x;
        const dy = py - tree.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= treeRadius;
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#e8f5e9';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context and apply zoom/pan transformations
        this.ctx.save();
        this.ctx.translate(this.panOffset.x, this.panOffset.y);
        this.ctx.scale(this.zoom, this.zoom);

        // Draw grid
        this.drawGrid();

        // Draw venue boundary
        this.drawVenueBoundary();

        // Draw dais
        this.drawDais();

        // Draw trees
        this.drawTrees();

        // Draw tables
        this.drawTables();

        // Draw measurements (guide lines)
        this.drawMeasurements();

        // Restore context
        this.ctx.restore();

        // Draw zoom indicator
        this.drawZoomIndicator();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#d0e8d0';
        this.ctx.lineWidth = 0.5;

        // Draw vertical lines every 5 feet
        for (let x = 0; x <= this.venue.width; x += 5) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * SCALE, 0);
            this.ctx.lineTo(x * SCALE, this.canvas.height);
            this.ctx.stroke();
        }

        // Draw horizontal lines every 5 feet
        for (let y = 0; y <= this.venue.height; y += 5) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * SCALE);
            this.ctx.lineTo(this.canvas.width, y * SCALE);
            this.ctx.stroke();
        }
    }

    drawVenueBoundary() {
        this.ctx.strokeStyle = '#888';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 5]);
        this.ctx.strokeRect(0, 0, this.venue.width * SCALE, this.venue.height * SCALE);
        this.ctx.setLineDash([]);
    }

    drawDais() {
        // Draw circular dais (stage/platform)
        this.ctx.fillStyle = '#f5f5f5';
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 3;

        this.ctx.beginPath();
        this.ctx.arc(
            this.venue.daisX * SCALE,
            this.venue.daisY * SCALE,
            this.venue.daisRadius * SCALE,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.stroke();

        // Add texture/pattern to dais
        this.ctx.fillStyle = '#e0e0e0';
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const x = this.venue.daisX * SCALE + Math.cos(angle) * (this.venue.daisRadius * SCALE * 0.7);
            const y = this.venue.daisY * SCALE + Math.sin(angle) * (this.venue.daisRadius * SCALE * 0.7);
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Label
        this.ctx.fillStyle = '#666';
        this.ctx.font = 'bold 14px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('DAIS', this.venue.daisX * SCALE, this.venue.daisY * SCALE + 5);
        this.ctx.font = '10px Courier New';
        this.ctx.fillText('25ft diameter', this.venue.daisX * SCALE, this.venue.daisY * SCALE + 20);
    }

    drawTrees() {
        this.trees.forEach(tree => {
            const x = tree.x * SCALE;
            const y = tree.y * SCALE;
            const isSelected = tree === this.selectedTree;

            // Selection ring if selected
            if (isSelected) {
                this.ctx.strokeStyle = '#ff6f00';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 20, 0, Math.PI * 2);
                this.ctx.stroke();
            }

            // Tree canopy (dark green circle)
            this.ctx.fillStyle = isSelected ? '#3d6826' : '#2d5016';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 15, 0, Math.PI * 2);
            this.ctx.fill();

            // Tree canopy (lighter green)
            this.ctx.fillStyle = isSelected ? '#5a9c3c' : '#4a7c2c';
            this.ctx.beginPath();
            this.ctx.arc(x - 3, y - 3, 12, 0, Math.PI * 2);
            this.ctx.fill();

            // Tree highlights
            this.ctx.fillStyle = isSelected ? '#7bc84e' : '#6ba83e';
            this.ctx.beginPath();
            this.ctx.arc(x - 5, y - 5, 6, 0, Math.PI * 2);
            this.ctx.fill();

            // Trunk
            this.ctx.fillStyle = '#5d4037';
            this.ctx.fillRect(x - 3, y + 8, 6, 10);
        });
    }

    drawTables() {
        this.tables.forEach(table => {
            this.ctx.save();
            this.ctx.translate(table.x * SCALE, table.y * SCALE);
            this.ctx.rotate((table.rotation * Math.PI) / 180);

            const isSelected = table === this.selectedTable;

            if (table.shape === 'serpentine') {
                this.drawSerpentineTable(table, isSelected);
            } else {
                this.drawRectangleTable(table, isSelected);
            }

            this.ctx.restore();
        });
    }

    drawRectangleTable(table, isSelected) {
        const w = table.width * SCALE;
        const h = table.height * SCALE;

        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(-w/2 + 3, -h/2 + 3, w, h);

        // Table top
        this.ctx.fillStyle = isSelected ? '#ffd54f' : '#8d6e63';
        this.ctx.strokeStyle = isSelected ? '#ff6f00' : '#5d4037';
        this.ctx.lineWidth = isSelected ? 3 : 2;
        this.ctx.fillRect(-w/2, -h/2, w, h);
        this.ctx.strokeRect(-w/2, -h/2, w, h);

        // Wood grain effect
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = -w/2; i < w/2; i += 10) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, -h/2);
            this.ctx.lineTo(i, h/2);
            this.ctx.stroke();
        }

        // Draw chairs
        this.drawChairs(table);

        // Label
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 10px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(table.type === 'banquet8' ? '8ft' : '6ft', 0, 0);
    }

    drawSerpentineTable(table, isSelected) {
        const outerRadius = table.width * SCALE;  // 6ft outer arc
        const innerRadius = (table.width - 2.5) * SCALE;  // Inner arc (2.5ft depth)

        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc(3, 3, outerRadius, 0, Math.PI / 2);
        this.ctx.arc(3, 3, innerRadius, Math.PI / 2, 0, true);
        this.ctx.closePath();
        this.ctx.fill();

        // Table top (crescent/arc shape)
        this.ctx.fillStyle = isSelected ? '#ffd54f' : '#8d6e63';
        this.ctx.strokeStyle = isSelected ? '#ff6f00' : '#5d4037';
        this.ctx.lineWidth = isSelected ? 3 : 2;
        this.ctx.beginPath();
        // Draw outer arc
        this.ctx.arc(0, 0, outerRadius, 0, Math.PI / 2);
        // Draw inner arc in reverse
        this.ctx.arc(0, 0, innerRadius, Math.PI / 2, 0, true);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Curved grain effect
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        for (let r = innerRadius + 10; r < outerRadius; r += 15) {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, r, 0, Math.PI / 2);
            this.ctx.stroke();
        }

        // Label
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 9px Courier New';
        this.ctx.textAlign = 'center';
        const labelRadius = (outerRadius + innerRadius) / 2;
        this.ctx.fillText('SERP', labelRadius * 0.7, labelRadius * 0.7);
    }

    drawChairs(table) {
        const w = table.width * SCALE;
        const h = table.height * SCALE;
        const chairSize = 12;
        const chairOffset = 18;

        this.ctx.fillStyle = '#424242';
        this.ctx.strokeStyle = '#212121';
        this.ctx.lineWidth = 1;

        // Calculate chair positions based on table type
        const seatsPerSide = table.seats / 2;
        const spacing = w / (seatsPerSide + 1);

        // Chairs on top
        for (let i = 1; i <= seatsPerSide; i++) {
            const x = -w/2 + spacing * i;
            const y = -h/2 - chairOffset;
            this.ctx.fillRect(x - chairSize/2, y - chairSize/2, chairSize, chairSize);
            this.ctx.strokeRect(x - chairSize/2, y - chairSize/2, chairSize, chairSize);
        }

        // Chairs on bottom
        for (let i = 1; i <= seatsPerSide; i++) {
            const x = -w/2 + spacing * i;
            const y = h/2 + chairOffset;
            this.ctx.fillRect(x - chairSize/2, y - chairSize/2, chairSize, chairSize);
            this.ctx.strokeRect(x - chairSize/2, y - chairSize/2, chairSize, chairSize);
        }
    }

    drawMeasurements() {
        this.ctx.strokeStyle = '#999';
        this.ctx.fillStyle = '#666';
        this.ctx.font = '11px Courier New';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 3]);

        // 24ft above dais measurement (vertical)
        const daisTop = (this.venue.daisY - this.venue.daisRadius) * SCALE;
        this.drawDimensionLine(this.venue.daisX * SCALE, 0, this.venue.daisX * SCALE, daisTop, '24ft', 'vertical');

        // 18ft below dais measurement (vertical)
        const daisBottom = (this.venue.daisY + this.venue.daisRadius) * SCALE;
        this.drawDimensionLine(this.venue.daisX * SCALE, daisBottom, this.venue.daisX * SCALE, this.venue.height * SCALE, '18ft', 'vertical');

        this.ctx.setLineDash([]);
    }

    drawDimensionLine(x1, y1, x2, y2, label, orientation) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(midX - 25, midY - 8, 50, 16);
        this.ctx.fillStyle = '#666';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(label, midX, midY + 4);
    }

    createProfessionalLayout() {
        // Clear existing tables
        this.tables = [];

        // Randomly select a layout strategy
        const strategies = [
            this.createTheaterLayout.bind(this),
            this.createCircularLayout.bind(this),
            this.createAsymmetricLayout.bind(this),
            this.createClusteredLayout.bind(this),
            this.createUShapeLayout.bind(this)
        ];

        const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
        randomStrategy();

        this.selectedTable = null;
        this.render();
        this.updateStats();
        this.saveLayout();
    }

    createTheaterLayout() {
        // Theater-style rows facing the dais
        const daisBottomY = this.venue.daisY + this.venue.daisRadius + 4;
        const tableTypes = ['banquet8', 'banquet6'];

        // Row 1: Front premium seating
        const row1Y = daisBottomY + 2;
        this.addTable('banquet8', 10, row1Y, 0);
        this.addTable('banquet8', 24, row1Y, 0);
        this.addTable('banquet8', 38, row1Y, 0);

        // Row 2: Mid section
        const row2Y = row1Y + 7;
        this.addTable('banquet6', 8, row2Y, 0);
        this.addTable('banquet6', 20, row2Y, 0);
        this.addTable('banquet6', 32, row2Y, 0);
        this.addTable('banquet6', 44, row2Y, 0);

        // Row 3: Back section
        const row3Y = row2Y + 6;
        this.addTable('banquet6', 12, row3Y, 0);
        this.addTable('banquet6', 24, row3Y, 0);
        this.addTable('banquet6', 36, row3Y, 0);

        // Add serpentines for flair
        this.addTable('serpentine', 54, row1Y, 270);
        this.addTable('serpentine', 6, 30, 0);
    }

    createCircularLayout() {
        // Circular arrangement around the dais
        const centerX = this.venue.daisX;
        const centerY = this.venue.daisY;
        const baseRadius = this.venue.daisRadius + 8;

        // Create semi-circle below dais
        const numTables = 8;
        const startAngle = Math.PI * 0.3; // Start from lower-left
        const endAngle = Math.PI * 0.7;   // End at lower-right
        const angleStep = (endAngle - startAngle) / (numTables - 1);

        for (let i = 0; i < numTables; i++) {
            const angle = startAngle + (i * angleStep);
            const radius = baseRadius + Math.random() * 3;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const tableType = Math.random() > 0.6 ? 'banquet8' : 'banquet6';
            // Rotate tables to face the dais
            const rotation = Math.floor(Math.random() * 4) * 90;
            this.addTable(tableType, x, y, rotation);
        }

        // Add serpentines on the sides
        this.addTable('serpentine', 8, centerY, 0);
        this.addTable('serpentine', 48, centerY - 8, 270);

        // Add tables above dais
        this.addTable('banquet6', 12, 18, 0);
        this.addTable('banquet6', 36, 18, 0);
        this.addTable('banquet6', 24, 10, 0);
    }

    createAsymmetricLayout() {
        // Creative asymmetric layout with intentional imbalance
        const daisBottomY = this.venue.daisY + this.venue.daisRadius + 4;

        // Heavy left cluster
        this.addTable('banquet8', 10, daisBottomY + 2, 0);
        this.addTable('banquet8', 10, daisBottomY + 9, 0);
        this.addTable('banquet6', 18, daisBottomY + 5.5, 0);

        // Lighter right scatter
        this.addTable('banquet6', 38, daisBottomY + 1, 0);
        this.addTable('banquet6', 38, daisBottomY + 7, 0);
        this.addTable('banquet6', 45, daisBottomY + 11, 0);

        // Center feature
        this.addTable('serpentine', 24, daisBottomY + 8, Math.floor(Math.random() * 4) * 90);

        // Upper area
        this.addTable('banquet6', 15, 20, 0);
        this.addTable('banquet8', 35, 20, 0);
        this.addTable('banquet6', 24, 12, 0);

        // Side accents
        this.addTable('serpentine', 8, 35, 0);
        this.addTable('banquet6', 52, 30, 90);
    }

    createClusteredLayout() {
        // Small intimate clusters throughout
        const daisBottomY = this.venue.daisY + this.venue.daisRadius + 4;

        // Front cluster - premium seating
        this.addTable('banquet8', 14, daisBottomY + 3, 0);
        this.addTable('banquet8', 34, daisBottomY + 3, 0);
        this.addTable('serpentine', 24, daisBottomY + 2, 180);

        // Left cluster
        this.addTable('banquet6', 9, daisBottomY + 10, 0);
        this.addTable('banquet6', 9, daisBottomY + 16, 0);
        this.addTable('banquet6', 16, daisBottomY + 13, 90);

        // Right cluster
        this.addTable('banquet6', 39, daisBottomY + 10, 0);
        this.addTable('banquet6', 39, daisBottomY + 16, 0);
        this.addTable('banquet6', 46, daisBottomY + 13, 270);

        // Center back cluster
        this.addTable('banquet6', 20, 62, 0);
        this.addTable('banquet6', 28, 62, 0);

        // Upper clusters
        this.addTable('banquet6', 12, 20, 0);
        this.addTable('banquet6', 36, 20, 0);
        this.addTable('serpentine', 24, 10, Math.floor(Math.random() * 4) * 90);
    }

    createUShapeLayout() {
        // U-shaped arrangement embracing the dais
        const daisBottomY = this.venue.daisY + this.venue.daisRadius + 4;
        const daisTopY = this.venue.daisY - this.venue.daisRadius - 4;

        // Bottom of U - front tables
        this.addTable('banquet8', 12, daisBottomY + 2, 0);
        this.addTable('banquet8', 24, daisBottomY + 2, 0);
        this.addTable('banquet8', 36, daisBottomY + 2, 0);

        // Left arm of U
        this.addTable('banquet6', 8, daisBottomY - 2, 90);
        this.addTable('banquet6', 8, this.venue.daisY, 90);
        this.addTable('banquet6', 8, daisTopY + 2, 90);

        // Right arm of U
        this.addTable('banquet6', 40, daisBottomY - 2, 270);
        this.addTable('banquet6', 40, this.venue.daisY, 270);
        this.addTable('banquet6', 40, daisTopY + 2, 270);

        // Top of U - tables above dais
        this.addTable('banquet6', 14, 18, 0);
        this.addTable('banquet6', 34, 18, 0);

        // Inner details
        this.addTable('serpentine', 18, daisBottomY + 8, 180);
        this.addTable('serpentine', 30, daisBottomY + 8, 270);

        // Outer accents
        this.addTable('banquet6', 24, 64, 0);
        this.addTable('banquet6', 24, 10, 0);
    }

    drawZoomIndicator() {
        // Draw zoom level in bottom-right corner
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(this.canvas.width - 100, this.canvas.height - 40, 90, 30);

        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`Zoom: ${Math.round(this.zoom * 100)}%`, this.canvas.width - 55, this.canvas.height - 25);
        this.ctx.restore();
    }

    updateStats() {
        const totalTables = this.tables.length;
        const totalSeats = this.tables.reduce((sum, table) => sum + table.seats, 0);

        document.getElementById('tableCount').textContent = totalTables;
        document.getElementById('seatCount').textContent = totalSeats;
    }

    exportAsImage() {
        // Temporarily deselect to export clean image
        const wasSelected = this.selectedTable;
        this.selectedTable = null;
        this.render();

        // Create download link
        const link = document.createElement('a');
        link.download = 'wedding-venue-layout.png';
        link.href = this.canvas.toDataURL('image/png');
        link.click();

        // Restore selection
        this.selectedTable = wasSelected;
        this.render();

        // Show feedback
        const button = document.getElementById('exportImage');
        const originalText = button.textContent;
        button.textContent = '✅ Exported!';
        button.style.background = '#4caf50';
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }
}

// Initialize the simulator when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const simulator = new VenueSimulator('venueCanvas');

    // Optional: Load professional layout by default
    // simulator.createProfessionalLayout();
});
