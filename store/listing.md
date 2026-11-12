# LinkClean — Chrome Web Store listing

Name and summary come from the package (`src/public/_locales/en/messages.json`,
`extName` / `extDesc`). The detailed description below is dashboard-only: paste
it into the CWS dashboard (Store listing → Description) by hand.

## Name (package)

LinkedIn Feed Cleaner - Filter Ads, Spam & Promoted Posts

## Summary (package)

Clean your LinkedIn feed — filter promoted posts, suggested content, polls, reshares & newsletter ads. 28 languages. Free.

## Detailed description (dashboard)

LinkClean hides promoted posts, suggested content, polls, reshares and newsletter ads in your LinkedIn feed, so you see the people and posts you actually follow.

Features:
• Hide Promoted — removes sponsored posts and promoted ads
• Hide Suggested — removes posts from people you don't follow
• Hide Newsletter Ads — removes subscribe prompts
• Hide Sidebar Ads — removes promoted ads in the right sidebar
• Hide Polls, Reshares and Video-Only posts — optional filters
• Stats — how many posts were hidden this session and all time
• Badge count on the extension icon

Works in Chrome, Brave and Edge. Detects promoted labels in more than 20 LinkedIn interface languages, including English, Russian, Ukrainian, German, French, Spanish, Portuguese, Italian, Dutch, Polish, Swedish and Turkish. The extension itself is translated into 28 languages.

Private by design: filtering runs entirely in your browser. LinkClean has no account, sends no data to any server and only asks for storage permission plus access to linkedin.com.

How it works:
1. Install LinkClean.
2. Open or reload linkedin.com — promoted and suggested posts are hidden automatically.
3. Click the LinkClean icon to choose which filters are on and see what was hidden.

Why LinkClean:
• Text-based detection instead of LinkedIn's changing CSS class names, so it keeps working when LinkedIn updates its page.
• Lightweight: one small content script, no background network requests.

Something not hidden, or LinkedIn changed its layout? Open the LinkClean popup: it shows whether it can reach your feed, can copy a diagnostic report, and links to support.

Built by Mirana Apps.

## Reply to the 2026-10-04 review "Not working in Brave" (dashboard)

Thanks for reporting this. LinkClean 1.3.9 is tested in Brave and hides promoted posts there. If the feed still shows ads, please reload linkedin.com once after installing or updating, and check that the extension has access to linkedin.com (Brave: Extensions → LinkClean → Site access). If it still fails, open the LinkClean popup — it now tells you when it can't reach the feed — and copy the diagnostic report there and send it through the support link (konabayev.com/linkclean/support/).
