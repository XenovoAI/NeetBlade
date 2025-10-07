# NEET Blade Design Guidelines

## Design Approach
**Selected Approach**: Custom Clean Educational Platform with Material Design influences
- Clean, minimal interface prioritizing content accessibility and functionality
- Educational platform aesthetic that builds trust and professionalism
- Focus on clarity, readability, and efficient information hierarchy

## Core Design Elements

### A. Color Palette

**Primary Colors:**
- Brand Orange: `#EA580C` (25 91% 53%) - Primary CTAs, accents, active states
- Dark Gray: `#1F2937` (220 26% 14%) - Primary text, headings
- Pure White: `#FFFFFF` - Backgrounds, cards

**Supporting Colors:**
- Light Gray: `#F9FAFB` (220 20% 97%) - Subtle backgrounds, section dividers
- Medium Gray: `#6B7280` (220 9% 46%) - Secondary text, labels
- Success Green: `#10B981` (160 84% 39%) - Test results, achievements
- Error Red: `#EF4444` (0 84% 60%) - Validation errors, urgent notifications

**Dark Mode** (if implemented):
- Background: `#111827` (220 39% 11%)
- Card background: `#1F2937`
- Text: `#F9FAFB`

### B. Typography

**Font Family**: Inter (via Google Fonts CDN)

**Font Scale:**
- Hero Heading: `text-5xl md:text-6xl font-bold` (48px/60px)
- Section Headings: `text-3xl md:text-4xl font-bold` (30px/36px)
- Subsection Headings: `text-2xl font-semibold` (24px)
- Card Titles: `text-xl font-semibold` (20px)
- Body Text: `text-base` (16px)
- Small Text: `text-sm` (14px)
- Captions: `text-xs` (12px)

**Line Heights:**
- Headings: `leading-tight` (1.25)
- Body: `leading-relaxed` (1.625)

### C. Layout System

**Spacing Units**: Use Tailwind units of 4, 6, 8, 12, 16, 20, 24
- Component padding: `p-4 md:p-6`
- Section padding: `py-12 md:py-16 lg:py-20`
- Card spacing: `space-y-4`
- Grid gaps: `gap-6 md:gap-8`

**Container Widths:**
- Max content width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Card sections: `max-w-6xl mx-auto`
- Text content: `max-w-3xl`

**Grid Systems:**
- Study Materials: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Features: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8`
- Two-column layouts: `grid grid-cols-1 lg:grid-cols-2 gap-8`

### D. Component Library

**Navigation Bar:**
- Sticky header: `sticky top-0 z-50 bg-white shadow-sm`
- Logo: Orange "NEET Blade" text with subtle icon
- Nav links: Gray text with orange underline on hover
- CTA buttons: Orange primary, outline secondary

**Buttons:**
- Primary: `bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors`
- Secondary: `border-2 border-orange-600 text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-lg font-medium transition-colors`
- On images: Add `backdrop-blur-sm bg-white/90` to outline buttons

**Cards:**
- Base: `bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6`
- Subject cards: Include colored top border (Physics: blue, Chemistry: green, Biology: purple)
- Test cards: Display metadata badges, progress indicators

**Forms:**
- Input fields: `border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500`
- Labels: `text-sm font-medium text-gray-700 mb-2`
- Error states: Red border with error message below

**Badges & Tags:**
- Difficulty levels: Colored badges (Easy: green, Medium: yellow, Hard: red)
- Subject tags: `bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm`

**Tables (Admin Panel):**
- Striped rows: `odd:bg-gray-50`
- Header: `bg-gray-100 font-semibold text-left`
- Hover: `hover:bg-gray-50`

### E. Animations

**Minimal, Purposeful Animations:**
- Button hover: Subtle color transitions (`transition-colors duration-200`)
- Card hover: Shadow elevation (`transition-shadow duration-300`)
- Modal/Toast: Slide in from top (`animate-slideDown`)
- Loading states: Spinner or skeleton screens
- NO autoplay carousels or distracting scroll effects

## Page-Specific Guidelines

### Homepage
**Hero Section** (80vh):
- Centered content with generous whitespace
- Large hero heading with orange accent word
- Include background pattern or subtle gradient (orange tint)
- Primary CTA prominent, secondary CTA below
- Optional: Abstract education-themed illustration (books, atoms, DNA) on the right

**Study Materials Preview:**
- Three-column grid showcasing Physics, Chemistry, Biology
- Each card with subject icon, name, chapter count, CTA button
- Hover effect: Lift shadow

**Live Test Series:**
- Tabbed interface with smooth transitions
- Test cards in 2-column layout on desktop
- Display timer icon, question count, difficulty badge

**Features Grid:**
- 3-column grid (2 on tablet, 1 on mobile)
- Icons using Heroicons (outline style)
- Brief descriptions under each feature

**Trust Section:**
- Logo carousel or grid
- Statistics: Large numbers with labels

### Study Materials Page
- Filter sidebar (left): Subject, Chapter, Difficulty
- Content grid (right): Material cards with preview, download, bookmark options
- Search bar at top with instant filtering

### Live Test Interface
- Fixed header: Test name, timer (red when < 5 min)
- Question navigation sidebar (numbered buttons showing answered/unanswered)
- Main area: Question, options (radio buttons), navigation buttons
- Submit confirmation modal

### Admin Dashboard
- Sidebar navigation (collapsible on mobile)
- Dashboard cards showing key metrics (users, tests, materials)
- Data tables with action buttons (edit, delete)
- Upload interface with drag-and-drop zone

## Images

**Hero Section Image:**
- Placement: Right side of hero (40% width on desktop)
- Type: Illustration or photo of students studying/medical preparation
- Style: Modern, clean, with orange accent colors
- Alternative: Abstract geometric pattern with education motifs

**Study Material Cards:**
- Subject icons: Simple, colorful icons representing each subject
- Use icon library (Heroicons) for consistency

**About Page:**
- Team photos (if applicable)
- Mission/vision supporting imagery

**General Imagery:**
- Avoid stock photos that look generic
- Use illustrations for abstract concepts
- Keep imagery minimal and purposeful

## Accessibility & Interaction States

**Focus States:**
- Orange ring: `focus:ring-2 focus:ring-orange-500 focus:ring-offset-2`
- Keyboard navigation clearly visible

**Loading States:**
- Skeleton screens for content loading
- Spinner for button actions
- Progress bars for file uploads

**Error Handling:**
- Toast notifications (top-right): Red for errors, green for success
- Inline validation messages below form fields

**Responsive Breakpoints:**
- Mobile: < 640px (single column layouts)
- Tablet: 640px - 1024px (2-column grids)
- Desktop: > 1024px (3-column grids, sidebar layouts)