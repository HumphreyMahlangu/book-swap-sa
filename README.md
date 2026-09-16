# Book Swap SA

Build a polished, fully working full-stack school project called “SecondHand Textbook Swap”. It is a student-to-student marketplace where South African university students can buy, sell, or swap used textbooks affordably. Use the supplied prototype’s visual direction: calm blue-grey palette (#4A6E88 primary, #3A4F62 dark, #629BB6 accent, #C9D5E3 light, #F5F8FA background), rounded cards, soft shadows, clean typography, and a mobile-first app feel. Make it responsive and presentation-ready on both phone and desktop. Do not make a static mockup: every visible control and core flow must work.

TECH STACK AND DATA
- React + TypeScript + Vite, Tailwind CSS, shadcn/ui, Lucide icons, React Router.
- Use the modular Firebase Web SDK: Firebase Authentication (email/password), Cloud Firestore, and Firebase Storage for textbook/profile images.
- Put Firebase config in VITE_FIREBASE_* environment variables, create src/lib/firebase.ts, and add a clear README section explaining exactly how to connect a Firebase project, enable Email/Password auth, create Firestore and Storage, and run the app.
- Include firestore.rules and storage.rules suitable for this student demo: public read of active listings; authenticated users may create listings; only owners may edit/delete their own listings; users may access only their own cart, notifications, profile, orders, and their own message conversations; reviews require authentication.
- IMPORTANT FOR TOMORROW’S DEMO: if Firebase environment variables are missing, the whole app must automatically run in a clearly labelled “Demo mode” using seeded localStorage data. No blank screens and no broken features. All CRUD, cart, messages, checkout, orders, reviews, and profile edits must still work and persist after refresh in demo mode. Provide a one-click “Continue as demo student” option. When Firebase is configured, use Firebase instead of localStorage.

CORE USER FLOWS
1. Authentication: attractive welcome screen, sign up with full name, student number, student email, institution, password and confirm password; login; logout; validation and friendly errors; demo login. Use a protected app shell after authentication.
2. Home: greeting for the signed-in student, notification badge, prominent search, “New books every day” hero, horizontal categories, recently listed textbooks, recommended textbooks, and quick actions.
3. Browse/search: live search by title, author, ISBN, module/course and institution; filters for category, condition, listing type, campus and price range; sort by newest, price low-high, price high-low. Empty and loading states must look good.
4. Product details: real cover image or tasteful fallback, title, author, edition, ISBN, module, condition, seller, campus, description, price in South African rand, listing type (Sell / Swap / Sell or Swap), seller rating, add to cart, request swap, contact seller, and share/copy-link feedback. Prevent users from buying their own listing.
5. Sell a textbook: image preview/upload, title, author, module/course, edition, ISBN, category, condition, description, price, campus/collection location and listing type. Validate required fields. Publishing immediately adds the item to Browse and My Listings. Owners can edit, mark sold/swapped, and delete with confirmation.
6. Cart: add/remove items, prevent duplicates, subtotal and item count. Checkout collects a collection/delivery choice, optional note and a fake payment choice. Do NOT use a real payment gateway or collect real card/bank details. Offer only safe simulated options such as “Demo card payment”, “Pay on collection”, or “EFT simulation”. Clicking “Place demo order” shows a success state, creates an order with a readable order number, clears purchased cart items, and adds a notification.
7. Orders: tabs for active/completed/cancelled, order detail with status timeline (Confirmed, Arranging collection, Completed), textbook, seller, total and meeting details. Let the user mark a demo order completed.
8. Swap flow: request a swap by choosing one of the current user’s active listings and adding a message. Show sent/received swap requests with Pending, Accepted, Declined and Completed states; in demo mode allow accepting/declining received requests.
9. Messages: conversation list and usable chat thread. Contact Seller opens or reuses a conversation about that textbook. Sending messages works in demo mode and writes to Firestore when configured. Show timestamps and helpful empty states.
10. Notifications: order, message, listing and swap notifications; unread indicator; mark one or all as read.
11. Reviews: seller rating summary, review list and authenticated review form with 1–5 stars and comment. After a completed order, allow reviewing the seller once.
12. Profile: avatar, name, student number, student email, institution/campus, member since, rating and counts for active/sold/swapped listings. Include Edit Profile, My Listings, Orders, Swap Requests, Messages, Reviews, Settings, About and Help/Contact screens. Profile editing and notification preferences must persist.

INFORMATION ARCHITECTURE
- Routes: /welcome, /login, /signup, /, /browse, /books/:id, /sell, /listings, /listings/:id/edit, /cart, /checkout, /orders, /orders/:id, /swaps, /messages, /messages/:conversationId, /notifications, /profile, /profile/edit, /reviews, /settings, /about, /help, and a friendly 404.
- Use a bottom navigation on mobile: Home, Browse, Sell, Alerts, Profile. On desktop, use a compact top/side navigation while preserving the same style.
- Keep page headers, buttons, form labels and status chips consistent. Add toast feedback for successful/failed actions. Use accessible labels, keyboard-friendly controls and sensible contrast.

SEED DATA AND POLISH
- Seed at least 10 realistic South African university textbooks across Information Technology, Business, Accounting, Engineering, Mathematics and Communication, with realistic ZAR prices, module codes and CPUT-style campuses. Use clearly fictional student names and no private personal data.
- Seed a demo student, several sellers, ratings, messages, notifications, one active order and a few listing statuses so every page is convincing during a presentation.
- Prefer reliable remote cover images from stable public image URLs, but always provide an attractive book-cover fallback so broken images never hurt the demo.
- Add loading skeletons, empty states, error boundaries, and a small Demo Mode badge when localStorage fallback is active.
- Avoid lorem ipsum, dead links, placeholder buttons, real financial claims, real card inputs and unfinished TODO sections.

DELIVERY QUALITY
- Build the complete app now, not only a landing page or plan.
- Ensure all routes render without errors and all core flows work end-to-end in demo mode immediately: demo login → browse/search → product → cart → demo checkout → order → notification; sell → publish → edit/mark sold; contact seller → send message; request swap → update status; edit profile → persist.
- Keep components and data services modular so Firebase and demo repositories expose the same interface. Use strict TypeScript and fix all build/runtime errors before considering the task done.
- Include a concise in-app “Presentation guide” reachable from Help that lists a 3-minute demo path, plus Firebase setup instructions in README.

Start by implementing the working app in one coherent pass. Prioritize reliability, navigation and real interactions over fancy animation.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a931b988-c6c0-46c7-a7f8-0790771c4b0b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
