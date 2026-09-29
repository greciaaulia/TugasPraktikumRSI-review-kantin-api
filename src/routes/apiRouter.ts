import { Router } from 'express';
import { ApiController } from '../controllers/apiController.ts';

const apiRouter = Router();
const apiController = new ApiController();

apiRouter.get('/users', (req, res) => {
	// #swagger.responses[200] = { description: 'Daftar user tanpa password' }
	return apiController.getUsers(req, res);
});
apiRouter.post('/users', (req, res) => {
	// #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/UserInput' } }
	// #swagger.responses[201] = { description: 'User dibuat' }
	return apiController.createUser(req, res);
});

apiRouter.get('/menu-items', (req, res) => {
	// #swagger.responses[200] = { description: 'Daftar menu beserta data warung' }
	return apiController.getMenuItems(req, res);
});
apiRouter.post('/menu-items', (req, res) => {
	// #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/MenuItemInput' } }
	// #swagger.responses[201] = { description: 'Menu dibuat' }
	return apiController.createMenuItem(req, res);
});
apiRouter.get('/menu-items/:id', (req, res) => {
	// #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
	// #swagger.responses[200] = { description: 'Detail menu beserta data warung' }
	return apiController.getMenuItem(req, res);
});
apiRouter.put('/menu-items/:id', (req, res) => {
	// #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
	// #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/MenuItemInput' } }
	return apiController.updateMenuItem(req, res);
});
apiRouter.delete('/menu-items/:id', (req, res) => {
	// #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
	return apiController.deleteMenuItem(req, res);
});

apiRouter.get('/reviews', (req, res) => {
	// #swagger.responses[200] = { description: 'Daftar review beserta nama user' }
	return apiController.getReviews(req, res);
});
apiRouter.post('/reviews', (req, res) => {
	// #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/ReviewInput' } }
	return apiController.createReview(req, res);
});
apiRouter.delete('/reviews/:id', (req, res) => {
	// #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
	return apiController.deleteReview(req, res);
});

apiRouter.post('/likes', (req, res) => {
	// #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/LikeInput' } }
	return apiController.createLike(req, res);
});
apiRouter.delete('/likes/:reviewId/:userId', (req, res) => {
	// #swagger.parameters['reviewId'] = { in: 'path', required: true, type: 'integer' }
	// #swagger.parameters['userId'] = { in: 'path', required: true, type: 'integer' }
	return apiController.deleteLike(req, res);
});

apiRouter.get('/flags', (req, res) => {
	// #swagger.responses[200] = { description: 'Daftar flag beserta review dan pelapor' }
	return apiController.getFlags(req, res);
});
apiRouter.put('/flags/:id', (req, res) => {
	// #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
	// #swagger.parameters['body'] = { in: 'body', required: true, schema: { status: 'resolved' } }
	return apiController.updateFlag(req, res);
});

apiRouter.get('/audit', (req, res) => {
	// #swagger.responses[200] = { description: 'Daftar audit log' }
	return apiController.getAuditLogs(req, res);
});
apiRouter.post('/audit', (req, res) => {
	// #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/AuditInput' } }
	return apiController.createAuditLog(req, res);
});

export { apiRouter };