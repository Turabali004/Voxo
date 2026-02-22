import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {prisma} from "../../lib/prisma.js"

import type { Request, Response } from "express";

export const signup = async (req: Request, res: Response) => {
  const { name, username, email, password } = req.body;

  // 1. Check existing user
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Create user
  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      passwordHash: hashedPassword,
    },
  });

  // 4. Generate token
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  res.status(201).json({
    token,
    user: {
      id: user.id,
      username: user.username,
    },
  });
};




export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
    },
  });
};