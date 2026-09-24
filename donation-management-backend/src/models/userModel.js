import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: ['Admin', 'Staff'], default: 'Staff' },
    status: { type: String, enum: ['Pending', 'Active', 'Inactive'], default: 'Pending' },

    passwordSetToken: { type: String, select: false },
    passwordSetExpires: { type: Date, select: false },

    activeToken: { type: String, select: false }, // NEW
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);