const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
{
  apptID: {type: Number},
  date: {type: Date},
  time: {type: String},
  serviceType: {type: String},
  userInfo: {type: String},
  specialistInfo: {type: String},
  status: {type: String}
},
{
  collection: "Appointment"
});

mongoose.model("appointment", AppointmentSchema);