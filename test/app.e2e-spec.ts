import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      })
    );

    await app.init();
    await app.listen(3333);

    prisma = app.get<PrismaService>(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('🪪🛂 Auth', () => {
    const dto: AuthDto = {
      email: 'testUser@gmail.com',
      password: '123',
    };

    describe('👋 Signup', () => {
      /* empty email */
      it('should throw an error if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...dto, email: '' })
          .expectStatus(400);
      });

      /* invalid email */
      it('should throw an error if email is invalid', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...dto, email: dto.email.replace('@', '') })
          .expectStatus(400);
      });

      /* empty password */
      it('should throw an error if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...dto, password: '' })
          .expectStatus(400);
      });

      /* no body provided */
      it('should throw an error if no body provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });

      /* success signup */
      it('should signup', () => {
        return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201);
      });
    });

    describe('🔑 Signin', () => {
      /* empty email */
      it('should throw an error if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...dto, email: '' })
          .expectStatus(400);
      });

      /* invalid email */
      it('should throw an error if email is invalid', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...dto, email: dto.email.replace('@', '') })
          .expectStatus(400);
      });

      /* empty password */
      it('should throw an error if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...dto, password: '' })
          .expectStatus(400);
      });

      /* no body provided */
      it('should throw an error if no body provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      /* success signin */
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('👤 User', () => {
    describe('🪪 Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });

    describe('✏️ 👤 Edit user', () => {
      it('should edit current user', () => {
        const dto: EditUserDto = {
          email: 'kek@gmail.com',
          firstName: 'kek',
        };

        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe('📎 Bookmarks', () => {
    /* get empty bookmarks */
    describe('💭🔖 Get empty bookmarks', () => {
      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/api/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    /* create bookmark */
    describe('🆕🔖 Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        url: 'http://google.com',
        title: 'Google',
      };

      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/api/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    /* get all bookmarks */
    describe('🗃️🔖Get bookmarks', () => {
      it('should get all bookmarks', () => {
        return pactum
          .spec()
          .get('/api/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    /* get bookmark by id */
    describe('🆔🔖 Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/api/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('✏️🔖 Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        url: 'https://yahoo.com',
        title: 'Yahoo',
      };

      it('should edit bookmark by id', () => {
        return pactum
          .spec()
          .patch('/api/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200);
      });
    });

    describe('🗑️🔖 Delete bookmark by id', () => {
      it('should delete bookmark by id', () => {
        return pactum
          .spec()
          .delete('/api/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });
    });
  });
});
