Retirement Planner v17 — portfolio spending waterfall

Replace only:
- index.html
- retirement_app.js
- sw.js

Keep styles-v4.css unchanged.

Withdrawal order:
1. Traditional 401(k) first, including the RMD overlay from age 75.
2. When 401(k) assets cannot fully cover the spending gap, Roth IRA is used next.
   Roth withdrawals are modeled as tax-free qualified distributions.
3. When Roth IRA is exhausted, VOO shares are sold to fill the remaining gap.

The retirement-stage details now show Roth withdrawals and VOO share sales.
VOO share sales reduce the VOO balance.

Important tax limitation:
The calculator still does not track VOO tax basis, so capital-gain realization/tax
from VOO sales is not modeled. VOO sale proceeds are treated dollar-for-dollar as
spendable cash. This can modestly overstate after-tax cash when embedded gains exist.

Everything else is unchanged from v16.
