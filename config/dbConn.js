// const mongoose = require('mongoose')

// const connectDB = async () => {
//     try {
//         await mongoose.connect(process.env.DATABASE_URI)
//     } catch (err) {
//         console.log(err)
//     }
// }

// module.exports = connectDB

const mongoose = require('mongoose');

class Database {
  constructor() {
    this._connect();
  }

  _connect() {
    mongoose
      .connect(process.env.DATABASE_URI)
      .then(() => {
        console.log('Connected to MongoDB');
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = new Database();