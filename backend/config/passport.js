// backend/config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL, 
    scope: ['profile', 'email']
},
async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return done(null, false, { message: 'ไม่พบอีเมล์ผู้ใช้งาน' }); 
        }
        
        if (user.role === "technician") {
            const Technician = (await import('../models/Technician.js')).default;
            const technician = await Technician.findOne({ userId: user._id });
            if (!technician || technician.status !== "approved") {
                return done(null, false, { message: "บัญชีช่างเทคนิคอยู่ระหว่างรอการอนุมัติ" });
            }
        }
        return done(null, user);

    } catch (err) {
        return done(err, false);
    }
}));

export default passport;