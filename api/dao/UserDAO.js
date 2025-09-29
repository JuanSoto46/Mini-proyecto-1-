const User = require("../models/User");
const GlobalDAO = require("./GlobalDAO");

// UserDAO extends the generic GlobalDAO to handle User-specific persistence
class UserDAO extends GlobalDAO{
  constructor() {
    // Pass the User model to the parent DAO
    super(User);
  }
}

// Export a singleton instance of UserDAO
module.exports = new UserDAO();



