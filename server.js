require("dotenv").load();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 5000;
const { Client } = require("pg");
const escape = require("pg-escape");
const worker = require("./worker");
const connectionString = process.env.DATABASE_URL;

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
    res.send(resData);
  });
});

app.post("/login", (req, res) => {
  const token = req.body.token;
  const userid = req.body.userid;
  console.log(token);
  console.log(userid);
  console.log("Got you login");
  const sql = escape(
    "UPDATE users SET token=%L WHERE userid=%L; INSERT INTO users (userid, token) SELECT %L, %L WHERE NOT EXISTS (SELECT * FROM users WHERE userid= %L);",
    token,
    userid,
    userid,
    token,
    userid
  );
  client.query(sql, (error, response) => {
    console.log(error, response);
  });
});

app.get("/users", (req, res) => {
  var sql = "SELECT * FROM people";
  let resData;
  client.query(sql, (error, response) => {
    //console.log(err, res);
    resData = response.rows;
    res.send(resData);
  });
});
//Create jobs here
app.get("/users/:posts", (req, res) => {
  const filters = req.params.posts.split("&");
  const sqlfilter = filters.map(e => {
    return "'" + e + "'";
  });
  const uid = "MDQ6VXNlcjI3Mzk5NjU2";
  const newSlugs = [];
  let pendingJobIds = [];
  client
    .query(
      escape(
        "SELECT slug FROM posts WHERE slug in ('%s')",
        filters.join("', '")
      )
    )
    .then(response => {
      const existingSlugs = response.rows.map(row => {
        return row["slug"];
      });
      console.log(existingSlugs);
      console.log(filters);
      filters.forEach(slug => {
        if (!existingSlugs.includes(slug)) {
          newSlugs.push(slug);
        }
      });
      console.log(newSlugs.length);
      if (!newSlugs.length == 0) {
        console.log("111111111");
        newSlugs.map(slug => {
          console.log("worker here++++++++++");
          const job = worker.queuePostBySlug(slug, uid);
          console.log(job);
        });
      } else {
        console.log("222222222f");
      }
      const sql = escape(
        "SELECT * FROM people WHERE producthunt_id IN (SELECT uid FROM votes WHERE pid IN (SELECT id FROM posts WHERE slug in (%s)));",
        sqlfilter.toString()
      );

      client.query(sql, (error, response) => {
        //console.log(err, res);
        const resData = response.rows;
        res.send(resData);
      });
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
