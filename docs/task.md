Alba Corp.

An n8n workflow that does something genuinely useful. It pulls or scrapes data, transforms it, applies some logic, and delivers a result or report you can verify.

## What to Build

Automate a real task end-to-end. Skip "fetch one URL and print it." Build something with branching, transformation, and an output a real person would actually want.

**Some ideas (pick one or bring your own):**

- **Topic news digest.** Pull from a news API or RSS feeds, dedupe, score and filter for relevance, summarise with an LLM node, and email or Slack a tidy daily digest.
- **Price or availability watcher.** Poll an API (or scrape a page), compare against a saved threshold, alert on changes, and log history to a Google Sheet.
- **Job or listing aggregator.** Gather listings from one or more sources, filter by your criteria, enrich and rank them, and produce a report.
- **Repo activity report.** Pull events from the GitHub API, categorise them, and post a weekly summary.
- **Lead enrichment pipeline.** Webhook in, enrich via an external API, score, write to a sheet or CRM, then notify.

**Bonus points for:** an LLM/AI node for summarising or classifying, merging data from two or more sources, a reusable sub-workflow, retry/backoff on flaky calls, or idempotency (re-running doesn't create duplicates).

## Core Requirements

These are all required. Use the checkboxes to track your own progress — tick items off as you complete them; they're saved with your draft.

A trigger

Schedule/cron, webhook, or manual.

External data

At least one real API call (HTTP Request node) or a scrape.

Transformation

Reshape the data (Code/Function, Set, Item Lists, Aggregate, Date/Time, and so on).

Conditional logic

IF/Switch branching and/or a loop, so it's not just a straight line.

Error handling

Deal with failures on purpose (an error-trigger workflow, or continueOnFail with a handled branch). Don't let one bad API response quietly kill the run.

A delivered, verifiable output

Email, Slack/Discord, a Google Sheet or Notion row, a generated report or PDF, or a webhook response. We need to be able to see the result.

## Resources

Tools and services you may need while building. Links open in a new tab.

|Name|Category|Auth|Link|
|---|---|---|---|
|n8n Cloud|Automation|Free trial|[Link](https://n8n.io/)|

## What to Hand In

Your final submission should include everything listed here — you'll provide it in the form at the bottom of this page.

- 01
    
    Live n8n instance (preferred) — Access to a live n8n instance (the free cloud tier is fine) with credentials so we can open and run it.
    
- 02
    
    Or: exported workflow JSON — The exported workflow JSON, plus everything we need to import and run it.
    
- 03
    
    README.md — Covering what the workflow does, a node-by-node walkthrough, setup and credentials (placeholders, never real secrets), how to run it, and how to verify it worked — with a screenshot or sample from a successful run.
    

## Documentation Requirements

Make sure your documentation covers the following.

- 01
    
    What and why — What the workflow does and why it's useful.
    
- 02
    
    Node-by-node walkthrough — What each significant node does and how data moves between them.
    
- 03
    
    Setup and credentials — Which API keys or connections are needed and how to set them up (use placeholders, never real secrets).
    
- 04
    
    How to run it — Trigger manually or wait for the schedule.
    
- 05
    
    How to verify it worked — Exactly what we should see and where (the email that lands, the sheet that fills, the Slack message that posts). Drop in a screenshot or sample from a successful run.
    

## Submit Your Work

### How to Structure Your Submission

Ideal: one GitHub monorepo with three folders, /01-web-app, /02-dashboard, and /03-n8n- workflow, plus a root README.md linking to each live version and video.

Also fine: three separate repos, with all the links gathered in one place.

Each folder should stand on its own: a README, the build log, an .env.example, and instructions to run it. One hard rule: never commit real secrets. Live API keys or credentials in a repo are an instant red flag.

Save Draft stores your progress so you can leave and come back anytime — nothing is sent for review.

Submit sends your work in for review. Once you submit, your submission is locked and can no longer be changed, so double-check everything first.

Live URL

Repository URL

Video URL (optional)

AttachmentsDrop files here or click to upload

Notes (optional)

Before You Submit

Confirm each item below — all required items must be checked before the Submit button unlocks.

All URLs are working and accessibleRepository is public or shared with reviewerBUILD_LOG.md is includedVideo walkthrough is recorded and linked (optional)

3 checklist items left before you can submit — tap to review

Save DraftSubmit