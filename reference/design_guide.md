# Waypoint Design Guide

This document codifies the design choices and patterns used throughout the Waypoint application. It serves as a reference for maintaining visual consistency and implementing new features.

## Design Philosophy

Waypoint follows a **"Stripe-like" aesthetic**—clean, professional, and visually polished. The design emphasizes:

- **Clarity over decoration**: Information hierarchy is clear and purposeful
- **Subtle sophistication**: Professional dark theme with carefully chosen accents
- **Smooth interactions**: Animations and transitions that feel "expensive" and polished
- **Accessibility first**: High contrast, readable typography, and keyboard navigation

---

## Visual Design System

### Color Palette

The application uses a **dark theme** as the default, with a deep navy-blue foundation and vibrant blue accents.

#### Primary Colors
- **Background**: `hsl(222, 47%, 11%)` - Deep navy-blue dark
- **Foreground**: `hsl(213, 31%, 91%)` - Soft off-white text
- **Card**: `hsl(222, 47%, 13%)` - Slightly lighter than background for depth
- **Primary**: `hsl(217, 91%, 60%)` - Vibrant blue accent for CTAs and highlights
- **Secondary**: `hsl(217, 33%, 17%)` - Dark blue-gray for secondary elements
- **Muted**: `hsl(217, 33%, 17%)` with foreground at `hsl(215, 20%, 65%)` - Softer gray for less important text
- **Border**: `hsl(217, 33%, 20%)` - Subtle borders that don't overpower
- **Destructive**: `hsl(0, 84%, 60%)` - Red for errors and destructive actions

#### Semantic Colors
- **Success**: Green variants (e.g., `text-green-600` for validation states)
- **Error**: Red variants (destructive color)
- **Warning**: Yellow/amber variants (when needed)
- **Info**: Primary blue

### Typography

#### Font Families
- **Primary (UI)**: IBM Plex Sans Light (`--font-sans`) - Clean, modern sans-serif with light weight (300) for all UI text
- **Monospace (Data)**: JetBrains Mono (`--font-mono`) - For code, JSON, data tables, and technical content

#### Font Features
- **Ligatures**: Enabled (`rlig`, `calt`) for better typography
- **Antialiasing**: Enabled for smooth text rendering
- **Display**: `swap` for optimal font loading

#### Type Scale
- **Page Title**: `text-4xl font-bold` with gradient text effect
- **Section Title**: `text-2xl font-semibold`
- **Card Title**: `text-lg font-semibold`
- **Body**: `text-sm` or `text-base` (default)
- **Small Text**: `text-xs` for metadata, timestamps, version numbers
- **Mono Text**: Applied to code blocks, data tables, technical IDs

#### Text Effects
- **Gradient Text**: Used for main page headings
  ```tsx
  className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
  ```

### Spacing & Layout

#### Container
- **Max Width**: Container centers content with `2rem` padding
- **Breakpoint**: `1400px` for 2xl screens
- **Page Padding**: `px-4 py-8` for main content areas

#### Grid System
- **Split Screen**: `grid-cols-1 lg:grid-cols-2` for two-column layouts (e.g., Composer)
- **Card Grid**: `grid-cols-1 md:grid-cols-2` or `md:grid-cols-3` for card collections
- **Gap**: `gap-4` or `gap-6` between grid items

#### Border Radius
- **Default**: `0.75rem` (12px) - Slightly more rounded for modern feel
- **Small**: `calc(var(--radius) - 4px)`
- **Medium**: `calc(var(--radius) - 2px)`
- **Large**: `var(--radius)`

---

## Component Patterns

### Cards

Cards are the primary container for content sections.

**Structure:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Usage:**
- Group related content
- Create visual separation between sections
- Use consistent padding and spacing

### Buttons

**Primary Button**: High contrast, used for main actions (e.g., "SIGN & PUBLISH")
- Size: `lg` for primary actions, `sm` for secondary
- State: Disabled state with reduced opacity

**Outline Button**: For secondary actions
- Variant: `outline`
- Used for downloads, template links, etc.

### Navigation

**Navbar Pattern:**
- **Position**: Sticky top (`sticky top-0 z-50`)
- **Background**: `bg-card/50 backdrop-blur-sm` for glassmorphism effect
- **Border**: `border-b border-border/40` for subtle separation
- **Links**: Hover effect with animated underline
  ```tsx
  className="hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
  ```

**Navigation Links:**
- Role-based visibility (only show relevant links per persona)
- Active state indication
- Smooth hover transitions

### Badges

Used for status indicators, organization names, and metadata.

**Variants:**
- `outline` - For organization names, tags
- `default` - For status indicators (when needed)
- Color-coded for status (e.g., green for active, yellow for pending)

### Tables

**Data Tables:**
- **Font**: Monospace for data consistency
- **Border**: Subtle borders between rows
- **Header**: Bold, left-aligned
- **Scrollable**: Horizontal scroll for wide tables
- **Pagination**: Show "first 10 of X" for large datasets

**Table Pattern:**
```tsx
<div className="overflow-x-auto">
  <table className="w-full text-sm border-collapse">
    <thead>
      <tr className="border-b">
        <th className="text-left p-2 font-semibold">Header</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b">
        <td className="p-2">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Forms

**Input Fields:**
- **Label**: Above input with `space-y-2` container
- **Input**: Full width, consistent padding
- **Disabled State**: Visual indication for read-only fields
- **Validation**: Green checkmark or red X icon with status text

**Select Dropdowns:**
- Use shadcn/ui Select component
- Consistent styling with inputs
- Disabled state when dependent on other selections

**Textarea:**
- **Code/Data**: Use `font-mono text-sm` for technical content
- **Height**: `min-h-[300px]` for data input areas

### Tabs

**Pattern:**
- Two-column grid for tab list (`grid-cols-2`)
- Full width tabs
- Clear active state
- Used for switching input modes (e.g., Smart Paste vs Raw JSON)

---

## Layout Patterns

### Page Structure

**Standard Page Layout:**
```tsx
<div className="container mx-auto px-4 py-8">
  {/* Page Header with Animation */}
  <motion.div 
    className="mb-8"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
      Page Title
    </h1>
    <p className="text-muted-foreground text-lg">Description</p>
  </motion.div>

  {/* Main Content */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Content Cards */}
  </div>
</div>
```

### Split Screen Layout

Used in the Composer for input/preview split:
- **Left**: Input/editing area
- **Right**: Preview/validation area
- **Responsive**: Stacks on mobile (`grid-cols-1 lg:grid-cols-2`)

### Feed Layout

Used in the Ledger for chronological data feed:
- **Style**: Twitter/newsfeed style
- **Items**: Card-based with expand/collapse
- **Metadata**: Top line with badges and timestamps
- **Actions**: Expandable details view

### Dashboard Layout

Used in Admin console:
- **Metrics**: Live ticker, health indicators
- **Tables**: Searchable, filterable data tables
- **Tabs**: For switching between views (Organizations, Users)

---

## Interaction Patterns

### Animations

**Framer Motion** is used for smooth, polished animations.

**Page Entry:**
```tsx
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
```

**Available Animations** (defined in `tailwind.config.ts`):
- `fade-in`: `0.5s ease-out`
- `slide-up`: `0.4s ease-out`
- `slide-down`: `0.4s ease-out`
- `scale-in`: `0.2s ease-out`

**Principles:**
- Keep animations subtle and purposeful
- Use for page transitions, card appearances, and state changes
- Avoid excessive motion that distracts from content

### Hover States

**Links:**
- Color change to primary
- Animated underline (width transition)

**Buttons:**
- Slight opacity change or color shift
- Smooth transitions (`transition-colors`)

**Cards:**
- Subtle elevation or border color change (when interactive)

### Loading States

**Button Loading:**
- Disabled state with loading text (e.g., "Publishing...")
- Prevent multiple submissions

**Data Loading:**
- Show skeleton or placeholder
- Display "No data" state when empty

### Status Indicators

**Validation States:**
- **Valid**: Green checkmark icon + "Valid JSON" text
- **Invalid**: Red X icon + "Syntax Error" text
- **Neutral**: No indicator until validation runs

**Status Badges:**
- Color-coded (green = active, yellow = pending, red = error)
- Consistent placement and sizing

---

## Data Display Patterns

### JSON/Data Preview

**Format:**
- Monospace font
- Table view for structured data
- Limit preview to first 10 rows with "Showing X of Y" message
- Scrollable container for overflow

### Timestamps

**Format:**
- Use `date-fns` for formatting
- ISO 8601 for technical display
- Human-readable format for UI (e.g., "Oct 15, 2025 at 10:42 AM")
- Monospace font for technical timestamps

### IDs and Technical Data

**Display:**
- Monospace font (`font-mono`)
- Smaller text size (`text-xs` or `text-sm`)
- Muted color for less important technical details

### Empty States

**Pattern:**
```tsx
<div className="text-center text-muted-foreground py-12">
  No data to preview
</div>
```

- Centered text
- Muted color
- Generous padding
- Clear, concise message

---

## Accessibility

### Color Contrast
- All text meets WCAG AA contrast requirements
- Primary color chosen for sufficient contrast on dark background
- Muted text still readable but clearly secondary

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus states visible (ring color matches primary)
- Logical tab order

### Screen Readers
- Semantic HTML (headings, lists, tables)
- ARIA labels where needed
- Descriptive button text (not just icons)

### Responsive Design
- Mobile-first approach
- Breakpoints: `md` (768px), `lg` (1024px), `2xl` (1400px)
- Grid layouts stack on mobile
- Touch-friendly button sizes

---

## Responsive Breakpoints

- **Mobile**: Default (< 768px)
  - Single column layouts
  - Stacked cards
  - Full-width inputs

- **Tablet** (`md: 768px`):
  - Two-column grids
  - Side-by-side cards

- **Desktop** (`lg: 1024px`):
  - Split-screen layouts
  - Multi-column grids
  - Optimal spacing

- **Large Desktop** (`2xl: 1400px`):
  - Container max-width applied
  - Generous spacing

---

## Custom Utilities

### Scrollbar Styling

Custom thin scrollbar for dark theme:
```css
.scrollbar-thin::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
```

Apply with: `className="scrollbar-thin"`

### Glassmorphism

Navbar uses backdrop blur:
```tsx
className="bg-card/50 backdrop-blur-sm"
```

---

## Design Tokens Reference

All design tokens are defined in `app/globals.css` and `tailwind.config.ts`:

- **Colors**: HSL values in CSS variables
- **Spacing**: Tailwind's default scale (0.25rem increments)
- **Typography**: Font families and sizes
- **Border Radius**: Custom `--radius` variable
- **Animations**: Custom keyframes and durations

---

## Implementation Guidelines

### When Adding New Components

1. **Use shadcn/ui** components as the base
2. **Follow existing patterns** for similar components
3. **Maintain consistency** with spacing, colors, and typography
4. **Add animations** sparingly and purposefully
5. **Test responsive** behavior on mobile and desktop
6. **Ensure accessibility** with proper semantic HTML and ARIA

### When Modifying Existing Components

1. **Preserve existing patterns** unless improving UX
2. **Maintain visual consistency** with color and spacing
3. **Update this guide** if establishing new patterns
4. **Test across personas** to ensure role-based visibility works

### Code Style

- **Tailwind classes**: Prefer utility classes over custom CSS
- **Component composition**: Build complex UIs from simple components
- **TypeScript**: Strong typing for all props and state
- **Naming**: Descriptive, semantic class names and variables

---

## Examples

### Complete Page Example

See `app/composer/page.tsx` for a complete implementation following these patterns:
- Page header with gradient text and animation
- Split-screen layout with cards
- Form inputs with labels
- Data preview table
- Status indicators
- Primary action button

### Component Examples

- **Navbar**: `components/shared/navbar.tsx`
- **Cards**: Used throughout, see `app/composer/page.tsx`
- **Tables**: Data preview in composer, ledger feed
- **Forms**: Composer envelope configuration

---

## Future Considerations

- **Light Theme**: Color tokens defined but not implemented
- **Dark Mode Toggle**: Can be added using existing light theme tokens
- **Additional Animations**: Can extend with more Framer Motion patterns
- **Component Library**: Expand shadcn/ui components as needed

---

*This guide should be updated as new patterns emerge or design decisions are made.*

