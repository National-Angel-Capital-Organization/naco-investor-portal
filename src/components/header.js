import React from 'react'
import Link from 'gatsby-link'

const Header = ({ siteTitle }) => (
  <div id="header">
      <div id="header-img">
      <Link to="/"><img alt={siteTitle} src="https://d3lut3gzcpx87s.cloudfront.net/image_encoded/aHR0cHM6Ly9zaWxrc3RhcnQuczMuYW1hem9uYXdzLmNvbS8yMzUxYjhkZC05NzRiLTE3OGQtODc3Ny0wYmM0ZTQ5Y2M3NTMucG5n/540x100fPNG" /></Link>
      </div>
      <ul>
        <li>GENERAL DASHBOARD</li>
        <li>DEALS <br />
          <ul>
            <li>My Deals</li>
            <li>Submit New Deal</li>
          </ul>
        </li>
        <li>EXITS <br />
          <ul>
            <li>My Exits</li>
            <li>Submit New Exit</li>
          </ul>
        </li>
        <li>USER <br />
          <ul>
            <li>My Profile</li>
            <li>Log Out</li>
          </ul>
        </li>
      </ul>
    </div>
)

export default Header
