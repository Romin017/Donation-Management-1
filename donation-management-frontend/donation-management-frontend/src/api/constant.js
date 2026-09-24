export const APIs = {
  API: "/api",

  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  DONOR_LOGIN: "/auth/donor/login",
  DONOR_REGISTER: "/auth/donor/register",
  LOGOUT: "/auth/logout",
  SET_PASSWORD: "/auth/set-password", // append /:token when calling

  // Donors
  DONORS: "/donors",

  // Campaigns
  CAMPAIGNS: "/campaigns",

  // Donations
  DONATIONS: "/donations",

  // Razorpay donations
  CREATE_RAZORPAY_ORDER: "/donations/razorpay/order",
  VERIFY_RAZORPAY_PAYMENT: "/donations/razorpay/verify",

  // Expenses
  EXPENSES: "/expenses",
  EXPENSES_TOTAL: "/expenses/total",

  // Users
  USERS: "/users",
}