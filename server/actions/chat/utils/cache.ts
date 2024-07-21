// import session from "express-session";
// import MongoStore from "connect-mongo";
// import mongoose from "mongoose";

// const sessionStore = MongoStore.create({
//   mongoUrl: process.env.MONGODB_URI, // Your MongoDB URI
//   collectionName: "sessions",
// });

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     store: sessionStore,
//     cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
//   }),
// );
