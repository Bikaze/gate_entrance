// controllers/computerController.js
const Computer = require('../models/computer');
const User = require('../models/user');
const QRCode = require('../models/qrcode');
const { validateComputerRegistration, validateComputerUpdate } = require('../utils/validation');

exports.registerComputer = async (req, res) => {
  const { registrationId } = req.params;
  const { regNo, serialNo, brand } = req.body;

  const validationError = validateComputerRegistration(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const qrCode = await QRCode.findOne({ code: registrationId, isUsed: false });
    if (!qrCode) {
      return res.status(400).json({ error: 'Invalid or used QR code' });
    }

    const user = await User.findOne({ regNo });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingComputer = await Computer.findOne({ serialNo });
    if (existingComputer) {
      return res.status(400).json({ error: 'Serial number already registered' });
    }

    const computer = new Computer({ registrationId, serialNo, brand, owner: user._id });
    await computer.save();

    qrCode.isUsed = true;
    await qrCode.save();

    res.status(201).json({ message: 'Computer registered successfully', registrationId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateComputer = async (req, res) => {
  const { registrationId } = req.params;
  const { regNo, serialNo, brand } = req.body;

  const validationError = validateComputerUpdate(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const qrCode = await QRCode.findOne({ code: registrationId, isUsed: false });
    if (!qrCode) {
      return res.status(400).json({ error: 'Invalid or used QR code' });
    }

    const user = await User.findOne({ regNo });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const computer = await Computer.findOneAndUpdate(
      { registrationId },
      { serialNo, brand, owner: user._id },
      { new: true }
    );

    if (!computer) {
      return res.status(404).json({ error: 'Computer not found' });
    }

    qrCode.isUsed = true;
    await qrCode.save();

    res.status(200).json({ registrationId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyComputer = async (req, res) => {
  const { registrationId } = req.params;

  try {
    const computer = await Computer.findOne({ registrationId }).populate('owner');
    if (!computer) {
      return res.status(404).json({ error: 'Computer not found' });
    }

    const { owner } = computer;
    res.status(200).json({
      photoLink: owner.photo,
      regNo: owner.regNo,
      names: owner.name,
      serialNo: computer.serialNo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchComputers = async (req, res) => {
  const { regNo, page = 1, limit = 10 } = req.query;

  try {
    const user = await User.findOne({ regNo });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const computers = await Computer.find({ owner: user._id })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      computers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: await Computer.countDocuments({ owner: user._id })
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// todo: resolve vulnerabilities
// sql-injection Unchecked input in database commands can alter intended queries
// stack-trace-exposure Error messages or stack traces can reveal sensitive details