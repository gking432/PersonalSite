# IMPLEMENTATION INSTRUCTIONS FOR CURSOR

## Quick Start: Applying the Prestige Design

### Step 1: Replace Global Styles
**File:** `src/index.css`
- Replace ENTIRE contents with `/home/claude/index.css`
- This establishes color palette, typography, base components

### Step 2: Replace Home Page Styles
**File:** `src/pages/Home.css` (or wherever your Home styles are)
- Replace ENTIRE contents with `/home/claude/Home.css`
- This provides the editorial layout structure

### Step 3: Replace Home Page Component
**File:** `src/pages/Home.jsx` (or wherever your Home component is)
- Replace ENTIRE contents with `/home/claude/Home.jsx`
- This restructures the content for the new design

### Step 4: Add Google Fonts
**File:** `public/index.html` (in the `<head>` section)
Add this line (if not already importing in CSS):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

The CSS already imports the fonts, but preconnect improves performance.

### Step 5: Photo Placeholders
The two photo sections currently have gradient placeholders:
```jsx
// Photo Section 1 - Line 67-82 in Home.jsx
// Photo Section 2 - Line 128-143 in Home.jsx
```

**When real photos are available:**
1. Replace the inline style with actual image src:
```jsx
// BEFORE (placeholder):
<div className="photo-section-image" style={{
  backgroundColor: '#2d5016',
  backgroundImage: 'linear-gradient(135deg, #1a3a2e 0%, #2d5016 100%)'
}} />

// AFTER (real photo):
<img 
  src="/images/outdoor-photo.jpg" 
  className="photo-section-image" 
  alt="Descriptive alt text"
/>
```

2. Apply grayscale filter in CSS (already in Home.css):
```css
.photo-section-image {
  filter: grayscale(30%) contrast(1.1);
}
```

---

## Other Pages to Build

### Projects Page
**Structure:**
- Hero with "Selected Work" headline
- Grid of project cards (2 columns desktop, 1 mobile)
- Each card: Image, title, description, tech stack tags, links
- Full case studies for major projects

**Key styles to use:**
- `.card` for project cards
- `.project-meta` for tech stack tags
- `.text-link` for "View case study" links

### About Page
**Structure:**
- Hero with large headline "Background"
- Integrated photos (use `.photo-section` pattern)
- Long-form narrative text
- Timeline (already styled in Home.css)
- Philosophy section with pull quotes

**Key styles to use:**
- `.pull-quote` for standout quotes
- `.timeline` for experience
- `.photo-section` for integrated photos

### Speaking Page
**Structure:**
- Hero introducing lecture series
- Large cards for each lecture
- Pricing tiers clearly displayed
- Booking/calendar integration
- Testimonials (when available)

**Key styles to use:**
- `.card` for lecture descriptions
- `.btn-primary` for purchase/booking CTAs
- `.meta` for pricing info

### Contact Page
**Structure:**
- Simple, centered form
- Direct headline: "Get in Touch"
- Name, email, subject dropdown, message textarea
- Location info: "Based in Madison, WI"
- Submit button

**Key styles to use:**
- `.btn-primary` for submit
- `.container-text` for narrow centered layout

---

## Navbar & Footer

### Navbar (to be built)
**Design:**
- Minimal, fixed to top
- Logo/name on left: "Gunnar Neuman" in serif
- Nav links on right: Home, Projects, About, Speaking, Contact
- Cream background with subtle shadow
- Forest green on active/hover

**Code structure:**
```jsx
<nav className="navbar">
  <div className="container">
    <Link to="/" className="logo">Gunnar Neuman</Link>
    <div className="nav-links">
      <Link to="/projects">Projects</Link>
      <Link to="/about">About</Link>
      <Link to="/speaking">Speaking</Link>
      <Link to="/contact">Contact</Link>
    </div>
  </div>
</nav>
```

**CSS to add to index.css:**
```css
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background-color: var(--cream);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 1.5rem 0;
  z-index: 1000;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--charcoal);
}

.nav-links {
  display: flex;
  gap: 2.5rem;
}

.nav-links a {
  font-family: var(--font-sans);
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--slate);
  transition: color var(--transition);
}

.nav-links a:hover,
.nav-links a.active {
  color: var(--forest-green);
}

@media (max-width: 768px) {
  .nav-links {
    gap: 1.5rem;
  }
  
  .nav-links a {
    font-size: 0.8rem;
  }
}
```

### Footer (to be built)
**Design:**
- Dark green background (var(--forest-green))
- Centered content
- Links to social (LinkedIn, GitHub, etc.)
- Copyright notice
- "Built by Gunnar Neuman" credit

**Code structure:**
```jsx
<footer className="footer">
  <div className="container">
    <div className="footer-content">
      <p>© 2026 Gunnar Neuman</p>
      <div className="footer-links">
        <a href="https://linkedin.com/in/..." target="_blank">LinkedIn</a>
        <a href="https://github.com/..." target="_blank">GitHub</a>
        <a href="mailto:gunnarneuman14@gmail.com">Email</a>
      </div>
    </div>
  </div>
</footer>
```

**CSS to add to index.css:**
```css
.footer {
  background-color: var(--forest-green);
  color: var(--cream);
  padding: 3rem 0;
  margin-top: var(--space-2xl);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer p {
  color: var(--cream);
  opacity: 0.8;
  margin: 0;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: var(--cream);
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  opacity: 0.8;
  transition: opacity var(--transition);
}

.footer-links a:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
}
```

---

## Testing Checklist

After implementing:
- [ ] All pages render without console errors
- [ ] Fonts load correctly (Crimson Text, Source Sans 3)
- [ ] Colors match palette (no hardcoded hex values outside variables)
- [ ] Mobile responsive on all pages
- [ ] Buttons have hover states
- [ ] Links change color on hover
- [ ] Images (when added) have grayscale filter
- [ ] Spacing feels generous, not cramped
- [ ] Typography hierarchy is clear
- [ ] No horizontal scroll on mobile

---

## Common Issues & Fixes

### Issue: Fonts not loading
**Fix:** Check that Google Fonts import is in index.css (line 1) or in index.html

### Issue: Colors look wrong
**Fix:** Ensure you're using CSS variables (`var(--forest-green)`) not hex codes

### Issue: Layout breaks on mobile
**Fix:** Check that you're using the media queries from index.css

### Issue: Photos don't fill section
**Fix:** Ensure `.photo-section-image` has `width: 100%; height: 100%; object-fit: cover;`

### Issue: Buttons don't have hover effects
**Fix:** Check that `.btn-primary` and `.btn-secondary` classes are applied correctly

---

## Next Steps After Implementation

1. **Add real photos:** Replace gradient placeholders with actual images
2. **Build remaining pages:** Projects, About, Speaking, Contact
3. **Add Navbar:** Fixed navigation at top
4. **Add Footer:** Social links and copyright
5. **Optimize images:** Convert to WebP, add lazy loading
6. **Add metadata:** SEO tags, Open Graph images
7. **Test performance:** Lighthouse score, page speed
8. **Deploy:** Host on Vercel/Netlify

---

## Design Philosophy Reminder

This design is:
- **Editorial, not corporate:** Think magazine, not SaaS
- **Refined, not flashy:** Subtle elegance wins
- **Warm, not sterile:** Cream tones, not pure white
- **Confident, not arrogant:** Big headlines, direct language
- **Integrated, not templated:** Photos blend into layout

If something feels generic or "tech bro-y," it's wrong. Go back to DESIGN_SYSTEM.md for guidance.

---

**Good luck. Make it prestigious.**
