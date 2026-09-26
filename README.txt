Retirement Planner v19 — optional Monte Carlo sequence-of-returns analysis

Replace only:
- index.html
- retirement_app.js
- sw.js

Keep styles-v4.css unchanged.

New feature:
- Monte Carlo sequence-of-returns toggle in the Scenario presets section.
- OFF: all existing deterministic outputs behave exactly as before.
- ON: adds a separate 2,000-trial Monte Carlo risk summary without replacing the deterministic plan outputs.
- Simulates annual real returns from the current age through age 95.
- Uses the selected real return as the compound-return center and 16% annual real-return volatility.
- Applies the same market return each year to VOO, 401(k), and Roth IRA.
- Uses a fixed random seed so results remain stable between refreshes and comparable across assumption changes.
- Reports plan success through age 95, median and 10th–90th percentile portfolio at retirement, and median / 10th / 90th percentile portfolio at age 95.
- Success means every modeled annual after-tax spending target can be funded through age 95 using the existing 401(k) -> Roth -> VOO waterfall.

All v18 features remain intact: scenario presets, step-down spending, RMDs, Roth/VOO spending waterfall, Social Security options, taxes, FERS survivor election, and printing.
