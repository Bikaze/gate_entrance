// controllers/userController.js
const mongoose = require("mongoose");
const User = require("../models/user");
const { validateUser } = require("../utils/validation");

exports.createUser = async (req, res) => {
  const { regNo, nationalId, name = "", type } = req.body;
  const photo = req.file
    ? { data: req.file.buffer, contentType: req.file.mimetype }
    : undefined;

  console.log(photo);

  // Convert regNo and nationalId to numbers
  const regNoNum = regNo ? Number(regNo) : undefined;
  const nationalIdNum = nationalId ? Number(nationalId) : undefined;

  // Check if regNo and nationalId are valid numbers
  if ((regNo && isNaN(regNoNum)) || (nationalId && isNaN(nationalIdNum))) {
    return res.status(400).json({ error: "Invalid regNo or nationalId" });
  }

  const validationError = validateUser({
    regNo: regNoNum,
    nationalId: nationalIdNum,
    name,
    photo,
    type,
  });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    // Check if a user with the same regNo or nationalId already exists
    let existingUser;
    if (type === "student" && regNoNum) {
      existingUser = await User.findOne({ regNo: regNoNum });
    } else if (type === "guest" && nationalIdNum) {
      existingUser = await User.findOne({ nationalId: nationalIdNum });
    }

    if (existingUser) {
      return res
        .status(400)
        .json({
          error: `User with the same ${
            type === "student" ? "regNo" : "nationalId"
          } already exists`,
        });
    }

    const user = new User({
      regNo: regNoNum,
      nationalId: nationalIdNum,
      name,
      photo,
      type,
    });
    await user.save();

    const { _id, __v, createdAt, updatedAt, ...userData } = user.toObject();
    res.status(201).json(userData);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const { regNo, nationalId, name, type } = req.body;
  const photo = req.file
    ? { data: req.file.buffer, contentType: req.file.mimetype }
    : null;

  // Convert regNo and nationalId to numbers
  const regNoNum = regNo ? Number(regNo) : undefined;
  const nationalIdNum = nationalId ? Number(nationalId) : undefined;

  // Check if regNo and nationalId are valid numbers
  if ((regNo && isNaN(regNoNum)) || (nationalId && isNaN(nationalIdNum))) {
    return res.status(400).json({ error: "Invalid regNo or nationalId" });
  }

  const validationError = validateUser({
    regNo: regNoNum,
    nationalId: nationalIdNum,
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
      { regNo: regNoNum, nationalId: nationalIdNum, name, photo, type },
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

exports.getPhoto = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findOne({
      $or: [{ regNo: id }, { nationalId: id }],
    });

    if (!user || !user.photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    // Extract the file extension from the contentType
    const extension = user.photo.contentType.split('/')[1];
    const filename = `photo.${extension}`;

    // Set headers to prompt the browser to display the image
    res.set('Content-Type', user.photo.contentType);
    res.set('Content-Disposition', `inline; filename="${filename}"`);

    res.send(user.photo.data);
  } catch (error) {
    console.error("Error fetching photo:", error);
    res.status(500).json({ error: "Internal server error" });
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
