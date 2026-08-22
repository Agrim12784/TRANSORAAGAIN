const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type     : String,
      required : [true, 'Name is required'],
      trim     : true,
      maxlength: [60, 'Name cannot exceed 60 characters']
    },
    email: {
      type     : String,
      required : [true, 'Email is required'],
      unique   : true,
      lowercase: true,
      trim     : true,
      match    : [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type     : String,
      required : [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select   : false   // never returned in queries by default
    },
    // Transora-specific fields
    isDeaf: {
      type   : Boolean,
      default: false
    },
    preferredLang: {
      type   : String,
      enum   : ['ASL', 'BSL', 'ISL', 'other'],
      default: 'ASL'
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Course'
      }
    ],
    level: {
      type   : String,
      enum   : ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    xp: {
      type   : Number,
      default: 0
    },
    avatar: {
      type   : String,
      default: ''
    },
    role: {
      type   : String,
      enum   : ['student', 'instructor', 'admin'],
      default: 'student'
    },
    isVerified: {
      type   : Boolean,
      default: false
    },
    resetPasswordToken  : String,
    resetPasswordExpire : Date
  },
  {
    timestamps: true   // adds createdAt, updatedAt automatically
  }
);

// ── Hash password before saving ───────────────────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt   = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare entered password with hashed one ─────────────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ── Instance method: safe user object (no password) ──────────────────────────
UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
