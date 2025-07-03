export default {
  port: parseInt(process.env.PORT || '3000', 10),
  httpMaxSize: `${parseInt(process.env.HTTP_MAX_SIZE_KB || '5000', 10)}kb`,
};
