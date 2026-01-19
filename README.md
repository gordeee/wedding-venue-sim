# 🎊 Wedding Venue Layout Simulator

An interactive, game-style wedding venue layout tool that lets you visualize and plan table arrangements for your special day!

## Features

- **Interactive Drag & Drop** - Move tables around with your mouse
- **Zoom & Pan Controls** - Mouse wheel zoom (30%-300%) and click-drag panning
- **Multiple Table Types** - 8ft banquet, 6ft banquet, and 6ft serpentine tables
- **Professional Layouts** - AI-generated optimal table arrangements
- **Real-time Stats** - Track table count and guest capacity
- **Game-Style Graphics** - Beautiful top-down 2D rendering inspired by simulation games
- **Venue Elements** - 25ft circular dais and 6 strategically placed trees

## Venue Specifications

Based on your venue diagram:
- **Dais**: 25ft diameter circular platform (main stage/focal point)
- **Trees**: 6 trees positioned around the venue
- **Dimensions**: 62ft × 67ft total space (24ft above dais, 25ft dais, 18ft below)
- **Available Tables**:
  - 8ft Banquet Tables (96" × 30") - seats 8
  - 6ft Banquet Tables (72" × 30") - seats 6
  - 6ft Serpentine Tables (quarter circle) - seats 4

## How to Use

### Getting Started

1. **Open the simulator**:
   ```bash
   # Simply open index.html in your web browser
   open index.html
   # Or use a local server (recommended):
   python3 -m http.server 8000
   # Then visit: http://localhost:8000
   ```

2. **Add Tables**: Click on table types in the left sidebar
3. **Move Tables**: Click and drag tables to reposition them
4. **Rotate Tables**: Double-click a table or select it and click "Rotate"
5. **Delete Tables**: Select a table and click "Delete Selected"

### Navigation Controls

🔍 **Zoom & Pan**:
- **Mouse Wheel**: Zoom in and out (30% to 300%)
- **Click & Drag**: Click on empty space and drag to pan the view
- **Click & Drag Tables**: Click directly on tables to select and move them
- Zoom intelligently centers on your mouse cursor position
- Current zoom level displayed in bottom-right corner

⌨️ **Keyboard Shortcuts**:
- **Arrow Keys**: Fine-tune selected table position (hold Shift for 0.5ft increments)
- **R**: Rotate selected table 90 degrees
- **Delete/Backspace**: Remove selected table
- **Esc**: Deselect current table

### Professional Layout

Click the "✨ Professional Layout" button to generate an optimized arrangement based on wedding planning best practices:

- **Sightlines** - All guests have clear views of the dais
- **Flow** - Wide aisles for easy movement and service
- **Spacing** - Proper clearance between tables (3-4ft)
- **Capacity** - Maximizes seating while maintaining comfort
- **Tree Avoidance** - Strategic placement to avoid sight obstructions

### Tips for Best Results

💡 **Layout Principles**:
- Keep 3-4ft between tables for guest and server movement
- Front tables are premium seating (family/VIPs)
- Create clear aisles to the dais
- Avoid placing tables directly behind trees
- Mix table types for visual interest

## Technical Details

- **Scale**: 1 foot = 20 pixels
- **Rendering**: HTML5 Canvas
- **Framework**: Vanilla JavaScript (no dependencies!)
- **Style**: Inspired by top-down farming/life simulation games

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Professional Layout Strategy

The built-in professional layout uses wedding planning expertise:

1. **Front Section**: Premium 8ft tables near dais
2. **Mid Sections**: Mixed table sizes for optimal flow
3. **Side Sections**: Serpentine tables for visual variety
4. **Back Section**: Additional seating with good sightlines
5. **Aisles**: 5ft main aisles for easy access

## Future Enhancements

Potential features to add:
- Save/load layouts
- Export to PDF
- Dance floor placement
- Head table configuration
- Guest list management
- Buffet/bar placement
- Lighting zones

## Credits

Created with love for beautiful wedding planning! 💒

Inspired by classic simulation games like Stardew Valley, Animal Crossing, and management sims.