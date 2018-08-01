const fetch = require("node-fetch");
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
      voters(first: 1) {
        edges {
          node {
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
    .then(json => {
      console.log(json);
      /*
      console.log("Setting data here");
      console.log(json.data.productHunt.post.voters.edges[0].node.name);
        const upvoters = json.data.productHunt.post.voters.edges;

      userdata.name = upvoters[0].node.name;
      //if null, look for github descuri
      userdata.twitter = upvoters[0].node.twitter_username;

      userdata.github = upvoters[0].node.gitHubUser.login;
      // if not work ---> upvoters[0].node.twitterUser.homepageDescuri.gitHub.gitHubUser.login;

      userdata.avatarURL = upvoters[0].node.twitterUser.profileImageUrlHttps;
      // if not work ---> upvoters[0].node.gitHubUser.avatarUrl;
      //                      ----> upvoters[0].node.twitterUser.homepageDescuri.gitHub.gitHubUser.avatarUrl;

      userdata.website = upvoters[0].node.twitterUser.url;
      // if not work ---> if (upvoters[0].node.gitHubUser) upvoters[0].node.gitHubUser.websiteUrl;
      //                  else upvoters[0].node.twitterUser.homepageDescuri.gitHub.gitHubUser.websiteUrl;

      userdata.location = upvoters[0].node.twitterUser.location;
      // if not work ---> if (upvoters[0].node.gitHubUser) upvoters[0].node.gitHubUser.location;
      //                  else upvoters[0].node.twitterUser.homepageDescuri.gitHub.gitHubUser.location;

      userdata.company = upvoters[0].node.gitHubUser.company;
      //                   if(!upvoters[0].node.gitHubUser) upvoters[0].node.twitterUser.homepageDescuri.gitHub.gitHubUser.company;

      userdata.email = upvoters[0].node.gitHubUser.email;
      //                   upvoters[0].node.twitterUser.homepageDescuri.mailto
      //                   if(upvoters[0].node.twitterUser) upvoters[0].node.twitterUser.homepageDescuri.gitHub.gitHubUser.email;
      //                   else [githubuser.homepageDescuri.mailto]
      //                   ([githubuser.homepageDescuri.twitter.email])
      console.log(userdata);*/
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
