Retirement Planner v15 — RMD integration

Replace only:
- index.html
- retirement_app.js
- sw.js

Keep styles-v4.css unchanged.

RMD behavior:
- RMDs automatically begin at age 75 under current law for this plan.
- Uses the IRS Uniform Lifetime Table (appropriate for the current spouse age gap).
- Each year's RMD is based on the prior year-end / beginning-of-year 401(k) balance.
- The model assumes the first RMD is taken during the age-75 year rather than delayed.
- Actual 401(k) withdrawal = larger of:
    * the user's planned need-based/fixed withdrawal, or
    * the RMD minimum.
- RMD withdrawals are taxed at the entered ordinary effective tax rate.
- If an RMD forces out more after-tax cash than is needed for the spending target,
  the after-tax forced excess is reinvested into VOO at year-end.
- Retirement income stages split when RMDs begin and display the RMD minimum and
  any excess RMD reinvested into VOO.

Everything else is unchanged from v14.
