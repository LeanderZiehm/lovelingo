// databaseService.test.js
const { createClient } = require('@supabase/supabase-js');
jest.mock('@supabase/supabase-js');


const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn(() => ({
  insert: mockInsert,
  select: mockSelect,
  eq: jest.fn(() => ({ select: mockSelect, single: mockSelect })),
  not: jest.fn(() => ({ select: mockSelect })),
}));

const mockSupabaseClient = {
  from: mockFrom
};

// Mock the client creation
createClient.mockReturnValue(mockSupabaseClient);

const dbService = require('./database');

describe('DatabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });



  describe('simple', () => {
    it('should call supabase.from().select() and log data and error', async () => {
      const fakeData = [{ id: 1, name: 'test' }];
      const fakeError = null;

      mockSelect.mockResolvedValueOnce({ data: fakeData, error: fakeError });

      // Mock console
      console.log = jest.fn();
      console.error = jest.fn();

      await dbService.simple();

      expect(mockFrom).toHaveBeenCalledWith('characwaitlistters');
      expect(mockSelect).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Data:', fakeData);
      expect(console.error).toHaveBeenCalledWith('Error:', fakeError);
    });
  });

    
  

  describe('createWaitlistEntry', () => {
    it('should insert a new waitlist entry and return the result', async () => {
      const mockData = {
        name: 'Test User',
        email: 'test@example.com',
        language: 'JavaScript',
        level: 'Intermediate',
        frustration: 'Error handling',
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0',
      };

      const expectedResponse = [{ id: 1, ...mockData }];
      mockInsert.mockReturnValueOnce({
        select: () => Promise.resolve({ data: expectedResponse, error: null }),
      });

      const result = await dbService.createWaitlistEntry(mockData);
      expect(result).toEqual(expectedResponse[0]);
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should throw error on insert failure', async () => {
      mockInsert.mockReturnValueOnce({
        select: () => Promise.resolve({ data: null, error: { message: 'Insert failed' } }),
      });

      await expect(dbService.createWaitlistEntry({ email: 'fail@test.com' })).rejects.toThrow('Database error: Insert failed');
    });
  });


describe('Integartion Test Supabase', () => {
  it('should insert a new entry', async () => {
    const newEntry = {
      name: 'Test User',
      email: 'test@example.com',
      language: 'JavaScript',
      level: 'Intermediate',
      frustration: 'Error handling',
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0',
    };

    const result = await dbService.createWaitlistEntry(newEntry);
    expect(result.email).toBe(newEntry.email);

    // Optionally, cleanup after test by deleting the inserted row
  });
});


  // describe('checkIfEmailExists', () => {
  //   it('should return true if email exists', async () => {
  //     mockSelect.mockResolvedValue({ data: { email: 'test@example.com' }, error: null });

  //     const result = await dbService.checkIfEmailExists('test@example.com');
  //     expect(result).toBe(true);
  //   });

  //   it('should return false if email does not exist', async () => {
  //     const error = { code: 'PGRST116', message: 'No rows found' };
  //     mockSelect.mockResolvedValue({ data: null, error });

  //     const result = await dbService.checkIfEmailExists('notfound@example.com');
  //     expect(result).toBe(false);
  //   });
  // });

  // describe('getWaitlistStats', () => {
  //   it('should return the total number of signups', async () => {
  //     mockSelect.mockResolvedValue({ count: 42, error: null });

  //     const result = await dbService.getWaitlistStats();
  //     expect(result).toEqual({ total_signups: 42 });
  //   });
  // });

  // describe('getLanguageStats', () => {
  //   it('should return language statistics', async () => {
  //     const mockLanguageData = [
  //       { language: 'JavaScript' },
  //       { language: 'Python' },
  //       { language: 'JavaScript' },
  //     ];
  //     mockSelect.mockResolvedValue({ data: mockLanguageData, error: null });

  //     const stats = await dbService.getLanguageStats();
  //     expect(stats).toEqual({ JavaScript: 2, Python: 1 });
  //   });
  // });
});
