# The Void; hidden time-loop easter egg

> Status: **idea / parked.** Captured so we don't lose it. Not started. We'll revisit.

A secret, self-contained experience hidden inside the personal site. Completely
separate from the Horizon Journey and the main portfolio; its own page / route,
its own rules. The portfolio stays clean and fast for normal visitors; this is a
rabbit hole for the curious who stumble into it.

## The feeling we're chasing

The same magic as the portal circle blooming out of nothing; "blank canvas, then
something appears and it's alive." Take that feeling and turn it into a small
point-and-click adventure / **escape room with a time loop**. It should feel like
accidentally falling into a video game that was hiding inside a résumé.

Reference vibe: old Flash / NDS-era interactive sites (e.g. the food-pyramid site)
; a blank stage where elements appear and respond to you.

## The flow (rough)

1. **The misclick.** You click something innocuous on the normal site and instead
   of the expected thing; the screen fades to **blank**. No nav, no chrome. Just void.
2. **Scroll.** As you scroll into the emptiness, **portals bloom in** (reuse the
   circle bloom/collapse animation). A few of them, floating in the dark.
3. **Enter a portal → BAM.** Click one and you're dropped *inside a scene*; e.g. a
   **log cabin**. It's an explorable space; you hunt around and **click objects to
   find clues** (a book on a table, a notepad by the fireplace, a letter on the
   stairs, etc.).
4. **BAM, back to the portals.** Once you've found the scene's clues, you're yanked
   back to the portal screen. The portal you finished is marked done.
5. **Next portals = new worlds.** Another portal → a different scene (a **graveyard**,
   say) → more clues. **BAM** back. Last portal → a third scene → the final clues.
6. **The cursor screen.** After the scenes, you land on a **white screen with a black
   blinking cursor**. An **inventory icon** fades in, top-right.
7. **Inventory → terminal.** Open the inventory: it holds the clues you gathered. One
   clue is a **password**. Enter it at the cursor → you're in a **computer terminal**,
   where you have to crack another code using the clues.
8. **The loop.** Solve it the "obvious" way and; **BAM**; you're back in the cabin.
   You open the door, walk forward, everything goes white… and you're **back at the
   blinking cursor**. You realize: repeating the same steps just loops you back to the
   start. The same password + same hack = same cabin = same loop.
9. **Breaking out.** Knowing the loop, you now have to **hack the terminal a different
   way**, using the clues differently. Wrong approaches re-trigger the loop. Keep
   trying until you do it *right*.
10. **Escape.** When you finally crack it correctly; **BAM**; you're back on the
    normal homepage, like nothing ever happened. Total trip.

## Why it fits Gunnar

It literally enacts "find the pattern." The whole puzzle is noticing you're in a loop
and finding the pattern that breaks it. It also rewards curiosity and persistence; the exact traits the portfolio is trying to signal; without ever saying so.

## How it's built (high level)

The engine is the easy part. It's a **state machine** plus an **inventory store** and
the **"BAM" portal transition** (reused bloom/collapse):

```
void → portals → [scene A | scene B | scene C] → portals → cursor → terminal
        ↑                                                      │
        └──────────────── loop (wrong solve) ──────────────────┘
                                                               │ (right solve)
                                                               ▼
                                                             home
```

- **Route:** its own hidden path (e.g. `/void`), isolated from the main app so it
  can't disrupt the clean portfolio.
- **Scene model:** background art + positioned **hotspots** (clickable regions with a
  hover affordance) that reveal clues / add to inventory.
- **Inventory:** small global store (Context/Zustand), persisted to `localStorage` so
  progress survives reloads. Holds clues, a password, terminal state.
- **Transitions:** the portal bloom in/out for every BAM.
- **Input variety:** scroll (portals), click (hotspots), type (password / terminal),
  maybe spacebar moments. Each scene should have **one clear signature interaction** so
  it's discoverable, not frustrating.

**The actually-hard part is content, not code:** the scene art (cabin interior,
graveyard) and the puzzle design (what the clues are, how the codes chain, how the
loop's wrong-path vs. right-path logic works). That's where the real time goes.

## Suggested build phasing (when we pick this up)

0. **Engine slice (grey-box).** Hidden entry → scroll → portals bloom → click → a
   placeholder room with 2–3 clickable clue hotspots → BAM back → all-done → cursor
   screen + inventory icon → open inventory. No finished art. Proves the loop *feel*.
1. **One real room.** Build the cabin fully (art + hotspots + real clues).
2. **Terminal + the loop.** Wire the cursor → terminal → loop-back logic and the
   wrong-vs-right solve.
3. **Remaining scenes + escape + hide the entrance** in the main site.

## Open questions to settle later

- What are the three scenes? (Cabin + graveyard + ?; should connect into one story.)
- What's the actual puzzle chain; what do the clues unlock, and what's the "right"
  way to break the loop vs. the wrong ways?
- Where is the secret entrance hidden on the main site, and how discoverable should it
  be? (Truly accidental, or a faint nudge for the observant?)
- Art approach per scene: procedural canvas (like the Horizon Journey) vs. illustrated
  SVG/layers vs. hybrid.
- How long should a full playthrough take? (Keep it tight; a few minutes, not an epic.)
