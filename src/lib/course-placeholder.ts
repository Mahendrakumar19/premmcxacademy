// Generates placeholder course images with course name and colors
export function generateCourseImagePlaceholder(courseName: string, courseId: number): string {
  // SVG placeholder with course name
  const colors = [
    '#0066CC', // Blue
    '#7B2CBF', // Purple
    '#E63946', // Red
    '#FF7B54', // Orange
    '#06D6A0', // Green
    '#118AB2', // Teal
    '#073B4C', // Dark Teal
    '#F4A261', // Gold
    '#E76F51', // Rust
    '#264653', // Dark Blue
  ];

  // Use course ID to consistently select color for same course
  const colorIndex = courseId % colors.length;
  const bgColor = colors[colorIndex];

  // Get initials or first few letters
  const title = courseName.substring(0, 3).toUpperCase();

  // Create SVG
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <!-- Gradient background -->
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${shadeColor(bgColor, -0.3)};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="300" fill="url(#grad)"/>
      
      <!-- Decorative shapes -->
      <circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.1)"/>
      <circle cx="350" cy="250" r="50" fill="rgba(255,255,255,0.1)"/>
      <rect x="150" y="80" width="100" height="100" fill="rgba(255,255,255,0.05)" rx="10"/>
      
      <!-- Title text -->
      <text x="200" y="140" font-size="48" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">
        ${title}
      </text>
      
      <!-- Course name (smaller) -->
      <text x="200" y="200" font-size="16" fill="rgba(255,255,255,0.9)" text-anchor="middle" font-family="Arial, sans-serif" word-spacing="5">
        ${courseName.substring(0, 30)}
      </text>
    </svg>
  `;

  // Convert SVG to data URL
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Helper function to shade colors
function shadeColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
}
