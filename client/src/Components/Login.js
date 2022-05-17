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

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      address: '',
      authenticated: false,
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

    if (window.localStorage.getItem('authenticated') === 'true') {
      window.location = '/dashboard'
    }
  }

  handleChange = (name) => (event) => {
    this.setState({ [name]: event.target.value })
  }

  handleSubmit = async () => {
    let data = {
      address: this.state.address,
    }
    if (this.state.account !== data.address) {
      alert('Account entered not same as account connected with metamask')
      window.location = '/login'
    }

    if (this.state.address) {
      try {
        const user = await this.state.landContractMethods.methods.getUser(data.address).call()
        if (user) {
          this.setState({
            uid: user[0],
            uname: user[1],
            ucontact: user[2],
            uemail: user[3],
            ucode: user[4],
            ucity: user[5],
            exist: user[6],
          })
          if (this.state.exist) {
            window.localStorage.setItem('authenticated', true)
            window.location = '/dashboard'
          } 
          else {
            alert('Login Failed. Make sure your account is already registered!')
            console.log('Login Failed')
            window.localStorage.setItem('authenticated', false)
            this.props.history.push('/login')
          }
        } 
        else {
          console.log('Please try again')
        }
      } 
      catch (error) {
        console.log('error:', error)
      }
    } 
    else {
      alert('All fields are required')
    }
  }
  render() {
    const { classes} = this.props
    return (
      <div className="profile-bg">
        <Container style={{ marginTop: '40px' }} className={classes.root}>
          <div className="login-text">User Login</div>
          <div className="input">
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
          </div>

          <div>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Button
                style = {{color: '#000', backgroundColor: '#d4af37'}}
                variant="contained"
                endIcon={<SendIcon>submit</SendIcon>}
                onClick={this.handleSubmit}
              >
                Login
              </Button>
            </div>
          </div>
          <div
            style={{ marginTop: '20px', textAlign: 'center', color: '#fff' }}
          >
            Don't have an account?{'   '}{' '}
            <a href="/signup" style={{ color: '#d4af37' }}>
              Sign Up
            </a>
          </div>
        </Container>
      </div>
    )
  }
}
export default withStyles(styles)(Login)
