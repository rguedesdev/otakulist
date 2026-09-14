import type { AuthPayload } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: { code?: string };
  }>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code = "UNKNOWN",
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const REFRESH_SESSION_MUTATION = `
  mutation RefreshSession {
    refreshSession {
      accessToken
      user { id username displayName bio email role avatarUrl createdAt updatedAt }
    }
  }
`;

type SessionListener = (session: AuthPayload | null) => void;
const sessionListeners = new Set<SessionListener>();
let refreshRequest: Promise<AuthPayload | null> | null = null;

export function subscribeAuthSession(listener: SessionListener) {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

function publishAuthSession(session: AuthPayload | null) {
  sessionListeners.forEach((listener) => listener(session));
}

async function graphqlRequestOnce<T>(
  query: string,
  variables?: Record<string, unknown>,
  accessToken?: string | null,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor", "NETWORK_ERROR");
  }

  const result = (await response.json().catch(() => null)) as GraphQLResponse<T> | null;
  if (!response.ok || !result) {
    throw new ApiError("O servidor não conseguiu processar a solicitação", `HTTP_${response.status}`);
  }

  const error = result.errors?.[0];
  if (error) throw new ApiError(error.message, error.extensions?.code);
  if (!result.data) throw new ApiError("Resposta vazia do servidor");

  return result.data;
}

export function refreshAuthSession() {
  refreshRequest ??= graphqlRequestOnce<{ refreshSession: AuthPayload }>(REFRESH_SESSION_MUTATION)
    .then(({ refreshSession }) => {
      publishAuthSession(refreshSession);
      return refreshSession;
    })
    .catch(() => {
      publishAuthSession(null);
      return null;
    })
    .finally(() => {
      refreshRequest = null;
    });
  return refreshRequest;
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  accessToken?: string | null,
): Promise<T> {
  try {
    return await graphqlRequestOnce<T>(query, variables, accessToken);
  } catch (error) {
    if (!(error instanceof ApiError) || error.code !== "UNAUTHENTICATED" || !accessToken) throw error;
    const session = await refreshAuthSession();
    if (!session) throw error;
    return graphqlRequestOnce<T>(query, variables, session.accessToken);
  }
}

export function assetUrl(path: string | null) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith("/uploads/")) return `${API_URL}${path}`;
  return path;
}

async function sendImage(file: File, path: string, accessToken: string) {
  const body = new FormData();
  body.append("file", file);
  return fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body,
    credentials: "include",
  });
}

async function authenticatedImageUpload(file: File, path: string, accessToken: string) {
  let response = await sendImage(file, path, accessToken);
  if (response.status === 401) {
    const session = await refreshAuthSession();
    if (session) response = await sendImage(file, path, session.accessToken);
  }
  return response;
}

export async function uploadAnimeCover(file: File, accessToken: string) {
  const response = await authenticatedImageUpload(file, "/uploads/anime-cover", accessToken);
  const result = await response.json().catch(() => null) as { coverUrl?: string; error?: string } | null;
  if (!response.ok || !result?.coverUrl) {
    throw new ApiError(result?.error ?? "Não foi possível enviar a capa", `HTTP_${response.status}`);
  }
  return result.coverUrl;
}

export async function uploadCatalogImage(file: File, accessToken: string) {
  const response = await authenticatedImageUpload(file, "/uploads/catalog-image", accessToken);
  const result = await response.json().catch(() => null) as { imageUrl?: string; error?: string } | null;
  if (!response.ok || !result?.imageUrl) {
    throw new ApiError(result?.error ?? "Não foi possível enviar a imagem", `HTTP_${response.status}`);
  }
  return result.imageUrl;
}

export async function uploadAvatar(file: File, accessToken: string) {
  const response = await authenticatedImageUpload(file, "/uploads/avatar", accessToken);
  const result = await response.json().catch(() => null) as { avatarUrl?: string; error?: string } | null;
  if (!response.ok || !result?.avatarUrl) {
    throw new ApiError(result?.error ?? "Não foi possível enviar a imagem de perfil", `HTTP_${response.status}`);
  }
  return result.avatarUrl;
}
