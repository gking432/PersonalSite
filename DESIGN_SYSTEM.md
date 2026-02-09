# PRESTIGE PORTFOLIO DESIGN SYSTEM
## Aesthetic Philosophy & Implementation Guide

---

## CORE CONCEPT

**"Old Money Meets New Capability"**

This is not a tech portfolio—it's a prestige piece. The design evokes:
- Private clubs where serious people do serious work
- 1960s Esquire magazine editorial layouts
- Mad Men offices with dark wood paneling
- Hunting lodges with leather-bound books and laptops
- Northwestern style: navy blues, sail boats, lakes
- Midwest authenticity: golf courses, classy but real

The user wants visitors to feel:
- Awe and wonder: "How have I not heard of this guy?"
- Inferiority (in a good way): "This guy is clearly superior"
- Emotional connection: Like looking out over a huge lake, then turning to see a cozy cabin with a fire
- Curiosity: "Does he really give AI lectures?"
- Urgency: "We need to contact him immediately"

---

## COLOR PALETTE

### Primary Colors
```css
--forest-green: #1a3a2e    /* Primary brand color, buttons, accents */
--hunter-green: #2d5016    /* Darker green for variation */
--navy: #1e3a5f            /* Secondary color, Northwestern vibes */
--charcoal: #2a2a2a        /* Primary text */
--slate: #4a4a4a           /* Body text */
```

### Background Colors
```css
--cream: #f4f1ea           /* Primary light surface */
--parchment: #fafaf3       /* Body background */
--off-white: #fefefe       /* Elevated surfaces */
```

### Accent Colors (use sparingly)
```css
--tobacco: #6b4423         /* Rich brown, for special accents */
--cognac: #9b6b47          /* Lighter brown */
--brass: #b8860b           /* Metallic accent, very rare */
--warm-gray: #8b8680       /* Muted text, metadata */
```

### Usage Philosophy
- **Dominant:** Cream/parchment backgrounds (warm, inviting)
- **Strong accents:** Forest green for CTAs, links, important elements
- **Restrained use:** Navy and tobacco for visual variety
- **Never:** Bright colors, neon, gradients (except subtle ones)

---

## TYPOGRAPHY

### Font Families
```css
--font-serif: 'Crimson Text', 'Lora', Georgia, serif;
--font-sans: 'Source Sans 3', 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'Courier New', Courier, monospace;
```

### Typographic Hierarchy
- **Headlines (h1, h2):** Serif, large, confident, tight letter-spacing
- **Subheadings (h3, h4):** Serif, medium weight
- **Body text:** Sans-serif, generous line-height (1.7-1.8)
- **Metadata/small text:** Sans-serif, uppercase, wide letter-spacing
- **Technical details:** Monospace

### Key Principles
- **Big, bold headlines:** Don't be timid. Headlines should command attention.
- **Generous spacing:** Let typography breathe. More whitespace than you think.
- **Tight letter-spacing on headlines:** -0.03em to -0.04em makes them feel premium
- **Wide letter-spacing on small text:** 0.08em to 0.15em makes metadata feel refined

---

## LAYOUT PHILOSOPHY

### Editorial, Not Grid-Based
This is **magazine layout thinking**, not standard web design:

1. **Asymmetric compositions:** Not everything needs to be centered or in a grid
2. **Generous whitespace:** Sections should breathe. Don't pack content tight.
3. **Varied rhythm:** Alternate between dense sections and open space
4. **Chapter-like sections:** Each section tells part of a story
5. **Full-bleed elements:** Some things should break the container and span full width

### Section Structure Pattern
```
[Full-bleed photo section]
  ↓
[Text-heavy section on cream background]
  ↓
[Timeline or list on parchment]
  ↓
[Photo section with overlay text]
  ↓
[Final CTA on dark green]
```

Variety is key. No two sections should feel exactly the same.

---

## PHOTO INTEGRATION

### Philosophy
Photos should be **part of the design**, not just placed in frames.

### Integration Techniques

#### 1. Full-Bleed Photo Sections
Photos that span the entire viewport width with overlaid text:
```jsx
<section className="photo-section">
  <img src="..." className="photo-section-image" alt="..." />
  <div className="photo-section-overlay" />
  <div className="container">
    <div className="photo-section-content">
      <h2>Headline over photo</h2>
      <p>Supporting text</p>
    </div>
  </div>
</section>
```

**When to use:** 
- Outdoor photos (hunting, lakes, golf)
- Office/work environment shots
- Presenting/speaking photos
- Breaks between major content sections

**Treatment:**
- Slight grayscale (30-40%) for sophistication
- Dark overlay (forest green at 70-85% opacity) for text readability
- Text in cream color
- Generous padding

#### 2. Asymmetric Photo Layouts
Photos that bleed off one side of the container:
```jsx
<div className="split-section">
  <div className="split-content">
    <h2>Headline</h2>
    <p>Text content</p>
  </div>
  <div className="split-image">
    <img src="..." alt="..." />
  </div>
</div>
```

**When to use:**
- About page
- Project case studies
- Breaking up long text sections

#### 3. Inline Photos
Photos integrated into text flow, not separated:
```jsx
<div className="content-with-photo">
  <img src="..." className="inline-photo-right" alt="..." />
  <p>Text wraps around photo naturally...</p>
</div>
```

**Treatment:**
- No borders, no frames
- Subtle shadow or slight grayscale
- Generous margin from text

### Photo Style Guidelines
1. **Color treatment:** Slight desaturation (grayscale 20-40%) for cohesion
2. **Contrast:** Bump contrast 10% for clarity
3. **Mood:** Natural, confident, candid over posed
4. **Composition:** Rule of thirds, not always centered
5. **File format:** WebP for performance, JPG fallback

---

## COMPONENTS

### Buttons
```jsx
// Primary - Forest green background
<button className="btn btn-primary">Primary Action</button>

// Secondary - Outlined charcoal
<button className="btn btn-secondary">Secondary Action</button>

// Tertiary - Outlined green, smaller
<button className="btn btn-tertiary">Tertiary Action</button>
```

**Philosophy:** 
- Uppercase, wide letter-spacing (0.08em)
- Generous padding (1rem × 2.5rem)
- Subtle transitions, not flashy
- Hover states swap background/border colors

### Text Links
```jsx
<a href="..." className="text-link">View all projects →</a>
```

**Style:** 
- Uppercase, small font, wide tracking
- Underlined with forest green
- Arrow indicator (→) for forward actions

### Cards
```jsx
<div className="card">
  <h3>Card Title</h3>
  <p>Card content...</p>
</div>
```

**Treatment:**
- Cream background
- Subtle border (1px, rgba black)
- Minimal shadow
- Slight lift on hover

### Timeline
```jsx
<div className="timeline">
  <div className="timeline-item">
    <span className="timeline-year">2020-2023</span>
    <div className="timeline-content">
      <h4>Title</h4>
      <p className="timeline-label">Role</p>
      <p>Description...</p>
    </div>
  </div>
</div>
```

**Visual:**
- Vertical line with dots
- Year labels in small uppercase
- Generous spacing between items

### Project Meta Tags
```jsx
<div className="project-meta">
  <span>React</span>
  <span>Python</span>
  <span>API</span>
</div>
```

**Style:**
- Small, uppercase, bordered pills
- Warm gray by default
- Forest green on hover

---

## TEXTURE & ATMOSPHERE

### Grain Overlay
Subtle noise texture for depth:
```jsx
<section className="grain-overlay">
  {/* Content */}
</section>
```

Use on:
- Full-bleed photo sections
- Dark green CTA sections
- Cream background sections

### Gradients
Use sparingly, only for:
- Subtle background transitions (cream to parchment)
- Photo overlays (dark to transparent)
- Never for buttons or UI elements

---

## MOTION & INTERACTION

### Philosophy
**Subtle and refined.** No bouncing, spinning, or flashy effects.

### Approved Interactions
1. **Hover lifts:** `transform: translateY(-2px)` on cards
2. **Border color changes:** On project items and tags
3. **Opacity transitions:** For photo treatments
4. **Left padding on hover:** For project list items
5. **Underline expansion:** For text links

### Timing
```css
--transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```
Smooth easing, not too fast, not too slow.

### AVOID
- Slide-ins
- Rotations
- Scale transforms (except minimal)
- Anything that feels "bouncy"
- Auto-playing animations

---

## RESPONSIVE DESIGN

### Breakpoints
```css
@media (max-width: 1024px)  /* Tablet */
@media (max-width: 768px)   /* Mobile */
@media (max-width: 480px)   /* Small mobile */
```

### Mobile Adaptations
- **Typography:** Reduce sizes but maintain hierarchy
- **Layouts:** Stack columns vertically
- **Photos:** Full-width on mobile
- **Buttons:** Full-width on small screens
- **Spacing:** Reduce gutters and section padding
- **Timeline:** Narrow left margin, smaller dots

### Priority
Mobile should feel **just as refined** as desktop, not like an afterthought.

---

## PAGE-SPECIFIC GUIDELINES

### Home Page
- **Hero:** Bold name, subheadline, two CTAs
- **Capabilities:** Three-column on desktop, stack on mobile
- **Photo sections:** Two full-bleed sections with overlaid text
- **Projects:** List format, not grid
- **Timeline:** Visual storytelling of background
- **Final CTA:** Dark green, centered, direct

### Projects Page (to be built)
- **Hero:** "Selected Work" headline
- **Grid:** 2 columns on desktop, 1 on mobile
- **Each project:** Large image, detailed description, tech stack, links
- **Case studies:** Long-form project deep-dives with multiple photos

### About Page (to be built)
- **Photo-heavy:** Multiple integrated photos
- **Long-form narrative:** Story-driven, not resume format
- **Philosophy section:** Pull quotes from the user's vision
- **Skills section:** List format, not boring grid

### Speaking Page (to be built)
- **Event-focused:** Calendar, booking system
- **Lecture cards:** Large, detailed
- **Testimonials:** When available, integrated naturally
- **Pricing tiers:** Clear, honest, not salesy

### Contact Page (to be built)
- **Simple form:** No bullshit, just name/email/message
- **Direct:** "I'm looking for full-time opportunities"
- **Location:** Madison, WI (open to relocation)

---

## CONTENT VOICE & TONE

### Writing Style
- **Direct, not fluffy:** "I built X" not "I'm passionate about building X"
- **Specific, not vague:** "Led product launch at Sub-Zero" not "Marketing professional"
- **Confident, not arrogant:** Own accomplishments without peacocking
- **Honest, not salesy:** "Looking for the right role" not "Disruptive innovator"

### Avoid
- Corporate buzzwords (synergy, leverage, disrupt)
- Overused phrases (detail-oriented, team player)
- Vague claims without proof
- Excessive modesty

---

## TECHNICAL SPECIFICATIONS

### File Structure
```
src/
  components/
    Navbar.jsx / Navbar.css
    Footer.jsx / Footer.css
  pages/
    Home.jsx / Home.css
    Projects.jsx / Projects.css
    About.jsx / About.css
    Speaking.jsx / Speaking.css
    Contact.jsx / Contact.css
  index.css (global styles)
  App.jsx
```

### Asset Organization
```
public/
  images/
    hero/
    projects/
    about/
    speaking/
  fonts/ (if self-hosting)
```

### Performance
- Optimize images (WebP, lazy loading)
- Use srcset for responsive images
- Minimize CSS (remove unused styles)
- Self-host fonts if possible

---

## IMPLEMENTATION CHECKLIST FOR CURSOR

When building new pages or components:

- [ ] Choose serif or sans-serif based on content hierarchy
- [ ] Use CSS variables for all colors (never hardcode)
- [ ] Integrate photos into layout, not just place them
- [ ] Apply grain overlay to appropriate sections
- [ ] Use generous spacing (don't pack content)
- [ ] Ensure mobile responsiveness
- [ ] Add subtle hover states to interactive elements
- [ ] Use uppercase + wide tracking for metadata
- [ ] Apply grayscale filter to photos (30-40%)
- [ ] Test in both light and dark environments
- [ ] Verify all transitions are 0.3s cubic-bezier
- [ ] Ensure text has proper max-width for readability

---

## FINAL NOTES

### What Makes This Work
1. **Restraint:** Not every element needs decoration
2. **Confidence:** Big headlines, generous space, direct language
3. **Warmth:** Cream tones, natural colors, inviting
4. **Sophistication:** Serif headlines, refined typography, editorial layout
5. **Authenticity:** Not trying to be a tech bro, being Gunnar

### Common Mistakes to Avoid
- Using pure white backgrounds (too stark, use cream/parchment)
- Making headlines too small (go bigger)
- Centering everything (asymmetry is good)
- Adding too many colors (stick to the palette)
- Generic stock photos (wait for real photos)
- Over-animating (subtlety wins)

### The Goal
When someone lands on this site, they should:
1. Immediately know this is different
2. Feel the prestige and confidence
3. Want to keep scrolling
4. Remember it hours later
5. Think "I need to reach out to this person"

---

## INSPIRATION REFERENCES

If Cursor needs visual reference:
- 1960s Esquire magazine layouts
- Monocle magazine (editorial design)
- High-end whiskey brand websites (prestige, restraint)
- Architectural firm portfolios (clean, refined)
- Private club websites (understated elegance)

Do NOT reference:
- Generic tech portfolios
- SaaS landing pages
- Modern "minimalist" sites that are just lazy
- Anything with purple gradients

---

**This is not a template. This is a custom-designed prestige piece that reflects who Gunnar actually is.**
