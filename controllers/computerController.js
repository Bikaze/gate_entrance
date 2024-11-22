const Computer = require('../models/computer');
const User = require('../models/user');
const QRCode = require('../models/qrcode');
const { validateComputer } = require('../utils/validation');

exports.registerComputer = async (req, res) => {
  const { registrationId } = req.params;
  const { regNo, serialNo, brand } = req.body;

  const validationError = validateComputer(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
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

    const qrCode = await QRCode.findOne({ code: registrationId });
    qrCode.isUsed = true;
    await qrCode.save();

    res.status(201).json({ message: 'Computer registered successfully', registrationId });
  } catch (error) {
    console.error('Error registering computer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateComputer = async (req, res) => {
  const { registrationId } = req.params;
  const { regNo, serialNo, brand } = req.body;

  const validationError = validateComputer(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const user = await User.findOne({ regNo });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const computer = await Computer.findOneAndUpdate(
      { serialNo, brand, owner: user._id },
      { registrationId },
      { new: true }
    );

    if (!computer) {
      return res.status(404).json({ error: 'Computer not found' });
    }

    const qrCode = await QRCode.findOne({ code: registrationId });
    qrCode.isUsed = true;
    await qrCode.save();

    res.status(200).json({ registrationId });
  } catch (error) {
    console.error('Error updating computer:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    console.error('Error verifying computer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.searchComputers = async (req, res) => {
  const { regNo, nationalId, page = 1, limit = 10 } = req.query;

  try {
    let user;
    if (regNo) {
      user = await User.findOne({ regNo });
    } else if (nationalId) {
      user = await User.findOne({ nationalId });
    }

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
    console.error('Error searching computers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
