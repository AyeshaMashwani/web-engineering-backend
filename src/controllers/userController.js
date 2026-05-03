class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  createUser = async (req, res) => {
    try {
      const user = await this.userService.createUser(req.body);

      return res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  getUsers = async (req, res) => {
    try {
      const users = await this.userService.getAllUsers();

      return res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
}

export default UserController;