export const appConfig = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'secret_key',
};
