"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { graphqlRequest, refreshAuthSession, subscribeAuthSession } from "./api";
import type { AuthPayload, AuthUser } from "./types";

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput extends LoginInput {
  username: string;
  displayName: string;
}

interface UpdateProfileInput {
  username: string;
  displayName: string;
  bio: string;
  email: string;
  showAdultContent: boolean;
  hideAdultContentFromVisitors: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  login(input: LoginInput): Promise<AuthUser>;
  register(input: RegisterInput): Promise<AuthUser>;
  updateProfile(input: UpdateProfileInput): Promise<AuthUser>;
  refreshUser(): Promise<AuthUser | null>;
  logout(): Promise<void>;
}

const USER_FIELDS = `
  id username displayName bio email role avatarUrl showAdultContent hideAdultContentFromVisitors createdAt updatedAt
`;

const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) { accessToken user { ${USER_FIELDS} } }
  }
`;

const REGISTER_MUTATION = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) { accessToken user { ${USER_FIELDS} } }
  }
`;

const LOGOUT_MUTATION = `mutation Logout { logout }`;

const UPDATE_PROFILE_MUTATION = `
  mutation UpdateMyProfile($input: UpdateProfileInput!) {
    updateMyProfile(input: $input) { accessToken user { ${USER_FIELDS} } }
  }
`;

const AuthContext = createContext<AuthContextValue | null>(null);
let bootstrapRequest: Promise<AuthPayload | null> | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeAuthSession((payload) => {
      bootstrapRequest = Promise.resolve(payload);
      if (active) setSession(payload);
    });
    bootstrapRequest ??= refreshAuthSession();

    void bootstrapRequest.then((payload) => {
      if (active) {
        setSession(payload);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    document.cookie = `otakulist-adult-content=${session?.user.showAdultContent ? "1" : "0"}; Path=/; SameSite=Lax`;
  }, [loading, session?.user.showAdultContent]);

  const login = useCallback(async (input: LoginInput) => {
    const data = await graphqlRequest<{ login: AuthPayload }>(LOGIN_MUTATION, { input });
    bootstrapRequest = Promise.resolve(data.login);
    setSession(data.login);
    return data.login.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const data = await graphqlRequest<{ register: AuthPayload }>(REGISTER_MUTATION, { input });
    bootstrapRequest = Promise.resolve(data.register);
    setSession(data.register);
    return data.register.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await graphqlRequest<{ logout: boolean }>(LOGOUT_MUTATION);
    } finally {
      bootstrapRequest = Promise.resolve(null);
      setSession(null);
    }
  }, []);

  const updateProfile = useCallback(async (input: UpdateProfileInput) => {
    const data = await graphqlRequest<{ updateMyProfile: AuthPayload }>(
      UPDATE_PROFILE_MUTATION,
      { input },
      session?.accessToken,
    );
    bootstrapRequest = Promise.resolve(data.updateMyProfile);
    setSession(data.updateMyProfile);
    return data.updateMyProfile.user;
  }, [session?.accessToken]);

  const refreshUser = useCallback(async () => {
    const refreshed = await refreshAuthSession();
    return refreshed?.user ?? null;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      loading,
      login,
      register,
      updateProfile,
      refreshUser,
      logout,
    }),
    [session, loading, login, register, updateProfile, refreshUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return context;
}
