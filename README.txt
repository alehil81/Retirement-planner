Retirement Planner v5 update

Replace these three files in the ROOT of your GitHub repository:
1. index.html
2. retirement_app.js
3. sw.js

No CSS replacement is needed. This update continues to use styles-v4.css.

New features:
- Annual gross moonlighting income input
- Moonlighting-through-your-age input (inclusive)
- Dynamic retirement income stages
- Separate bridge period before Social Security starts
- Separate stages as each spouse's Social Security turns on
- Moonlighting included in approximate ordinary-income taxes
- Moonlighting reduces need-based 401(k) withdrawals
- Income-vs-expenses chart reflects moonlighting and Social Security transitions
- Existing locally saved values migrate automatically; new moonlighting fields default to $0 through age 70

After committing the files:
- Wait for GitHub Pages to deploy
- Open the site once in Safari and refresh
- Close/reopen the Home Screen app so service-worker v5 takes over
