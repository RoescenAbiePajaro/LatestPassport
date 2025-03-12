import { createClient } from '@supabase/supabase-js';

const supabase = createClient("https://ipcwaepmlqyadvsqnimo.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwY3dhZXBtbHF5YWR2c3FuaW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3Nzg0MDcsImV4cCI6MjA1NzM1NDQwN30.IChGv_FS3m6utAlUSYgUNZW7ZxINJCmookJGfJXgfEw");
const CDNURL = "https://ipcwaepmlqyadvsqnimo.supabase.co/storage/v1/object/public/InteractiveBoard/";


export async function uploadFile(filePath, file) {
    const { data, error } = await supabase.storage
        .from('InteractiveBoard')
        .upload(filePath, file);

    if (error) {
        throw error;
    }

    return data;
}

export async function getPublicUrl(filePath) {
    const { publicURL, error } = supabase.storage
        .from('InteractiveBoard')
        .getPublicUrl(filePath);

    if (error) {
        throw error;
    }

    return publicURL;
}


export default{ supabase, CDNURL };
