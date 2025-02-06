// import mongoose from "mongoose";


// const leaveSchema=new mongoose.Schema({
// id:{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
// },
// employeeId:{ type: String, default: "" },
// employeeName:{ type: String, default: "" },
// branch:{type: String, default: ""},
// leaveSets:[
//     {
//         startDate: { type: Date, default: "" },
//         endDate: { type: Date, default: "" },
//         leave_status: { type: String, default: "pending" },
//         leaveDays: { type: Number, default: 0 },
//         leaveReason: { type: String, default: "" },
//         leaveType: {
//           type: String,
//           enum: ["casual-leave", "sick-leave", "unpaid-leave"],
//           default: "",
//         },
//         leaveDuration: {
//           type: String,
//           enum: ["full-day", "half-day"],
//           required: true,
//         },
//         approvedBy:{
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "User",
//           required: true,
//       },
//       approvedAt:{ type: Date, default: "" },
//       createdAt:{ type: Date, default: "" }
//       },
// ]

// },{timestamps:true})

// const Leave =mongoose.model("Leave", leaveSchema);

// export default Leave;



import mongoose from "mongoose";


const leaveSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startDate: { type: Date, default: new Date(), required: true },
  endDate: { type: Date, default: new Date(), required: true },
  leave_status: { type: String, default: "pending" },
  leaveDays: { type: Number, default: 0 },
  leaveReason: { type: String, default: "" },
  leaveType: {
    type: String,
    enum: ["casual-leave", "sick-leave", "unpaid-leave"],
    default: "unpaid-leave",
    required: true
  },
  leaveDuration: {
    type: String,
    enum: ["full-day", "half-day"],
    default: "full-day",
    required: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  },
  approvedAt: { type: Date, default: "" },
}, { timestamps: true, versionKey: false })

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;