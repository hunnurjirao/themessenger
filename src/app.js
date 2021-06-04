require("dotenv").config();
const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const socket = require("socket.io");
const nodemailer = require('nodemailer');
const auth = require('./middleware/auth');

const port = process.env.PORT || 4000;

// require("./db/conn");

const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
mongoose.connect(uri || "mongodb://localhost:27017/ST1", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => {
    console.log("Database Connection Successful!");
}).catch((err) => {
    console.log("Database Connection Failed");
});


const Register = require("./models/registers");

const { json } = require("express");

const server = app.listen(port, () => {
    console.log(`Listening to port ${port}`);
})

const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");
const static_path = path.join(__dirname, "../public")

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));


app.use(express.static(static_path))
app.set("view engine", "hbs")
app.set("views", template_path)
hbs.registerPartials(partials_path)

//send a mail 
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hunnurjirao2000@gmail.com',
        pass: 'password goes here'
    }
});




app.get("/", (req, res) => {
    res.render("index")
});

app.get("/register", (req, res) => {
    res.render("register")

});

app.get("/login", (req, res) => {
    res.render("login")
});


app.get("/messenger", auth, (req, res) => {

    try {
        res.render("messenger", {
            firstname: req.user.firstname,
            lastname: req.user.lastname
        })
    } catch (error) {
        res.status(401).send(error);
    }


});

app.get("/logout", auth, async (req, res) => {

    try {
        //for single user logout---in single device

        // req.user.tokens = req.user.tokens.filter((ele)=>{
        //     return ele.token != req.token 
        // })

        // logout in all devices

        req.user.tokens = [];
        res.clearCookie("jwt");
        await req.user.save();
        res.render("login")

    } catch (error) {
        res.status(500).send(error);
    }
});

app.post("/register", async (req, res) => {


    try {

        const password = req.body.password;
        const cpassword = req.body.cpassword;

        if (password === cpassword) {
            const registerUser = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                phone: req.body.phone,
                password: password,
                cpassword: cpassword
            })

            const token = await registerUser.generateAuthToken()

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 1000 * 300),
                httpOnly: true
            });

            const registered = await registerUser.save()

            var minm = 10000;
            var maxm = 99999;
            var rand_num = Math.floor(Math.random() * (maxm - minm + 1)) + minm;
            var mailOptions = {
                from: 'hunnurjirao2000@gmail.com',
                to: `${req.body.email}`,
                subject: 'Verification key',
                text: `The verificatin key is ${rand_num}`
            }

            transporter.sendMail(mailOptions)

            res.status(201).render("index", {
                rand_num: rand_num,
                link: "logout"
            });

        } else {
            res.send("password not Matching!")
        }



    } catch (error) {
        res.status(401).send(error);
        res.send("Something went wrong in registration")
    }
});

app.post("/login", async (req, res) => {
    try {

        const confirm_email = req.body.confirm_email;
        const confirm_password = req.body.confirm_password;

        const useremail = await Register.findOne({ email: confirm_email });
        const isMatch = await bcrypt.compare(confirm_password, useremail.password)

        const token = await useremail.generateAuthToken();
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 1000 * 300),
            httpOnly: true
        });

        if (isMatch) {
            res.status(201).render("index", {
                quote: "Start messaging!",
                link: "logout"
            });
        } else {
            res.send("Invalid Login Details");
        }

    } catch (error) {
        res.status(400).send("Invalid Login Details");
    }
});




var io = socket(server);

io.on("connection", (socket) => {
    console.log("Socket connection successful!", socket.id)


    socket.on("chat", (data) => {
        io.sockets.emit("chat", data);
    });


    socket.on("typing", (data) => {
        socket.broadcast.emit("typing", data);
    });
});
