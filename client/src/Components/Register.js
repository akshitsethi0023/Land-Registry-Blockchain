import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { Container } from '@material-ui/core'
import SendIcon from '@material-ui/icons/Send'
import Land from '../contracts/LandRegistry.json'
import { withStyles } from '@material-ui/core/styles'

const styles = () => ({
  root: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    '& .MuiFormLabel-root': {
      color: '#fff',
    },
    '&  .MuiInputBase-root': {
      color: '#fff',
    },
    '&  .MuiInput-underline:before': {
      borderBottomColor: '#fff',
    },
    '&  .MuiInput-underline:after': {
      borderBottomColor: '#d4af37',
    },
    '&  .MuiInput-underline:hover': {
      borderBottomColor: '#d4af37',
    },
    '& .MuiButton-containedPrimary': {
      backgroundColor: '#328888',
      fontFamily: "'Roboto Condensed', sans-serif",
    },
  },
})

class Register extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      email: '',
      address: '',
      postalCode: '',
      city: '',
      contact: ''
    }
  }

  componentDidMount = async () => {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    await window.localStorage.setItem('web3account', accounts[0])
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()
    const landContract = Land.networks[networkId]
    
    if (landContract) {
      const landContractMethods = new web3.eth.Contract(Land.abi, landContract.address)
      this.setState({ landContractMethods })
    } 
    else {
      window.alert('Token contract not deployed to detected network.')
    }

    if (window.localStorage.getItem('authenticated') === 'true')
      this.props.history.push('/dashboard')
  }

  validateEmail = (emailField) => {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
    return reg.test(emailField)
  }

  handleChange = (name) => (event) => {
    this.setState({ [name]: event.target.value })
  }

  register = async (user) => {
    if (this.state.account !== user.address) {
      alert('Account entered not same as account connected with metamask')
      window.location = '/signup'
    }
    await this.state.landContractMethods.methods
      .addUser(
        user.address,
        user.name,
        user.contact,
        user.email,
        user.postalCode,
        user.city,
      )
      .send({ from: this.state.account, gas: 1000000 })
      .on('receipt', function (receipt) {
        if (!receipt) {
          console.log('Could not add User. Please try again')
        } 
        else {
          console.log('User has been added successfully!')
          window.alert('User has been added successfully!')
          window.location = '/login'
        }
      })
  }

  handleSubmit = async () => {
    let user = {
      name: this.state.name,
      email: this.state.email,
      contact: this.state.contact,
      address: this.state.address,
      city: this.state.city,
      postalCode: this.state.postalCode,
    }
    if (this.state.name && this.state.email && this.state.contact && this.state.address && this.state.city && this.state.postalCode) {
      if (this.validateEmail(this.state.email)) {
        try {
          this.register(user)
        } catch (error) {
          console.log('error:', error)
        }
      }
      else alert('Please, Enter correct Email address')
    }
    else {
      alert('All fields are required')
    }
  }
  render() {
    const { classes } = this.props
    return (
      <div className="profile-bg">
        <Container style={{ marginTop: '40px'}} className={classes.root}>
          <div className="register-text">Register Here</div>
          <div className="input">
            <TextField
              id="standard-full-width"
              type="name"
              label="Name"
              placeholder="Enter Your Name"
              fullWidth
              value={this.state.name}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={this.handleChange('name')}
            />
            <TextField
              id="standard-full-width"
              type="email"
              label="Email Address"
              placeholder="Enter Your Email Address"
              fullWidth
              value={this.state.email}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={this.handleChange('email')}
            />
            <TextField
              id="standard-full-width"
              type="contact"
              label="Contact Number"
              placeholder="Enter Your Contact Number"
              fullWidth
              value={this.state.contact}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={this.handleChange('contact')}
            />
            <TextField
              id="standard-full-width"
              type="address"
              label="Account Address"
              placeholder="Enter Your Account Address(make sure to connect this address with metamask)"
              fullWidth
              value={this.state.address}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={this.handleChange('address')}
            />
            <TextField
              id="standard-full-width"
              type="city"
              label="City"
              placeholder="Enter Your City"
              fullWidth
              value={this.state.city}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={this.handleChange('city')}
            />
            <TextField
              id="standard-full-width"
              type="postalCode"
              label="Postal Code"
              placeholder="Enter Your Postal Code"
              fullWidth
              value={this.state.postalCode}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={this.handleChange('postalCode')}
            />
          </div>
          <div style={{ marginTop: '20px', textAlign: 'center', color: '#d4af37' }}>
            <Button
              style = {{color: '#000', backgroundColor: '#d4af37'}}
              variant="contained"
              endIcon={<SendIcon>submit</SendIcon>}
              onClick={this.handleSubmit}
            >
              Sign Up
            </Button>
          </div>
          <div
            style={{ marginTop: '20px', textAlign: 'center', color: '#fff' }}
          >
            Already have an account?{'   '}{' '}
            <a href="/login" style={{ color: '#d4af37' }}>
              Login here
            </a>
          </div>
        </Container>
      </div>
    )
  }
}
export default withStyles(styles)(Register)
