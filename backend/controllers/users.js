const User = require("../models/user");
const Recipe = require("../models/recipe");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

module.exports = {
  signup,
  login,
  updateProfile,
  deleteProfile,
};

async function signup(req, res) {
  const user = new User(req.body);
  try {
    await user.save();
    const token = createJWT(user);
    res.json({ token });
  } catch (err) {
    res.status(400).json(err);
  }
}

async function login(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ err: "bad credentials" });
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (isMatch) {
        const token = createJWT(user);
        res.json({ token });
      } else {
        return res.status(401).json({ err: "bad credentials" });
      }
    });
  } catch (err) {
    return res.status(401).json(err);
  }
}

async function updateProfile(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ err: "User not found" });

    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = req.body.password;
    await user.save();

    res.json({ token: createJWT(user) });
  } catch (err) {
    res.status(400).json(err);
  }
}

async function deleteProfile(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ err: "User not found" });

    await Recipe.deleteMany({ ownerId: user._id });
    await user.deleteOne();
    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}

/*----- Helper Functions -----*/

function createJWT(user) {
  return jwt.sign({ user }, SECRET, { expiresIn: "24h" });
}
