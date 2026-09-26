Retirement Planner v20 — spending presets

Replace only:
- index.html
- retirement_app.js
- sw.js

Keep styles-v4.css unchanged.

New feature: three editable step-down spending presets

Luxury retirement
- Through age 79: $400,000
- Ages 80–89: $350,000
- Age 90+: $250,000

Controlled affluent retirement
- Through age 79: $300,000
- Ages 80–89: $250,000
- Age 90+: $200,000

Fallback retirement
- Through age 79: $225,000
- Ages 80–89: $200,000
- Age 90+: $175,000

Behavior:
- Selecting a preset automatically turns Step-down spending ON.
- The preset fills the existing three spending fields.
- All three fields remain fully editable afterward.
- The matching preset remains highlighted only while the current values exactly match it.
- If any value is edited, the preset highlight disappears, effectively making it a custom spending plan.

Everything else from v19 remains unchanged, including Monte Carlo, return/inflation scenarios, RMDs, the 401(k) → Roth IRA → VOO withdrawal waterfall, Social Security controls, FERS survivor election, and printing.
