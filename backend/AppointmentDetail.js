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
    userEmail: {type: String},
    specialistInfo: {type: String},
    details: [{
        date: {type: String},
        time: {type: String},
        status: {type: String}
    }]
}
)

mongoose.model("specialistAppointment", SpecialistAppointmentSchema);
mongoose.model("appointment", AppointmentSchema);