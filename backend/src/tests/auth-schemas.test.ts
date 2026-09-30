import { describe, expect, it } from "vitest";

import { registerSchema, updateProfileSchema } from "../src/services/auth/schemas.js";

describe("registerSchema", () => {
  it("normaliza e-mail e username", () => {
    const result = registerSchema.parse({
      input: {
        username: "  USER_01 ",
        displayName: "Usuário",
        email: " USER@Example.com ",
        password: "senha-segura",
      },
    });

    expect(result.input.username).toBe("user_01");
    expect(result.input.email).toBe("user@example.com");
  });

  it("recusa senhas maiores que o limite do bcrypt em bytes", () => {
    const result = registerSchema.safeParse({
      input: {
        username: "user_01",
        displayName: "Usuário",
        email: "user@example.com",
        password: "界".repeat(25),
      },
    });

    expect(result.success).toBe(false);
  });

  it("não aceita role no input estrito da aplicação", () => {
    const result = registerSchema.parse({
      input: {
        username: "user_01",
        displayName: "Usuário",
        email: "user@example.com",
        password: "senha-segura",
        role: "ZEUS",
        showAdultContent: true,
        hideAdultContentFromVisitors: true,
      },
    });

    expect(result.input).not.toHaveProperty("role");
    expect(result.input).not.toHaveProperty("showAdultContent");
    expect(result.input).not.toHaveProperty("hideAdultContentFromVisitors");
  });
});

describe("updateProfileSchema", () => {
  it("normaliza os identificadores e converte biografia vazia em null", () => {
    const result = updateProfileSchema.parse({
      input: {
        username: "  USER_01 ",
        displayName: "  Usuário  ",
        bio: "   ",
        email: " USER@Example.com ",
      },
    });

    expect(result.input).toEqual({
      username: "user_01",
      displayName: "Usuário",
      bio: null,
      email: "user@example.com",
      showAdultContent: false,
      hideAdultContentFromVisitors: false,
    });
  });

  it("aceita a ativação explícita de conteúdo adulto", () => {
    const result = updateProfileSchema.parse({
      input: {
        username: "user_01",
        displayName: "Usuário",
        bio: "",
        email: "user@example.com",
        showAdultContent: true,
      },
    });

    expect(result.input.showAdultContent).toBe(true);
  });

  it("aceita ocultar conteúdo adulto dos visitantes como preferência independente", () => {
    const result = updateProfileSchema.parse({
      input: {
        username: "user_01",
        displayName: "Usuário",
        bio: "",
        email: "user@example.com",
        showAdultContent: false,
        hideAdultContentFromVisitors: true,
      },
    });

    expect(result.input.showAdultContent).toBe(false);
    expect(result.input.hideAdultContentFromVisitors).toBe(true);
  });

  it("limita a biografia a 300 caracteres", () => {
    const result = updateProfileSchema.safeParse({
      input: {
        username: "user_01",
        displayName: "Usuário",
        bio: "a".repeat(301),
        email: "user@example.com",
      },
    });

    expect(result.success).toBe(false);
  });
});
