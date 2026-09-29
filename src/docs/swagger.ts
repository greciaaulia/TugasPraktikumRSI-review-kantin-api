import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: { title: 'Review Kantin API', version: '1.0.0' },
  servers: [{ url: 'http://localhost:3000' }],
  definitions: {
    StallInput: {
      type: 'object',
      required: ['ownerId', 'name'],
      properties: {
        ownerId: { type: 'integer', example: 2 },
        name: { type: 'string', example: 'Warung Baru' },
        category: { type: 'string', example: 'Nasi' },
        location: { type: 'string', example: 'Kantin FK' },
        description: { type: 'string' },
      },
    },
    UserInput: {
      type: 'object',
      required: ['name', 'email', 'password', 'role'],
      properties: {
        name: { type: 'string', example: 'Nama User' },
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'rahasia' },
        role: { type: 'string', enum: ['admin', 'owner', 'customer'] },
      },
    },
    MenuItemInput: {
      type: 'object',
      required: ['stallId', 'name', 'price', 'isAvailable'],
      properties: {
        stallId: { type: 'integer', example: 1 },
        name: { type: 'string', example: 'Nasi Goreng' },
        price: { type: 'integer', example: 15000 },
        isAvailable: { type: 'boolean', example: true },
      },
    },
    ReviewInput: {
      type: 'object',
      required: ['stallId', 'userId', 'rating'],
      properties: {
        stallId: { type: 'integer', example: 1 },
        userId: { type: 'integer', example: 1 },
        rating: { type: 'integer', example: 5 },
        comment: { type: 'string', example: 'Enak' },
      },
    },
    LikeInput: {
      type: 'object',
      required: ['reviewId', 'userId'],
      properties: {
        reviewId: { type: 'integer', example: 1 },
        userId: { type: 'integer', example: 1 },
      },
    },
    AuditInput: {
      type: 'object',
      required: ['userId', 'action', 'targetTable', 'targetId'],
      properties: {
        userId: { type: 'integer', example: 1 },
        action: { type: 'string', example: 'DELETE' },
        targetTable: { type: 'string', example: 'REVIEWS' },
        targetId: { type: 'integer', example: 1 },
        metadata: { type: 'string', example: '{}' },
      },
    },
  },
};

const outputFile = './src/docs/swagger-output.json';
const endpointsFiles = ['./src/index.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
