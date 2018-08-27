import * as ORM from 'reiso/Modules/ORM';
import * as GraphQL from 'reiso/Modules/Query';

import { User } from '../Entity/User';

@ORM.RegisterEntity('Authentication')
@ORM.Entity('session')
@GraphQL.Structure('Session')
export class Session {

    @ORM.PrimaryColumn({
        length: 32
    })
    @GraphQL.Field('string', { name: "sid" })
    @ORM.Index("sid-idx")
    sid: string;

    @ORM.ManyToOne(type => User, user => user.sessions, {
        nullable: false,
        onDelete: "CASCADE"
    })
    @ORM.JoinColumn()
    @GraphQL.Field(type => User, { name: "user" })
    user: User;

    @ORM.Column({
        length: 32
    })
    @GraphQL.Field('string', { name: "token" })
    @ORM.Index("token-idx")
    token: string;

    @ORM.CreateDateColumn()
    date: Date;

    @ORM.UpdateDateColumn()
    @ORM.Index("updated-idx")
    updated: Date;
}