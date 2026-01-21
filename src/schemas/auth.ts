import z from 'zod';

export const jwtUserPayloadSchema = z.object({
  email: z.email(),
  id: z.number(),
  name: z.string(),
  role: z.enum(['admin', 'guest', 'user']),
});

export type JwtUserPayload = z.infer<typeof jwtUserPayloadSchema>;

export const loginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(3),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const loginResponseSchema = z.object({
  token: z.string(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
