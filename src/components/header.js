import React, { Component } from 'react'
import Link from 'gatsby-link'
import FlatButton from 'material-ui/FlatButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

export default class Header extends Component {

  state = {
    dealsOpen: false,
    exitsOpen: false,
    userOpen: false,
  }

  handleClick = (event) => {
    // This prevents ghost click.
    event.preventDefault();
    switch (event.currentTarget.textContent) {
      case "DEALS":
        this.setState({
          dealsOpen: true,
          anchorEl: event.currentTarget,
        });
        break;
      case "EXITS":
        this.setState({
          exitsOpen: true,
          anchorEl: event.currentTarget,
        });
        break;
      case "USER":
        this.setState({
          userOpen: true,
          anchorEl: event.currentTarget,
        });
        break;
    }
  };

  handleRequestClose = () => {
    this.setState({
      dealsOpen: false,
      exitsOpen: false,
      userOpen: false,
    });
  };


  render() {
    const { siteTitle } = this.props;
    return (
      <div id="header">
        <div id="header-img">
          <Link to="/"><img alt={siteTitle} src="https://d3lut3gzcpx87s.cloudfront.net/image_encoded/aHR0cHM6Ly9zaWxrc3RhcnQuczMuYW1hem9uYXdzLmNvbS8yMzUxYjhkZC05NzRiLTE3OGQtODc3Ny0wYmM0ZTQ5Y2M3NTMucG5n/540x100fPNG" /></Link>
        </div>
        <nav>
          <FlatButton
            label="GENERAL DASHBOARD"
          />
          <FlatButton
            onClick={this.handleClick}
            label="DEALS"
          />
          <Popover
            open={this.state.dealsOpen}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            targetOrigin={{ horizontal: 'left', vertical: 'top' }}
            onRequestClose={this.handleRequestClose}
          >
            <Menu>
              <MenuItem primaryText="My Deals" />
              <MenuItem primaryText="Submit New Deal" />
            </Menu>
          </Popover>
          <FlatButton
            onClick={this.handleClick}
            label="EXITS"
          />
          <Popover
            open={this.state.exitsOpen}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            targetOrigin={{ horizontal: 'left', vertical: 'top' }}
            onRequestClose={this.handleRequestClose}
          >
            <Menu>
              <MenuItem primaryText="My Exits" />
              <MenuItem primaryText="Submit New Exit" />
            </Menu>
          </Popover>
          <FlatButton
            onClick={this.handleClick}
            label="USER"
          />
          <Popover
            open={this.state.userOpen}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            targetOrigin={{ horizontal: 'left', vertical: 'top' }}
            onRequestClose={this.handleRequestClose}
          >
            <Menu>
              <MenuItem primaryText="My Profile" />
              <MenuItem primaryText="Log Out" />
            </Menu>
          </Popover>
        </nav>
      </div>
    )
  }
}
