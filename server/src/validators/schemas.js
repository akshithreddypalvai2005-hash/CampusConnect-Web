const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  studentId: z.string().min(2, 'Student ID must be at least 2 characters'),
  department: z.string().min(2, 'Department is required'),
  yearOfStudy: z.enum(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Faculty/Staff']),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const createItemSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(120),
  description: z.string().min(3, 'Description must be at least 3 characters').max(2000),
  category: z.string().min(1, 'Category is required'),
  reportType: z.enum(['lost', 'found']),
  approximateLocation: z.string().min(2, 'Location is required'),
  eventDate: z.string().optional(),
  custodyStatus: z.enum(['held_by_finder', 'campus_office', 'not_applicable']).optional(),
  identifyingCharacteristics: z.string().max(1000).optional(),
  contactPreference: z.enum(['in_app', 'office_handover', 'email']).optional(),
});

const updateItemSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  description: z.string().min(3).max(2000).optional(),
  category: z.string().optional(),
  approximateLocation: z.string().optional(),
  status: z.enum(['open', 'claimed', 'recovered', 'closed']).optional(),
  custodyStatus: z.enum(['held_by_finder', 'campus_office', 'not_applicable']).optional(),
  identifyingCharacteristics: z.string().optional(),
  contactPreference: z.enum(['in_app', 'office_handover', 'email']).optional(),
});

const claimSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  explanation: z.string().min(5, 'Please provide an explanation of at least 5 characters').max(1500),
  secretIdentifiers: z.string().max(1000).optional(),
  purchaseOrReceiptDetails: z.string().max(1000).optional(),
});

const reviewClaimSchema = z.object({
  status: z.enum(['under_review', 'approved', 'rejected']),
  reviewNotes: z.string().max(1000).optional(),
  confirmHandover: z.boolean().optional(),
});

const reportFlagSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  reason: z.enum(['inappropriate_content', 'spam_or_fake', 'duplicate_post', 'privacy_violation', 'other']),
  description: z.string().max(1000).optional(),
});

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

module.exports = {
  registerSchema,
  loginSchema,
  createItemSchema,
  updateItemSchema,
  claimSchema,
  reviewClaimSchema,
  reportFlagSchema,
  contactSchema,
};
