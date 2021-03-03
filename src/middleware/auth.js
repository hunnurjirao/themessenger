const jwt = require('jsonwebtoken');
const Register = require('../models/registers');

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        // console.log(verifyUser);

        const user = await Register.findOne({ _id: verifyUser._id });
        // console.log(`user====>${user}`)

        req.token = token;
        req.user = user;

        next();

    } catch (error) {
        res.status(401).send("<div class='container'><h3>you are not login / registered! Click <a href='/login'> here </a> to login/register or go to <a href='/'>home</a></h3></div>")
    }
}

module.exports = auth;