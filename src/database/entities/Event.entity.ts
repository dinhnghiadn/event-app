import {
    BaseEntity,
    Column,
    Entity,
    ObjectIdColumn,
} from 'typeorm';
import {ObjectId} from "mongodb";


@Entity('events')
export class Event extends BaseEntity {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column("varchar", { length: 100 })
    name: string;

    @Column()
    description: string;

    @Column({ type: 'timestamptz' })
    startDate: Date;

    @Column({ type: 'timestamptz' })
    dueDate: Date;

}
