const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("montage.db");

const fetch = require("node-fetch");
const idx = require("idx");
let peopledata = {
  name: null,
  location: null,
  website: null,
  twitter: null,
  github: null,
  avatarURL: null,
  email: null,
  company: null
};
let cursor = null;
let hasNextPage = true;

const peopledataQuery = `
  query($slug: String!, $cursor: String!) {
  productHunt {
    post(slug: $slug) {
      voters(first: 30, after: $cursor) {
        edges {
          node {
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
      console.log(cursor);
      console.log(hasNextPage);
      const upvoters = json.data.productHunt.post.voters.edges;
      upvoters.forEach((e, index) => {
        const gitHubUser = idx(e, _ => _.node.gitHubUser)
          ? idx(e, _ => _.node.gitHubUser)
          : idx(e, _ => _.node.twitterUser.homepageDescuri.gitHub.gitHubUser);
        const twitterUser = idx(e, _ => _.node.twitterUser)
          ? idx(e, _ => _.node.twitterUser)
          : ""; /*github descuri here*/

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
          "INSERT INTO people(name, url, twitter, github, AvatarUrl, location, email) VALUES ('" +
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
          "')";
        db.serialize(() => {
          db.run(sql);
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

/*
  const people_data = getdata(peopledataQuery, {
  slug: "startup-stash",
  cursor: cursor
  });

const findVotesQuery = `query findVoters($cursor: String!) {
  productHunt {
    post(slug: "codezen") {
      voters(after: $cursor) {
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
        edges {
          cursor
          node {
            first_name
            name
            followers_count
            followings_count
            twitterUser {
              name
              statusesCount
              screenName
              homepageDescuri {
                mailto {
                  address
                }
                other {
                  descuri {
                    mailto {
                      address
                    }
                  }
                }
              }
            }
          }
        }
      }
      votes_count
      _id
    }
  }
}
`;
*/
