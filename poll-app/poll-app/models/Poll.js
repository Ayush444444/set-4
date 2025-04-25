const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a poll title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    votes: {
      type: Number,
      default: 0
    }
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  voters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total votes
PollSchema.virtual('totalVotes').get(function () {
  return this.options.reduce((total, option) => total + option.votes, 0);
});

module.exports = mongoose.model('Poll', PollSchema);