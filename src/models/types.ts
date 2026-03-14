export enum UserRole {
  ADMIN = 'admin',
  DRIVER = 'driver',
  VENDOR = 'vendor',
}

export enum CollectionTime {
  MORNING = 'morning',
  EVENING = 'evening',
}

export enum MilkType {
  COW = 'cow',
  BUFFALO = 'buffalo',
  MIX_MILK = 'mix_milk',
}

export enum CollectionStatus {
  COLLECTED = 'collected',
  DELIVERED = 'delivered',
  PROCESSED = 'processed',
  REJECTED = 'rejected',
}

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum PaymentType {
  MONTHLY_MILK = 'monthly_milk',
  DRIVER_SALARY = 'driver_salary',
  ADVANCE = 'advance',
  ADJUSTMENT = 'adjustment',
}

export interface User {
  id: string;
  mobile_no: string;
  email?: string;
  password: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  aadhar_card?: string;
  pan_card?: string;
  is_active: boolean;
  is_verified: boolean;
  date_of_birth?: Date;
  profile_image?: any;
  address?: any;
  created_at: Date;
  modified_at: Date;
  created_by?: string;
  modified_by?: string;
}

export interface DairyCenter {
  id: string;
  user_id: string;
  dairy_name: string;
  address?: any;
  contact_mobile?: string;
  is_active: boolean;
  center_image?: any;
  qr_code?: string;
  created_at: Date;
  modified_at: Date;
  created_by?: string;
  modified_by?: string;
}

export interface Driver {
  id: string;
  driver_id: string;
  center_id?: string;
  aadhar_card?: any;
  pan_card?: any;
  license_number?: string;
  license_expiry?: Date;
  vehicle_number?: string;
  vehicle_type?: string;
  salary_per_month?: number;
  joining_date?: Date;
  is_on_duty: boolean;
  emergency_contact_name?: string;
  emergency_contact_mobile?: string;
  additional_info?: any;
  created_at: Date;
  modified_at: Date;
  created_by?: string;
  modified_by?: string;
}

export interface DriverLocation {
  id: string;
  driver_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  address?: string;
  recorded_at: Date;
}

export interface MilkCollection {
  id: string;
  vendor_id: string;
  driver_id: string;
  center_id: string;
  collection_code: string;
  collection_date: Date;
  collection_time: CollectionTime;
  milk_type: MilkType;
  milk_weight: number;
  base_value?: number;
  fat_percentage: number;
  snf_percentage: number;
  rate_per_liter: number;
  total_amount: number;
  can_number?: string;
  can_weight_kg?: number;
  quality_notes?: string;
  status: CollectionStatus;
  is_synced: boolean;
  collected_at: Date;
  created_at: Date;
  modified_at: Date;
  created_by?: string;
  modified_by?: string;
}

export interface MilkPrice {
  id: string;
  price_date: Date;
  base_price: number;
  fat_rate: number;
  snf_rate: number;
  milk_type: MilkType;
  is_active: boolean;
  notes?: string;
  created_at: Date;
  modified_at: Date;
  created_by?: string;
  modified_by?: string;
}

export interface Payment {
  id: string;
  vendor_id: string;
  payment_code: string;
  payment_type: PaymentType;
  payment_month?: Date;
  total_amount: number;
  advance_amount: number;
  previous_pending: number;
  deductions: number;
  final_amount: number;
  status: PaymentStatus;
  payment_notes?: string;
  transaction_id?: string;
  payment_method?: string;
  paid_at?: Date;
  created_at: Date;
  modified_at: Date;
  created_by?: string;
  modified_by?: string;
}

export interface Notification {
  id: string;
  user_id?: string;
  user_role: 'admin' | 'driver' | 'vendor' | 'all';
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  metadata?: any;
  read_at?: Date;
  created_at: Date;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email?: string;
  mobile_no: string;
}

