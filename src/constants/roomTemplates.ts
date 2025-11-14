/**
 * Room Template Presets - IKEA style kitchen layouts
 */

export interface RoomTemplate {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  descriptionVi: string;
  icon: string;
  walls: Array<{
    start: { x: number; y: number };
    end: { x: number; y: number };
    thickness: number;
    height: number;
  }>;
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
}

/**
 * All available room templates
 */
export const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: 'square',
    name: 'Square Kitchen',
    nameVi: 'Bếp Vuông',
    description: 'Simple square room with 4 walls',
    descriptionVi: 'Phòng vuông đơn giản với 4 bức tường',
    icon: '⬜',
    dimensions: {
      width: 400,
      length: 400,
      height: 240
    },
    walls: [
      // Top wall
      { start: { x: 0, y: 0 }, end: { x: 400, y: 0 }, thickness: 20, height: 240 },
      // Right wall
      { start: { x: 400, y: 0 }, end: { x: 400, y: 400 }, thickness: 20, height: 240 },
      // Bottom wall
      { start: { x: 400, y: 400 }, end: { x: 0, y: 400 }, thickness: 20, height: 240 },
      // Left wall
      { start: { x: 0, y: 400 }, end: { x: 0, y: 0 }, thickness: 20, height: 240 }
    ]
  },

  {
    id: 'rectangle',
    name: 'Rectangle Kitchen',
    nameVi: 'Bếp Chữ Nhật',
    description: 'Rectangular room - wider layout',
    descriptionVi: 'Phòng chữ nhật - bố trí rộng hơn',
    icon: '▭',
    dimensions: {
      width: 500,
      length: 350,
      height: 240
    },
    walls: [
      { start: { x: 0, y: 0 }, end: { x: 500, y: 0 }, thickness: 20, height: 240 },
      { start: { x: 500, y: 0 }, end: { x: 500, y: 350 }, thickness: 20, height: 240 },
      { start: { x: 500, y: 350 }, end: { x: 0, y: 350 }, thickness: 20, height: 240 },
      { start: { x: 0, y: 350 }, end: { x: 0, y: 0 }, thickness: 20, height: 240 }
    ]
  },

  {
    id: 'l-shape',
    name: 'L-Shape Kitchen',
    nameVi: 'Bếp Chữ L',
    description: 'L-shaped layout - missing top-right corner',
    descriptionVi: 'Bếp chữ L - thiếu góc trên bên phải',
    icon: '╔',
    dimensions: {
      width: 500,
      length: 500,
      height: 240
    },
    walls: [
      // Top-left wall (shorter)
      { start: { x: 0, y: 0 }, end: { x: 250, y: 0 }, thickness: 20, height: 240 },
      // Right wall (full height)
      { start: { x: 500, y: 250 }, end: { x: 500, y: 500 }, thickness: 20, height: 240 },
      // Bottom wall (full width)
      { start: { x: 500, y: 500 }, end: { x: 0, y: 500 }, thickness: 20, height: 240 },
      // Left wall (full height)
      { start: { x: 0, y: 500 }, end: { x: 0, y: 0 }, thickness: 20, height: 240 },
      // Inner corner wall (vertical)
      { start: { x: 250, y: 0 }, end: { x: 250, y: 250 }, thickness: 20, height: 240 },
      // Inner corner wall (horizontal)
      { start: { x: 250, y: 250 }, end: { x: 500, y: 250 }, thickness: 20, height: 240 }
    ]
  },

  {
    id: 'u-shape',
    name: 'U-Shape Kitchen',
    nameVi: 'Bếp Chữ U',
    description: 'U-shaped layout - open on one side',
    descriptionVi: 'Bếp chữ U - mở một phía',
    icon: '⊔',
    dimensions: {
      width: 500,
      length: 400,
      height: 240
    },
    walls: [
      // Top wall
      { start: { x: 0, y: 0 }, end: { x: 500, y: 0 }, thickness: 20, height: 240 },
      // Right wall
      { start: { x: 500, y: 0 }, end: { x: 500, y: 400 }, thickness: 20, height: 240 },
      // Bottom wall
      { start: { x: 500, y: 400 }, end: { x: 0, y: 400 }, thickness: 20, height: 240 },
      // Left wall
      { start: { x: 0, y: 400 }, end: { x: 0, y: 0 }, thickness: 20, height: 240 }
      // Note: U-shape is actually same as square, difference is in furniture placement
      // User will remove one wall manually or we can offer "open side" variant
    ]
  },

  {
    id: 'galley',
    name: 'Galley Kitchen',
    nameVi: 'Bếp Hành Lang',
    description: 'Two parallel walls - corridor style',
    descriptionVi: 'Hai tường song song - kiểu hành lang',
    icon: '║',
    dimensions: {
      width: 500,
      length: 250,
      height: 240
    },
    walls: [
      // Top wall (long)
      { start: { x: 0, y: 0 }, end: { x: 500, y: 0 }, thickness: 20, height: 240 },
      // Bottom wall (long)
      { start: { x: 500, y: 250 }, end: { x: 0, y: 250 }, thickness: 20, height: 240 }
      // Note: Only 2 walls for galley kitchen
    ]
  },

  {
    id: 'one-wall',
    name: 'Single Wall Kitchen',
    nameVi: 'Bếp Một Tường',
    description: 'Everything along one wall',
    descriptionVi: 'Tất cả dọc theo một bức tường',
    icon: '─',
    dimensions: {
      width: 500,
      length: 100,
      height: 240
    },
    walls: [
      // Single long wall
      { start: { x: 0, y: 0 }, end: { x: 500, y: 0 }, thickness: 20, height: 240 }
    ]
  }
];
