import { z } from 'zod';
const roleEnum = z.enum(['employee', 'manager', 'rh']);

export const createUserSchema = z.object({
    firstName: z.string().min(1, 'Prénom requis'),
    lastName: z.string().min(1, 'Nom requis'),
    email: z.string().email('Email invalide'),
    role: roleEnum,
    manager: z.string().optional(),
    team: z.string().optional(),
});

export const updateUserSchema  = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email('Email invalide').optional(),
    role: roleEnum.optional(),
     manager: z.string().nullable().optional(),
    team: z.string().nullable().optional(),
});
export const updateStatusSchema = z.object({
    isActive: z.boolean(),
});