var jwt = require("jsonwebtoken");
const JWT_SECRET = "Hello I'm Piyush Vyas";

const fetchuser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res
      .status(401)
      .send({ error: "Please authenticate with valid credentials" });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    //console.log(data);
    req.user = data.user;
    next();
  } catch (error) {
    return res
    .status(401)
    .send({ error: "Please authenticate with valid credentials" });
  }
};

module.exports = fetchuser;
