/* istanbul ignore file */
export default {
  limit: parseInt(process.env.INSEE_COUNTRY_DB_LIMIT, 10),
  countryCSVPath: process.env.INSEE_COUNTRY_CSV_PATH,
  fieldsToSearch: ['name', 'cog', 'oldName', 'capay', 'crpay'],
};
