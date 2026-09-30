Retirement Planner v33 — nominal values on milestone cards

Changes from v32:
- Every retirement milestone card now shows:
  * projected portfolio in today's dollars (existing main value)
  * nominal future-dollar equivalent at that age
  * existing VOO + 401(k) + Roth IRA breakdown
- The At retirement card also shows its nominal future-dollar equivalent.
- The Goal portfolio achieved card shows the portfolio in today's dollars and
  its nominal equivalent at the age the goal is reached.
- Nominal values are derived from the app's inflation assumption:
    nominal = today's-dollar value × (1 + inflation)^(age - current age)
- No retirement projection math changed.
- v32 scenario presets are preserved.

Replace on GitHub Pages:
- index.html
- styles-v4.css
- retirement_app.js
- sw.js
