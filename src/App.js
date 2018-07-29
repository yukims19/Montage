import React, { Component } from "react";
import logo from "./logo.svg";
import { Tabs, Icon, Checkbox, Collapse } from "antd";
import "./App.css";
import { gql } from "apollo-boost";
import { ApolloProvider, Query } from "react-apollo";
import OneGraphApolloClient from "onegraph-apollo-client";
import OneGraphAuth from "onegraph-auth";
import idx from "idx";
/*** Be sure to create an app on https://onegraph.com, replace the APP_ID here, and add the chrome-extension id to your CORS origins ***/
const APP_ID = "59f1697f-4947-49c0-964e-8e3d4fa640be";
const auth = new OneGraphAuth({
  appId: APP_ID,
  oauthFinishPath: "/index.html"
});
const client = new OneGraphApolloClient({
  oneGraphAuth: auth
});

const TabPane = Tabs.TabPane;
const CheckboxGroup = Checkbox.Group;
const Panel = Collapse.Panel;

const plainOptions = ["1 mathch", "2 mathch", "3 match"];
const defaultCheckedList = ["1 mathch", "2 mathch", "3 match"];

let target = {
  github: "sgrove",
  twitter: "sgrove"
};

const GET_GithubQuery = gql`
  query($github: String!) {
    gitHub {
      user(login: $github) {
        id
        avatarUrl
        url
        login
        starredRepositories {
          totalCount
        }
        followers {
          totalCount
        }
        following {
          totalCount
        }
        repositories(
          first: 6
          orderBy: { direction: DESC, field: UPDATED_AT }
        ) {
          nodes {
            id
            description
            url
            name
            forks {
              totalCount
            }
            stargazers {
              totalCount
            }
            languages(first: 1, orderBy: { field: SIZE, direction: DESC }) {
              edges {
                size
                node {
                  id
                  color
                  name
                }
              }
            }
          }
          totalCount
        }
      }
    }
  }
`;

class GithubInfo extends Component {
  render() {
    if (!target.github) {
      return <div>No Data Found</div>;
    }
    return (
      <Query query={GET_GithubQuery} variables={{ github: target.github }}>
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) {
            console.log(error);
            return <div>Uh oh, something went wrong!</div>;
          }
          if (!idx(data, _ => _.gitHub.user)) return <div>No Data Found</div>;
          return (
            <div className="tab-github">
              <div className="github-summary">
                <li>
                  Total Repositories:{" "}
                  <span>
                    {idx(data, _ => _.gitHub.user.repositories.totalCount)}
                  </span>
                </li>
                <li>
                  Stars:{" "}
                  <span>
                    {idx(
                      data,
                      _ => _.gitHub.user.starredRepositories.totalCount
                    )}
                  </span>
                </li>
                <li>
                  Follower:{" "}
                  <span>
                    {idx(data, _ => _.gitHub.user.followers.totalCount)}
                  </span>
                </li>
                <li>
                  Following:{" "}
                  <span>
                    {idx(data, _ => _.gitHub.user.following.totalCount)}
                  </span>
                </li>
              </div>
              <div className="repos">
                {idx(
                  data,
                  _ => _.gitHub.user.repositories.nodes
                ).map((item, index) => {
                  return (
                    <div className="repo-card" key={item.name}>
                      <div className="card">
                        <div className="card-body">
                          <h5 className="card-title">
                            <a href={item.url}>
                              {item.name}
                            </a>
                          </h5>
                          <p className="card-text">
                            {item.description}
                          </p>
                          <div className="card-bottom">
                            {item.languages.edges[0]
                              ? <p>
                                  <i
                                    className="fas fa-circle"
                                    style={{
                                      color: item.languages.edges[0].node.color
                                    }}
                                  />
                                  {item.languages.edges[0].node.name}
                                </p>
                              : " "}
                            {item.stargazers
                              ? <p>
                                  <i className="fas fa-star" />
                                  {item.stargazers.totalCount}
                                </p>
                              : " "}
                            {item.forks
                              ? <p>
                                  <i className="fas fa-code-branch" />
                                  {item.forks.totalCount}
                                </p>
                              : " "}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }}
      </Query>
    );
  }
}

class LoginButton extends Component {
  render() {
    return (
      <button
        className={"loginbtn loginbtn-" + this.props.eventClass}
        onClick={this.props.onClick}
      >
        <i className={"fab fa-" + this.props.eventClass} />
        <span> </span>Login with {this.props.event}
      </button>
    );
  }
}

class UserTabInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventil: false,
      github: false,
      youtube: false,
      twitter: false
    };
    this.isLoggedIn("eventil");
    this.isLoggedIn("github");
    this.isLoggedIn("youtube");
    this.isLoggedIn("twitter");
  }
  isLoggedIn(event) {
    auth.isLoggedIn(event).then(isLoggedIn => {
      this.setState({
        [event]: isLoggedIn
      });
    });
  }
  handleClick(service) {
    try {
      auth.login(service).then(() => {
        auth.isLoggedIn(service).then(isLoggedIn => {
          if (isLoggedIn) {
            console.log("Successfully logged in to " + service);
            this.setState({
              [service]: isLoggedIn
            });
          } else {
            console.log("Did not grant auth for service " + service);
            this.setState({
              service: isLoggedIn
            });
          }
        });
      });
    } catch (e) {
      console.error("Problem logging in", e);
    }
  }
  renderButton(eventTitle, eventClass) {
    return (
      <LoginButton
        event={eventTitle}
        eventClass={eventClass}
        onClick={() => this.handleClick(eventClass)}
      />
    );
  }
  render() {
    return (
      <div className="right-tabs">
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <span>
                <Icon type="github" />Github
              </span>
            }
            key="1"
          >
            <div className="tab-content" id="github-content">
              {this.state.github
                ? <ApolloProvider client={client}>
                    <GithubInfo />
                  </ApolloProvider>
                : this.renderButton("GitHub", "github")}
            </div>
          </TabPane>
          <TabPane
            tab={
              <span>
                <Icon type="youtube" />Youtube
              </span>
            }
            key="2"
          >
            <div className="tab-content" id="youtube-content">
              {this.state.youtube
                ? "youtube"
                : this.renderButton("Youtube", "youtube")}
            </div>
          </TabPane>
          <TabPane
            tab={
              <span>
                <Icon type="twitter" />Twitter
              </span>
            }
            key="3"
          >
            <div className="tab-content" id="twitter-content">
              {this.state.twitter
                ? "twitter"
                : this.renderButton("Twitter", "twitter")}
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

class UserGeneralInfo extends Component {
  render() {
    return (
      <div className="right-general-info">
        <img src={logo} />
        <div className="user-general-info">
          <div className="username">
            <h3>Youxi Li</h3>
            <small>
              <cite title="San Diego, CA">
                San Diego, CA <i className="fas fa-map-marker-alt" />
              </cite>
            </small>
          </div>
          <div className="useraccounts">
            <ul>
              <li>
                <i className="fas fa-globe" /> yosili.com
              </li>
              <li>
                <i className="fab fa-github-square" /> yosili.com
              </li>
              <li>
                <i className="fab fa-twitter-square" /> yosili.com
              </li>
              <li>
                <i className="fab fa-reddit-square" /> yosili.com
              </li>
              <li>
                <i className="fab fa-linkedin" /> yosili.com
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedList: defaultCheckedList,
      indeterminate: true,
      checkAll: false
    };
  }

  onChange = checkedList => {
    this.setState({
      checkedList,
      indeterminate:
        !!checkedList.length && checkedList.length < plainOptions.length,
      checkAll: checkedList.length === plainOptions.length
    });
  };

  onCheckAllChange = e => {
    this.setState({
      checkedList: e.target.checked ? plainOptions : [],
      indeterminate: false,
      checkAll: e.target.checked
    });
  };

  render() {
    return (
      <div className="left-filter">
        <Collapse defaultActiveKey={["1"]}>
          <Panel header="Filter" key="1">
            <div style={{ borderBottom: "1px solid #E9E9E9" }}>
              <Checkbox
                indeterminate={this.state.indeterminate}
                onChange={this.onCheckAllChange}
                checked={this.state.checkAll}
              >
                Check all
              </Checkbox>
            </div>
            <br />
            <CheckboxGroup
              options={plainOptions}
              value={this.state.checkedList}
              onChange={this.onChange}
            />
          </Panel>
        </Collapse>
      </div>
    );
  }
}

class AllUsers extends Component {
  render() {
    return (
      <div className="left-body">
        <li>
          <img src={logo} />
          <div className="alluser-userinfo">
            <p>Youxi Li</p>
            <small>
              <cite title="San Diego, CA">
                San Diego, CA <i className="fas fa-map-marker-alt" />
              </cite>
            </small>
          </div>
        </li>
        <li>
          <img src={logo} />
          <div className="alluser-userinfo">
            <p>Youxi Li</p>
            <small>
              <cite title="San Diego, CA">
                San Diego, CA <i className="fas fa-map-marker-alt" />
              </cite>
            </small>
          </div>
        </li>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="left-column">
          <Filter />
          <AllUsers />
        </div>
        <div className="right-column">
          <header className="right-header">
            <div className="dropdown">
              <button
                className="btn dropdown-toggle"
                type="button"
                id="dropdownMenuButton"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <i>
                  {" "}<img src={logo} />
                </i>
                Youxi Li
              </button>
              <div
                className="dropdown-menu"
                aria-labelledby="dropdownMenuButton"
              >
                <a className="dropdown-item" href="#">
                  Logout
                </a>
              </div>
            </div>
          </header>
          <div className="right-body">
            <UserGeneralInfo />
            <UserTabInfo />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
