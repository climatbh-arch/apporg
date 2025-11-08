export const ENV = {
  appId: process.env.VITE_APP_ID ?? "default-app-id",
  cookieSecret: process.env.JWT_SECRET ?? "default-jwt-secret-change-in-production",
  jwtSecret: process.env.JWT_SECRET ?? "default-jwt-secret-change-in-production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "https://api.manus.im",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "default-owner-id",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "https://api.manus.im",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "default-forge-key",
};
