import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    employeeId: { type: String, unique: true, default: "" },
    email: { type: String, unique: true, default: "" },
    password: { type: String, minLength: 6, default: "" },
    joiningDate: { type: Date, default: "" },
    position: { type: String, default: "" },
    name: { type: String, default: "" },
    branch: { type: String, default: "" },
    team: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
    isSuperUser: { type: Boolean, default: false },
    attendance: [
      {
        date: { type: Date, default: "" },
        status: {
          type: String,
          enum: ["Present", "Absent", "Half Day"],
          default: "Absent",
        },
        permission: { type: Boolean, default: false },
        reason: { type: String, default: "" },
      },
    ],
    leaveDate: [
      {
        startDate: { type: Date, default: "" },
        endDate: { type: Date, default: "" },
        leave_status: { type: String, default: "pending" },
        leaveDays: { type: Number, default: 0 },
        leaveReason: { type: String, default: "" },
        leaveType: {
          type: String,
          enum: ["casual-leave", "sick-leave", "unpaid-leave"],
          default: "",
        },
        leaveDuration: {
          type: String,
          enum: ["full-day", "half-day"],
          required: true,
        },
      },
    ],
    permissions: [{ accessLeaveRequest: { type: Boolean, default: "" } }],
    image: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zipCode: { type: Number, default: "" },
    },
    emergencyContactNumber: {
      type: Number,
      default: "",
    },
    emergencyContactName: {
      type: String,
      default: "",
    },
    emergencyContactRelation: {
      type: String,
      default: "",
    },
    salary: {
      type: Number,
      default: "",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },
    employmentStatus: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    phone: { type: Number, default: "" },
    dateOfBirth: { type: Date, default: "" },
    // refreshToken: { type: String, default: "" },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// console.log("_______________hghjgjh_", process.env.ACCESS_TOKEN_EXPIRY)
// Generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// // Generate Refresh Token
// userSchema.methods.generateRefreshToken = function () {
//   return jwt.sign(
//     { _id: this._id, email: this.email },
//     process.env.REFRESH_TOKEN_SECRET,
//     {
//       expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
//     }
//   );
// };

// Match Entered Password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
