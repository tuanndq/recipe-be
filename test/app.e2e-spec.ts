import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { RecipesController } from '../src/recipes/recipes.controller';
import { RecipesService } from '../src/recipes/recipes.service';

describe('App (e2e)', () => {
  let app: INestApplication;

  const authService = {
    login: jest.fn(),
  };

  const recipesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController, RecipesController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: RecipesService, useValue: recipesService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('returns 201 with token payload', async () => {
      authService.login.mockResolvedValue({
        accessToken: 'token',
        tokenType: 'Bearer',
        expiresIn: 86400,
      });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'admin123' })
        .expect(201)
        .expect({
          accessToken: 'token',
          tokenType: 'Bearer',
          expiresIn: 86400,
        });
    });

    it('returns 400 when body is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin' })
        .expect(400);

      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('GET /recipes', () => {
    it('returns paginated recipes', async () => {
      recipesService.findAll.mockResolvedValue({
        data: [{ id: 1, title: 'Pho' }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });

      await request(app.getHttpServer())
        .get('/recipes')
        .expect(200)
        .expect({
          data: [{ id: 1, title: 'Pho' }],
          meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
        });
    });
  });

  describe('GET /recipes/:id', () => {
    it('returns recipe detail', async () => {
      recipesService.findOne.mockResolvedValue({ id: 1, title: 'Pho' });

      await request(app.getHttpServer())
        .get('/recipes/1')
        .expect(200)
        .expect({ id: 1, title: 'Pho' });
    });

    it('returns 400 for non-numeric id', async () => {
      await request(app.getHttpServer()).get('/recipes/abc').expect(400);
    });
  });
});
