const User = require("../models/User");
const GlobalDAO = require("./GlobalDAO");


class UserDAO extends GlobalDAO{
  constructor() {
    super(User);
  }
}


module.exports = new UserDAO();



