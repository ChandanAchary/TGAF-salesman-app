// export const AppConfig = {
//   // Physical phone (Expo Go): use your PC's LAN IP, e.g. 'http://192.168.29.226:3000'
//   // Android emulator: 'http://10.0.2.2:3000'  |  iOS simulator/web: 'http://localhost:3000'
//   // After Render deploy, swap this to e.g. 'https://tgaf-test.onrender.com'  (NO trailing slash)
//   BACKEND_URL: 'https://tgaf-server-elysia.onrender.com',
//   AUTH_TOKEN_NAME: 'authToken',
//   AUTH_REFRESH_TOKEN_NAME: 'authToken',
//   USER_DETAILS: 'userDetails',
// } as const;

// // export const AppConfig = {
// //   // BACKEND_URL: 'http://192.168.29.226:3000',
// //   BACKEND_URL: 'https://tgaf.server.nexusinfotech.co',
// //   AUTH_TOKEN_NAME: 'authToken',
// //   AUTH_REFRESH_TOKEN_NAME: 'authToken',
// //   USER_DETAILS: 'userDetails',
// // } as const;



export const AppConfig = {
  // BACKEND_URL: 'http://192.168.29.226:3000',
  BACKEND_URL: 'https://tgaf-api-mobile-u5umx.ondigitalocean.app',
  // IMPORTANT : THIS IS PRODUCTION SERVER, TRIPLE CHECK TO COMMENT IT OUT DURING DEVELOPMENT
  // BACKEND_URL: 'https://tgaf.server.nexusinfotech.co',
  AUTH_TOKEN_NAME: 'authToken',
  AUTH_REFRESH_TOKEN_NAME: 'authToken',
  USER_DETAILS: 'userDetails',
} as const;