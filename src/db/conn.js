const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => {
    console.log("Database Connection Successful!");
}).catch((err) => {
    console.log("Database Connection Failed");
});

// || "mongodb://localhost:27017/ST1"   