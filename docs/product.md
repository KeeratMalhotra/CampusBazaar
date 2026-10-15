# Campus Bazaar: product

## The problem

NSUT students trade notes, books and hostel stuff through messy WhatsApp groups or OLX. There's no trust, no search and no privacy.

## The idea

One place to buy, sell and find help, open only to verified NSUT students. Everyone appears under an anonymous username. The app only connects people: payments and hand-overs happen outside it.

## Roles

| Role | Can do |
|---|---|
| Student | Everything under "Student features" |
| Moderator | Student features, plus: handle reports, hide content, warn and suspend |
| Admin | Moderator features, plus: ban and unban, handle appeals, manage roles |

## Student features

### 1. Account

- Sign up with an `@nsut.ac.in` email, in one of two ways:
  - **Email + password:** we email a 6-digit code (OTP) to prove you own the address.
  - **Google:** Google has already verified the address, so no code is needed.
- Same email = same account, whichever way you sign in:
  - Signed up with a password? Signing in with Google later just works.
  - Signed up with Google? You can add a password later.
- **Safety rule:** a signup that was never verified can't claim an email. If someone starts a signup with your email but never enters the code, your own signup (or your Google sign-in) takes over, and their password is thrown away.
- Forgot your password? We email a code, and you set a new password.
- You get a random username like `CaffeinatedCompiler_417`. Your real name and email are never shown to other students.
- You can change your username in Settings, at most once every 30 days: 3 to 20 characters, using letters, numbers and `_`. Names like "admin" or "moderator" aren't allowed.
- You can delete your account.

### 2. Listings

- **Offer** something (sell it or give it away), or **request** something ("looking for a cycle").
- Categories: notes, books, electronics, hostel gear, academic help, other.
- Fields: title, description, price in ₹ (0 means free), a "negotiable" flag, condition (for physical items), up to 5 photos and up to 5 tags.
- You can edit a listing, mark it as sold, or delete it.

### 3. Notes

- **Hard copy:** a normal listing with photos.
- **Soft copy:** you upload a PDF. Other students see a **blurred preview** of page 1 and the page count. The real PDF is never sent to anyone who doesn't have access.
  - Free notes: any signed-in student can download them.
  - Paid notes: the buyer pays the seller outside the app, then the seller grants that buyer access. The seller can revoke access.
- Only your own notes. No pirated textbooks or paid course material.

### 4. Academic help board

- Listings in the "academic help" category, shown as a board. You can ask for help ("need help with Signals") or offer it ("DSA doubt sessions").
- Tutoring and doubt-solving are fine. Doing someone's assignment or exam for them is not.

### 5. Browse and search

- Search the words in titles, descriptions and tags. Small typos still match.
- Filters: category, offer or request, price range, free only, condition. Sort by newest or by price.
- The search is part of the URL, so you can share it.

### 6. Chat

- Message the person who posted a listing. Each listing gets one conversation per buyer.
- Messages arrive live, with unread badges and the full history.

### 7. Safety tools

- Report a listing, a message or a user, and pick a reason.
- Block a user. You stop seeing each other's listings, and neither of you can message the other.

### 8. Public profile

- Your username, the month you joined, and your active listings. Nothing else.

## Moderation

### Reports and the AI check

1. A student reports something and picks a reason.
2. Gemini reads only the reported content (with usernames removed) and our content rules. It answers **violates**, **safe** or **unsure**, with a confidence score and a short reason.
3. What happens next:

| AI answer | What the app does automatically |
|---|---|
| Violates, high confidence | Hides the content until a human reviews it. This can be undone |
| Safe, high confidence | Puts the report at the bottom of the queue. A human still sees it |
| Unsure, or the AI isn't responding | Normal place in the queue |

**The AI never warns, suspends, bans or deletes anything. Humans do.**

### Moderator and admin dashboard

- A report queue, highest priority first. Each report shows the content, the reporter's reason and the AI's answer.
- Actions: dismiss the report, restore hidden content, or uphold the report and choose an outcome (remove the content, warn, suspend or ban).
- **3-strike rule:** each upheld violation gives the student a strike.
  - 1st strike: warning.
  - 2nd strike: 7-day suspension.
  - 3rd strike: ban, which an admin must confirm.
  - Strikes expire after 6 months. Severe cases (threats, scams, sexual content) can go straight to an admin.
- **Audit log:** every moderation action is recorded: who did what, when and why. Nobody can edit or delete it from inside the app.
- **Appeals:** one appeal per strike, suspension or ban. A different moderator or admin from the one who acted reviews it.
- Suspended students can browse but can't post or send messages. Banned students only see the ban notice and the appeal form.
- Moderators and admins never see students' emails in the dashboard.
- The first admin is created with a command-line script, because there's no admin yet who could grant the role.

## Content rules (draft: you decide)

Not allowed:

- Scams and fake listings
- Weapons, drugs, alcohol, tobacco and vapes, prescription medicines, stolen goods, and anything illegal or against hostel rules
- Academic dishonesty: selling completed assignments, exam answers or leaked papers, and proxy attendance
- Pirated material: copyrighted books or paid course content as PDFs
- Harassment, hate speech and threats
- Sexual content
- Personal information about other people, or trying to find out who is behind a username
- Spam

## Limits

These stop spam and keep us inside the free tiers.

| Item | Limit |
|---|---|
| Active listings | 20 per student |
| Photos | 5 per listing, up to 5 MB each before compression |
| PDF | 20 MB and 300 pages |
| Message | 2,000 characters |
| Reports | 10 per day, and 1 per item |
| OTP code | 6 digits, valid for 10 minutes, 5 wrong tries allowed, a new code after 60 seconds |

## Not in version 1

- Payments, escrow or delivery
- Ratings and reviews
- Native mobile apps (the website is designed for phones first)
- Email or push notifications for new messages
- Other colleges. The allowed email domain is a setting, though, so adding more later is easy
- AI checks on images (a possible extension in Phase 11)

## Open questions for you

1. Do you accept the content rules above? Anything to add or remove?
2. Should paid soft-copy notes be allowed, or only free PDFs?
3. Are the limits above OK?
