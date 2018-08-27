import * as ORM from 'reiso/Modules/ORM';

import { User } from '../Entity/User';

@ORM.RegisterEntity('Authentication')
@ORM.Entity('user_avatar')
export class UserAvatar {

    @ORM.PrimaryGeneratedColumn()
    id: number;

    @ORM.Column()
    height: number;

    @ORM.Column()
    width: number;

    @ORM.Column()
    path: string;

    @ORM.Column()
    thumb: string;

    @ORM.OneToOne(type => User, user => user.avatar, {
        nullable: false,
        onDelete: "CASCADE"
    })
    @ORM.JoinColumn()
    user: User;

    @ORM.CreateDateColumn()
    date: Date;
}