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
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  restaurantName?: string;
  branchName?: string;
  status: UserStatus;
  joinedDate: string;
  lastActive: string;
}

export type RestaurantStatus = 'Active' | 'Pending' | 'Suspended';

export interface Branch {
  id: string;
  name: string;
  address: string;
  city?: string;
  country?: string;
  phone: string;
  managerName: string;
  managerEmail: string;
  staffCount: number;  ordersToday: number;
  revenueToday: number;
  status: 'Active' | 'Inactive';
  planName: string;
  planExpiry: string;
  monthlyFee: number;
  activities?: { id: string; time: string; description: string; user: string }[];
}

export interface Restaurant {
  id: string;
  name: string;
  logo: string;
  category: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  address: string;
  status: RestaurantStatus;
  joinedDate: string;
  planName: string;
  planType: 'Restaurant' | 'Branch';
  // Billing cycles per Figma Dump → "Create new Restaurant 5" (node 1859:336):
  // Monthly / Quarterly (Save 5%) / Semi Annually (Save 10%) / Yearly (Save 20%).
  planBilling: 'Monthly' | 'Quarterly' | 'SemiAnnually' | 'Yearly';
  planPrice: number;
  planExpiry: string;
  totalBranches: number;
  totalOrders: number;
  totalRevenue: number;
  branches: Branch[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'Restaurant' | 'Branch';
  priceMonthly: number;
  priceYearly: number;
  description: string;
  isPopular?: boolean;
  maxBranches?: number;
  maxStaff?: number;
  features: string[];
  status: 'Active' | 'Archived';
}

export interface TransactionLedger {
  id: string;
  invoiceId: string;
  restaurantName: string;
  restaurantId: string;
  branchName?: string;
  planName: string;
  amount: number;
  paymentMethod: 'Credit Card' | 'Bank Transfer' | 'Stripe' | 'PayPal';
  date: string;
  status: 'Paid' | 'Pending' | 'Failed';
}

export interface RevenueMetric {
  month: string;
  revenue: number;
  subscriptionRevenue: number;
  platformFees: number;
  payouts: number;
}
