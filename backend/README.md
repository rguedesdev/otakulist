# Backend OtakuList

API em Fastify + Mercurius (GraphQL), MongoDB e TypeScript.

## Configuração

```bash
cd ..
docker compose up -d mongodb
cd backend
cp .env.example .env
# substitua JWT_SECRET por uma chave aleatória longa
npm install
npm run dev
```

O Compose usa MongoDB 7 com autenticação, healthcheck, volume persistente e a
porta `27017` vinculada somente a `127.0.0.1`. As credenciais incluídas são
exclusivas para desenvolvimento local e devem ser diferentes em produção.

O GraphQL fica em `http://localhost:5000/graphql`, o GraphiQL em
`http://localhost:5000/graphiql` no ambiente de desenvolvimento e a verificação
de saúde em `GET /health`.

## Autenticação

- O cadastro público sempre cria uma conta `FREE`. `role` não faz parte de
  `RegisterInput`, evitando promoção de privilégio pelo cliente.
- O access token JWT dura 15 minutos por padrão e deve ser enviado como
  `Authorization: Bearer <token>`.
- O refresh token JWT é rotacionado, persistido no banco somente como hash e
  enviado em cookie `HttpOnly`. No frontend, use `credentials: "include"`.
- `VIP` está preparado para a futura assinatura. `ZEUS` representa operadores
  administrativos, mas a segurança depende das verificações de autorização —
  não do nome incomum do papel.

Para alterar um papel fora da API pública:

```bash
npm run user:role -- usuario@exemplo.com VIP
npm run user:role -- operador@exemplo.com ZEUS
```

Exemplo de cadastro:

```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    accessToken
    user { id username displayName email role avatarUrl }
  }
}
```

```json
{
  "input": {
    "username": "usuario_01",
    "displayName": "Usuário",
    "email": "usuario@example.com",
    "password": "uma-senha-segura"
  }
}
```

Também estão disponíveis `login`, `refreshSession`, `logout` e a query `me`.

## Avatar

O arquivo binário usa uma rota HTTP dedicada em vez de passar pelo GraphQL:

```bash
curl -X POST http://localhost:5000/uploads/avatar \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -F "file=@avatar.png"
```

A rota aceita um arquivo JPEG, PNG ou WebP de até 5 MiB, verifica o tipo real,
limita a quantidade de pixels, remove metadados ao reprocessar e gera WebP com
nome aleatório. Os metadados do perfil continuam disponíveis no GraphQL. O
armazenamento local em `src/uploads/` pode ser substituído futuramente por S3 sem
alterar o contrato da mutation de autenticação.
