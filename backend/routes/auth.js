const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = "Hello I'm Piyush Vyas";
let success = false;
//Create a user. Auth not enabled
router.post(
  "/createUser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password should be at least 3 characters").isLength({
      min: 3,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).send("User with this email already exists");
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });
      user.save();
      const data = {
        user:{
          id: user.id,
        }
      }
      //console.log(data);
      const authToken = jwt.sign(data, JWT_SECRET)
      //console.log(authToken);
      res.json({status: 200, authToken: authToken});
    } catch (error) {
      res.send({ error: "Internal server error" });
    }
  }
);

//user login. Auth not enabled
router.post('/login',[
  body("email", "Enter a valid email").isEmail(),
  body("password", "Password cannot be blank").exists()],
  async (req, res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try{
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user){
      success = false;
      return res.status(400).json({error: "Please enter valid credentials"});
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if(!passwordCompare){
      success = false
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }
    const data = {
      user:{
        id: user.id
      }
    }
    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success, authToken })
  } catch(error) {
    res.json({ error:"Internal server error" });
  }
}
)

//Get user details. Authentication required
router.post('/getuser', fetchuser, async (req, res)=>{
  const userid = req.user.id;
  const user = await User.findById(userid).select("-password");
  if(!user){
    return res.status(400).json({error: "Please enter valid credentials"});
  }
  res.send(user);
})

module.exports = router;
