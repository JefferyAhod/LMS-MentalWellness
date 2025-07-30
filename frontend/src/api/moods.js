import API from './axios'; 


export const createOrUpdateMoodEntry = async (mood, notes) => {
  const res = await API.post('/moods', { mood, notes });
  return res.data;
};


export const getMoodEntries = async () => {
  const res = await API.get('/moods');
  return res.data;
};


export const getTodaysMoodEntry = async () => {
  const res = await API.get('/moods/today');
  return res.data;
};


export const deleteMoodEntry = async (id) => {
  const res = await API.delete(`/moods/${id}`);
  return res.data;
};



