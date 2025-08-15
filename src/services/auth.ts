import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
import { User } from "prisma/prisma-client";

export async function signup(email: string, password: string, name: string): Promise<string> {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name },
  });
  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
}

export async function login(email: string, password: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid email or password');
  }
  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
}