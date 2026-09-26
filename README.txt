Retirement Planner v23 — approved review changes

Replace only:
- index.html
- retirement_app.js
- sw.js

Keep styles-v4.css unchanged.

Approved changes implemented:
1. Retirement age is capped at 95. Entering a higher age restores the prior value and explains that projections currently run through age 95. Older saved/imported plans are also clamped to 95.

2. Milestone wording only was clarified to "UPON REACHING AGE 70/80/90/95" and "PORTFOLIO UPON REACHING AGE 95." Monte Carlo age-95 labels use the same wording. The milestone and Monte Carlo timing math was not changed.

3. Contribution education was clarified dynamically. The calculator now explicitly says that to keep VOO/401(k) contributions roughly flat in today's dollars, the nominal increase should approximately equal the inflation assumption, and it continues to show the resulting real contribution-growth rates.

4. Social Security now uses editable monthly FRA (age-67) benefits for the user and spouse. Both auto-default to $4,152/month. Claim ages 62–70 are calculated from the FRA amount using statutory early-retirement reductions and 8%/year delayed-retirement credits through age 70. A Reset both to 2026 FRA benchmark button is included. Existing claim-age selections are preserved.

5. RMD starting age is now derived from birth year rather than hard-coded at 75. The default birth year is 1981. Current-law cohort mapping in the app: 1960+ -> 75; 1951–1959 -> 73; 1949–1950 -> 72; older cohorts -> 70½. Uniform Lifetime Table divisors were expanded to support ages 70–74.

6. VOO sale tax remains unchanged from v22: editable blended haircut, default 10%.

Everything else from v22 is preserved, including three contribution phases, spending presets, step-down spending, Monte Carlo, FERS, RMD mechanics, and the 401(k) -> Roth IRA -> VOO withdrawal waterfall.
