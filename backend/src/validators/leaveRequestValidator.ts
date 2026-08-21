import { z } from 'zod';

export const createLeaveSchema = z.object({
  type: z.enum(['cp', 'rtt', 'unpaid', 'sick', 'training']),
  startDate: z.coerce.date({ message: 'Date de debut invalide' }),
  endDate: z.coerce.date({ message: 'Date de fin invalide' }),
  startPeriod: z.enum(['morning', 'afternoon']).optional().default('morning'),
  endPeriod: z.enum(['morning', 'afternoon']).optional().default('afternoon'),
  comment: z.string().optional(),
});