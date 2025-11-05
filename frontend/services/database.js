const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);


class DatabaseService {

  async simple(){
    const { data, error } = await supabase
  .from('characwaitlistters')
  .select();
  console.log('Data:', data);
  console.error('Error:', error);
  }

  async createWaitlistEntry(data) {
    try {
      const { data: result, error } = await supabase
        .from('waitlist')
        .insert([{
          name: data.name,
          email: data.email,
          language: data.language,
          level: data.level,
          frustration: data.frustration,
          created_at: new Date().toISOString(),
          ip_address: data.ip_address,
          user_agent: data.user_agent
        }])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      return result[0];
    } catch (error) {
      console.error('Database service error:', error);
      throw error;
    }
  }

  async checkIfEmailExists(email) {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('email')
        .eq('email', email.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Database error: ${error.message}`);
      }

      return !!data;
    } catch (error) {
      if (error.message.includes('no rows')) {
        return false;
      }
      throw error;
    }
  }

  async getWaitlistStats() {
    try {
      const { count, error } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return { total_signups: count };
    } catch (error) {
      console.error('Database stats error:', error);
      throw error;
    }
  }

  async getLanguageStats() {
    try {
    const { data, error } = await supabase
  .from('waitlist')
  .not('language', 'is', null)
  .select('language');


      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const languageCounts = data.reduce((acc, entry) => {
        acc[entry.language] = (acc[entry.language] || 0) + 1;
        return acc;
      }, {});

      return languageCounts;
    } catch (error) {
      console.error('Language stats error:', error);
      throw error;
    }
  }
}

module.exports = new DatabaseService();


