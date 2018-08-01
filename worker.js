const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("montage.db");

const fetch = require("node-fetch");
const idx = require("idx");

let cursor = null;
let hasNextPage = true;

db.serialize(() => {
  db.run("INSERT INTO posts(slug) VALUES ('submarine-poppe');");
});

const peopledataQuery = `
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
        Authentication: "Bearer 82FX1XXuI6Zkp7MMvJHtvfCStQbDyEcJOyiXUG3ZkNU",
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
      db.serialize(() => {
        db.run(
          "UPDATE posts SET cursor = '" +
            startCursor +
            "' WHERE slug = 'submarine-poppe';"
        );
      });
      console.log(cursor);
      console.log(hasNextPage);
      let peopledata = {
        name: null,
        location: null,
        website: null,
        twitter: null,
        github: null,
        avatarURL: null,
        email: null,
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

        peopledata.producthunt_id = idx(e, _ => _.node.id);
        peopledata.name = idx(e, _ => _.node.name);
        peopledata.twitter = e.node.twitter_username;
        //if null, look for github descuri

        peopledata.github = gitHubUser ? gitHubUser.login : null;

        peopledata.avatarURL = twitterUser
          ? twitterUser.profileImageUrlHttps
          : gitHubUser ? gitHubUser.avatarUrl : null;

        peopledata.website = idx(e, _ => _.node.website_url)
          ? idx(e, _ => _.node.website_url)
          : idx(e, _ => _.node.twitterUser.url)
            ? twitterUser.url
            : gitHubUser ? gitHubUser.websiteUrl : null;

        peopledata.location = idx(e, _ => _.node.twitterUser.location)
          ? twitterUser.location
          : gitHubUser ? gitHubUser.location : null;

        peopledata.company = gitHubUser ? gitHubUser.company : null;

        peopledata.email = idx(e, _ => _.node.gitHubUser.email)
          ? gitHubUser.email
          : twitterUser
            ? idx(twitterUser, _ => _.homepageDescuri.mailto)
              ? idx(twitterUser, _ => _.homepageDescuri.mailto)
              : null
            : null;

        let sql =
          "INSERT INTO people(name, url, twitter, github, AvatarUrl, location, email, producthunt_id) VALUES ('" +
          peopledata.name +
          "', '" +
          peopledata.website +
          "', '" +
          peopledata.twitter +
          "', '" +
          peopledata.github +
          "', '" +
          peopledata.avatarURL +
          "', '" +
          peopledata.location +
          "', '" +
          peopledata.email +
          "', '" +
          peopledata.producthunt_id +
          "')";
        db.serialize(() => {
          db.run(sql);
          db.run(
            "INSERT INTO votes VALUES ((select id from people where producthunt_id = '" +
              peopledata.producthunt_id +
              "'),(select id from posts where slug = 'submarine-poppe'));"
          );
        });
      });
      if (hasNextPage == true) {
        getdata(peopledataQuery, {
          slug: "submarine-popper",
          cursor: cursor
        });
      }
    });
};

const people_data = getdata(peopledataQuery, {
  slug: "submarine-popper",
  cursor: cursor
});
