import dotenv from 'dotenv';

import { supabase, supabaseAdmin } from '../config/supabaseConfig.js';
import { BadRequestError, SupabaseError, AuthenticationError, AuthorizationError, NotFoundError } from '../utilis/AppError.js';

const env = process.env.NODE_ENV;
dotenv.config({ path: `./config/.env.${env}` });

// User login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email) return next(new BadRequestError("Invalid Email Adress"));

        //Confirming if user has been verified yet
        const { data: info, error: err } = await supabaseAdmin.auth.admin.listUsers({
            email,
        });

        if (err) return next(new SupabaseError(err));

        const user = info.users[0];

        if (!user) return next(new NotFoundError("Profile not found"))
        const isVerified = user.user_metadata.email_verified;
        if (!isVerified) return next(new AuthorizationError("Not Verified Account"));

        //Signing In
        let { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) return next(new AuthenticationError());

        // Store user information in session
        req.session.userId = data.user.id;
        req.session.authenticated = true;
        return res.status(201).json({ message: 'logged in successfully' })
    } catch (err) {
        next(err);
    }
}

// User logout
const logout = (req, res, next) => {
    try {
        req.session.destroy((err) => {
            if (err) return next(new SupabaseError(err))
            res.clearCookie('connect.sid');
            return res.status(201).json({ message: 'logged out successfully' })
        });
    } catch (err) {
        next(err);
    }
};

const signUp = async (req, res, next) => {
    try {
        const { email,
            password,
            first_name,
            last_name,
            role,
            is_active,
            assigned_country
        } = req.body;

        const { data: newUser,
            error: insertError
        } = await supabase.auth.signUp({
            email: email, password: password,
            options: {
                data: {
                    first_name,
                    last_name,
                    role,
                    is_active,
                    assigned_country
                },
                emailRedirectTo: process.env.LOGIN_REDIRECT_URL//<replaced by frontend path>
            },
        })

        if (insertError) return next(new SupabaseError(insertError))

        return res.status(201).json({ message: `${newUser.user.user_metadata.first_name}'s account created` })
    } catch (err) {
        next(err);
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return next(new BadRequestError("Invalid Email Adress"));

        const { data, error: err } = await supabaseAdmin.auth.admin.listUsers({
            email,
        });

        if (err) return next(new SupabaseError(err));

        const user = data.users[0];
        if (!user) return next(new NotFoundError("Profile not found"));

        const isVerified = user.user_metadata.email_verified;
        if (!isVerified) return next(new AuthorizationError("Not Verified Account"));

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: process.env.RESET_PASSWORD_REDIRECT_URL, //<replaced by frontend path>
        });
        if (error) return next(new SupabaseError(error));

        return res.json({ message: 'Recovery email sent successfully' });
    } catch (err) {
        next(err);
    }
}

const sendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return next(new BadRequestError("Invalid Email Adress"));

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: process.env.REATHENTICATION_URL //<replaced by frontend path>
            }
        });
        if (error) return next(new SupabaseError(error));

        res.json({ message: "Verification email sent" });
    } catch (err) {
        next(err);
    }
}

export { login, logout, signUp, resetPassword, sendVerification };

