import {DataSource, EntityManager, MongoRepository, Repository} from 'typeorm';
import {ENTITIES_DIR, ENTITIES_PATH, MIGRATION_PATH} from "../utils/const/db-const";
import fs from "fs";
import dotenv from 'dotenv';
import path from "path";
import logger from "../shared/log/logger";
import {User} from "./entities/User.entity";

dotenv.config({ path: `.env` });
export class DatabaseConnection {
    dataSource: DataSource;
    repositories: { [entity: string]: MongoRepository<any> };
    entityManager: EntityManager;

    constructor() {
        this.dataSource = new DataSource({
            type: "mongodb",
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || "27017"),
            database: process.env.DB_NAME,
            entities: [ENTITIES_PATH],
            migrations: [MIGRATION_PATH],
            synchronize: true,
            // logging: ['query', 'error'],
        });
        this.repositories = {};
        this.entityManager = this.dataSource.manager;
    }

    initialize() {
        return this.dataSource
            .initialize()
            .then(async () => {
                logger.info("Start initializing Data source...")
                // init repositories models
                const files = fs.readdirSync(ENTITIES_DIR);
                // fetch all files in models folder
                for (const file of files) {
                    if (file.indexOf('.') !== 0 && file.slice(-3) === '.ts') {
                        const model = await import(
                            path.join(`${__dirname}/`, '/entities', file)
                            );
                        const modelName = file.replace('.entity.ts', '');
                        this.repositories[modelName] = this.dataSource.getMongoRepository(
                            model[modelName]
                        );
                    }
                }
                logger.info("Initialize Data source successfully!")
            })
            .catch((err) => {
                console.log(err)
                logger.error("Error during Data source initialization!")
            });
    }

    getRepository(entityName: string): MongoRepository<any> {
        return this.repositories[entityName];
    }
}

export const databaseConnection = new DatabaseConnection()

export const AppDataSource = databaseConnection.dataSource
