const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true,
        // minlength:4
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
        // minlength:4
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(val) {
            if (!validator.isEmail(val)) {
                throw new Error("Please enter a valid Email.");
            }
        }
    },
    phone: {
        type: Number,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        // minlength: 8,
        // maxlength: 16,
        trim: true
    },
    cpassword: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

userSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token });

        await this.save(function (err, result) {
            if (err) {
                console.log(err);
                console.log("registers part failure")
            }

        })
        console.log("registers part successful")

        return token;


    } catch (error) {
        res.status(401).send(error);
    }
}

userSchema.pre("save", async function (next) {

    if (this.isModified("password")) {
        // console.log(`original password = ${this.password}`);
        this.password = await bcrypt.hash(this.password, 10);
        // console.log(`bycrypt password = ${this.password}`);

        this.cpassword = await bcrypt.hash(this.password, 10);
    }
    next();
})


const Register = new mongoose.model("Register", userSchema);

module.exports = Register;