const express = require("express");

const app = express();
const port = process.env.PORT || 5000;
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("customers.db");

app.get("/user/:id", (req, res) => {
  var sql = 'SELECT * FROM customers where twitter="' + req.params.id + '"';
  db.all(sql, (err, rows) => {
    console.log(rows);
    console.log(req.params.id);
    res.send(rows);
  });
  //res.send({ express: "Hello From Expres" });
});
app.get("/users", (req, res) => {
  //###############select user from where users in specified votes
  var sql = "SELECT * FROM customers";
  db.all(sql, (err, rows) => {
    console.log(rows);
    res.send(rows);
  });
  //res.send({ express: "Hello From Expres" });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
