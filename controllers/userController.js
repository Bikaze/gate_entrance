const mongoose = require("mongoose");
const User = require("../models/user");
const { validateUser } = require("../utils/validation");

exports.createUser = async (req, res) => {
  const { regNo, nationalId, name = "", type, photo = "" } = req.body;

  const validationError = validateUser({
    regNo,
    nationalId,
    name,
    photo,
    type,
  });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    let existingUser;
    if (type === "student" && regNo) {
      existingUser = await User.findOne({ regNo });
    } else if (type === "guest" && nationalId) {
      existingUser = await User.findOne({ nationalId });
    }

    if (existingUser) {
      return res.status(400).json({
        error: `User with the same ${
          type === "student" ? "registration number" : "national ID"
        } already exists`,
      });
    }

    const user = new User({ regNo, nationalId, name, photo, type });
    await user.save();

    const { _id, __v, createdAt, updatedAt, ...userData } = user.toObject();
    res.status(201).json(userData);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { _id, __v, createdAt, updatedAt, ...userData } = user;
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateUser = async (req, res) => {
  const { regNo, nationalId, name, type, photo } = req.body;

  const validationError = validateUser({
    regNo,
    nationalId,
    name,
    photo,
    type,
  });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { regNo, nationalId, name, photo, type },
      { new: true, lean: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { _id, __v, createdAt, updatedAt, ...userData } = user;
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getPhoto = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user || !user.photo) {
      return res.status(404).json({ error: "Photo not found" });
    }
    res.status(200).send(user.photo);
  } catch (error) {
    console.error("Error getting photo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
