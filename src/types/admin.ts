export type UserRole =
  | 'Super Admin'
  | 'Restaurant Owner'
  | 'Branch Manager'
  | 'Cashier'
  | 'Kitchen Staff';

export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export interface AdminUser {
  id: string;
  name: string;
  name_ar?: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  restaurantName?: string;
  restaurantName_ar?: string;
  branchName?: string;
  branchName_ar?: string;
  status: UserStatus;
  joinedDate: string;
  joinedDate_ar?: string;
  lastActive: string;
  lastActive_ar?: string;
}

export type RestaurantStatus = 'Active' | 'Pending' | 'Suspended';

export interface Branch {
  id: string;
  name: string;
  name_ar?: string;
  address: string;
  address_ar?: string;
  city?: string;
  country?: string;
  phone: string;
  managerName: string;
  managerName_ar?: string;
  managerEmail: string;
  staffCount: number;  ordersToday: number;
  revenueToday: number;
  status: 'Active' | 'Inactive';
  planName: string;
  planName_ar?: string;
  planExpiry: string;
  planExpiry_ar?: string;
  monthlyFee: number;
  activities?: { id: string; time: string; time_ar?: string; description: string; description_ar?: string; user: string; user_ar?: string }[];
}

export interface Restaurant {
  id: string;
  name: string;
  name_ar?: string;
  logo: string;
  category: string;
  category_ar?: string;
  ownerName: string;
  ownerName_ar?: string;
  ownerEmail: string;
  ownerPhone: string;
  address: string;
  address_ar?: string;
  status: RestaurantStatus;
  joinedDate: string;
  joinedDate_ar?: string;
  planName: string;
  planName_ar?: string;
  planType: 'Restaurant' | 'Branch';
  // Billing cycles per Figma Dump → "Create new Restaurant 5" (node 1859:336):
  // Monthly / Quarterly (Save 5%) / Semi Annually (Save 10%) / Yearly (Save 20%).
  planBilling: 'Monthly' | 'Quarterly' | 'SemiAnnually' | 'Yearly';
  planPrice: number;
  planExpiry: string;
  planExpiry_ar?: string;
  totalBranches: number;
  totalOrders: number;
  totalRevenue: number;
  branches: Branch[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  name_ar?: string;
  type: 'Restaurant' | 'Branch';
  priceMonthly: number;
  priceYearly: number;
  description: string;
  description_ar?: string;
  isPopular?: boolean;
  maxBranches?: number;
  maxStaff?: number;
  features: string[];
  features_ar?: string[];
  status: 'Active' | 'Archived';
}

export interface TransactionLedger {
  id: string;
  invoiceId: string;
  restaurantName: string;
  restaurantName_ar?: string;
  restaurantId: string;
  branchName?: string;
  branchName_ar?: string;
  planName: string;
  planName_ar?: string;
  amount: number;
  paymentMethod: 'Credit Card' | 'Bank Transfer' | 'Stripe' | 'PayPal';
  paymentMethod_ar?: string;
  date: string;
  date_ar?: string;
  status: 'Paid' | 'Pending' | 'Failed';
}

export interface RevenueMetric {
  month: string;
  month_ar?: string;
  revenue: number;
  subscriptionRevenue: number;
  platformFees: number;
  payouts: number;
}
