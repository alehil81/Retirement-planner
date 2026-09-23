Retirement Planner v7 — VOO dividend-use control

This is intentionally a minimal change from v6.

Replace ONLY these files in the root of the GitHub repository:
- index.html
- retirement_app.js
- sw.js

Do NOT replace styles-v4.css.

New feature:
- Toggle VOO dividend use On / Off.
- When On, choose 0–100% of VOO dividends to use for retirement spending.
- The unused percentage is reinvested in VOO.
- When Off, 100% of VOO dividends are reinvested.
- All VOO dividends remain taxable whether spent or reinvested.
- The assumed real return remains a TOTAL return, so only the dividends actually spent are subtracted from VOO. This avoids double-counting.
- Existing saved plans migrate automatically and default to the prior behavior: On + 100% used.

Examples:
- On + 100%: exactly the prior v6 behavior.
- On + 50%: half used for spending, half reinvested.
- Off: none used for spending, all reinvested.
