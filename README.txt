Retirement Planner v28 — iPhone input zoom fix

Problem:
- On iPhone Safari, tapping an input field zoomed the page in.
- The retirement app's mobile CSS was overriding input text from 16px to 15px.
- iOS Safari commonly auto-zooms form controls below 16px.

Fix:
- Mobile text/date inputs now stay at 16px.
- Added a final defensive mobile rule so later CSS does not reduce them below 16px.
- No retirement calculations or other UI logic changed.
- User pinch-zoom remains available; this does not disable accessibility zoom.

Replace on GitHub Pages:
- index.html
- styles-v4.css
- sw.js

retirement_app.js is unchanged but included in the ZIP.
