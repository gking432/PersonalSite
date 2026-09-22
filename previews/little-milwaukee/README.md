# Little Milwaukee standalone preview

This is the homepage miniature in its own responsive canvas. It uses the same
`src/features/traffic` implementation, including discoveries, manual lights,
boats, live Milwaukee conditions, and visible crashes. It does not use or change
the separate level-based game in `games/milwaukee-traffic`.

Run from the repository root:

```sh
npm run milwaukee:dev
npm run milwaukee:build
node scripts/verify-little-milwaukee-site.mjs
```

The standalone build writes `dist-little-milwaukee`. The homepage still hides its
miniature below 701px; this entry opts into phone rendering. One finger rotates,
two fingers pan and pinch, and the existing zoom/reset controls have larger touch
targets. In the standalone view, spills leave the screen instead of encountering
the portfolio's paragraphs.

Sites owns a separate source checkout at `.sites/little-milwaukee` and project
`appgprj_6ab2bab0ae7481919bf6d4859ad56807`. It retains the same `previews/` and
`src/features/traffic` / `src/features/marbles` paths. Its build overrides output
to `dist`, as declared in its hosting manifest. Future preview updates should
open that Site before synchronizing changed shared files and publishing it.

Local validation on September 22, 2026 covers portrait/landscape phone viewports,
real touch input for lights/bridge/rotation/pinch/pan, reset, desktop sizing,
and no browser errors. WebMCP state/control tools were exercised in the in-app
browser, including independent light changes, reset, and invalid-input rejection.
These are local browser checks, not measurements on physical phones.
