Retirement Planner v12

Replace only:
- index.html
- retirement_app.js
- sw.js

Keep styles-v4.css unchanged.

Changes only:
1. Fixes the top "Portfolio at age 95" card so it represents the balance upon
   reaching age 95, matching the age-95 milestone.
2. Fixes printing so the inactive 3.5% Fixed withdrawal rate does not appear
   when Need-based mode is selected.
3. Social Security claim age can be any whole age from 62 through 72 for each person.
   - Quick buttons: 62 and 72.
   - Blank custom field: type any whole age 62–72.
   - Existing saved age 70 appears in the custom field automatically.
   - Benefits stop increasing at age 70 under current law; ages 71 and 72 use
     the age-70 monthly benchmark but start later.

This update does NOT add the Social Security earnings test for work before FRA.
Everything else is unchanged from v11.
