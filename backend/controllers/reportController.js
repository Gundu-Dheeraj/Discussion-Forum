const Report = require('../models/Report');

// @POST /api/reports
exports.createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    const existing = await Report.findOne({
      reporter: req.user._id,
      targetId,
      status: 'Pending',
    });
    if (existing) return res.status(400).json({ message: 'You already reported this content' });

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason,
      description,
    });

    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/reports  (mod/admin)
exports.getReports = async (req, res) => {
  try {
    const { status = 'Pending', page = 1, limit = 20 } = req.query;
    const query = status !== 'all' ? { status } : {};

    const reports = await Report.find(query)
      .populate('reporter', 'username')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(query);
    res.json({ reports, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/reports/:id
exports.updateReport = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, reviewNote, reviewedBy: req.user._id },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
