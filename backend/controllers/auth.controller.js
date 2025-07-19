
import  crypto from "crypto"
import asyncHandler from "express-async-handler";
import User from "../models/UserModel.js";
import generateToken from '../utils/generateToken.js'
import { sendEmail } from "../utils/sendEmail.js";

// Register
export const register = asyncHandler(async (req, res) => {
  const {name, email, password, role} = req.body; 

    //Validation
    if (!name || !email || !password || !role) {
        res.status(400);
        throw new Error('Please fill in all required fields');

    }
    if (password.length < 8 ) {
        res.status(400);
        throw new Error('Password must not be less than 8 characters');
    }

    const userExists = await User.findOne({email}); 

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        status: role === "educator" ? "pending" : "approved"  
    });

    if(user) {
        generateToken(res, user._id)

        const newUser = await User.findOne({ email }).select("-password"); 
        res.status(201).json(newUser);
       
    } else{
        res.status(400);
        throw new Error('Invalid user data');
    }

});

// Login
export const login = asyncHandler(async (req, res) => {
  const {email, password } = req.body;

        //Validation
        if (!email || !password) {
            res.status(400);
            throw new Error('Please fill in all required fields');
    
        }
        //   check if user exists
      const user = await User.findOne({email});

    if(user && (await user.matchPassword(password))) {
        generateToken(res, user._id);
        const newUser = await User.findOne({ email }).select("-password"); 
        res.status(200).json(newUser);
    } else{
        res.status(404);
        throw new Error('Invalid email or password');
    }
});

// Logout
export const logout = asyncHandler(async (req, res) => {
 res.cookie('jwt', '', {
        httpOnly:true,
        expires: new Date(0)
    })
    res.status(200).json({ message: 'Logged out Successfully'});

});

// Forgot Password (Send Reset Token - Simulated)
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
  
    const resetToken = user.createPasswordResetToken();
    await user.save();
  
    const resetUrl = `${process.env.FRONTEND_URL}/set-password/${resetToken}`;
  
    const message = `
 <h2>Hello ${user.name}</h2>
<p>Please use the link below to reset your password</p>
<p>The reset link is valid for 10 minutes</p>

<a href=${resetUrl} clicktracking=off>${resetUrl}</a>

<p>Regards...</p>
<p>Lecture Mate</p>
    `;
    await sendEmail({
      send_to: user.email,
      subject: "FORGOT PASSWORD",
      message,
    });
  
    res.json({ message: "Reset link sent to email" });

});

// Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
  const {resetToken} =req.params 

    //    Hash token, then compare to token in the db
const hashedToken = crypto
.createHash("sha256")
.update(resetToken)
.digest("hex");

const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

if(!user){
 res.status(404)
    throw new Error("Invalid or expired Token")
    
  }

    const { password } = req.body;
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
        status: "Success",
        message: "Password Reset Successful"
    });
});
