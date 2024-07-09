import request from 'supertest';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {DataSource, EntityManager, MongoRepository} from 'typeorm';
import {ENTITIES_PATH} from "../utils/const/db-const";
import {app} from "../main";
import {databaseConnection} from "../database/db";
import {Event} from "../database/entities/Event.entity";
import {User} from "../database/entities/User.entity";
import {Role, UserStatus} from "../utils/enum/user";
import {hashPassword} from "../utils/common/hash-password";

describe('Event API', () => {
    let mongoServer: MongoMemoryServer;
    let entityManager: EntityManager;
    let eventRepository: MongoRepository<Event>;
    let userRepository: MongoRepository<User>;
    let token: string;

    beforeAll(async () => {
        const mongo = await MongoMemoryServer.create();
        const uri = mongo.getUri();

        // Initialize DataSource and connection
        databaseConnection.dataSource = new DataSource({
            type: 'mongodb',
            host: uri,
            entities: [ENTITIES_PATH],
            synchronize: true,
        }) ;

        await databaseConnection.initialize();

        entityManager = databaseConnection.entityManager;
        eventRepository = entityManager.getMongoRepository(Event);
        userRepository = entityManager.getMongoRepository(User)
    });

    afterAll(async () => {
    });

    beforeEach(async () => {
        await eventRepository.deleteMany({});
        await userRepository.deleteMany({});
        const password = 'Mypassword@121'
        const loginUser = await userRepository.save({ username: 'testuser', password: await hashPassword(password), role: Role.User, email: 'test@example.com', status: UserStatus.Active });
        const loginRes: any = await request(app)
            .post('/auth/login')
            .send({ username: loginUser.username, password })
            .expect(200);
        token = loginRes._body.data.token;
    });

    it('Should create a new event', async () => {

        const newEvent = { name: 'Test Event', description: 'Test Description', startDate: '2024-07-10T10:00:00Z', dueDate: '2024-07-11T10:00:00Z' };

        const res : any = await request(app)
            .post('/event/add')
            .set('Authorization', `Bearer ${token}`)
            .send(newEvent)
            .expect(201);

        expect(res._body.data.event).toMatchObject(newEvent);

        const eventFromDB = await eventRepository.findOne({
            where: {
                name: 'Test Event'
            }
        });
        expect(eventFromDB).toBeTruthy();
        expect(eventFromDB!.description).toBe('Test Description');
    });

    it('Should fetch all events', async () => {
        const eventData = [
            { name: 'Event 1', description: 'Description 1' },
            { name: 'Event 2', description: 'Description 2' },
        ];
        await eventRepository.insertMany(eventData);

        const res: any = await request(app)
            .get('/event/list?limit=10&page=1')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(res._body.data.listEvent.length).toBe(eventData.length);
        expect(res._body.data.listEvent[0].name).toBe('Event 1');
        expect(res._body.data.listEvent[1].description).toBe('Description 2');
    });

    it('Should update an existing event', async () => {
        const eventToUpdate = await eventRepository.save({ name: 'Event to Update', description: 'Old Description', startDate: '2024-07-10T10:00:00Z', dueDate: '2024-07-11T10:00:00Z' });

        const updatedEventData = { id: eventToUpdate._id.toString(),...eventToUpdate, description: 'Updated Description' };

        const res: any = await request(app)
            .patch(`/event/update`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedEventData)
            .expect(200);

        expect(res._body.message).toBe('Update event successfully!');

        const updatedEventFromDB = await eventRepository.findOne({
            where: {
                _id: eventToUpdate._id
            }
        });
        expect(updatedEventFromDB!.description).toBe('Updated Description');
    });

    it('Should delete an existing event', async () => {
        const eventToDelete = await eventRepository.save({ name: 'Event to Delete', description: 'To be deleted', startDate: '2024-07-10T10:00:00Z', dueDate: '2024-07-11T10:00:00Z' });
        console.log(eventToDelete._id.toString())
        const res: any = await request(app)
            .delete(`/event/delete/${eventToDelete._id.toString()}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res._body.message).toBe('Delete event successfully!');

        const deletedEventFromDB = await eventRepository.findOne({
            where: {
                _id: eventToDelete._id
            }
        });
        expect(deletedEventFromDB).toBeNull();
    });
});
