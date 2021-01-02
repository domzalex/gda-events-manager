const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("./models/User");
const ListTask = require("./models/ListTask");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

app.use("/static", express.static("static"));

app.use(express.urlencoded({ extended: true }));

//DB CONNECT
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, () => {
  console.log("We're connected, baby.");
  app.listen(3000, () => console.log("We did it, baby."));
});


//ENGINE CONFIG
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
  secret: "Rusty is a dog",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//GET
app.get('/', (req, res) => {
  res.render("login");
});

app.get('/login', (req, res) => {
  res.render("login");
});

app.get('/list', isLoggedIn, (req, res) => {
  ListTask.find({}, (err, tasks) => {
    res.render("list", { listTask: tasks });
  });
});

//POST
app.post('/login', passport.authenticate('local', {
  successRedirect: '/list',
  failureRedirect: '/login'
}), (req, res) => {
});

app.post('/list', async (req, res) => {
  const listTask = new ListTask({
    name: req.body.name,
    date: req.body.date,
    location: req.body.location
  });
  try {
    await listTask.save();
    res.redirect("/list");
  } catch (err) {
    res.redirect("/list");
  }
});

//UPDATE
app
  .route("/edit/:id")
  .get((req, res) => {
    const id = req.params.id;
    ListTask.find({}, (err, tasks) => {
      res.render("listEdit", { listTask: tasks, idTask: id });
    });
  })
  .post((req, res) => {
    const id = req.params.id;
    ListTask.findByIdAndUpdate(id, { name: req.body.name, date: req.body.date, location: req.body.location }, err => {
      if (err) return res.send(500, err);
      res.redirect("/list");
    });
  });


  //DELETE
  app.route("/remove/:id").get((req, res) => {
    const id = req.params.id;
    ListTask.findByIdAndRemove(id, err => {
      if (err) return res.send(500, err);
      res.redirect("/list");
    });
  });

//CHECKS FOR LOGIN OK
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}
