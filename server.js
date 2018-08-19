require("dotenv").load();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 5000;
const { Client } = require("pg");
const escape = require("pg-escape");
const fetch = require("node-fetch");
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
    resData = response.rows[0];
    res.send(resData);
  });
});

app.post("/login", (req, res) => {
  const token = req.body.token;
  const userid = req.body.userid;
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
    resData = response.rows;
    res.send({ people: resData });
  });
});

async function newSlugVoteNumber(q, slug) {
  const response = await fetch(
    "https://serve.onegraph.com/dynamic?app_id=59f1697f-4947-49c0-964e-8e3d4fa640be",
    {
      method: "POST",
      body: JSON.stringify({
        query: q,
        variables: { slug: slug }
      }),
      headers: {
        //Authentication: "Bearer " + token,
        Accept: "application/json"
      }
    }
  );
  const body = await response.json();
  const voteNum = body.data.productHunt.post.voters.edges.length;
  return voteNum;
}

const GET_VoteNumber = `
query($slug: String!) {
  productHunt {
    post(slug: $slug) {
      voters {
        edges {
          node {
            id
          }
        }
      }
    }
  }
}
`;

app.get("/users/:posts", (req, res) => {
  const filters = req.params.posts.split("&");
  const sqlfilter = filters.map(e => {
    return "'" + e + "'";
  });
  //TODO: Get real uid
  const uid = "MDQ6VXNlcjI3Mzk5NjU2";
  const newSlugs = [];
  let pendingJobIds = [];
  let totalVotes = 0;
  let exsistingTotalVotes = 0;
  client
    .query(
      escape(
        "SELECT slug, votenum FROM posts WHERE slug in ('%s')",
        filters.join("', '")
      )
    )
    .then(async response => {
      const existingSlugs = response.rows.map(row => {
        return row["slug"];
      });
      //Get total vote nums for all the slugs
      for (const slug of filters) {
        const voteNumber = await newSlugVoteNumber(GET_VoteNumber, slug);
        totalVotes += voteNumber;
      }
      filters.forEach(slug => {
        if (!existingSlugs.includes(slug)) {
          newSlugs.push(slug);
        }
      });
      if (!newSlugs.length == 0) {
        for (const slug of newSlugs) {
          const job = worker.queuePostBySlug(slug, uid);
        }
      }
      const sql = escape(
        "SELECT * FROM people WHERE producthunt_id IN (SELECT uid FROM votes WHERE pid IN (SELECT id FROM posts WHERE slug in (%s)));",
        sqlfilter.toString()
      );

      client.query(sql, (error, response) => {
        const resData = response.rows;
        const peopleTotalVotes = totalVotes;
        const peopleCurrentVotes = resData.length;
        res.send({
          people: resData,
          peopleTotal: peopleTotalVotes,
          peopleCurrent: peopleCurrentVotes
        });
      });
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
