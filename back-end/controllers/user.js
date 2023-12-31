const UserModel = require("../models/Users");
const CafesModel = require("../models/Cafes");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const register = async (req, res) => {
  try {
    const auth = await UserModel.findOne({ email: req.body.email });
    if (auth) {
      return res.status(400).json({ status: "error", msg: "duplicate email" });
    }
    const hash = await bcrypt.hash(req.body.password, 12);

    await UserModel.create({
      email: req.body.email,
      hash,
      role: req.body.role || "user",
    });

    res.json({ status: "ok", msg: "user registered" });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const auth = await UserModel.findOne({ email: req.body.email });
    if (!auth) {
      return res.status(400).json({
        status: "error",
        msg: "cannot find email or password incorrect",
      });
    }

    const result = await bcrypt.compare(req.body.password, auth.hash);
    if (!result) {
      return res.status(401).json({
        status: "error",
        msg: "cannot find email or password incorrect",
      });
    }

    const payload = {
      id: auth._id,
      email: auth.email,
      role: auth.role,
      referralCode: auth.referralCode,
    };
    const access = jwt.sign(payload, process.env.ACCESS_SECRET, {
      expiresIn: "20m",
      jwtid: uuidv4(),
    });

    const refresh = jwt.sign(payload, process.env.REFRESH_SECRET, {
      expiresIn: "30d",
      jwtid: uuidv4(),
    });

    res.json({ access, refresh });
  } catch (error) {
    console.error(error.message);
    return res.status(400).json({ status: "error", msg: "login failed" });
  }
};

const refresh = async (req, res) => {
  try {
    const decoded = jwt.verify(req.body.refresh, process.env.REFRESH_SECRET);
    const user = await UserModel.findById(decoded.id);
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode,
    };

    const access = jwt.sign(payload, process.env.ACCESS_SECRET, {
      expiresIn: "20m",
      jwtid: uuidv4(),
    });

    res.json({ access });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ status: "error", msg: "unable to refresh token" });
  }
};

async function getUsers(req, res) {
  try {
    const allUsers = await UserModel.find().select("-hash");
    res.json(allUsers);
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", message: "error getting users" });
  }
}

const patchUser = async (req, res) => {
  try {
    const updateInfo = {};
    if (req.body.name) updateInfo.name = req.body.name;
    if (req.body.savedPlaces) updateInfo.savedPlaces = req.body.savedPlaces;
    if (req.body.points) updateInfo.points = req.body.points;
    if (req.body.referredCount)
      updateInfo.referredCount = req.body.referredCount;
    if (req.body.wasReferred) updateInfo.wasReferred = req.body.wasReferred;
    if (req.body.aboutMe) updateInfo.aboutMe = req.body.aboutMe;

    await UserModel.findByIdAndUpdate(req.body.id, updateInfo);

    res.json(updateInfo);
  } catch (error) {
    console.log(error.message);
    res.json({ status: "error", msg: "error updating user" });
  }
};

const postUser = async (req, res) => {
  try {
    const targetUser = await UserModel.findById(req.body.id).select("-hash");

    res.json(targetUser);
  } catch (error) {
    console.log(error.message);
    res.json({ status: "error", msg: "error getting user" });
  }
};

async function postSavedCafes(req, res) {
  try {
    const targetUserCafes = await UserModel.findById(req.body.id).select(
      "savedPlaces"
    );
    const cafeArray = await CafesModel.find({
      _id: { $in: targetUserCafes.savedPlaces },
    });
    res.json(cafeArray);
  } catch (error) {
    console.error(error.message);
    res
      .status(400)
      .json({ status: "error", message: "error getting saved places" });
  }
}

module.exports = {
  register,
  login,
  refresh,
  getUsers,
  patchUser,
  postUser,
  postSavedCafes,
};
