import { z } from 'zod';

export const createLeaveSchema = z.object({
  type: z.enum(['cp', 'rtt', 'unpaid', 'sick', 'training']),
  startDate: z.coerce.date({ message: 'Date de debut invalide' }),
  endDate: z.coerce.date({ message: 'Date de fin invalide' }),
  startPeriod: z.enum(['morning', 'afternoon']).optional().default('morning'),
  endPeriod: z.enum(['morning', 'afternoon']).optional().default('afternoon'),
  comment: z.string().optional(),
});

export const refuseSchema = z.object({
    managerComment: z
        .string({ required_error: 'Le commentaire est obligatoire pour un refus' })
        .min(1, 'Le commentaire est obligatoire pour un refus'),
});

export const overrideStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'refused', 'cancelled']),
  managerComment: z.string().optional(),
});