import dotenv from 'dotenv';

import { supabase } from '../config/supabaseConfig.js'
import { SupabaseError, AuthorizationError, NotFoundError } from '../utilis/AppError.js';

const env = process.env.NODE_ENV;
dotenv.config({ path: `./config/.env.${env}` });

// Check anon key for RLS and protect data ingesting
const ensureAuth = function (req, res, next) {
    try {
        const anonKey = req.get('SUPABASE_ANON_KEY');
        if (!anonKey || anonKey !== process.env.SUPABASE_ANON_KEY) {
            return next(new AuthorizationError("Invalid or missing anon key"));
        }
        req.anonKey = anonKey;
        next();
    } catch (err) {
        next(err)
    }
}

// middleware to protect data routes 
const ensureLogin = function (req, res, next) {
    try {
        if (req.session.authenticated) return next();
        return next(new AuthorizationError("Authentication required"));
    } catch (err) {
        next(err)
    }
}

// protect signup route, only available for admin
const checkAdmin = async (req, res, next) => {
    try {
        const userId = req.session.userId
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (error) return next(new SupabaseError(error));
        if (!profile) return next(new NotFoundError("Profile not found"));
        if (profile.role !== 'admin') return next(new AuthorizationError("Insufficient permissions"));

        next();
    } catch (err) {
        next(err)
    }
}

export { ensureAuth, ensureLogin, checkAdmin };


