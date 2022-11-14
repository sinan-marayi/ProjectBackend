const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: "rzp_test_L0BoevbClOoS6I",
  key_secret: "d9ncWXWoPEFpxZvtJzUEClha",
});

module.exports.generaterazorpay =async function (orderId, total) {
    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100,
        currency: "INR",
        receipt: "" + orderId,
      };
       instance.orders.create(options, (err, order) => {
        if (err) {
          throw err;
        } else {
            // console.log(order);
          resolve(order);
        }
      });
    });
//   var options = {
//     amount: total,
//     currency: "INR",
//     receipt: "" + orderId,
//   };
//   await instance.orders.create(options, async (err, order) => {
//     if (err) {
//       throw err;
//     } else {
//         console.log(order);
//       return order;
//     }
//   })
};
