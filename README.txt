Retirement Planner v21 — three editable contribution phases

Replace only:
- index.html
- retirement_app.js
- sw.js

Keep styles-v4.css unchanged.

New contribution structure:
- Phase 1: current age until Phase 2 start
- Phase 2: default start age 50, editable
- Phase 3: default start age 60, editable

Each phase now has separate annual contribution inputs for:
- VOO
- 401(k)
- Roth IRA

Behavior:
- Phase 2 and Phase 3 start ages are editable whole-number ages.
- Phase 3 must start after Phase 2.
- VOO and 401(k) continue to use their existing nominal annual contribution
  increase assumptions within each phase; each new phase restarts from its
  entered base amount.
- Roth IRA phase amounts are constant real/today's-dollar contributions within
  each phase (same behavior as the old single Roth contribution input).

Saved-plan migration:
- Existing Roth annual contribution is copied into Phase 2 and Phase 3 for older plans.
- For older 2-phase plans, Phase 3 starts at age 60 and its initial VOO/401(k)
  amounts are derived from what the old Phase 2 schedule would have reached by
  age 60. This minimizes changes to existing projections until the new Phase 3
  inputs are edited.

Everything else from v20 is preserved:
- Spending presets
- Return/inflation scenario presets
- Step-down spending
- Monte Carlo sequence-of-returns toggle
- RMDs
- 401(k) -> Roth IRA -> VOO withdrawal waterfall
- Social Security controls
- FERS survivor election
- Print / Save PDF
