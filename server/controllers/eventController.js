const { Event } = require("../models/event");
const Admin = require("../models/admin");
const User = require("../models/user");
const dotenv = require("dotenv");
dotenv.config();

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const nodemailer = require("nodemailer");

function sendCheckInMail(data) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODE_MAILER_USER,
      pass: process.env.NODE_MAILER_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  let mailOptions = {
    from: process.env.NODE_MAILER_USER,
    to: data.email,
    subject: `${data.name}, You've Checked In - InVITe`,
    html: `
      Dear ${data.name},<br><br>
      <strong>Congratulations, you've successfully checked in for ${data.event}!</strong><br><br>
      <ul>
        <li><strong>Name:</strong> ${data.name}</li>
        <li><strong>Registration Number:</strong> ${data.regNo}</li>
        <li><strong>Contact Number:</strong> ${data.number}</li>
      </ul>
      <br>
      For any questions or concerns, contact:<br>
      Anurag Singh: 2002anuragksingh@gmail.com<br>
      Devanshu Yadav: devanshu.yadav2020@vitbhopal.ac.in<br>
      Saksham Gupta: saksham.gupta2020@vitbhopal.ac.in<br>
      Lavanya Doohan: lavanya.doohan2020@vitbhopal.ac.in<br><br>
      Thank you for choosing InVITe!<br><br>
      Best regards,<br>
      The InVITe Team
    `,
  };

  transporter.sendMail(mailOptions, function (err) {
    if (err) console.log(err);
    else console.log("Check-In Email sent successfully");
  });
}

const postEvent = async (req, res) => {
  const {
    name,
    venue,
    date,
    time,
    description,
    price,
    profile,
    cover,
    organizer,
    admin_id,
  } = req.body;

  const payload = { email: name };
  const token = jwt.sign(payload, JWT_SECRET);

  const new_event = new Event({
    event_id: token,
    name,
    venue,
    date,
    time,
    description,
    price,
    profile,
    cover,
    organizer,
  });

  try {
    await new_event.save();

    await Admin.updateOne(
      { admin_id },
      {
        $push: {
          eventCreated: {
            event_id: token,
            name,
            venue,
            date,
            time,
            description,
            price,
            profile:
              profile ??
              "https://i.etsystatic.com/15907303/r/il/c8acad/1940223106/il_794xN.1940223106_9tfg.jpg",
            cover:
              cover ??
              "https://eventplanning24x7.files.wordpress.com/2018/04/events.png",
            organizer,
          },
        },
      }
    );

    res.status(200).send({ msg: "event created", event_id: token });
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: "Error creating event" });
  }
};

const allEvents = async (req, res) => {
  try {
    const events = await Event.find({});
    res.status(200).send(events);
  } catch (err) {
    res.status(400).send({ msg: "Error fetching data", error: err });
  }
};

const particularEvent = async (req, res) => {
  const { event_id } = req.body;
  try {
    const data = await Event.findOne({ event_id });
    res.status(200).send(data);
  } catch (err) {
    res.status(400).send({ msg: "Error fetching event", error: err });
  }
};

const deleteEvent = async (req, res) => {
  const { event_id, admin_id } = req.body;

  try {
    await Event.deleteOne({ event_id });
    await Admin.updateOne(
      { admin_id },
      { $pull: { eventCreated: { event_id } } }
    );

    res.status(200).send({ msg: "success" });
  } catch (err) {
    res.status(400).send({ msg: "Deletion failed", error: err });
  }
};

const checkin = async (req, res) => {
  const { event_id, checkInList } = req.body;

  try {
    const event = await Event.findOne({ event_id });
    const eventName = event.name;

    for (const userId of checkInList) {
      await Event.updateOne(
        { event_id, "participants.id": userId },
        { $set: { "participants.$.entry": true } }
      );

      const user = await User.findOne({ user_token: userId });

      if (user) {
        const data_obj = {
          name: user.username,
          regNo: user.reg_number,
          email: user.email,
          number: user.contactNumber,
          event: eventName,
        };
        sendCheckInMail(data_obj);
      }
    }

    res.status(200).send({ msg: "success" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: "Check-in failed", error: err });
  }
};

const likeEvent = async (req, res) => {
  const { id } = req.params; // Event ID from URL parameter
  const { user_id,email } = req.body; // User ID from request body
  try {
      const event = await Event.findOne({ event_id: id });
      console.log("user "+email);


    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    } 

    const alreadyLiked = event.likedBy.some(
      (uid) =>{
        console.log("uid "+uid.toString());
        
        return uid.toString() === user_id
      } 
    );
    
    if (alreadyLiked) {
      return res
        .status(400)
        .json({ message: "You already liked this event" });
    }

    event.likes =event.likes+1;
    
    
    event.likedBy.push(user_id);
    event.likedByWithNames.push(email);
    await event.save();

    res.status(200).json({ message: "Liked successfully", likes: event.likes });
  } catch (error) {
    console.error("Like error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  postEvent,
  allEvents,
  particularEvent,
  deleteEvent,
  checkin,
  likeEvent,
};
