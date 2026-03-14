import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import db from '../config/database';
import { User, UserRole, JwtPayload } from '../models/types';
import logger from '../utils/logger';

export class AuthService {
  async login(mobileOrEmail: string, password: string): Promise<{
    user: Omit<User, 'password'>;
    token: string;
  }> {
    // Find user by mobile or email
    const user = await db('users')
      .where(function () {
        this.where('mobile_no', mobileOrEmail).orWhere('email', mobileOrEmail);
      })
      .where('is_active', true)
      .first();

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    if (!user.is_verified) {
      throw new Error('Account not verified. Please contact admin.');
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT secret not configured');
    }

    const payload: JwtPayload = {
      userId: user.id,
      role: user.role as UserRole,
      email: user.email,
      mobile_no: user.mobile_no,
    };

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: expiresIn,
    } as SignOptions);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async register(userData: {
    mobile_no: string;
    email?: string;
    password: string;
    role: UserRole;
    first_name?: string;
    last_name?: string;
  }): Promise<Omit<User, 'password'>> {
    // Check if user already exists
    const existingUser = await db('users')
      .where('mobile_no', userData.mobile_no)
      .orWhere(function () {
        if (userData.email) {
          this.where('email', userData.email);
        }
      })
      .first();

    if (existingUser) {
      throw new Error('User with this mobile number or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Insert user
    const [user] = await db('users')
      .insert({
        ...userData,
        password: hashedPassword,
        is_active: true,
        is_verified: userData.role === UserRole.ADMIN ? true : false, // Admin auto-verified
      })
      .returning('*');

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getCurrentUser(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await db('users').where('id', userId).first();
    if (!user) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export default new AuthService();

