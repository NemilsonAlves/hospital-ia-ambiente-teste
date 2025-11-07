import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  organizationId: string
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12)
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

export const signToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

// Middleware para verificar permissões baseadas em role
export const hasPermission = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole)
}

// Hierarquia de permissões (roles com mais privilégios)
export const roleHierarchy: Record<UserRole, number> = {
  ADMIN: 9,
  COORDINATOR: 8,
  DOCTOR: 7,
  SPECIALIST_NURSE: 6,
  PHYSIOTHERAPIST: 5,
  PHARMACIST: 4,
  TECHNICIAN: 3,
  VISITOR: 2,
  PATIENT: 1,
}

export const hasMinimumRole = (userRole: UserRole, minimumRole: UserRole): boolean => {
  return roleHierarchy[userRole] >= roleHierarchy[minimumRole]
}