const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    event_id: {
      type: String,
      required: true,
      unique: true, // ensure each event has a unique identifier
    },
    name: String,
    venue: String,
    date: String,
    time: String,
    description: String,
    price: Number,
    cover: {
      type: String,
      default:
        "https://eventplanning24x7.files.wordpress.com/2018/04/events.png",
    },
    profile: {
      type: String,
      default:
        "https://i.etsystatic.com/15907303/r/il/c8acad/1940223106/il_794xN.1940223106_9tfg.jpg",
    },
    organizer: String,
    participants: [],
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
      },
    ],
    likedByWithNames: [String],
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = {
  Event,
  eventSchema,
};
