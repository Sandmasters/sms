import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { ThemeProvider } from 'styled-components'
import './App.css';
import Register from './components/Register/Register';
import Login from './components/Login/Login';
import JobList from './components/JobList/JobList';
import Job from './components/Job/Job';
import CreateJob from './components/Job/CreateJob';
import EditJob from './components/Job/EditJob';
import { CustomerList } from './components/CustomerList'
import { CreateCustomer, EditCustomer, ViewCustomer } from './components/Customer';
import Menu from './components/Menu/Menu'
import { Admin, Sales } from './components/Dashboard'
import { Button } from './components/Button'

class App extends React.Component {
  state = {
    customers: [],
    customer: null,
    jobs: [],
    job: null,
    token: null,
    user: null,
    role: null
  };

  componentDidMount() {
    this.authenticateUser();
  }

  authenticateUser = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      localStorage.removeItem('user');
      this.setState({ user: null });
    }

    if (token) {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };
      axios
        .get('/api/auth', config)
        .then(response => {
          localStorage.setItem('user', response.data.firstName);
          this.setState(
            {
              user: response.data.firstName,
              role: response.data.role,
              token: token
            },
            () => {
              this.loadData();
            }
          );
        })
        .catch(error => {
          localStorage.removeItem('user');
          this.setState({ user: null });
          console.error(`Error logging in: ${error}`);
        });
    }
  };

  loadData = () => {
    this.loadJobs()
    this.loadCustomers()
  }

  loadJobs = () => {
    const { token } = this.state;

    if (token) {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };
      axios
        .get('/api/jobs', config)
        .then(response => {
          this.setState({
            jobs: response.data
          });
        })
        .catch(error => {
          console.error(`Error fetching jobs: ${error}`);
        });
    }
  }

  loadCustomers = () => {
    const { token } = this.state;

    if (token) {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };
      axios
        .get('/api/customers', config)
        .then(response => {
          this.setState({
            customers: response.data
          });
        })
        .catch(error => {
          console.error(`Error fetching customers: ${error}`);
        });
    }
  }

  logOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.setState({ user: null, token: null });
  };

  /**
   * Job Functions
   */
  viewJob = job => {
    console.log(`view job: ${job.name}`);
    this.setState({
      job: job
    });
  };

  deleteJob = job => {
    const { token } = this.state;

    if (token) {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      axios
        .delete(`/api/jobs/${job._id}`, config)
        .then(response => {
          const newJobs = this.state.jobs.filter(p => p._id !== job._id);
          this.setState({
            jobs: [...newJobs]
          });
        })
        .catch(error => {
          console.error(`Error deleting job: ${error}`);
        });
    }
  };

  editJob = job => {
    this.setState({
      job: job
    });
  };

  onJobCreated = job => {
    const newJobs = [...this.state.jobs, job];

    this.setState({
      jobs: newJobs
    });
  };

  onJobUpdated = job => {
    console.log('updated job: ', job);
    const newJobs = [...this.state.jobs];
    const index = newJobs.findIndex(p => p._id === job._id);

    newJobs[index] = job;

    this.setState({
      jobs: newJobs
    });
  };

  /**
   * Customer Functions
   */
  viewCustomer = customer => {
    console.log(`view customer: ${customer.name}`);
    this.setState({
      customer: customer
    });
  }

  deleteCustomer = customer => {
    const { token } = this.state

    if (token) {
      const config = {
        headers: {
          'x-auth-token': token
        }
      }

      axios
        .delete(`/api/customers/${customer._id}`, config)
        .then(response => {
          const newCustomers = this.state.customers.filter(c => c._id !== customer._id)
          this.setState({
            customers: [...newCustomers]
          })
        })
        .catch(error => {
          console.error(`Error delete customer: ${customer}`)
        })
    }
  }

  editCustomer = customer => {
    this.setState({
      customer: customer
    })
  }

  onCustomerCreated = customer => {
    const newCustomers = [...this.state.customers, customer]

    this.setState({
      customers: newCustomers
    })
  }

  onCustomerUpdated = customer => {
    console.log('updated customer: ', customer)
    const newCustomers = [...this.state.customers]
    const index = newCustomers.findIndex(c => c._id === customer._id)

    newCustomers[index] = customer

    this.setState({
      customers: newCustomers
    })
  }

  renderDashboard = (user, role) => {
    switch (role) {
      case 'admin':
        return (
          <>
            <h2>Admin Dashboard | {user}</h2>
            <Admin />
          </>
        )
      case 'sales':
        return (
          <>
            <h2>Sales Dashboard | {user}</h2>
            <Sales />
          </>
        )
    
      default:
        return <></>
    }
  }

  render() {
    let { user, role, jobs, job, customers, customer, token } = this.state;
    const authProps = {
      authenticateUser: this.authenticateUser
    };

    return (
      <Router>
        <ThemeProvider theme={{ mode: 'light' }}>
          <div className="App">
          <header className="App-header">
            <h1>Sandmasters</h1>
            <ul>          
              {user ? (
                <li><Link to="" onClick={this.logOut}>Log out {user}</Link></li>
              ) : (
                <>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/login">Log in</Link></li>
                </>
              )}
            </ul>
          </header>

          {user && <Menu role={role} />}
          <main>
            <Switch>
              <Route exact path="/">
                {user ? (
                  this.renderDashboard(user, role)
                ) : (
                  <>Please Register or Login</>
                )}
              </Route>
              <Route path="/customers">
                <h2>Customers</h2>
                <Link to="/new-customer">
                  <Button>New Customer</Button>
                </Link>
                <CustomerList
                  customers={customers}
                  clickCustomer={this.viewCustomer}
                  deleteCustomer={this.deleteCustomer}
                  editCustomer={this.editCustomer}
                />
              </Route>
              <Route path="/jobs">
                <h2>Jobs</h2>
                <Link to="/new-job">
                  <Button>New Job</Button>
                </Link>
                <JobList
                  jobs={jobs}
                  clickJob={this.viewJob}
                  deleteJob={this.deleteJob}
                  editJob={this.editJob}
                />
              </Route>
              <Route path="/jobs/:jobId">
                <Job job={job} />
              </Route>
              <Route path="/new-job">
                <CreateJob token={token} onJobCreated={this.onJobCreated} />
              </Route>
              <Route path="/edit-job/:jobId">
                <EditJob
                  token={token}
                  job={job}
                  onJobUpdated={this.onJobUpdated}
                />
              </Route>
              <Route path="/customers/:customerId">
                <ViewCustomer customer={customer} />
              </Route>
              <Route path="/new-customer">
                <CreateCustomer token={token} onCustomerCreated={this.onCustomerCreated} />
              </Route>
              <Route path="/edit-customer/:customerId">
                  <EditCustomer 
                    token={token}
                    customer={customer}
                    onCustomerUpdated={this.onCustomerUpdated}
                  />
              </Route>
              <Route
                exact
                path="/register"
                render={() => <Register {...authProps} />}
              />
              <Route
                exact
                path="/login"
                render={() => <Login {...authProps} />}
              />
            </Switch>
          </main>
        </div>
        </ThemeProvider>
      </Router>
    );
  }
}

export default App;
