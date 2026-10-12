export const authTypeDefs = /* GraphQL */ `enum UserRole {
    FREE
    VIP
    ZEUS
  }

type User {
    id: ID!
    username: String!
    displayName: String!
    bio: String
    email: String!
    role: UserRole!
    avatarUrl: String
    showAdultContent: Boolean!
    hideAdultContentFromVisitors: Boolean!
    createdAt: String!
    updatedAt: String!
  }

input RegisterInput {
    username: String!
    displayName: String!
    email: String!
    password: String!
  }

input LoginInput {
    email: String!
    password: String!
  }

input UpdateProfileInput {
    username: String!
    displayName: String!
    bio: String
    email: String!
    showAdultContent: Boolean!
    hideAdultContentFromVisitors: Boolean!
  }

type AuthPayload {
    accessToken: String!
    user: User!
  }

type PublicUser {
    id: ID!
    username: String!
    displayName: String!
    bio: String
    role: UserRole!
    avatarUrl: String
    createdAt: String!
  }

type Query {
    me: User
    user(username: String!): PublicUser
  }

type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    refreshSession: AuthPayload!
    logout: Boolean!
    updateMyProfile(input: UpdateProfileInput!): AuthPayload!
  }`;
