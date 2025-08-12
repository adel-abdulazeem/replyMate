import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

import { logger } from "../utilis/logger.js";

dotenv.config({ path: `./config/.env` });
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const checkSupabaseConnection = async () => {
    try {
        const { data, error } = await supabase.auth.getSession();// eslint-disable-line no-unused-vars

        if (error) throw error;
        logger.info('✅ Connected to Supabase successfully');
    } catch (err) {
        logger.info('❌ Supabase connection failed:', err.message);
    }
};


export { supabase, supabaseAdmin, checkSupabaseConnection };
