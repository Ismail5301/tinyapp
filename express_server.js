const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const saltRounds = 12;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['234x0sdf8casdf9', '4kjdfd989sdf2e4'],
  maxAge: 24 * 60 * 60* 1000
}));

//Importing helper functions from helpers.js
const { getUserURLs, findEmail, findUserByID, generateRandomString, findPassword} = require('./helpers.js');

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": { longURL : "http://www.google.com" , userID: "user2RandomID"}
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("2", saltRounds)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("2", saltRounds)
  }
};


app.get("/urls/new", (req, res) => {
  const templateVars = {user : users[req.session["userID"]]};
  if (!req.session.userID){  // Send back to login page if user is not logged in
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});


app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: getUserURLs(req.session["userID"], urlDatabase),
    user: users[req.session["userID"]]
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.post("/url/:id", (req, res) => {
  if (urlDatabase[req.params.id].userID === req.session["userID"]) {
    let longURL = req.body.longURL;
    urlDatabase[req.params.id].longURL = longURL;
    res.redirect('/url');
  } else {
    res.status(403).send("No permission for this action");
  }
})

app.get("/urls/:shortURL", (req, res) => {
   const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session["userID"]]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const {longURL} = req.body;
  urlDatabase[req.params.shortURL].longURL = longURL;
  res.redirect("/urls");
})

// Deleting the URL

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session["userID"]){
  delete urlDatabase[shortURL];
  res.redirect("/urls");
  } else {
    res.status(403).send("No permission for this action");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const userID = req.session["userID"];
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL, userID};
  res.redirect(`/urls/${shortURL}`);
});

//Registration process
app.get("/register", (req, res) => {
  const templateVars = {user: users[req.session["userID"]]};
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  const newUserID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const userObj = {
    id: newUserID,
    email: email,
    password: bcrypt.hashSync(password, saltRounds)
  };
  const userEmail = findEmail(email, users);
  if (userObj.email === "" || userObj.password === "") {
    res.status(400).send("400 error ! Please Provide Information");
  } else if (!userEmail) {
    users[newUserID] = userObj;
    req.session["userID"] = newUserID;
    res.redirect("/urls");
  } else {
    res.status(400).send("400 error ! Please Login");
  }
});
//Login process 
app.get("/login", (req, res) => {
  const templateVars = {
    user : users[req.session["userID"]]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userEmail = findEmail(email, users);
  const userPassword = findPassword(email, users);
  if (email === userEmail) {
    if (bcrypt.compareSync(password, userPassword)) {
      const userID = findUserByID(email, users);
      req.session["userID"] = userID;
      res.redirect("/urls");
    } else {
      res.status(403).send("403 Forbidden: Wrong password!");
    }
  } else {
    res.status(403).send("403 Forbidden : Please register account");
  }
});
//Logout process
app.post("/logout" , (req, res) => {
  req.session["userID"] = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});


