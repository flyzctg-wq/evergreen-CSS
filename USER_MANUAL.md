# 🏏 Evergreen Club Cricket Scoring System — User Manual
# 🏏 এভারগ্রিন ক্লাব ক্রিকেট স্কোরিং সিস্টেম — ব্যবহারকারী নির্দেশিকা

---

# Part 1 — English User Manual

## 1. Getting Started & Logging In
When you open the Scorer Console, you will be prompted to authenticate:
- **Persistent Login (Online):** Register an account using your email, full name, and a **6-digit numeric passcode** (e.g. `123456`). No complex passwords, uppercase, or special characters are required.
- **Offline Scoring (Guest Scorer):** Click **Score as Guest (Offline)** to run a match locally in your browser without saving any data to the cloud.

---

## 2. Player Draft & Selection Board
The Draft Board allows you to manage a pool of players and assign their tactical roles:
- **Roster Management:** You can add new players, edit existing names, search for players, or reset the pool to the default 27 club members.
- **Assigning Player Roles:** Each player can be assigned a specific cricket role from the dropdown menu:
  - 🏏 **Right-Handed Batsman (RHB):** Bat icon pointing right.
  - 🏏 **Left-Handed Batsman (LHB):** Bat icon pointing left (automatically mirrored).
  - ☄️ **Fast Bowler:** Fast delivery ball icon with speed trails.
  - 🌀 **Spin Bowler:** Spinning ball icon with circular rotation arrows.
  - 🧤 **Wicket-keeper:** Wicket-keeping gloves icon.
  - 🏏⚾ **All-rounder:** Bat and ball icon grouped together.
- **Smart Auto-Detection:** If you write keywords like `RHB`, `LHB`, `Fast`, `Spin`, `WK` / `Keeper`, or `AR` / `All-rounder` in the *Notes & Remarks* column, the dropdown will auto-select the role for you.
- **Loading Rosters:** Toggle players as "Selected", then click **Assign to Team A** or **Assign to Team B**. In the Match Setup wizard, click **Load Draft** to automatically import these squads.

---

## 3. Match Setup & Rules
Before starting the match, configure the format:
- **Match Format:** Specify the total overs per innings and the squad size (e.g., 20 overs, 11-a-side).
- **Bowler Quota:** The system automatically calculates the maximum overs per bowler based on ICC proportional rules:
  $$\text{Max Overs} = \lceil\text{Total Overs} \div 5\rceil$$
- **Injury Replacement Rules:**
  - **Standard Local (MCC Laws):** Substitutes are restricted to fielding only. They are barred from batting and bowling.
  - **Serious Injury Replacement:** Allows a "like-for-like" substitute to bat and bowl following severe trauma/blow, subject to referee approval.

---

## 4. Live Scoring Controls
Once the toss is decided, the scorer enters the live scoring screen:
- **Standard Runs:** Tap `0`, `1`, `2`, `3`, `4`, or `6` to record runs scored off the bat.
- **Extras Toggles:** Toggle **Wide**, **No ball**, **Bye**, or **Leg bye** before selecting the run value:
  - *Wide:* Adds 1 run (or more if selected) to the team total. The ball is not counted in the over.
  - *No ball:* Adds 1 run plus bat runs. Arms a *Free Hit* for the next delivery.
- **Wickets:** Click **Wicket** and select the dismissal type. Under a *Free Hit* or *No ball*, only **Run Out** and **Retired Hurt** are selectable, strictly adhering to ICC laws.
- **Undo Ball:** Mistake during entry? Click **↩ Undo Ball** to step back.
- **Manual Correction:** Need to override historical errors? Click **Manual Correction** to directly edit runs, wickets, and legal balls.

---

## 5. Spectator Live Viewer
- **Broadcast Channel (Same-Device):** Open the file in another tab or monitor on the same device; it syncs in real-time.
- **Cloud Sync (Vercel KV / Upstash):** Open the Scorer's **Viewers** panel, copy the live URL, and share it. Anyone on the internet can open this link to follow the match ball-by-ball.

---

# পার্ট ২ — বাংলা ব্যবহারকারী নির্দেশিকা

## ১. অ্যাকাউন্ট নিবন্ধন ও লগইন
স্কোরার কনসোলটি খোলার পর আপনাকে লগইন বা নিবন্ধন করতে বলা হবে:
- **অনলাইন লগইন:** আপনার ইমেইল, সম্পূর্ণ নাম এবং ক্লায়েন্টের চাহিদা অনুযায়ী একটি **৬-সংখ্যার পিনকোড/পাসকোড** (যেমন: `123456`) ব্যবহার করে অ্যাকাউন্ট নিবন্ধন করুন। এখানে কোনো জটিল পাসওয়ার্ড, ক্যাপিটাল লেটার বা প্রতীকের প্রয়োজন নেই।
- **অতিথি হিসেবে স্কোরিং (অফলাইন):** মেঘে (ক্লাউড) কোনো ডেটা সংরক্ষণ না করে আপনার ব্রাউজারে স্থানীয়ভাবে ম্যাচ পরিচালনা করতে **Score as Guest (Offline)** বাটনে ক্লিক করুন।

---

## ২. খেলোয়াড় ড্রাফট এবং সিলেকশন বোর্ড
ড্রাফট বোর্ডের মাধ্যমে আপনি খেলোয়াড়দের তালিকা পরিচালনা করতে পারবেন এবং তাদের রোল/ভূমিকা নির্ধারণ করতে পারবেন:
- **খেলোয়াড় তালিকা পরিচালনা:** আপনি নতুন খেলোয়াড় যুক্ত করতে পারেন, নাম পরিবর্তন করতে পারেন, খেলোয়াড় খুঁজতে পারেন অথবা মূল ২৭ জন ক্লাবের খেলোয়াড়ের তালিকায় রিসেট করতে পারেন।
- **ভূমিকা (Role) নির্ধারণ:** ড্রপডাউন মেনু থেকে প্রতিটি খেলোয়াড়ের ভূমিকা নির্ধারণ করুন, যা স্কোরকার্ডে আইকন হিসেবে প্রদর্শিত হবে:
  - 🏏 **Right-Handed Batsman (RHB):** ডানহাতি ব্যাটার আইকন।
  - 🏏 **Left-Handed Batsman (LHB):** বামহাতি ব্যাটার আইকন (এটি স্বয়ংক্রিয়ভাবে স্ক্রিনে উল্টো দিকে ঘুরে যায়)।
  - ☄️ **Fast Bowler:** গতিশীল ফাস্ট বোলার বল আইকন।
  - 🌀 **Spin Bowler:** বৃত্তাকার ঘূর্ণন তীরসহ স্পিন বোলার বল আইকন।
  - 🧤 **Wicket-keeper:** উইকেট-কিপিং গ্লাভস আইকন।
  - 🏏⚾ **All-rounder:** ব্যাট এবং বল একত্রিত অলরাউন্ডার আইকন।
- **স্মার্ট অটো-ডিটেকশন:** আপনি যদি খেলোয়াড়ের *Notes & Remarks* কলামে `RHB`, `LHB`, `Fast`, `Spin`, `WK` / `Keeper`, বা `AR` / `All-rounder` লিখেন, তবে সিস্টেমটি স্বয়ংক্রিয়ভাবে ড্রপডাউন মেনুতে খেলোয়াড়ের রোল সিলেক্ট করে নেবে।
- **স্কোয়াড অ্যাসাইন ও লোড:** খেলোয়াড়দের নামের পাশে টিক চিহ্ন দিয়ে **Assign to Team A** অথবা **Assign to Team B** বাটনে ক্লিক করুন। ম্যাচ সেটআপ উইজার্ডে গিয়ে **Load Draft** বাটনে ক্লিক করলে এই স্কোয়াডগুলো সরাসরি ইম্পোর্ট হয়ে যাবে।

---

## ৩. ম্যাচ সেটআপ ও নিয়মাবলী
খেলার শুরুর আগে ম্যাচের ফরম্যাট নির্ধারণ করুন:
- **ম্যাচ ফরম্যাট:** ইনিংস প্রতি মোট ওভার এবং ম্যাচ প্রতি দলগত খেলোয়াড় সংখ্যা (যেমন: ২০ ওভার, ১১ জন খেলোয়াড়) লিখুন।
- **বোলার ওভার কোটা:** আইসিসি আনুপাতিক নিয়ম অনুযায়ী সিস্টেমটি স্বয়ংক্রিয়ভাবে বোলার প্রতি সর্বোচ্চ ওভার নির্ধারণ করে:
  $$\text{বোলার প্রতি সর্বোচ্চ ওভার} = \lceil\text{মোট ওভার} \div ৫\rceil$$
- **ইনজুরি রিপ্লেসমেন্ট নিয়ম:**
  - **Standard Local (MCC Laws):** অতিরিক্ত খেলোয়াড় শুধু ফিল্ডিং করতে পারবে। তারা ব্যাটিং বা বোলিং করতে পারবে না।
  - **Serious Injury Replacement:** গুরুতর আঘাতের ক্ষেত্রে আম্পায়ার ও রেফারির অনুমতি সাপেক্ষে সমমানের খেলোয়াড় (ব্যাট ও বল করার যোগ্য) বদলি হিসেবে খেলার সুযোগ পাবে।

---

## ৪. লাইভ স্কোরিং কন্ট্রোল
টসের পর স্কোরার লাইভ স্কোরবোর্ড স্ক্রিনে প্রবেশ করবেন:
- **রান ইনপুট:** ব্যাটের রান ইনপুট করতে `0`, `1`, `2`, `3`, `4` বা `6` বাটনে ট্যাপ করুন।
- **অতিরিক্ত রান (Extras):** রান সিলেক্ট করার পূর্বে **Wide**, **No ball**, **Bye** অথবা **Leg bye** টগলটি সিলেক্ট করে নিন:
  - *Wide:* অতিরিক্ত ১ রান বা তার বেশি দলের টোটালে যোগ হবে এবং বলটি ওভারে গণনা করা হবে না।
  - *No ball:* অতিরিক্ত ১ রান ও ব্যাটের রান যোগ হবে। পরবর্তী বলটিতে রানার একটি *Free Hit* পাবেন।
- **উইকেট:** **Wicket** বাটনে ক্লিক করে আউটের ধরণ সিলেক্ট করুন। আইসিসি নিয়ম অনুযায়ী নো-বল বা ফ্রি-হিটের ক্ষেত্রে শুধুমাত্র **Run Out** এবং **Retired Hurt** আউট করা যাবে।
- **অনূর্ধ্ব বল (Undo):** কোনো বল ভুল ইনপুট দিলে **↩ Undo Ball** বাটনে ক্লিক করে পেছনের বলগুলোতে ফিরে যান।
- **ম্যানুয়াল কারেকশন:** ম্যাচ হিস্টোরিতে ভুল সংশোধন করতে **Manual Correction** বাটনে ক্লিক করে সরাসরি রান, উইকেট বা ওভারের বল সংখ্যা পরিবর্তন করতে পারবেন।

---

## ৫. লাইভ দর্শক ভিউয়ার
- **ব্রডকাস্ট চ্যানেল (একই ডিভাইস):** একই কম্পিউটারে আরেকটি ব্রাউজার ট্যাবে ম্যাচ ভিউয়ার লিংকটি ওপেন করলে এটি সরাসরি সিঙ্ক হবে।
- **ক্লাউড সিঙ্ক (Vercel KV / Upstash):** স্কোরার প্যানেলে থাকা **Viewers** বাটনে ক্লিক করে ভিউয়ার লিংকটি কপি করে বন্ধুদের সাথে শেয়ার করুন। ইন্টারনেটের মাধ্যমে যেকোনো ব্যক্তি ম্যাচটি লাইভ দেখতে পাবেন।
