import type { FastifyRequest } from "fastify";

declare module "mercurius" {
  interface MercuriusContext {
    request: FastifyRequest;
  }
}
