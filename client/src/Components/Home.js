import React, { Component } from 'react'

export default class Home extends Component {
  render() {
    return (
      <div className="bg"
      >
        <div className="home-text"
        >
          Land Registry Application
          
          <hr
            style={{
              border: '8px solid #fff',
              width: '87%',
              marginLeft: '0px',
            }}
          />
        </div>
        <div className="home-button">
          <button
            style={{ marginRight: '15px' }}
            onClick={() => this.props.history.push('/signup')}
          >
            Register
          </button>{' '}
          <button onClick={() => this.props.history.push('/login')}>
            Login
          </button>
        </div>
      </div>
    )
  }
}
