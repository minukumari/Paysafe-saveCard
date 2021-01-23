import React,{Component} from 'react';
import config from './config.js';
import axios from 'axios';

const intitalState = {
  name: "",
  email: "",
  amount: "",
  username: "",

  name_error: "",
  email_error: "",
  amount_error: "",
  username_error: "",
  marchentRef : Math.random().toString(36).slice(3),
  loading: "",
};

const EMAIL_REG = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

class Checkout extends Component {
  constructor(props) {
    super(props);
    this.state = intitalState;
    this.btnRef = React.createRef();

  }

  checkout = async (token, id) => {
    await window.paysafe.checkout.setup(
      config.key,

      {
        currency: "USD",
        amount: this.state.amount * 100,
        singleUseCustomerToken: token,
        customerId: id,
        customer: {
          firstName: this.state.name,
          lastName: "Kumar",
          email: this.state.email,
          phone: "9999999999",
          dateOfBirth: {
            day: 1,
            month: 7,
            year: 1990,
          },
        },
        billingAddress: {
          street: "India",
          city: "India",
          zip: "95014",
          country: "IN",
          state: "CA",
        },
        locale: "en_US",
        environment: "TEST",
        merchantRefNum: this.state.username,
        canEditAmount: false,
        displayPaymentMethods: ["card"],
        paymentMethodDetails: {
          paysafecard: {
            consumerId: id,
          },
        },
      },
      (instance, error, result) => {
        this.setState({ loading: "" });
        if (result && result.paymentHandleToken) {
          result["merchantRefNum"] = this.state.marchentRef;
          result["currencyCode"] = "USD";
          result["custId"] = id;
          result["merchantCustomerId"] = this.state.username;
          console.log(result);
          this.setState(intitalState);
          fetch('https://paysafe-payment1.herokuapp.com/api/payment', {
          method: "POST",
          body: JSON.stringify(result),
          headers: {
                 'Accept': 'application/json',
                 'Content-Type': 'application/json'
                },
            })
            .then(function(response) {
                console.log(response);
                return response.json();
            })
            .then((res) => {
              console.log(res);
              instance.showSuccessScreen(res.id);

            })
            .catch((error) => {
              console.log(error.message);
              instance.showFailureScreen(error.correlationId);
            });
        } else {
          // error handle
          alert("Server Overload, Please try again");
          window.location.reload();
        }
      },
      (stage, expired) => {
        switch (stage) {
          case "PAYMENT_HANDLE_NOT_CREATED":
            this.setState({loading: ""});
            this.btnRef.current.removeAttribute("disabled", "disabled");
            break;
          /*case "PAYMENT_HANDLE_CREATED":
          case "PAYMENT_HANDLE_REDIRECT":
          case "PAYMENT_HANDLE_PAYABLE":*/
          default:
            window.location.reload();
        }
      }
    );
  };

  changeUserName = (e) => {
    this.setState({ username: e.target.value });
  };

  changeName = (e) => {
    this.setState({ name: e.target.value });
  };

  changeEmail = (e) => {
    this.setState({ email: e.target.value });
  };

  changeAmount = (e) => {
    this.setState({ amount: e.target.value });
    console.log(this.state.amount);
  };

  validForm = () => {
    let error_happen = false;
    if (this.state.username === "") {
      error_happen = true;
      this.setState({ username_error: "Enter Valid Username" });
    } else {
      this.setState({ username_error: "" });
    }
    if (this.state.name === "") {
      error_happen = true;
      this.setState({ name_error: "Enter Valid Name" });
    } else {
      this.setState({ name_error: "" });
    }

    if (this.state.email === "" || !EMAIL_REG.test(this.state.email)) {
      error_happen = true;
      this.setState({ email_error: "Enter Valid Email" });
    } else {
      this.setState({ email_error: "" });
    }
    if (
      isNaN(parseInt(this.state.amount)) ||
      parseInt(this.state.amount) <= 0
    ) {
      error_happen = true;
      this.setState({ amount_error: "Amount Should Be Number Greater 0" });
    } else {
      this.setState({ amount_error: "" });
    }

    if (error_happen) return false;
    return true;
  };

  makePayment = (e) => {
    e.preventDefault();
    if (this.validForm()) {
      this.btnRef.current.setAttribute("disabled", "disabled");
      this.setState({ loading: "Loading..." });
      const body = {
        merchantRefNum: this.state.marchentRef,
        name: this.state.name,
        merchantCustomerId: this.state.username
      };
        fetch('https://paysafe-payment1.herokuapp.com/api/verify', {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
                 'Accept': 'application/json',
                 'Content-Type': 'application/json'
                },
            })
         .then(function(response) {
                console.log(response);
                return response.json();
          })
         .then( async (res) => {
            this.checkout(res.token, res.id);
        })
        .catch(() => {

          alert("Please try again something went wrong");
          this.setState(intitalState);
        });



    } else {
      this.btnRef.current.removeAttribute("disabled", "disabled");
      console.log("Check The Form");
    }
  };

  render() {
    return (
      <div className="center">
        <h2 className="ui blue header">
          <i className="settings icon"></i>
          <div className="content">
            Save Card Feature
            <div className="sub header">Make Payment With Same Username</div>
          </div>
        </h2>

        <div className="center-less ui container">
          <div className="ui segment">
            {this.state.loading !== "" ? (
              <div className="ui active inverted dimmer">
                <div className="ui text loader">{this.state.loading}</div>
              </div>
            ) : null}

            <form className="ui form">
              <h4 className="ui dividing header">Information</h4>
              <div className="field">
                <div className="two fields">
                  <div className="field">
                    <div className="error">{this.state.username_error}</div>
                    <label>Username</label>
                    <input
                      type="text"
                      name="username"
                      placeholder="UNIQUE USERNAME"
                      value={this.state.username}
                      onChange={this.changeUserName}
                    />
                  </div>
                  <div className="field">
                    <div className="error">{this.state.name_error}</div>
                    <label>Name</label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="NAME"
                      onChange={this.changeName}
                      value={this.state.name}
                    />
                  </div>
                </div>
              </div>
              <div className="two field">
                <div className="field">
                  <div className="error">{this.state.email_error}</div>

                  <label>Email</label>
                  <input
                    type="text"
                    name="amount"
                    placeholder="EMAIL ADDRESS"
                    value={this.state.email}
                    onChange={this.changeEmail}
                  />
                </div>
                <div className="field">
                  <div className="error">{this.state.amount_error}</div>
                  <label>Amount($)</label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="AMOUNT"
                    min="1"
                    value={this.state.amount}
                    onChange={this.changeAmount}
                  ></input>
                </div>
              </div>
              <button
                ref={this.btnRef}
                className="ui button"
                onClick={this.makePayment}
                tabIndex="0"
              >
                Proceed to Pay
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Checkout;