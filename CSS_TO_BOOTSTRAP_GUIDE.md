# Hướng Dẫn Migrate CSS sang Bootstrap 5

## Nguyên tắc chung

**Chỉ dùng custom CSS khi:**
- Animations (`@keyframes`)
- Canvas/SVG-specific styles (Konva, Three.js)
- Pseudo-elements (`::before`, `::after`)
- Custom scrollbar (`::-webkit-scrollbar`)
- Hover states phức tạp không có trong Bootstrap

**Còn lại đều dùng Bootstrap 5 utilities!**

---

## 1. Utility Classes Migration

### ❌ Xóa những class này (đã có trong Bootstrap)

```scss
// BEFORE (Custom CSS)
.full-height {
  height: 100vh;
}
.full-width {
  width: 100%;
}
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.no-select {
  user-select: none;
}
.cursor-pointer {
  cursor: pointer;
}
.cursor-move {
  cursor: move;
}
```

```html
<!-- AFTER (Bootstrap 5) -->
<div class="vh-100">Full height</div>
<div class="w-100">Full width</div>
<div class="d-flex align-items-center justify-content-center">Flex center</div>
<div class="user-select-none">No select</div>
<div class="cursor-pointer">Cursor pointer</div>
<div class="cursor-move">Cursor move</div>
```

### ✅ Giữ lại những class này (không có trong Bootstrap)

```scss
.cursor-grab {
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
}

.cursor-crosshair {
  cursor: crosshair;
}
```

---

## 2. Layout Components Migration

### App Layout

```scss
// BEFORE (Custom CSS)
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
```

```html
<!-- AFTER (Bootstrap) -->
<div class="d-flex flex-column vh-100 overflow-hidden">
  <!-- App content -->
</div>
```

### Sidebar

```scss
// BEFORE
.app-sidebar {
  width: 250px;
  background: $light;
  border-right: 1px solid #dee2e6;
  overflow-y: auto;
  flex-shrink: 0;
}
```

```html
<!-- AFTER -->
<div class="bg-light border-end overflow-auto flex-shrink-0" style="width: 250px">
  <!-- Sidebar content -->
</div>
```

### Main Content

```scss
// BEFORE
.app-main {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: white;
}
```

```html
<!-- AFTER -->
<div class="flex-fill position-relative overflow-hidden bg-white">
  <!-- Main content -->
</div>
```

---

## 3. Components Migration

### Tool Button

```scss
// BEFORE
.tool-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ced4da;
  background: white;
  border-radius: 0.375rem;
}
```

```html
<!-- AFTER -->
<button class="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center"
        style="width: 40px; height: 40px">
  <i class="bi bi-pencil"></i>
</button>
```

### Properties Panel

```scss
// BEFORE
.properties-panel {
  padding: 1rem;

  .property-group {
    margin-bottom: 1.5rem;

    .property-label {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
  }
}
```

```html
<!-- AFTER -->
<div class="p-3">
  <div class="mb-4">
    <label class="form-label fw-semibold small mb-2">Property Label</label>
    <input class="form-control" />
  </div>
</div>
```

### Furniture Card

```scss
// BEFORE
.furniture-card {
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.5rem;
  padding: 0.5rem;
  background: white;
  cursor: grab;
}
```

```html
<!-- AFTER -->
<div class="card p-2 cursor-grab">
  <div class="w-100 bg-light rounded d-flex align-items-center justify-content-center mb-2"
       style="aspect-ratio: 1">
    <i class="bi bi-box fs-1 text-secondary"></i>
  </div>
  <div class="small text-center text-truncate">Chair</div>
</div>
```

---

## 4. Position & Display

### Absolute Positioning

```scss
// BEFORE
.canvas-controls {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
```

```html
<!-- AFTER -->
<div class="position-absolute bottom-0 end-0 d-flex flex-column gap-2 m-3">
  <!-- Controls -->
</div>
```

### Fixed Positioning

```scss
// BEFORE
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items-center;
  justify-content-center;
}
```

```html
<!-- AFTER -->
<div class="position-fixed top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center"
     style="background: rgba(0, 0, 0, 0.5)">
  <!-- Loading -->
</div>
```

---

## 5. Spacing & Sizing

### Padding & Margin

```scss
// BEFORE
padding: 1rem;           → p-3
padding: 0.5rem 1rem;    → px-3 py-2
margin-bottom: 1.5rem;   → mb-4
margin-top: 2rem;        → mt-4
gap: 0.5rem;             → gap-2
```

### Width & Height

```scss
// BEFORE
width: 100%;             → w-100
height: 100%;            → h-100
height: 100vh;           → vh-100
min-width: 300px;        → style="min-width: 300px" (không có utility)
aspect-ratio: 1;         → ratio ratio-1x1 (hoặc style)
```

---

## 6. Colors & Backgrounds

```scss
// BEFORE
background: white;       → bg-white
background: $light;      → bg-light
background: $primary;    → bg-primary
color: $dark;            → text-dark
color: $secondary;       → text-secondary
color: $danger;          → text-danger
```

---

## 7. Typography

```scss
// BEFORE
font-size: 0.875rem;     → small
font-weight: 600;        → fw-semibold
font-weight: 700;        → fw-bold
text-align: center;      → text-center
white-space: nowrap;     → text-nowrap
text-overflow: ellipsis; → text-truncate
font-family: monospace;  → font-monospace
```

---

## 8. Borders & Shadows

```scss
// BEFORE
border: 1px solid #dee2e6;       → border
border-top: 1px solid #dee2e6;   → border-top
border-radius: 0.375rem;         → rounded
border-radius: 0.25rem;          → rounded-1
border-radius: 0.5rem;           → rounded-2
box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075); → shadow-sm
```

---

## 9. Flexbox & Grid

```scss
// BEFORE
display: flex;                    → d-flex
flex-direction: column;           → flex-column
align-items: center;              → align-items-center
justify-content: center;          → justify-content-center
justify-content: space-between;   → justify-content-between
flex: 1;                          → flex-fill
flex-shrink: 0;                   → flex-shrink-0
flex-wrap: wrap;                  → flex-wrap
```

---

## 10. Visibility & Overflow

```scss
// BEFORE
overflow: hidden;        → overflow-hidden
overflow-y: auto;        → overflow-auto
overflow-x: hidden;      → overflow-x-hidden
display: none;           → d-none
visibility: hidden;      → invisible
opacity: 0.5;            → opacity-50
```

---

## 11. Canvas/3D Specific (GIỮ LẠI CSS)

**Những phần này KHÔNG THỂ dùng Bootstrap, phải giữ CSS:**

```scss
// SVG/Konva styles
.wall-element {
  stroke: $wall-color;
  stroke-width: 2;
  fill: none;
  cursor: pointer;
  transition: stroke 0.2s ease;
}

// Canvas container
.canvas-2d-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: $canvas-bg;

  &.tool-wall {
    cursor: crosshair;
  }
}

// 3D Canvas
.canvas-3d-container {
  width: 100%;
  height: 100%;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  canvas {
    display: block;
    outline: none;
  }
}

// Animations
@keyframes screenshot-flash {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

// Pseudo-elements
.measurement-3d::after {
  content: '';
  position: absolute;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid rgba(0, 0, 0, 0.8);
}
```

---

## 12. Responsive Classes

```scss
// BEFORE
@media (max-width: 768px) {
  .app-sidebar {
    width: 280px;
  }
}
```

```html
<!-- AFTER -->
<div class="w-100 w-md-auto" style="--bs-width: 280px">
  <!-- hoặc -->
</div>

<!-- Display utilities -->
<div class="d-none d-md-block">Hidden on mobile</div>
<div class="d-md-none">Only on mobile</div>
```

---

## 13. Ví dụ Component hoàn chỉnh

### BEFORE (Custom CSS)

```tsx
// Component
<div className="furniture-library">
  <div className="furniture-category">
    <div className="category-title">
      <i className="bi bi-box"></i>
      Cabinets
    </div>
    <div className="furniture-grid">
      <div className="furniture-card">
        <div className="furniture-thumbnail">
          <i className="bi bi-archive"></i>
        </div>
        <div className="furniture-name">Base Cabinet</div>
      </div>
    </div>
  </div>
</div>
```

```scss
// SCSS
.furniture-library {
  padding: 1rem;

  .furniture-category {
    margin-bottom: 1.5rem;

    .category-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }
}
```

### AFTER (Bootstrap 5)

```tsx
<div className="p-3">
  <div className="mb-4">
    <div className="d-flex align-items-center gap-2 fw-semibold mb-3">
      <i className="bi bi-box"></i>
      Cabinets
    </div>
    <div className="row g-3">
      <div className="col-6 col-md-4 col-lg-3">
        <div className="card p-2 cursor-grab">
          <div className="w-100 bg-light rounded d-flex align-items-center justify-content-center mb-2"
               style="aspect-ratio: 1">
            <i className="bi bi-archive fs-1 text-secondary"></i>
          </div>
          <div className="small text-center text-truncate">Base Cabinet</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**→ Xóa toàn bộ SCSS! Chỉ dùng Bootstrap utilities!**

---

## 14. Checklist Migration

- [ ] Xóa utility classes trong `main.scss` (height, width, flex, cursor...)
- [ ] Replace layout classes bằng Bootstrap utilities
- [ ] Update components: buttons, cards, forms
- [ ] Giữ lại SVG/Canvas/3D styles
- [ ] Giữ lại animations & pseudo-elements
- [ ] Giữ lại custom scrollbar
- [ ] Test responsive trên mobile
- [ ] Remove unused SCSS files

---

## 15. Bootstrap 5 Cheat Sheet

| CSS Property | Bootstrap Class |
|---|---|
| `display: flex` | `d-flex` |
| `flex-direction: column` | `flex-column` |
| `align-items: center` | `align-items-center` |
| `justify-content: between` | `justify-content-between` |
| `padding: 1rem` | `p-3` |
| `margin-bottom: 1rem` | `mb-3` |
| `width: 100%` | `w-100` |
| `height: 100vh` | `vh-100` |
| `background: white` | `bg-white` |
| `color: #6c757d` | `text-secondary` |
| `font-weight: 600` | `fw-semibold` |
| `text-align: center` | `text-center` |
| `border-radius: 0.375rem` | `rounded` |
| `box-shadow: small` | `shadow-sm` |
| `position: absolute` | `position-absolute` |
| `top: 0` | `top-0` |
| `cursor: pointer` | `cursor-pointer` |

**Link docs:** https://getbootstrap.com/docs/5.3/utilities/

---

Làm từng bước, test kỹ sau mỗi migration! 🚀
