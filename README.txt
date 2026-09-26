Retirement Planner v18 — scenario presets + step-down spending

Replace only:
- index.html
- retirement_app.js
- sw.js

Keep styles-v4.css unchanged.

Scenario presets change ONLY real return and inflation:
- Base: 4.5% real / 2.5% inflation
- Conservative: 4.0% real / 3.0% inflation
- Stress: 3.0% real / 3.5% inflation
- Strong-return: 5.5% real / 2.5% inflation

Step-down spending:
- OFF by default so existing plans remain unchanged.
- When ON:
  * retirement through age 79 = main annual after-tax expense input
  * ages 80–89 = separate later-life input (default $300,000)
  * age 90+ = separate later-life input (default $275,000)
- All amounts are today's dollars.

All v17 RMD and 401(k) -> Roth -> VOO waterfall logic remains intact.
