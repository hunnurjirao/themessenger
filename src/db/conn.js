const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/ST1", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => {
    console.log("Database Connection Successful!");
}).catch((err) => {
    console.log(" Database Connection Failed");
});