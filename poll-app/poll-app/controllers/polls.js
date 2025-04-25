const Poll = require('../models/Poll');

// @desc    Create a new poll
// @route   POST /api/polls
// @access  Private
exports.createPoll = async (req, res) => {
  try {
    const { title, options } = req.body;

    // Validate title and options
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a title for the poll'
      });
    }

    if (!options || !Array.isArray(options) || options.length < 2 || options.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide between 2 and 5 options for the poll'
      });
    }

    // Format options
    const formattedOptions = options.map(option => ({
      text: option,
      votes: 0
    }));

    // Create poll
    const poll = await Poll.create({
      title,
      options: formattedOptions,
      creator: req.user.id
    });

    res.status(201).json({
      success: true,
      data: poll
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error creating poll',
      error: err.message
    });
  }
};

// @desc    Get all polls
// @route   GET /api/polls
// @access  Public
exports.getPolls = async (req, res) => {
  try {
    // Get all polls and populate creator information
    const polls = await Poll.find()
      .populate({
        path: 'creator',
        select: 'username'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: polls.length,
      data: polls
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching polls',
      error: err.message
    });
  }
};

// @desc    Get single poll
// @route   GET /api/polls/:id
// @access  Public
exports.getPoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate({
      path: 'creator',
      select: 'username'
    });

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    res.status(200).json({
      success: true,
      data: poll
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching poll',
      error: err.message
    });
  }
};

// @desc    Vote on a poll
// @route   POST /api/polls/:id/vote
// @access  Private
exports.votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;

    if (optionIndex === undefined || optionIndex === null) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an option to vote for'
      });
    }

    // Get the poll
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check if user has already voted
    if (poll.voters.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted on this poll'
      });
    }

    // Check if option exists
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid option selected'
      });
    }

    // Add vote
    poll.options[optionIndex].votes += 1;
    poll.voters.push(req.user.id);

    await poll.save();

    res.status(200).json({
      success: true,
      data: poll
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error voting on poll',
      error: err.message
    });
  }
};