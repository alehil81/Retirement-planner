Retirement Planner v6

Replace these three files in the ROOT of the GitHub repository:
- index.html
- retirement_app.js
- sw.js

styles-v4.css remains unchanged.

Main correction in v6:
Annual VOO and 401(k) contribution increase inputs are now NOMINAL rates.
The app converts them to real contribution growth using:
(1 + nominal increase) / (1 + inflation) - 1

Screenshot inputs verified:
Your age: 45
Spouse age: 43
Retirement age: 64
Target portfolio: $10,000,000
Inflation: 3%
Real return: 6%
VOO balance: $90,000
401(k) balance: $1,450,000
Phase 1 VOO: $182,000/yr today's dollars
Phase 1 401(k): $70,000/yr today's dollars
Annual VOO contribution increase: 1% nominal
Annual 401(k) contribution increase: 3% nominal
Phase 2 starts: age 50
Phase 2 VOO: $100,000/yr today's dollars
Phase 2 401(k): $70,000/yr today's dollars
High-3: $271,000
VA start date: Dec 1, 2018
SS claim age: 70 for both
VOO dividend yield: 1.3%
After-tax expenses: $300,000/yr
Ordinary effective tax rate: 20%
Qualified dividend tax rate: 15%
Moonlighting: $0/yr through age 70
401(k) withdrawal: need-based

With 3% inflation:
1% nominal VOO contribution growth = -1.94% real/yr
3% nominal 401(k) contribution growth = 0.00% real/yr
