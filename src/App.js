import React, { Component } from "react";
import logo from "./logo.svg";
import { Tabs, Icon, Checkbox, Collapse } from "antd";
import "./App.css";
const TabPane = Tabs.TabPane;
const CheckboxGroup = Checkbox.Group;
const Panel = Collapse.Panel;

const plainOptions = ["1 mathch", "2 mathch", "3 match"];
const defaultCheckedList = ["1 mathch", "2 mathch", "3 match"];

class UserTabInfo extends Component {
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
              github
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
              Youtube
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
              Twitter
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
