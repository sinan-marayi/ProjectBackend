const jwt = require('jsonwebtoken')

module.exports =function verifyToken(req, res, next) {
    if (!req.headers.authorization) {
      return res.json({ success: false, msg: "unauthorized request" });
    }
    let token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.json({ success: false, msg: "unauthorized request" });
    }
    jwt.verify(token, "ict", (err, payload) => {
      if (err) {
        res.json({ success: false, msg: "unauthorized request" });
      } else {
        req.user = payload;
        console.log(req.user);
        next();
      }
    });
  }