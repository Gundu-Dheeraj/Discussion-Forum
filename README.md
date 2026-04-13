# ⚖ DecisionForge – MERN Stack Decision Forum

A full-stack community decision forum with moderation panel, polls, voting, notifications, and an admin dashboard.

---

## 🗂 Project Structure

```
decision-forum/
├── backend/           # Node.js + Express API
│   ├── models/        # Mongoose schemas
│   ├── routes/        # Express routers
│   ├── controllers/   # Business logic
│   ├── middleware/    # Auth & role guards
│   ├── server.js      # Entry point
│   └── seed.js        # Demo data seeder
└── frontend/          # React app
    └── src/
        ├── pages/     # Route-level components
        ├── components/ # Reusable UI
        ├── context/   # AuthContext
        └── utils/     # Axios instance
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js >= 16
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env       # Edit MONGO_URI and JWT_SECRET
node seed.js               # Seed demo data
npm run dev                # Starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start                  # Starts on http://localhost:3000
```

---

## 🔐 Demo Accounts

| Role       | Email              | Password  |
|------------|--------------------|-----------|
| Admin      | admin@demo.com     | demo1234  |
| Moderator  | mod@demo.com       | demo1234  |
| User       | user@demo.com      | demo1234  |

---

## 🧩 Features Implemented

### ✅ Authentication & Users
- JWT-based login/register
- Role-based access (user / moderator / admin)
- Profile management

### ✅ Decision Posts
- Create posts with title, description, category, tags
- Anonymous posting
- Poll options with live voting & percentage bars
- Post upvotes / downvotes

### ✅ Comments
- Threaded replies (2 levels deep)
- Comment upvotes/downvotes
- Sentiment analysis (positive/neutral/negative emoji)
- Mark best answer by post author

### ✅ Moderation Panel
- View & filter reports (Pending / Reviewed / Action Taken / Dismissed)
- Auto-flagged posts (toxicity keyword detection)
- Approve or remove flagged content

### ✅ Reporting System
- Report posts and comments
- Reason categories: Spam, Abuse, Irrelevant, Misinformation, Other
- Full lifecycle tracking

### ✅ Notifications
- In-app bell notifications
- Triggered on: reply, vote, moderation, ban, best answer
- Real-time via Socket.io

### ✅ Admin Dashboard
- KPI cards: total users, posts, comments, reports, bans, flags
- Pie chart: posts by category (Recharts)
- Bar chart: users by role (Recharts)
- User management: search, role change, ban/unban
- Recent users and posts

### ✅ Search & Filter
- Full-text search by title/description/tags
- Filter by category
- Sort by: Latest, Top Voted, Trending

### ✅ AI / Smart Features
- Auto-flagging toxic content on creation
- Sentiment analysis on comments
- (Extension point: plug in any NLP API)

---

## 📡 API Reference

| Method | Endpoint                          | Auth      | Description              |
|--------|-----------------------------------|-----------|--------------------------|
| POST   | /api/auth/register                | Public    | Register                 |
| POST   | /api/auth/login                   | Public    | Login                    |
| GET    | /api/auth/me                      | User      | Get profile              |
| PUT    | /api/auth/profile                 | User      | Update profile           |
| GET    | /api/posts                        | Public    | List posts               |
| POST   | /api/posts                        | User      | Create post              |
| GET    | /api/posts/:id                    | Public    | Get post detail          |
| DELETE | /api/posts/:id                    | User/Mod  | Delete post              |
| GET    | /api/posts/stats/overview         | Public    | Forum statistics         |
| GET    | /api/comments/:postId             | Public    | Get comments             |
| POST   | /api/comments/:postId             | User      | Add comment              |
| PUT    | /api/comments/:id/best            | Author    | Mark best answer         |
| POST   | /api/votes/post/:id               | User      | Vote on post             |
| POST   | /api/votes/comment/:id            | User      | Vote on comment          |
| POST   | /api/votes/poll/:postId/:optionId | User      | Vote on poll option      |
| POST   | /api/reports                      | User      | Submit report            |
| GET    | /api/reports                      | Mod/Admin | View reports             |
| PUT    | /api/reports/:id                  | Mod/Admin | Update report status     |
| GET    | /api/admin/stats                  | Mod/Admin | Dashboard stats          |
| GET    | /api/admin/users                  | Mod/Admin | List users               |
| PUT    | /api/admin/users/:id/ban          | Mod/Admin | Ban/unban user           |
| PUT    | /api/admin/users/:id/role         | Admin     | Change user role         |
| PUT    | /api/admin/posts/:id/status       | Mod/Admin | Update post status       |
| GET    | /api/admin/flagged                | Mod/Admin | Get flagged content      |
| GET    | /api/notifications                | User      | Get notifications        |
| PUT    | /api/notifications/read-all       | User      | Mark all read            |

---

## 🛠 Tech Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Frontend    | React 18, React Router v6, Recharts     |
| Styling     | Pure CSS with CSS Variables             |
| HTTP Client | Axios with interceptors                 |
| Backend     | Node.js, Express.js                     |
| Database    | MongoDB with Mongoose ODM               |
| Auth        | JWT + bcryptjs                          |
| Real-time   | Socket.io                               |
| Fonts       | Syne (headings) + DM Sans (body)        |

---

## 🔮 Extension Ideas (AIML Branch 😏)

1. **Toxic comment detection** – Integrate Perspective API or a local TF.js model
2. **Auto-tagging** – Use keyword extraction (e.g., compromise.js) to suggest tags
3. **Decision recommendation** – Sentiment + vote analysis to suggest "best decision"
4. **Spam detection** – Train a simple Naive Bayes classifier on report history
5. **Trending algorithm** – Implement Reddit-style Wilson score ranking
