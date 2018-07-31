const express = require("express");

const app = express();
const port = process.env.PORT || 5000;
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("customers.db");

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, "g"), replace);
}

app.get("/user/:id", (req, res) => {
  var sql = 'SELECT * FROM customers where twitter="' + req.params.id + '"';
  db.all(sql, (err, rows) => {
    console.log(rows);
    console.log(req.params.id);
    res.send(rows);
  });
});

app.get("/users", (req, res) => {
  var sql = "SELECT * FROM customers";
  db.all(sql, (err, rows) => {
    console.log(rows);
    console.log(req.params.id);
    res.send(rows);
  });
});

app.get("/users/:posts", (req, res) => {
  const filters = req.params.posts.split(",");
  console.log(filters);
  let sqlfilter = filters.map(e => {
    return "or title = '" + e + "'";
  });
  var sql =
    'select * from customers where id in (select uid from votes where pid in(select id from posts where title = ""' +
    sqlfilter +
    "))";
  sql = replaceAll(sql, ",", "");
  db.all(sql, (err, rows) => {
    console.log(rows);
    res.send(rows);
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
