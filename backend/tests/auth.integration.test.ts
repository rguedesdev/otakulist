import mongoose from "mongoose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";

const databaseUrl = process.env.TEST_MONGODB_URI;
const integration = describe.skipIf(!databaseUrl);
let app: FastifyInstance;
let accessToken: string;
let refreshCookie: string;

integration("autenticação GraphQL", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "integration-test-secret-with-at-least-32-characters";
    process.env.MONGODB_URI = databaseUrl;
    process.env.CORS_ORIGIN = "http://localhost:3000";

    const { buildApp } = await import("../src/app.js");
    await mongoose.connect(databaseUrl!);
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await app.close();
    await mongoose.disconnect();
  });

  it("cadastra, autentica com bearer e permite renovações concorrentes", async () => {
    const registration = await app.inject({
      method: "POST",
      url: "/graphql",
      headers: { origin: "http://localhost:3000" },
      payload: {
        query: `
          mutation Register($input: RegisterInput!) {
            register(input: $input) {
              accessToken
              user { username email role }
            }
          }
        `,
        variables: {
          input: {
            username: "integration_user",
            displayName: "Integration User",
            email: "integration@example.com",
            password: "senha-segura",
          },
        },
      },
    });

    expect(registration.statusCode).toBe(200);
    expect(registration.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    const registrationBody = registration.json();
    expect(registrationBody.errors).toBeUndefined();
    expect(registrationBody.data.register.user.role).toBe("FREE");
    accessToken = registrationBody.data.register.accessToken;
    refreshCookie = registration.headers["set-cookie"]!.split(";")[0]!;

    const me = await app.inject({
      method: "POST",
      url: "/graphql",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { query: "query Me { me { username email role } }" },
    });
    expect(me.json().data.me.username).toBe("integration_user");

    const publicProfile = await app.inject({
      method: "POST",
      url: "/graphql",
      payload: {
        query: "query Profile($username: String!) { user(username: $username) { username displayName role createdAt } }",
        variables: { username: "integration_user" },
      },
    });
    expect(publicProfile.json().data.user).toMatchObject({
      username: "integration_user",
      displayName: "Integration User",
      role: "FREE",
    });

    const refresh = await app.inject({
      method: "POST",
      url: "/graphql",
      headers: { cookie: refreshCookie },
      payload: { query: "mutation Refresh { refreshSession { accessToken user { username } } }" },
    });
    expect(refresh.json().errors).toBeUndefined();
    expect(refresh.json().data.refreshSession.user.username).toBe("integration_user");

    const concurrentRefresh = await app.inject({
      method: "POST",
      url: "/graphql",
      headers: { cookie: refreshCookie },
      payload: { query: "mutation Refresh { refreshSession { accessToken user { username } } }" },
    });
    expect(concurrentRefresh.json().errors).toBeUndefined();
    expect(concurrentRefresh.json().data.refreshSession.user.username).toBe("integration_user");
  });
});
