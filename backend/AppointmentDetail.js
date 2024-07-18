const mongoose = require("mongoose");

const SpecialistAppointmentSchema = new mongoose.Schema(
{
    userEmail: { type: String },
    date: { type: String }, // Month YYYY
    appointment: [{
        date: {type: String },
        startTime: { type: String },
        endTime: { type: String},
        interval: { type: String },
        breakTimings: { type: Array, default: [] } 
    }]
},
{
    collection: "SpecialistAppointment"
});

const AppointmentSchema = new mongoose.Schema(
{
    apptID: {type: Number},
    date: {type: String}, // Month Year e.g. July 2024
    userEmail: {type: String},
    specialistEmail: {type: String},
    details: [{
        date: {type: String}, 
        time: {type: String},
        status: {type: String}, 
        userComments: {type: String}, 
        specialistNotes: {type: String} 
    }]
},
{
    collection: "Appointment"
}
);

mongoose.model("specialistAppointment", SpecialistAppointmentSchema);
mongoose.model("appointment", AppointmentSchema);