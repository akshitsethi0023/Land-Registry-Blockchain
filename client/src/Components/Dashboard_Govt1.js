import React, { Component } from 'react'
import { Container, CircularProgress } from '@material-ui/core'
import Land from '../contracts/LandRegistry.json'
import ipfs from '../ipfs'
import Table from '../Containers/Govt_Table'
import RegistryTable from '../Containers/Registry_Table'
import TransferTable from '../Containers/Transfer_Table'
import { withStyles } from '@material-ui/core/styles'
import jwtDecode from 'jwt-decode'

const styles = (theme) => ({
  container: {
    // paddingLedt: '0px',
    // paddingRight: '0px',
    '& .MuiContainer-maxWidthLg': {
      maxWidth: '100%',
    },
  },
})
TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
  }
  
  function a11yProps(index) {
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    }
  }
function TabPanel(props) {
    const { children, value, index, ...other } = props
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        aria-labelledby={`full-width-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={3}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    )
  }

class Dashboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      assetList: [],
      assetList1: [],
      isLoading: true,
      username: '',
      Governmentpublickey: '',
      address: '',
      contact: '',
      city: '',
      imgurl: '',
    }
  }

  componentWillMount = async () => {
    const user = jwtDecode(window.localStorage.getItem('token'))
    this.setState({ ...user.user })
    // this.setState({ ...user.user })

    const web3 = window.web3
    // Use web3 to get the user's accounts.
    const accounts = await web3.eth.getAccounts()
    await window.localStorage.setItem('web3account', accounts[0])
    this.setState({ account: accounts[0] })

    this.setState({ isLoading: false })
    const networkId = await web3.eth.net.getId()
    const LandData = Land.networks[networkId]
    if (LandData) {
      const landList = new web3.eth.Contract(Land.abi, LandData.address)
      this.setState({ landList })
    } else {
      window.alert('Token contract not deployed to detected network.')
    }
    this.getRegistryDetails()
    this.getTransferDetails()
  }

  async propertyDetails(property) {
    // console.log(property)
    let details = await this.state.landList.methods
      .landInfoOwner(property)
      .call()
    ipfs.cat(details[1], (err, res) => {
      if (err) {
        console.error(err)
        return
      }
      console.log(details)
      const temp = JSON.parse(res.toString())
      this.state.assetList.push({
        property: property,
        uniqueID: details[1],
        name: temp.name,
        key: details[0],
        email: temp.email,
        contact: temp.contact,
        pan: temp.pan,
        occupation: temp.occupation,
        oaddress: temp.address,
        ostate: temp.state,
        ocity: temp.city,
        opostalCode: temp.postalCode,
        laddress: temp.laddress,
        lstate: temp.lstate,
        lcity: temp.lcity,
        lpostalCode: temp.lpostalCode,
        larea: temp.larea,
        lamount: details[2],
        isGovtApproved: details[3],
        isAvailable: details[4],
        requester: details[5],
        requestStatus: details[6],
        document: temp.document,
        images: temp.images,
      })
      this.setState({ assetList: [...this.state.assetList] })
    })
  }

  async transferLandDetails(property) {

  }

  async getRegistryDetails() {
    const properties = await this.state.landList.methods.Assets().call()
    // console.log(properties)

    for (let item of properties) {
      console.log('item:' + item)
      this.propertyDetails(item)
    }
  }
  
  async getTransferDetails() {
    const properties = await this.state.landList.methods.Assets().call()
    // console.log(properties)

    for (let item of properties) {
      this.transferLandDetails(item)
    }
  }
  render() {
    const { classes } = this.props
    return this.state.isLoading ? (
      <div style={{ position: 'absolute', top: '50%', left: '50%' }}>
        <CircularProgress />
      </div>
    ) : (
        <div className="profile-bg ">
          <div className={classes.container}>
            <Container style={{ marginTop: '40px' }}>
              <div className={classes.root}>
                <AppBar position="static" color="default" className="dashboard">
                  <Tabs
                    value={this.state.value}
                    onChange={this.handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    aria-label="full width tabs example"
                  >
                    <Tab label="Land Registry Approval" {...a11yProps(0)} />
                    <Tab label="Land Transfer Approval" {...a11yProps(1)} />
                  </Tabs>
                </AppBar>
                
                <TabPanel value={this.state.value} index={0}>
                  <div style={{ marginTop: '60px' }}>
                    <RegistryTable assetList={this.state.assetList} />
                  </div>
                </TabPanel>
                <TabPanel value={this.state.value} index={1}>
                  <div style={{ marginTop: '60px' }}>
                    <TransactionTable assetList={this.state.assetList1} />
                  </div>
                </TabPanel>
              </div>
            </Container>
          </div>
        </div>
      )
  }
}
export default withStyles(styles)(Dashboard)
