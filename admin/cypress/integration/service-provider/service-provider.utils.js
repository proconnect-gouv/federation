export const getTodayDate = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const todayDate = `${day}/${month}/${year}`;
  return todayDate;
};
