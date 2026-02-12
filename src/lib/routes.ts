/**
 * Routes accessible without authentication.
 * Every other route is protected by default.
 */
export const publicRoutes = [
    "/checkin",
];

/**
 * Authentication routes — accessible to guests,
 * redirect logged-in users to DEFAULT_LOGIN_REDIRECT.
 */
export const authRoutes = [
    "/login",
];

/**
 * Default redirect after successful login.
 */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
