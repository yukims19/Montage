const express = require("express");

const app = express();
const port = process.env.PORT || 5000;
const { Client } = require("pg");
const escape = require("pg-escape");
var config = parse(
  "postgres://someuser:somepassword@somehost:381/somedatabase"
);

const client = new Client({ connectionString: connectionString });
client.connect();
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, "g"), replace);
}

app.get("/user/:id", (req, res) => {
  if (req.params.id == "initialdefault-firstuser") {
    var sql = "SELECT * FROM people LIMIT 1";
  } else {
    var sql = escape(
      "SELECT * FROM people where producthunt_id= %L",
      req.params.id
    );
  }

  let resData;
  client.query(sql, (error, response) => {
    //console.log(err, res);
    resData = response.rows[0];
    console.log(resData);
    res.send(resData);
  });
});

app.get("/users", (req, res) => {
  var sql = "SELECT * FROM people";
  let resData;
  client.query(sql, (error, response) => {
    //console.log(err, res);
    resData = response.rows;
    console.log(resData);
    res.send(resData);
  });
});

app.get("/users/:posts", (req, res) => {
  const filters = req.params.posts.split("&");
  let sqlfilter = filters.map(e => {
    return "'" + e + "'";
  });
  var sql = escape(
    "select * from people where producthunt_id in (select uid from votes where pid in (SELECT id FROM posts WHERE slug in (%s)));",
    sqlfilter.toString()
  );

  let resData;
  client.query(sql, (error, response) => {
    //console.log(err, res);
    resData = response.rows;
    console.log(resData);
    res.send(resData);
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
