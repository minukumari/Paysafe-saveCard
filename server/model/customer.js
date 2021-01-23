var mongoose = require("mongoose");

var Customer = mongoose.model('customerData', {
	merchantRefNum : {
		type : String,
		required : true,
	},
	custId : {
		type : String,
		requireds : true
	},
	paymentHandleToken : {
		type : String,
		requireds : true
	},
	amount : {
		type : Number,
		requireds : true
	},
	transactionType: {
		type : String,
		requireds : true
	},
	currency : {
		type : String,
		requireds : true
	},
	merchantCustomerId : {
		type : String,
		requireds : true
	},

})

module.exports = {
	Customer
}