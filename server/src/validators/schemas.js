import { z } from 'zod';
import { ROLES } from '../config/env.js';

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const nameSchema = z
  .string()
  .trim()
  .min(20, 'Name must be at least 20 characters')
  .max(60, 'Name must not exceed 60 characters');

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(255, 'Email must not exceed 255 characters')
  .regex(EMAIL_RULE, 'Enter a valid email address');

export const addressSchema = z
  .string()
  .trim()
  .min(1, 'Address is required')
  .max(400, 'Address must not exceed 400 characters');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be 8 to 16 characters')
  .max(16, 'Password must be 8 to 16 characters')
  .regex(PASSWORD_RULE, 'Password must include at least one uppercase letter and one special character');

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ['newPassword'],
    message: 'New password must be different from the current password',
  });

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
  role: z.enum([ROLES.ADMIN, ROLES.USER, ROLES.OWNER]),
});

export const createStoreSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  ownerId: z
    .union([z.coerce.number().int().positive(), z.literal(''), z.null()])
    .optional()
    .transform((value) => (value === '' || value === undefined ? null : value)),
});

export const ratingSchema = z.object({
  score: z.coerce
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid identifier'),
});

export const storeIdParamSchema = z.object({
  storeId: z.coerce.number().int().positive('Invalid identifier'),
});
