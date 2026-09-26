Retirement Planner v22 — estimated tax on VOO share sales

Replace only:
- index.html
- retirement_app.js
- sw.js

Keep styles-v4.css unchanged.

New behavior:
- Added editable "Estimated tax on VOO share sales" input.
- Default = 10%.
- When VOO must be sold to cover spending, the calculator now grosses up the
  required sale so that the AFTER-TAX proceeds fill the remaining spending gap.
- Example at 10%:
    Need $90,000 net spending cash -> sell $100,000 of VOO -> estimate $10,000
    sale tax -> $90,000 net cash.
- The full gross sale reduces the VOO portfolio.
- The estimated VOO-sale tax is included in the displayed estimated taxes.
- Retirement-stage details show the gross VOO amount sold and estimated sale tax.

This is deliberately a simplified blended haircut. Actual capital-gains tax
applies only to realized gains, not to the return-of-basis portion of a sale.
The calculator still does not track individual VOO tax lots or cost basis.

Everything else from v21 is preserved.
