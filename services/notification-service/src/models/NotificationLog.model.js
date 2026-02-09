const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['EMAIL', 'SMS'],
    },
    event: {
      type: String,
      required: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    subject: String,
    body: String,
    status: {
      type: String,
      required: true,
      enum: ['SENT', 'FAILED', 'RETRY'],
      default: 'SENT',
    },
    attempts: {
      type: Number,
      default: 1,
    },
    error: String,
    sentAt: Date,
  },
  {
    timestamps: true,
  }
);

notificationLogSchema.index({ userId: 1, createdAt: -1 });
notificationLogSchema.index({ event: 1 });

const NotificationLog = mongoose.model('NotificationLog', notificationLogSchema);

module.exports = NotificationLog;
