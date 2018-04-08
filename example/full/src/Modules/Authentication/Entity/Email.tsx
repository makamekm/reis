import * as ORM from 'reiso/Modules/ORM';

import { User } from '~/Modules/Authentication/Entity/User';

@ORM.RegisterEntity('Authentication')
@ORM.Entity('email')
export class Email {

    @ORM.PrimaryGeneratedColumn()
    id: number;

    @ORM.ManyToOne(type => User, user => user.emails, {
        nullable: true,
        onDelete: "SET NULL"
    })
    user: User;

    @ORM.Column({
        length: 100,
        nullable: false,
        unique: true
    })
    @ORM.Index("name-idx")
    name: string;

    @ORM.CreateDateColumn()
    date: Date;

    @ORM.Column({
        nullable: false
    })
    @ORM.Index("verifyed-idx")
    verifyed: boolean = false;
}