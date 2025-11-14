# Kitchen Studio - Usage Guide

## 🚀 Quick Start

Application đang chạy tại: **http://localhost:5174**

## 📐 2D Floor Plan Editor

### Các công cụ vẽ (Left Sidebar):

#### 1. **Select Tool** (Chọn)
- Click để chọn wall, door, hoặc window
- Properties hiển thị ở Right Panel
- Drag endpoints để thay đổi vị trí wall

#### 2. **Wall Tool** (Vẽ tường)
- **Cách sử dụng:**
  1. Click vào Left Sidebar → chọn "Wall" button
  2. Click trên canvas để đặt điểm bắt đầu
  3. Di chuyển chuột để xem preview
  4. Click lần nữa để hoàn thành wall
- **Tính năng:**
  - Real-time preview với distance label
  - Snap to grid (có thể bật/tắt)
  - Default thickness: 20cm, height: 240cm
- **Chỉnh sửa:**
  - Click vào wall để select
  - Drag 2 endpoints (chấm xanh) để thay đổi vị trí
  - Edit properties ở Right Panel

#### 3. **Door Tool** (Thêm cửa)
- **Hiện tại:** UI đã sẵn sàng, logic placement đang phát triển
- **Sẽ có:** Click vào wall để đặt door

#### 4. **Window Tool** (Thêm cửa sổ)
- **Hiện tại:** UI đã sẵn sàng, logic placement đang phát triển
- **Sẽ có:** Click vào wall để đặt window

#### 5. **Measure Tool** (Đo khoảng cách)
- Click 2 điểm để đo khoảng cách
- Hiển thị distance và coordinates

#### 6. **Pan Tool** (Di chuyển view)
- Drag để di chuyển canvas
- Hoặc giữ Space bar (sắp có)

---

### Canvas Controls:

#### **Zoom:**
- **Scroll chuột lên**: Zoom in
- **Scroll chuột xuống**: Zoom out
- **Zoom level** hiển thị ở góc phải trên (ví dụ: 100%)

#### **Grid:**
- Bật/tắt từ Bottom Toolbar
- Click icon **Grid** để toggle
- Có thể thay đổi grid size: 5cm, 10cm, 25cm, 50cm, 100cm

#### **Snap to Grid:**
- Bật/tắt từ Bottom Toolbar
- Click icon **Magnet** để toggle
- Khi bật, các điểm sẽ tự động snap vào grid

---

### Bottom Toolbar:

- **Grid** button: Bật/tắt grid
- **Snap** button: Bật/tắt snap to grid
- **Grid Size** dropdown: Chọn kích thước ô grid
- **Measurements** button: Hiển thị/ẩn kích thước
- **Unit** dropdown: Chọn đơn vị (mm, cm, m, inch, ft)
- **Coordinate display**: Hiển thị vị trí chuột (X, Y)
- **Zoom display**: Hiển thị zoom level

---

### Top Navbar:

#### **View Mode:**
- **2D Floor Plan**: Chế độ vẽ 2D
- **3D View**: Chế độ xem 3D (đang phát triển)

#### **Actions:**
- **Undo** (Ctrl+Z): Hoàn tác
- **Redo** (Ctrl+Y): Làm lại
- **New**: Tạo project mới
- **Save** (Ctrl+S): Lưu project vào LocalStorage
- **Load**: Load project từ LocalStorage
- **Export**: Export dưới dạng JSON, PNG, PDF, hoặc GLB

---

### Right Panel (Properties):

Khi select một wall/door/window, panel bên phải hiển thị:

#### **Wall Properties:**
- Name
- Thickness (cm)
- Height (cm)
- Start Point (X, Y)
- End Point (X, Y)
- Delete button

#### **Door Properties** (khi có door):
- Name
- Door Type (Single, Double, Sliding, Bifold, Pocket)
- Width, Height
- Swing Direction
- Delete button

#### **Window Properties** (khi có window):
- Name
- Window Type (Fixed, Casement, Sliding, etc.)
- Width, Height
- Sill Height
- Delete button

---

## ⌨️ Keyboard Shortcuts

- **Esc**: Cancel drawing
- **Ctrl+Z**: Undo
- **Ctrl+Y** / **Ctrl+Shift+Z**: Redo
- **Ctrl+S**: Save project
- **Delete**: Xóa selected item (sắp có)
- **Space**: Pan mode (sắp có)

---

## 🎨 3D Viewer (Đang phát triển)

Click button **3D View** ở top navbar để chuyển sang chế độ 3D.

**Sẽ có:**
- Render floor plan 2D thành 3D model
- Drag & drop furniture từ library
- Material editor
- Lighting controls
- Camera controls (orbit, pan, zoom)

---

## 💾 Save & Load

### **Auto-save:**
- Project tự động save vào LocalStorage mỗi khi có thay đổi (qua Zustand persist)

### **Manual save:**
- Click **Save** button ở top navbar
- Hoặc nhấn **Ctrl+S**

### **Load project:**
- Click **Load** button
- Chọn project từ danh sách

### **Export:**
- **JSON**: Floor plan data
- **PNG**: Screenshot của canvas
- **PDF**: Report với floor plan và measurements
- **GLB** (3D mode): 3D model file

---

## 🐛 Known Issues & Limitations

### **Đã hoàn thành:**
✅ Layout cơ bản với Bootstrap
✅ 2D Canvas với React-Konva
✅ Grid & Snap to Grid
✅ Wall Tool - vẽ và edit walls
✅ Wall selection & dragging endpoints
✅ Properties panel
✅ Zoom & Pan
✅ Undo/Redo
✅ Save/Load to LocalStorage

### **Đang phát triển:**
⏳ Door Tool - click to place logic
⏳ Window Tool - click to place logic
⏳ Select Tool - move, rotate, delete
⏳ Multi-selection
⏳ Copy/Paste
⏳ Context menu (right-click)
⏳ 3D Viewer với React Three Fiber
⏳ Furniture library & drag-drop
⏳ Material editor
⏳ Export to PNG/PDF/GLB

---

## 🏗️ Architecture

### **Tech Stack:**
- **React 19** + **TypeScript**
- **React-Konva** (2D Canvas)
- **React Three Fiber** + **@react-three/drei** (3D - sắp có)
- **Zustand** + **Immer** (State Management)
- **Bootstrap 5.3** + **React-Bootstrap** (UI)
- **SCSS** (Styling)

### **Project Structure:**
```
src/
├── components/
│   ├── layout/          # Layout components
│   ├── 2d-editor/       # 2D Canvas components
│   └── 3d-viewer/       # 3D components (sắp có)
├── stores/              # Zustand stores
├── types/               # TypeScript types
├── styles/              # SCSS files
├── utils/               # Utility functions
└── constants/           # Configuration constants
```

---

## 📝 Next Steps

1. **Implement Door/Window placement** - Click vào wall để đặt
2. **Select Tool improvements** - Move, rotate, delete
3. **3D Viewer** - Convert 2D → 3D
4. **Furniture Library** - Drag & drop objects
5. **Material Editor** - Change colors, textures
6. **Export features** - PNG, PDF, GLB

---

## 🤝 Contributing

Để thêm features mới, tham khảo:
- **Types**: `src/types/`
- **Stores**: `src/stores/`
- **Components**: `src/components/`

Tất cả đều có TypeScript types đầy đủ và JSDoc comments.
