# CURSOR IMPLEMENTATION GUIDE
## Make Your Site Look Like National Design Studio Built It

This is the final hybrid version: **NDS animations + scale with prestige warmth + all your content**.

---

## STEP 1: INSTALL FRAMER MOTION

```bash
npm install framer-motion
```

Required for all scroll animations.

---

## STEP 2: REPLACE 3 FILES

### File 1: `src/index.css`
Replace with: `index.css`

**What changed:**
- Added Instrument Serif for GIANT display text
- Kept Crimson Text for body/narrative
- NDS typography scale (10rem heroes)
- Prestige color palette (forest green, cream, tobacco)
- NDS button styles (lift on hover)
- Card hover effects

### File 2: `src/pages/Home.jsx`
Replace with: `Home.jsx`

**What changed:**
- Hero headline now 10rem (massive)
- Stats have number counters (count up on scroll)
- Capabilities are cards instead of plain grid
- Photo sections are TALLER (80vh)
- Giant text overlays on photos (10rem)
- Supporting paragraphs appear after giant text
- Projects are card grid (NDS style)
- All animations use NDS easing
- **ALL CONTENT PRESERVED**

### File 3: `src/pages/Home.css`
Replace with: `Home.css`

**What changed:**
- Stats numbers are GIANT (14rem on desktop)
- Photo sections taller (80vh minimum)
- Giant text styles (10rem)
- NDS card grid styling
- Hover effects on everything
- Mobile fully responsive

---

## STEP 3: VERIFY IMPORTS

Check that your `Home.jsx` has these imports at the top:

```jsx
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import './Home.css'
```

If you're not using React Router, adjust the `Link` import.

---

## WHAT YOU'LL SEE

### 1. Hero Section
- Your name in GIANT typography (10rem on desktop)
- Fades and scales down slightly as you scroll
- Two clean buttons with hover lift effect

### 2. Stats Bar (Forest Green Background)
- Numbers COUNT UP from 0 when you scroll to them:
  - **3+** (giant 14rem number)
  - **5+** (giant 14rem number)
  - **100+** (giant 14rem number)
- Small uppercase labels underneath

### 3. Capabilities (Card Grid)
- Three cards with hover effects
- Lift 4px on hover
- Border changes to green
- Stagger animation (appear one-by-one)

### 4. Photo Section 1 (Taller - 80vh)
- Gradient placeholder (replace with photo later)
- GIANT text overlay: **"I don't wait for permission"** (10rem)
  - Text gets progressively bolder as you scroll
- Supporting paragraph fades in below

### 5. Projects (Card Grid - NDS Style)
- Three project cards in grid
- Each has:
  - Small stat at top ("Built 2024")
  - Project name (1.75rem)
  - Description
  - Tech stack badges
- Cards stagger-reveal on scroll
- Hover lifts card up

### 6. Photo Section 2 (80vh)
- GIANT text: **"Think big picture. Compartmentalize. Execute."** (10rem)
- Supporting paragraph below
- Same scroll-reveal effect

### 7. Timeline (Prestige Style)
- Timeline with vertical line
- Three experiences
- Each item fades in from left
- Green dots with your forest green color

### 8. Final CTA (Green Background)
- "I'm looking for a marketing leadership role"
- Clean button
- Centered, direct

---

## KEY FEATURES (THE NDS MAGIC)

### ✅ Number Counters
Stats count from 0 → target when you scroll to them

### ✅ Giant Typography
- Hero: 10rem
- Stats: 14rem  
- Photo overlays: 10rem
All scale responsively on mobile

### ✅ Stagger Animations
Cards appear one-by-one (not all at once)

### ✅ Hover Effects
Everything lifts 2-4px on hover with shadow

### ✅ Smooth Easing
All animations use `cubic-bezier(0.22, 1, 0.36, 1)` - the NDS signature easing

### ✅ Card Grids
Projects and capabilities use NDS card grid layout

### ✅ Prestige Colors
Forest green, cream, tobacco - warm and refined

### ✅ Content Intact
All your paragraphs, descriptions, and content are preserved

---

## CUSTOMIZATION

### Change Stats Numbers
In `Home.jsx`, lines 155-177:
```jsx
<AnimatedNumber target={3} suffix="+" />  // Change 3 to your number
<AnimatedNumber target={5} suffix="+" />  // Change 5 to your number
<AnimatedNumber target={100} suffix="+" /> // Change 100 to your number
```

### Change Giant Text Statements
In `Home.jsx`:
- Line 224: Change "I don't wait for permission"
- Line 320: Change "Think big picture..."

Keep to 1 short sentence for best effect.

### Add Real Photos
Replace gradient placeholders:

**Photo Section 1** (line 214-219):
```jsx
// Change from this:
<motion.div 
  className="photo-section-image" 
  style={{
    backgroundColor: '#2d5016',
    backgroundImage: 'linear-gradient(...)'
  }}
/>

// To this:
<motion.img 
  src="/images/your-photo.jpg"
  className="photo-section-image"
  alt="Descriptive alt text"
  initial={{ scale: 1.05 }}
  whileInView={{ scale: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
/>
```

Same for Photo Section 2 (line 310-315).

---

## MOBILE RESPONSIVE

Everything automatically scales on mobile:
- 10rem heroes become 3-4rem
- 14rem stats become 3rem
- Card grids become single column
- Buttons go full width
- Photo sections become 60vh

Test on mobile - should look great.

---

## TESTING CHECKLIST

After implementing, scroll through and verify:

- [ ] Hero headline is MASSIVE (fills most of width)
- [ ] Stats numbers count up when you reach them
- [ ] Capability cards appear one-by-one
- [ ] Photo section 1 has giant text overlay
- [ ] Giant text gets bolder as you scroll
- [ ] Supporting paragraph appears below
- [ ] Project cards are in grid layout
- [ ] Projects stagger-reveal
- [ ] Cards lift on hover
- [ ] Photo section 2 has giant text
- [ ] Timeline items slide in from left
- [ ] All animations feel smooth (60fps)
- [ ] Mobile version looks good

---

## TROUBLESHOOTING

### Fonts not loading?
Check network tab for font requests. Should see:
- Instrument Serif
- Crimson Text
- Inter

### Numbers not counting?
Scroll to stats section slowly. Should animate when in viewport.

### Animations choppy?
Check browser console for errors. Ensure Framer Motion installed.

### Giant text too big/small?
Adjust in `Home.css`:
```css
.giant-text {
  font-size: clamp(3rem, 12vw, 10rem); /* Change 10rem to adjust max */
}
```

### Cards not in grid?
Check `Home.css` has:
```css
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-lg);
}
```

---

## WHAT MAKES IT LOOK LIKE NDS

1. **Scale contrast** - 14rem numbers next to 0.75rem labels
2. **Smooth animations** - Everything counts, stagger-reveals, lifts
3. **Card grids** - Not lists, cards with hover effects
4. **Giant typography** - Headlines fill the screen
5. **Clean buttons** - Solid, lift on hover, no outline style
6. **Number counters** - Stats animate up from 0
7. **Generous spacing** - Sections breathe
8. **Hybrid fonts** - Instrument for impact, Crimson for warmth

---

## YOU'RE DONE

Once these 3 files are in place:
1. `npm install framer-motion`
2. Replace index.css, Home.jsx, Home.css
3. Test in browser
4. Add real photos when ready
5. Adjust numbers/text as needed

**Your site now looks like National Design Studio built it, with prestige warmth.**
