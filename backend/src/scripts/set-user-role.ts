import mongoose from "mongoose";

import { env } from "../config/env.js";
import { USER_ROLES, User, type UserRole } from "../models/user.js";

const email = process.argv[2]?.trim().toLowerCase();
const role = process.argv[3]?.toUpperCase() as UserRole | undefined;

if (!email || !role || !USER_ROLES.includes(role)) {
  console.error("Uso: npm run user:role -- usuario@exemplo.com FREE|VIP|ZEUS");
  process.exit(1);
}

try {
  await mongoose.connect(env.MONGODB_URI);
  const user = await User.findOneAndUpdate({ email }, { role }, { new: true }).select("+email");

  if (!user) {
    console.error(`Usuário não encontrado: ${email}`);
    process.exitCode = 1;
  } else {
    console.log(`Papel de ${user.email} atualizado para ${user.role}.`);
  }
} finally {
  await mongoose.disconnect();
}
