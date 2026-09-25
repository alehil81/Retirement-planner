Retirement Planner v10 — Roth IRA inputs

Replace only:
- index.html
- retirement_app.js
- sw.js

Keep styles-v4.css unchanged.

Only new feature:
- Roth IRA current balance
- Roth IRA annual contribution (today's dollars)

Model behavior:
- Roth contributions continue through retirement at the entered real/today's-dollar amount.
- Roth IRA uses the same selected real return as the other investment accounts.
- No Roth withdrawals are modeled during retirement; it remains invested.
- Roth is included in combined portfolio totals, target attainment, retirement milestones, and age-95 portfolio value.
- Existing saved plans default Roth balance and contribution to $0, preserving all prior results until values are entered.

Everything else is unchanged from v9.
