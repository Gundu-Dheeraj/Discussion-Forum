/**
 * Seed script – run: node seed.js
 * Creates demo admin, moderator, and user accounts + sample posts
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});
  console.log('Cleared existing data');

  // Create users
  const admin = await User.create({
    username: 'AdminUser',
    email: 'admin@demo.com',
    password: 'demo1234',
    role: 'admin',
    bio: 'Forum administrator',
    reputation: 1000,
  });

  const mod = await User.create({
    username: 'ModUser',
    email: 'mod@demo.com',
    password: 'demo1234',
    role: 'moderator',
    bio: 'Community moderator',
    reputation: 500,
  });

  const user1 = await User.create({
    username: 'TechEnthusiast',
    email: 'user@demo.com',
    password: 'demo1234',
    role: 'user',
    bio: 'AIML student | Open source lover',
    reputation: 120,
  });

  const user2 = await User.create({
    username: 'CareerCoach',
    email: 'coach@demo.com',
    password: 'demo1234',
    role: 'user',
    bio: 'Helping people make better career decisions',
    reputation: 340,
  });

  console.log('Users created');

  // Create posts
  const posts = await Post.insertMany([
    {
      title: 'Should I choose React or Vue for my startup frontend?',
      description: 'I\'m building a SaaS product solo. I have basic experience with both React and Vue. React has a larger ecosystem but Vue feels simpler. My timeline is tight — 3 months to MVP. Which framework would you choose and why?',
      author: user1._id,
      category: 'Tech',
      tags: ['react', 'vue', 'frontend', 'startup'],
      options: [
        { text: 'React – larger ecosystem & job market' },
        { text: 'Vue – faster to learn, simpler syntax' },
        { text: 'Neither – use something else' },
      ],
      upvotes: [admin._id, mod._id],
      views: 142,
      commentsCount: 2,
    },
    {
      title: 'Should I accept a 40% salary hike with longer hours or stay at current job?',
      description: 'I got an offer for a 40% salary raise but the new role requires 60+ hours/week vs my current 40 hours. I have a family and value work-life balance, but the money would really help with our mortgage. What would you do?',
      author: user2._id,
      category: 'Career',
      tags: ['salary', 'work-life-balance', 'career'],
      options: [
        { text: 'Take the offer – money matters more right now' },
        { text: 'Stay – work-life balance is priceless' },
        { text: 'Negotiate – ask for better hours' },
      ],
      upvotes: [user1._id, admin._id, mod._id],
      views: 289,
      commentsCount: 1,
    },
    {
      title: 'Python vs Java for a CS student in 2025?',
      description: 'I\'m in my second year of CS. My university teaches Java but I see Python everywhere — data science, ML, automation. Should I focus on mastering Java first or switch my focus to Python? Which has better job prospects?',
      author: user1._id,
      category: 'Education',
      tags: ['python', 'java', 'programming', 'career'],
      options: [
        { text: 'Python – more versatile for modern tech' },
        { text: 'Java – stronger OOP foundations' },
        { text: 'Learn both simultaneously' },
      ],
      views: 198,
      commentsCount: 0,
    },
    {
      title: 'Should I invest in mutual funds or real estate?',
      description: 'I have ₹10 lakhs saved up and I\'m trying to decide between long-term SIP in mutual funds vs putting down payment on a plot. I\'m 26 years old, moderate risk appetite, and this is my first major investment.',
      author: user2._id,
      category: 'Finance',
      tags: ['investing', 'mutual-funds', 'real-estate'],
      isAnonymous: true,
      views: 176,
      commentsCount: 0,
    },
    {
      title: 'Remote work from Tier 2 city vs relocating to Bangalore for career growth?',
      description: 'My current remote job pays ₹18 LPA and I\'m in Hyderabad (Tier 2 costs). A Bangalore startup offered ₹24 LPA on-site. After rent and cost of living adjustments, the effective salary might actually be lower in Bangalore. What makes more sense long-term?',
      author: user1._id,
      category: 'Career',
      tags: ['remote-work', 'bangalore', 'career-growth'],
      upvotes: [mod._id],
      views: 312,
      commentsCount: 0,
      status: 'flagged',
    },
  ]);

  // Create comments
  await Comment.insertMany([
    {
      post: posts[0]._id,
      author: mod._id,
      content: 'React is the safer bet for a startup in 2025. The ecosystem is massive — you\'ll find libraries for almost anything you need. More importantly, hiring React developers is much easier when you scale. Vue is excellent but the talent pool is smaller.',
      upvotes: [user1._id, admin._id],
      isBestAnswer: true,
      sentiment: 'positive',
    },
    {
      post: posts[0]._id,
      author: admin._id,
      content: 'Both are solid choices, but for a solo founder on a tight deadline, I\'d actually suggest Vue. The learning curve is gentler, the documentation is superb, and you\'ll ship faster. You can always migrate or adopt React later.',
      upvotes: [mod._id],
      sentiment: 'neutral',
    },
    {
      post: posts[1]._id,
      author: user1._id,
      content: 'Negotiate first. Many employers expect counter-offers. Ask if they can do 50 hours max or offer a flexible schedule. If they say no, then you have a cleaner decision to make. Never accept the first offer as final.',
      upvotes: [user2._id, mod._id, admin._id],
      isBestAnswer: true,
      sentiment: 'positive',
    },
  ]);

  // Update post comment counts
  await Post.findByIdAndUpdate(posts[0]._id, { commentsCount: 2 });
  await Post.findByIdAndUpdate(posts[1]._id, { commentsCount: 1 });

  console.log('Posts and comments created');
  console.log('\n✅ Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo Accounts:');
  console.log('  Admin     → admin@demo.com / demo1234');
  console.log('  Moderator → mod@demo.com   / demo1234');
  console.log('  User      → user@demo.com  / demo1234');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
