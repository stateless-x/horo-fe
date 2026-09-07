# Thai copy review

Assumptions: Thai readers in Thailand, a friendly astrology product, and a primary goal of helping people start a free reading. Existing routes and product behavior define the scope. Voice: conversational Thai, short sentences, light warmth, คุณ only where needed, no archaic narrator or dash punctuation in authored UI prose.

## Changes

The homepage now opens with “ดูดวงฟรี เผื่อวันนี้จะเข้าใจตัวเองขึ้น”. Benefits and sample readings come before the closing CTA. The explanation of astrology systems follows that CTA, with an expandable FAQ at the bottom. Calendar explanations are also expandable below the calendar and CTA. FAQ answers and FAQPage JSON-LD share the same data.

Onboarding, login, invitations, shared results, daily and full readings, compatibility, settings, cookies, sharing, donation prompts and privacy navigation use the same voice. Privacy clauses retain their substance; headings and address are easier to read. Unsupported accuracy and absolute privacy claims were removed from the marketing FAQ. New generated readings use updated prompt instructions. Existing saved readings are not rewritten.

## Metadata verification

Counts below were measured from generated production HTML as Unicode code points. Thai combining marks mean rendered pixel width remains the practical search display constraint. Utility pages intentionally use short titles and descriptions.

| Route | Title | Title count | Description count |
| --- | --- | --- | --- |
| / | ดูดวงออนไลน์ฟรี เรื่องงาน เรื่องรัก รู้จักตัวเอง \| สายมู | 56 | 142 |
| /fortune | ดูดวงฟรี เริ่มจากวันเกิดของคุณ \| สายมู | 38 | 145 |
| /calendar/2026-09 | ปฏิทินไทย กันยายน 2569 วันพระ วันโกน วันหยุด \| สายมู | 52 | 137 |
| /login | เข้าสู่ระบบ \| สายมู | 19 | 85 |
| /privacy | นโยบายความเป็นส่วนตัว \| สายมู | 29 | 106 |

Homepage description: ดูดวงออนไลน์ฟรีกับสายมู ชวนอ่านเรื่องงาน ความรัก การเงิน และดวงคู่จากวันเกิด ใช้ AI เรียบเรียงดวงไทย ปาจื้อ และ MBTI ดูผลเบื้องต้นได้ก่อนสมัคร

Fortune description: ดูดวงฟรีจากวันเกิดกับสายมู บอกชื่อและข้อมูลเกิดเพื่อดูผลเบื้องต้น ใช้ดวงไทย ปาจื้อ และ MBTI ที่คุณเลือกบอก อยากอ่านครบทั้ง 6 ด้าน ค่อยเข้าสู่ระบบ

Calendar description example: ปฏิทินไทย กันยายน 2569 เช็กวันพระ วันโกน วันหยุดราชการ และสีประจำวัน ดูวันสำคัญของเดือนนี้ให้ครบ ก่อนนัดทำบุญหรือวางแผนวันพักผ่อนกับสายมู

Keyword intent: homepage targets ดูดวงออนไลน์ฟรี; onboarding targets ดูดวงฟรี; calendar targets ปฏิทินไทย with month and Buddhist year. Supporting terms include ดูดวงคู่, วันเกิด, วันพระ, วันโกน, วันหยุด and MBTI. Live Thai search results informed phrasing; search volume and ranking potential have not been verified. Existing slugs and canonicals are retained. Existing WebApplication, Organization and FAQPage schema are retained; no invented ratings or credentials were added. Links connect the FAQ with privacy and calendar pages.

Calendar background source: [สำนักงานพระพุทธศาสนาจังหวัดภูเก็ต, วันโกน วันพระ](https://pkt.onab.go.th/th/content/category/detail/id/73/iid/465). The calendar now links to this source and avoids unsupported supernatural guarantees.

## Validation

Frontend production build passed, including 123 generated pages. All 31 frontend and 114 backend tests passed; the 11 loading content and daily prompt tests also passed after the last prompt edits. Homepage was visually checked at 390 px and calendar structure checked in the browser. Seven FAQ entities were verified in generated HTML. Authenticated results and new live AI output were not exercised.

Backend type checking reports Elysia and HTTP header type errors. These also reproduce in a clean snapshot of the original HEAD with the same installed dependencies. Copy edits do not resolve those existing errors. AI punctuation instructions affect future generations but cannot guarantee every model response or change cached readings.
