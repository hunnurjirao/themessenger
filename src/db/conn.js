const mongoose = require('mongoose');
const url = "mongodb+srv://hunnurjirao:Rajahunnur@666@cluster0.ubnum.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
mongoose.connect(("mongodb://localhost:27017/ST1" || url), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => {
    console.log("Database Connection Successful!");
}).catch((err) => {
    console.log(" Database Connection Failed");
});