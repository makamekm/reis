import * as ORM from 'reiso/Modules/ORM';

import { User } from '~/Modules/Authentication/Entity/User';

@ORM.RegisterEntity('Authentication')
@ORM.Entity('user_private')
export class UserPrivate {

    @ORM.PrimaryGeneratedColumn()
    id: number;

    @ORM.OneToOne(type => User, user => user.avatar, {
        nullable: false,
        onDelete: "CASCADE"
    })
    @ORM.JoinColumn()
    user: User;

    @ORM.Column({
        length: 100,
        nullable: false
    })
    @ORM.Index("password-idx")
    password: string;
}