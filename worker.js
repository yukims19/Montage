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

const peopledataQuery = `
  query($slug: String!) {
  productHunt {
    post(slug: $slug) {
      voters(first: 2) {
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
      const upvoters = json.data.productHunt.post.voters.edges;
      const gitHubUser = idx(upvoters[0], _ => _.node.gitHubUser)
        ? idx(upvoters[0], _ => _.node.gitHubUser)
        : idx(
            upvoters[0],
            _ => _.node.twitterUser.homepageDescuri.gitHub.gitHubUser
          );
      const twitterUser = idx(upvoters[0], _ => _.node.twitterUser)
        ? idx(upvoters[0], _ => _.node.twitterUser)
        : "" /*github descuri here*/;

      peopledata.name = idx(upvoters[0], _ => _.node.name);
      peopledata.twitter = upvoters[0].node.twitter_username;
      //if null, look for github descuri

      peopledata.github = gitHubUser ? gitHubUser.login : null;

      peopledata.avatarURL = twitterUser
        ? twitterUser.profileImageUrlHttps
        : gitHubUser ? gitHubUser.avatarUrl : null;

      peopledata.website = idx(upvoters[0], _ => _.node.website_url)
        ? idx(upvoters[0], _ => _.node.website_url)
        : idx(upvoters[0], _ => _.node.twitterUser.url)
          ? twitterUser.url
          : gitHubUser ? gitHubUser.websiteUrl : null;

      peopledata.location = idx(upvoters[0], _ => _.node.twitterUser.location)
        ? twitterUser.location
        : gitHubUser ? gitHubUser.location : null;

      peopledata.company = gitHubUser ? gitHubUser.company : null;

      peopledata.email = idx(upvoters[0], _ => _.node.gitHubUser.email)
        ? gitHubUser.email
        : twitterUser
          ? idx(twitterUser, _ => _.homepageDescuri.mailto)
            ? idx(twitterUser, _ => _.homepageDescuri.mailto)
            : null
          : null;

      console.log(peopledata);
    });
};
const people_data = getdata(peopledataQuery, { slug: "startup-stash" });

/*
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
