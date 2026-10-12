import { GraphQLError } from "graphql";

export function badInput(error: unknown): never {
  const message = typeof error === "string" ? error : error instanceof Error ? error.message : "Dados inválidos";
  throw new GraphQLError(message, { extensions: { code: "BAD_USER_INPUT" } });
}

export function unauthenticated(message = "Não autenticado"): never {
  throw new GraphQLError(message, { extensions: { code: "UNAUTHENTICATED" } });
}
