const { Client } = require("pg");
const escape = require("pg-escape");
const connectionString =
  "postgresql://dbuser:secretpassword@database.server.com:3211/mydb";

const fetch = require("node-fetch");
const idx = require("idx");

let cursor = null;
let hasNextPage = true;
const productSlug = "submarine-popper";
const client = new Client({ connectionString: connectionString });
client.connect();

let sqlPostsSlug = escape("INSERT INTO posts(slug) VALUES (%L);", productSlug);

client.query(sqlPostsSlug, (err, res) => {
  console.log(err, res);
});

//Capitalize data
const peopleDataQuery = `
  query($slug: String!, $cursor: String!) {
  productHunt {
    post(slug: $slug) {
      voters(first: 30, after: $cursor) {
        edges {
          node {
            id
            websiteUrl
            gitHubUser {
              login
              websiteUrl
              email
              avatarUrl
              company
              location
            }
            twitter_username
            id
            name
            twitterUser {
              screenName
              name
              url
              location
              profileImageUrlHttps
              homepageDescuri {
                gitHub {
                  gitHubUser {
                    avatarUrl
                    websiteUrl
                    email
                    company
                    location
                    login
                  }
                }
                mailto {
                  address
                  uri
                }
              }
            }
          }
          cursor
        }
        pageInfo {
          startCursor
          hasNextPage
          endCursor
        }
      }
      name
      id
      votes_count
    }
  }
}`;
const getdata = (q, v) => {
  var bodycontent = {
    query: q,
    variables: v
  };
  fetch(
    "https://serve.onegraph.com/dynamic?app_id=59f1697f-4947-49c0-964e-8e3d4fa640be",
    {
      method: "POST",
      body: JSON.stringify(bodycontent),
      headers: {
        Authentication: "Bearer -RKkmL84TUov58KZcIUoJLxGdypYmQ7k4tikDvWNYdw",
        Accept: "application/json"
      }
    }
  )
    .then(res => res.json())
    .catch(error => error.json())
    .then(json => {
      console.log(json);
      console.log("Setting data here");
      cursor = json.data.productHunt.post.voters.pageInfo.endCursor;
      hasNextPage = json.data.productHunt.post.voters.pageInfo.hasNextPage;
      //Need to store startCursor in posts table to get new voted people
      const startCursor =
        json.data.productHunt.post.voters.pageInfo.startCursor;
      let sqlPostsCursor = escape(
        "UPDATE posts SET cursor = %L WHERE slug = %L;",
        startCursor,
        productSlug
      );
      client.query(sqlPostsCursor, (err, res) => {
        console.log(err, res);
      });
      console.log(cursor);
      console.log(hasNextPage);
      let peopleData = {
        name: null,
        location: null,
        website: null,
        twitter: null,
        github: null,
        avatarURL: null,
        email: [],
        company: null,
        producthunt_id: null
      };
      const upvoters = json.data.productHunt.post.voters.edges;
      upvoters.forEach((e, index) => {
        const gitHubUser = idx(e, _ => _.node.gitHubUser)
          ? idx(e, _ => _.node.gitHubUser)
          : idx(e, _ => _.node.twitterUser.homepageDescuri.gitHub.gitHubUser);
        const twitterUser = idx(e, _ => _.node.twitterUser)
          ? idx(e, _ => _.node.twitterUser)
          : ""; /*github descuri here*/

        peopleData.producthunt_id = idx(e, _ => _.node.id);
        peopleData.name = idx(e, _ => _.node.name);
        peopleData.twitter = e.node.twitter_username;
        //if null, look for github descuri

        peopleData.github = gitHubUser ? gitHubUser.login : null;

        peopleData.avatarURL = twitterUser
          ? twitterUser.profileImageUrlHttps
          : gitHubUser ? gitHubUser.avatarUrl : null;

        peopleData.website = idx(e, _ => _.node.website_url)
          ? idx(e, _ => _.node.website_url)
          : idx(e, _ => _.node.twitterUser.url)
            ? twitterUser.url
            : gitHubUser ? gitHubUser.websiteUrl : null;

        peopleData.location = idx(e, _ => _.node.twitterUser.location)
          ? twitterUser.location
          : gitHubUser ? gitHubUser.location : null;

        peopleData.company = gitHubUser ? gitHubUser.company : null;

        peopleData.email = idx(e, _ => _.node.gitHubUser.email)
          ? gitHubUser.email
          : twitterUser
            ? idx(twitterUser, _ => _.homepageDescuri.mailto)
              ? idx(twitterUser, _ => _.homepageDescuri.mailto)
              : []
            : [];
        //Table people
        let sqlPeople = escape(
          "INSERT INTO people(name, url, twitter, github, AvatarUrl, location, email, producthunt_id) VALUES (%L,%L,%L,%L,%L,%L,%L,%L)",
          peopleData.name,
          peopleData.website,
          peopleData.twitter,
          peopleData.github,
          peopleData.avatarURL,
          peopleData.location,
          peopleData.email.toString(),
          peopleData.producthunt_id
        );
        client.query(sqlPeople, (err, res) => {
          console.log(err, res);
        });

        //Table votes
        let sqlVotes = escape(
          "INSERT INTO votes VALUES(%L, (select id from posts where slug = %L))",
          peopleData.producthunt_id,
          productSlug
        );
        client.query(sqlVotes, (err, res) => {
          console.log(err, res);
        });
      });

      if (hasNextPage == true) {
        getdata(peopleDataQuery, {
          slug: productSlug,
          cursor: cursor
        });
      } else {
        //client.end();
      }
    });
};

const people_data = getdata(peopleDataQuery, {
  slug: productSlug,
  cursor: cursor
});
//client.end();
