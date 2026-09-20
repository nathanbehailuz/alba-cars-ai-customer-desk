# ALBA CARS AI Lead Acquisition Desk

## Project Brief

### Project Summary

ALBA CARS AI Lead Acquisition Desk is a website inquiry, lead qualification, and sales follow-up automation system for ALBA CARS.

The project replaces the website's WhatsApp-only contact widget with a fast, device-independent inquiry form. Visitors can explain what they need without leaving the website or signing in to WhatsApp. Their submission is sent to n8n, analyzed by AI, saved in Google Sheets as a lightweight CRM, and routed to the appropriate sales process.

The system immediately sends a personalized confirmation by email, WhatsApp, or both. Depending on the inquiry, that message can offer an appointment link, provide ALBA CARS' working hours, confirm that a sales agent will follow up, or tell the customer to expect a call from ALBA CARS' voice agent.

## Problem Statement

The current website directs visitors to WhatsApp. This creates friction for people who:

- Do not use WhatsApp on their computer
- Are not signed in to WhatsApp Web
- Do not want to leave the ALBA CARS website
- Lose interest while waiting for another application to open
- Are unsure what information to include

Unstructured messages can also omit important sales information such as vehicle preference, budget, buying timeline, and contact details. Employees must manually interpret, organize, and follow up on every message.

## Proposed Solution

Create a smart inquiry widget in the bottom-right corner of the ALBA CARS website. The widget asks what the visitor wants to do and presents a short form tailored to that intent.

The form sends the submission and relevant page context to an n8n webhook. AI turns the message into structured lead information, summarizes the request, estimates buying intent, and recommends the next action. The workflow then creates or updates the lead in Google Sheets, alerts the sales team when appropriate, and sends the customer a personalized confirmation.

## Primary Goal

Increase the number of website visitors who become qualified ALBA CARS leads by:

- Reducing contact friction
- Capturing usable contact details
- Understanding each visitor's vehicle needs
- Responding immediately with a relevant next step
- Helping salespeople prioritize high-intent prospects
- Making appointment scheduling easier
- Connecting qualified leads to the existing voice agent and sales team

## Target Users

### Potential Customers

- Visitors looking to buy a vehicle
- Customers requesting a test drive
- Customers asking about financing
- Vehicle owners interested in selling or trading in a car
- Visitors who cannot find a suitable vehicle in the current inventory
- Visitors with general pre-sales questions

### ALBA CARS Users and Systems

- Sales representatives
- Financing team
- Vehicle acquisition and appraisal team
- Sales managers
- ALBA CARS voice agent

## Customer Experience

### Step 1: Select an Intent

The widget asks:

> How can ALBA CARS help?

The available options are:

- Buy a car
- Sell or trade in my car
- Book a test drive
- Ask about financing
- Help me find a car
- Ask a question

### Step 2: Complete a Short Form

The form contains:

- Name, optional for the first version
- Email address
- Phone number
- Preferred reply channel: email, WhatsApp, or both
- Message, optional but encouraged

At least one of email or phone is required. The selected reply channel must match the supplied contact information. WhatsApp cannot be selected unless a valid phone number is provided.

The form should include concise consent text explaining that ALBA CARS may contact the visitor about the inquiry. WhatsApp messages and automated voice calls should only be used when the visitor supplied the relevant number and agreed to that contact method.

### Step 3: Receive a Contextual Prompt

| Intent | Message prompt |
| --- | --- |
| Buy a car | Tell us the make, model, budget, or features you are looking for. |
| Sell or trade in | Tell us your car's make, model, year, mileage, and condition. |
| Book a test drive | Which vehicle would you like to test-drive, and when? |
| Financing | Which vehicle are you interested in, and what would you like to know? |
| Help me find a car | Tell us your budget, preferred body type, and must-have features. |
| Ask a question | What would you like to know about our vehicles or buying process? |

This guides the visitor without forcing them to edit a prewritten message.

### Step 4: Receive a Personalized Confirmation

After submission, the visitor sees an on-screen confirmation and receives a message through email, WhatsApp, or both.

Every message should include:

- Confirmation that ALBA CARS received the inquiry
- The customer's name, when available
- A specific reference to the submitted request
- A unique reference number
- The next expected action
- A relevant call to action

The message should acknowledge the actual request instead of using a generic receipt.

Example:

> Hi Sara, thanks for contacting ALBA CARS. We received your request for a 2023 or newer Toyota RAV4 within a budget of AED 130,000. A sales agent will review suitable vehicles and contact you shortly. You can also choose a convenient time here: [appointment link]. Your reference is AC-10428.

## Calls to Action

The workflow chooses a call to action based on the inquiry.

### Buy or Find a Car

- Book a consultation with a sales agent
- View relevant available vehicles
- Expect a call from a sales agent or the voice agent

### Test Drive

- Select an available appointment time
- Confirm the requested vehicle and branch
- Expect a call if manual confirmation is required

### Financing

- Schedule a financing consultation
- Review the financing information page
- Expect follow-up from the financing team

### Sell or Trade In

- Book a vehicle valuation appointment
- Prepare the vehicle registration and service history
- Expect a call to confirm appraisal details

### Outside Working Hours

If a lead arrives outside ALBA CARS' configured working hours:

> We have received your request outside our working hours. Our sales team will contact you when we reopen. You can reserve a convenient appointment time now: [appointment link].

Working days, hours, branch timezone, appointment URL, and expected response times must be configuration values, not hard-coded assumptions.

## Voice Agent Integration

ALBA CARS has a voice agent that can call potential customers and arrange appointments with salespeople. The n8n workflow should prepare qualified leads for this system.

For eligible leads, the workflow sends or stores:

- Customer name
- Phone number
- Preferred language, when known
- Lead category
- AI summary
- Vehicle of interest
- Budget and buying timeline
- Preferred appointment time
- Suggested opening statement
- Google Sheets lead ID

The customer can receive:

> We received your request about the MG GT Comfort 2024. Please expect a call from our automated assistant shortly to help arrange a convenient appointment with a sales specialist.

Track voice-agent status in Google Sheets:

- Not queued
- Ready for voice agent
- Queued
- Call attempted
- Appointment scheduled
- No answer
- Human follow-up required

If direct integration is unavailable for the first version, n8n marks eligible rows as `Ready for voice agent` and alerts the responsible employee. Direct API or webhook integration can be added once the voice agent's interface is confirmed.

## Context Captured Automatically

The widget should submit information the website already knows:

- Source website
- Current page URL and page type
- Vehicle ID and vehicle name, when applicable
- Active vehicle-search filters
- Referral source, when available
- Submission timestamp
- Unique submission ID

If the visitor opens the widget from a vehicle page, that vehicle is attached automatically. If the visitor is on a no-results page, the active filters are included so sales can understand what they could not find.

## AI Capabilities

AI should:

- Classify the sales intent
- Produce a concise summary
- Extract vehicle preferences, budget, and buying timeline
- Estimate urgency and buying intent
- Score the lead
- Recommend the next sales action
- Select the most relevant call to action
- Draft a personalized confirmation
- Draft a concise sales-agent briefing
- Detect likely spam

Suggested categories:

- `vehicle_purchase`
- `vehicle_search`
- `test_drive`
- `financing`
- `trade_in`
- `vehicle_sale`
- `general_sales_question`
- `spam`

Example AI output:

```json
{
  "category": "vehicle_purchase",
  "summary": "Customer wants a recent Toyota RAV4 and plans to buy this month.",
  "vehicle": {
    "make": "Toyota",
    "model": "RAV4",
    "year_min": 2023,
    "budget_aed": 130000
  },
  "buying_timeline": "within_30_days",
  "buying_intent": "high",
  "urgency": "high",
  "lead_score": 87,
  "recommended_action": "Offer matching vehicles and schedule a consultation.",
  "recommended_cta": "book_sales_appointment",
  "voice_agent_eligible": true,
  "customer_confirmation": "Thanks for contacting ALBA CARS about a 2023 or newer Toyota RAV4...",
  "sales_brief": "High-intent buyer with AED 130,000 budget; contact today."
}
```

AI recommendations must be checked by deterministic n8n rules. A lead is not queued for a voice call unless a valid phone number and the required consent are present.

## End-to-End Workflow

1. The website form sends a submission to an n8n webhook.
2. The workflow validates that email or phone is present.
3. A unique submission ID prevents duplicate processing.
4. The workflow searches Google Sheets for an existing customer by email or phone.
5. AI classifies, summarizes, and extracts structured lead information.
6. n8n validates the AI output and confirms lead priority.
7. Customer and lead rows are created or updated in Google Sheets.
8. The workflow selects a relevant call to action.
9. A personalized confirmation is generated from an approved template.
10. The confirmation is sent by email, WhatsApp, or both.
11. High-priority leads trigger an immediate sales notification.
12. Eligible phone leads are queued for the voice agent or marked ready for follow-up.
13. Appointment and follow-up status are recorded in Google Sheets.
14. Processing errors are retried and recorded in the log.

## Google Sheets CRM

Google Sheets is the CRM for the first version. The workbook should contain separate sheets for each type of record.

### Customers

- Customer ID
- Name
- Email
- Phone
- Preferred contact channel
- Contact consent
- First and last contact dates
- Assigned sales agent
- Customer status

### Leads

- Lead ID and submission ID
- Customer ID
- Lead category
- Original message and AI summary
- Vehicle of interest and vehicle ID
- Budget and buying timeline
- Buying intent, lead score, and priority
- Recommended action and CTA
- Assigned team and sales agent
- Lead status
- Source page
- Created date and next follow-up date

### Communications

- Communication ID and lead ID
- Channel and message type
- Message content
- Delivery status
- Provider message ID
- Sent date
- Error details

### Appointments

- Appointment ID, lead ID, and customer ID
- Appointment type
- Requested and confirmed date/time
- Vehicle
- Assigned sales agent
- Booking source
- Appointment status

### Voice Agent Queue

- Queue ID and lead ID
- Customer name and phone
- Preferred language
- AI summary and suggested opening
- Queue status and call result
- Appointment outcome
- Last updated

### Processing Log

- Submission ID and workflow run ID
- Processing status
- Retry count
- Error stage and error message
- Created date and last updated

## Lead Scoring

Positive signals include:

- Plans to buy soon
- Provides a realistic budget
- Identifies a specific vehicle
- Requests a test drive
- Requests financing information
- Asks to be called
- Provides both email and phone
- Selects an appointment time

Score groups:

- `80-100`: Hot lead; notify sales immediately and queue eligible voice follow-up
- `50-79`: Warm lead; create a normal-priority sales task
- `0-49`: Early-stage or incomplete lead; send useful next steps and add to follow-up

Scoring weights should remain configurable until ALBA CARS can evaluate real submission data.

## Message Examples

### Email

**Subject:** We received your ALBA CARS vehicle request

> Hi Daniel,
>
> Thanks for contacting ALBA CARS. We received your request for a fuel-efficient sedan within a budget of AED 60,000.
>
> A sales agent will review suitable vehicles and contact you shortly. You can reserve a convenient consultation time here: [appointment link].
>
> Your reference number is AC-10429.

### WhatsApp

> Hi Daniel, this is ALBA CARS. We received your request for a fuel-efficient sedan within a budget of AED 60,000. A sales agent will contact you shortly. Book a convenient time: [appointment link]. Reference: AC-10429.

### Voice-Agent Handoff

> Hi Hana, thanks for your interest in test-driving the Geely Emgrand GS. Please expect a call from our automated assistant shortly to help arrange a suitable time with our sales team. Reference: AC-10430.

## Notifications and Reports

Notify sales immediately when:

- A hot lead is received
- A test drive is requested
- A customer wants to buy soon
- A visitor requests an available vehicle
- A high-intent lead cannot be sent to the voice agent
- Confirmation fails on every selected channel

A daily digest should cover new leads, hot leads awaiting contact, test-drive requests, voice-agent follow-ups, appointments, overdue follow-ups, and failed confirmations.

A weekly AI report should summarize requested vehicles, common budgets, unmet inventory demand, lead sources, appointment activity, voice-agent outcomes, and common customer questions.

## Error Handling

The workflow should include:

- Input and AI-output validation
- Retry logic for temporary API failures
- A fallback confirmation if AI generation fails
- Separate email and WhatsApp delivery tracking
- Partial-success handling when one channel fails
- Duplicate prevention with submission IDs
- Error logging in Google Sheets
- Internal alerts when a high-value lead cannot be processed

If email succeeds but WhatsApp fails, the retry must not resend the successful email.

## Minimum Viable Product

The first version includes:

- Bottom-right inquiry widget
- Six intent buttons
- Name, email, phone, reply channel, and message fields
- Requirement for at least one contact method
- Contextual prompts and consent capture
- Automatic page, vehicle, and filter context
- n8n webhook, validation, and duplicate prevention
- AI classification, extraction, summarization, and lead scoring
- Google Sheets CRM
- Personalized email confirmation
- Personalized WhatsApp confirmation when the connection is available
- Hot-lead sales notifications
- Appointment call-to-action link
- Voice-agent eligibility and queue status
- Retry logic and error logging

The MVP does not include a custom CRM, autonomous financing decisions, or an inventory recommendation engine. Direct voice-agent calling can be added once its integration method is confirmed.

## Success Criteria

The prototype must:

- Accept inquiries without requiring WhatsApp
- Require an email or phone number
- Capture customer intent and website context
- Return valid structured AI output
- Create or update the correct customer in Google Sheets
- Create a trackable lead and reference number
- Assign a useful lead score
- Send a confirmation specific to the request
- Include an appropriate appointment or follow-up CTA
- Notify sales about high-intent leads
- Prepare eligible leads for voice-agent follow-up
- Track email, WhatsApp, and voice-agent status
- Prevent duplicate lead creation
- Record and recover from processing failures

## Demonstration Scenarios

1. **High-intent buyer:** A buyer requests a recent Toyota RAV4 under AED 130,000. The workflow creates a hot lead, alerts sales, queues voice follow-up, and sends an appointment link.
2. **Test drive:** A visitor requests a Honda Civic test drive on Saturday. The workflow records the preferred time and sends the booking next step.
3. **Trade-in:** A visitor offers a 2020 Nissan Altima and wants an SUV. The workflow extracts both needs and sends a valuation CTA.
4. **No search results:** A visitor submits after an unsuccessful filtered search. The filters are captured so sales can recommend alternatives.
5. **Email and WhatsApp:** Both channel-specific confirmations are sent and tracked independently.
6. **Voice-agent appointment:** An eligible lead is queued for a call, and its call and appointment outcome are written back to Google Sheets.

## n8n Assignment Coverage

- Webhook trigger
- Website and page-context data
- Validation and transformation
- Branching by lead type, score, and reply channel
- Google Sheets lookup, creation, and update
- AI classification, summarization, extraction, and drafting
- Structured JSON output
- Email and WhatsApp delivery
- Sales notifications and verifiable CRM records
- Error handling, retries, and idempotency
- Scheduled daily and weekly reports
- Optional sub-workflows for CRM, messaging, and voice-agent handoff

## Future Enhancements

- Match leads against live vehicle inventory
- Recommend vehicles from preferences and browsing behavior
- Add multilingual forms and confirmations
- Connect directly to the voice agent API
- Connect appointments to a live sales calendar
- Add follow-up sequences for warm leads
- Assign leads by branch or vehicle category
- Build a conversion dashboard

## Project Identity

**Name:** ALBA CARS AI Lead Acquisition Desk  
**Positioning:** An intelligent website inquiry, lead qualification, and sales follow-up system for ALBA CARS.  
**Primary value:** Capture more potential customers, respond immediately with relevant information, and connect qualified leads to appointments, sales agents, and the ALBA CARS voice agent.
