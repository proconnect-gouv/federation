/* istanbul ignore file */
export default {
  limit: parseInt(process.env.INSEE_CITY_DB_LIMIT, 10),
  cityCSVPath: process.env.INSEE_CITY_CSV_PATH,
  fieldsToSearch: ['name', 'cog', 'abr', 'specificPlace'],
};
