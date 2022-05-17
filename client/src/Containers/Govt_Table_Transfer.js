import React, { Component } from 'react'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Land from '../contracts/LandRegistry.json'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Slide from '@material-ui/core/Slide'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})
const columns = [
  { id: 'key', label: 'Property ID', minWidth: 100 },
  { id: 'seller', label: 'Seller Address', minWidth: 100 },
  { id: 'buyer', label: 'Buyer Address', minWidth: 100 },
 
  {
    id: 'laddress',
    label: 'Land Details',
    minWidth: 170,
  },

  {
    id: 'lstate',
    label: 'State',
    minWidth: 100,
  },
  {
    id: 'lcity',
    label: 'City',
    minWidth: 100,
  },

  {
    id: 'lamount',
    label: 'Total Amount (in Rs)',
    minWidth: 100,
  },
  {
    id: 'isGovtApproved',
    label: 'Status of Land Approval (by the Govt.)',
    minWidth: 100,
  },
  {
    id: 'isAvailable',
    label: 'Land Availability Status',
    minWidth: 100,
  },
]

const styles = (theme) => ({
  root: {
    width: '100%',
  },
})

class table extends Component {
  constructor(props) {
    super(props)
    this.state = {
      assetList: [],
      isLoading: true,
      images: [],
      open1: false,
    }
  }
  componentDidMount = async () => {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    await window.localStorage.setItem('web3account', accounts[0])
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()
    const LandContract = Land.networks[networkId]

    if (LandContract) {
      const LandContractMethods = new web3.eth.Contract(Land.abi, LandContract.address)
      this.setState({ LandContractMethods })
    } else {
      window.alert('Token contract not deployed to detected network.')
    }
  }

  handleAccept = async (id, status, status1, email, number) => {
    const flag = await this.state.LandContractMethods.methods
      .govtStatus(id, status, status1)
      .send({
        from: this.state.account,
        gas: 1000000,
      })
    this.setState({ flag })
    this.state.LandContractMethods.methods.tranferComplete(id)
    if (flag) window.location.reload()
  }
  handleViewImages = async (images) => {
    this.setState({ open1: true })

    if (images) {
      this.setState({
        images: images,
      })
    }
  }
  handleClose1 = () => {
    this.setState({ open1: false })
  }

  render() {
    const { classes, assetList } = this.props
    console.log(assetList)
    return (
      <Paper className={classes.root}>
        {console.log(assetList)}
        <TableContainer className={classes.container}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    <b>{column.label}</b>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {assetList.map((row) => {
                return (
                  <TableRow hover role="checkbox" key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.id]
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.id == 'isGovtApproved' &&
                          value == 'Not Approved' ? (
                            <Grid container spacing={2}>
                              <Grid item>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={() =>
                                    this.handleAccept(
                                      row['key'],
                                      'Approved',
                                      'GovtApproved',
                                      row['email'],
                                      row['contact'],
                                    )
                                  }
                                >
                                  Accept
                                </Button>
                              </Grid>
                              <Grid item>
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  onClick={() =>
                                    this.handleAccept(
                                      row['key'],
                                      'Rejected',
                                      'GovtRejected',
                                      row['email'],
                                      row['contact'],
                                    )
                                  }
                                >
                                  Reject
                                </Button>
                              </Grid>
                            </Grid>
                          ) : column.id == 'document' ? (
                            <a href={row['document']} download>
                              Download Document
                            </a>
                          ) : column.id == 'images' ? (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() =>
                                this.handleViewImages(row['images'])
                              }
                            >
                              View Images
                            </Button>
                          ) : (
                            value
                          )}
                          <Dialog
                            open={this.state.open1}
                            TransitionComponent={Transition}
                            keepMounted
                            onClose={this.handleClose1}
                            aria-labelledby="alert-dialog-slide-title"
                            aria-describedby="alert-dialog-slide-description"
                          >
                            <DialogTitle
                              id="alert-dialog-slide-title"
                              style={{ textAlign: 'center' }}
                            >
                              {'View Images'}
                            </DialogTitle>
                            <DialogContent>
                              <DialogContentText id="alert-dialog-slide-description">
                                {this.state.images.map((image) => (
                                  <img
                                    src={image}
                                    style={{
                                      height: '300px',
                                      width: '400px',
                                      margin: '10px',
                                    }}
                                  />
                                ))}
                              </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                              <Button
                                onClick={this.handleClose1}
                                color="primary"
                              >
                                Close
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    )
  }
}
export default withStyles(styles)(table)
