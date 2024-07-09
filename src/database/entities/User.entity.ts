import {
    AfterLoad,
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    ObjectIdColumn,
    OneToMany,
    UpdateDateColumn,
} from 'typeorm';
import {IsEmail, MaxLength, MinLength} from 'class-validator';
import {Exclude, instanceToPlain} from 'class-transformer';
import {hashPassword} from "../../utils/common/hash-password";
import {Role, UserStatus} from "../../utils/enum/user";
import {Event} from "./Event.entity";
import {ObjectId} from 'mongodb';

@Entity('users')
export class User extends BaseEntity {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column({ unique: true, readonly: true })
    @MinLength(6, { message: 'Username too short, min length is $constraint1!' })
    @MaxLength(16, { message: 'Username too short, min length is $constraint1!' })
    username: string;

    @Column({ unique: true })
    @IsEmail()
    email: string;

    @Exclude()
    @Column()
    @MinLength(8, { message: 'Password too short, min length is $constraint1!' })
    password: string;

    @Exclude()
    tempPassword: string;

    @Column()
    status: UserStatus = UserStatus.NotVerified;

    @Column()
    role: Role = Role.User;

    @Exclude()
    @Column('varchar', { length: 500, nullable: true })
    resetToken: string;

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;


    @AfterLoad()
    loadTempPassword(): void {
        this.tempPassword = this.password;
    }

    @BeforeInsert()
    @BeforeUpdate()
    async hashingPassword() {
        if (this.tempPassword !== this.password) {
            try {
                this.password = await hashPassword(this.password);
            } catch (e) {
                throw new Error('There are some issues in the hash!');
            }
        }
    }

    toJSON() {
        return instanceToPlain(this);
    }
}
