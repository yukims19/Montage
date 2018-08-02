const express = require("express");

const app = express();
const port = process.env.PORT || 5000;
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("montage.db");

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, "g"), replace);
}

app.get("/user/:id", (req, res) => {
  if (req.params.id == "initialdefault-firstuser") {
    var sql = "SELECT * FROM people where id = 1";
  } else {
    var sql = 'SELECT * FROM people where id="' + req.params.id + '"';
  }

  db.all(sql, (err, rows) => {
    console.log(rows);
    console.log(req.params.id);
    res.send(rows);
    console.log("1111111");
    console.log(db);
  });
});

app.get("/users", (req, res) => {
  var sql = "SELECT * FROM people";
  db.all(sql, (err, rows) => {
    console.log(rows);
    console.log(req.params.id);
    res.send(rows);
    console.log("1111111");
  });
});

app.get("/users/:posts", (req, res) => {
  const filters = req.params.posts.split(",");
  console.log(filters);
  let sqlfilter = filters.map(e => {
    return "or title = '" + e + "'";
  });
  var sql =
    'select * from people where id in (select uid from votes where pid in(select id from posts where title = ""' +
    sqlfilter +
    "))";
  sql = replaceAll(sql, ",", "");
  db.all(sql, (err, rows) => {
    console.log(rows);
    res.send(rows);
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
