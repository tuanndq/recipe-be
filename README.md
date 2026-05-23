# Cooking Recipe API

A REST API for searching and browsing cooking recipes by ingredients and cuisine. Built with **NestJS**, **TypeORM**, and **MySQL**, with interactive **Swagger** docs.

## Features

- **Public endpoints**: list/search recipes, recipe detail, cuisines, ingredients
- **Multi-filter search**: text query, multiple cuisines, multiple ingredients (any/all match), pagination, sort
- **Admin CRUD**: create, update, delete recipes (JWT protected)
- **Image upload**: admin uploads images served from `/uploads`
- **Swagger UI**: `http://localhost:3000/docs`
- **Redis cache**: GET endpoints cached; invalidated on recipe admin writes

## Quick start (Docker)

```bash
cp .env.example .env   # DB_HOST=mysql, REDIS_HOST=redis — ready for Compose
docker compose up --build
```

All services read variables from `.env` (`env_file`). MySQL credentials use `DB_*` and `MYSQL_ROOT_PASSWORD` from that file.

On startup, the `api` container runs **migrations** then **seed** (`docker-entrypoint.sh`) before starting the server.

Then open:

- API: http://localhost:3000
- Swagger: http://localhost:3000/docs

Default admin credentials (from `.env.example`):

- Username: `admin`
- Password: `admin123`

### Login and authorize in Swagger

1. `POST /auth/login` with `{ "username": "admin", "password": "admin123" }`
2. Copy `accessToken`
3. Click **Authorize** → paste `Bearer <token>`

## Local development

### Prerequisites

- Node.js 20+
- MySQL 8 (or use Docker for MySQL only)

```bash
cp .env.example .env
# Local app (not the api container): point at host-mapped ports
# DB_HOST=localhost  REDIS_HOST=localhost  NODE_ENV=development

docker compose up mysql redis -d
npm install
npm run start:dev

# In another terminal, seed data (run migrations first: npm run migration:run)
npm run seed
```

## Tests

```bash
npm test          # unit tests (*.spec.ts under src/)
npm run test:e2e  # HTTP e2e (mocked services, no MySQL/Redis)
```

Unit tests cover auth, recipe mapper/validator/service, URL helper, config schema, and ingredient filter strategies. Shared fixtures live in `test/fixtures/`.

## Controllers

Each feature module has two controllers: default (public) and `*-admin.controller.ts` (JWT, prefix `admin/`).

| Module | Public | Admin (`/admin/...`, JWT) |
|--------|--------|---------------------------|
| recipes | `GET /recipes`, `GET /recipes/:id` | `GET/POST/PATCH/DELETE /admin/recipes` |
| cuisines | `GET /cuisines` | `GET /admin/cuisines` |
| ingredients | `GET /ingredients` | `GET /admin/ingredients` |
| uploads | — | `GET/POST /admin/uploads/images` |
| auth | `POST /auth/login` | `GET /admin/auth/me` |

Swagger: `recipes`, `cuisines`, … vs `admin/recipes`, `admin/uploads`, …

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | — | Admin login → JWT |
| GET | `/recipes` | — | List/search recipes |
| GET | `/recipes/:id` | — | Recipe detail |
| GET | `/admin/recipes` | JWT | List recipes (admin) |
| GET | `/admin/recipes/:id` | JWT | Recipe detail (admin) |
| POST | `/admin/recipes` | JWT | Create recipe |
| PATCH | `/admin/recipes/:id` | JWT | Update recipe |
| DELETE | `/admin/recipes/:id` | JWT | Delete recipe |
| GET | `/cuisines` | — | List cuisines |
| GET | `/ingredients` | — | List ingredients (`?q=`) |
| GET | `/admin/uploads/images` | JWT | List uploaded images |
| POST | `/admin/uploads/images` | JWT | Upload image → WebP → `{ url, format: "webp" }` |
| GET | `/admin/auth/me` | JWT | Current admin profile |

### Search query parameters (`GET /recipes`)

| Param | Example | Description |
|-------|---------|-------------|
| `q` | `pasta` | Search title/description |
| `cuisine` | `1,2` | Filter by cuisine IDs |
| `ingredient` | `3,5` | Filter by ingredient IDs |
| `ingredientMatch` | `any` \| `all` | Match any or all ingredients |
| `sort` | `newest` \| `oldest` \| `title_asc` \| `title_desc` | Sort order |
| `page` | `1` | Page number |
| `limit` | `10` | Items per page (max 100) |

Recipe `imageUrl` values in responses are absolute URLs (e.g. `http://localhost:3000/uploads/abc.webp` or S3 URL). Set `APP_URL` for local storage, or `S3_PUBLIC_BASE_URL` for S3.

## Image upload (WebP + Local / S3)

Flow: `POST /admin/uploads/images` → multer (memory) → **sharp** convert WebP → **LocalFileStorage** or **S3FileStorage**.

| Variable | Default | Description |
|----------|---------|-------------|
| `STORAGE_DRIVER` | `local` | `local` or `s3` |
| `IMAGE_CONVERT_TO_WEBP` | `true` | Convert uploads to WebP |
| `WEBP_QUALITY` | `80` | WebP quality (1–100) |
| `AWS_REGION` | — | Required when `STORAGE_DRIVER=s3` |
| `S3_BUCKET` | — | S3 bucket name |
| `S3_PREFIX` | `recipes` | Object key prefix |
| `S3_PUBLIC_BASE_URL` | auto | Public CDN/base URL (optional) |
| `AWS_ACCESS_KEY_ID` | — | Optional (uses IAM role if omitted) |
| `AWS_SECRET_ACCESS_KEY` | — | Optional |

**Local example** (default):

```env
STORAGE_DRIVER=local
IMAGE_CONVERT_TO_WEBP=true
```

**S3 example**:

```env
STORAGE_DRIVER=s3
AWS_REGION=ap-southeast-1
S3_BUCKET=my-recipe-images
S3_PREFIX=recipes
S3_PUBLIC_BASE_URL=https://cdn.example.com
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

## Project structure

```
src/
├── auth/
├── recipes/
│   ├── builders/       # RecipeQueryBuilder
│   ├── cache/          # recipe-cache.keys
│   ├── interfaces/     # IRecipeRepository
│   ├── mappers/        # RecipeMapper
│   ├── repositories/   # TypeOrmRecipeRepository
│   ├── strategies/     # Ingredient filter (any/all)
│   ├── validators/     # RecipeValidator
│   └── recipes.service.ts  # orchestration only
├── cuisines/
│   └── cache/          # cuisine-cache.keys
├── ingredients/
│   └── cache/          # ingredient-cache.keys
├── uploads/
│   ├── interfaces/     # FileStorage
│   ├── storage/        # LocalFileStorage, S3FileStorage
│   ├── services/       # ImageConverterService (sharp → WebP)
│   ├── multer/         # memory upload
│   └── interceptors/   # ImageUploadInterceptor
├── cache/
│   ├── interfaces/     # CacheInvalidator
│   └── redis-cache.invalidator.ts
├── database/
│   ├── migrations/     # TypeORM migrations (*.ts → compiled to dist/)
│   ├── run-migrations.ts
│   └── seeds/
└── common/
```

## Rate limiting (Redis)

Chỉ đăng ký **một** bộ throttle `default` global (`THROTTLE_LIMIT` / `THROTTLE_TTL_MS`). Route đặc biệt ghi đè bằng `@Throttle({ default: { limit, ttl } })` trong `throttle.constants.ts`.

| Route | Limit | Ghi chú |
|-------|-------|---------|
| Hầu hết API (GET `/recipes`, …) | 100 / 60s | env `THROTTLE_LIMIT` |
| `POST /auth/login` | 10 / 60s | `LOGIN_THROTTLE` |
| `POST /admin/uploads/images` | 20 / 60s | `UPLOAD_THROTTLE` |

Bỏ qua: `/docs`, `/uploads` (static). `THROTTLE_ENABLED=false` để tắt. Vượt limit → **429**.

## Cache (Redis)

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `CACHE_TTL_SECONDS` | `300` | TTL for cached GET responses (5 min) |
| `CACHE_ENABLED` | `true` | Set `false` to bypass cache |
| `CACHE_KEY_PREFIX` | `recipe-api` | Key namespace prefix |

Cached routes: `GET /recipes`, `GET /recipes/:id`, `GET /cuisines`, `GET /ingredients`.  
Cache is cleared automatically when admin creates/updates/deletes a recipe.

## Tech stack

- NestJS 10 + TypeScript
- TypeORM + MySQL 8
- Redis + `@nestjs/cache-manager`
- Passport JWT + bcrypt
- Swagger / OpenAPI 3
- Docker Compose

## License

MIT
