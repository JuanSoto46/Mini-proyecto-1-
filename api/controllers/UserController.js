const GlobalController = require("./GlobalController");
const UserDAO = require("../dao/UserDAO");


class UserController extends GlobalController {
  constructor() {
    super(UserDAO);
  }
}
module.exports = new UserController();