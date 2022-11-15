const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: "rzp_test_L0BoevbClOoS6I",
  key_secret: "d9ncWXWoPEFpxZvtJzUEClha",
});

module.exports.generaterazorpay =async function (orderId, total) {
    return new Promise((resolve, reject) => {
      var options = {
        amount: (total * 100),
        currency: "INR",
        receipt: "" + orderId,
      };
       instance.orders.create(options, (err, order) => {
        if (err) {
          console.log(err);
        } else {
          resolve(order);
        }
      });
    });
 
};
module.exports.signatureVerification= function (orderId,paymentId,signature){
return new Promise((resolve,reject)=>{
    const crypto = require('crypto')
    let hmac= crypto.createHmac('sha256','d9ncWXWoPEFpxZvtJzUEClha')

    hmac.update(orderId+'|'+paymentId);
    hmac=hmac.digest('hex')
    if(hmac === signature){
        console.log('success');
        resolve()
    }else{
        console.log('failed');
        reject()
    }
})
}
