const express = require("express");

const app = express();
const port = process.env.PORT || 5000;
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("customers.db");

app.get("/api/:id", (req, res) => {
  var sql = 'SELECT name FROM customers where twitter="' + req.params.id + '"';
  db.all(sql, (err, rows) => {
    console.log(rows);
    console.log(req.params.id);
    const allUsernames = rows.map(e => e.name);
    console.log(allUsernames);
    res.send(allUsernames);
  });
  //res.send({ express: "Hello From Expres" });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
