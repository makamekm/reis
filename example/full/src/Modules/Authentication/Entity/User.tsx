import * as ORM from 'reiso/Modules/ORM';
import * as GraphQL from 'reiso/Modules/Query';

import { dateType } from "../../../Global/QueryType";
import { Language, LanguageCode } from '../../Language/Enum/Language';
import { Email } from '../Entity/Email';
import { UserAvatar } from '../Entity/UserAvatar';
import { UserPrivate } from '../Entity/UserPrivate';
import { Session } from '../Entity/Session';
import { UserRule } from '../Enum/UserRule';
import { languageType } from '../Query/Type/Language';
import { ruleUserType } from '../Query/Type/UserRule';

@ORM.RegisterEntity('Authentication')
@ORM.Entity('user')
@GraphQL.Structure('User')
export class User {

    @ORM.PrimaryGeneratedColumn()
    @GraphQL.Field('id')
    id: number;

    @ORM.OneToOne(type => Email, {
        nullable: true,
        onDelete: "SET NULL"
    })
    @ORM.JoinColumn()
    email: Email;

    @GraphQL.Field('string', { name: 'email' })
    public async _email(context) {
        return this.email ? this.email.name : null;
    }

    @ORM.OneToMany(type => Email, email => email.user)
    @ORM.JoinColumn()
    emails: Promise<Email[]>;

    @ORM.Column({
        length: 100,
        nullable: false,
        unique: true,
        name: 'name'
    })
    @GraphQL.Field('string')
    @ORM.Index("username-idx")
    username: string;

    @ORM.CreateDateColumn()
    @GraphQL.Field(type => dateType)
    date: Date;

    @ORM.Column({
        nullable: true
    })
    @GraphQL.Field(type => dateType)
    dateOfBirth: Date;

    @ORM.OneToOne(type => UserAvatar, avatar => avatar.user)
    avatar: UserAvatar;

    @GraphQL.Field('string', { name: 'avatar' })
    public async _avatar(context) {
        return this.avatar && this.avatar.path;
    }

    @ORM.OneToOne(type => UserPrivate, pr => pr.user)
    private: Promise<UserPrivate>;

    @ORM.Column('simple-array', {
        nullable: false,
        comment: "Integers only",
    })
    rules: UserRule[] = [];

    @GraphQL.Field(type => ruleUserType, { name: 'rules', array: true })
    public async _rules(context) {
        return this.rules && this.rules[0] ? this.rules : [];
    }

    @ORM.OneToMany(type => Session, session => session.user)
    sessions: Promise<Session[]>;

    @ORM.Column({
        nullable: false,
        comment: "Integers only"
    })
    language: Language;

    public getLanguageCode() {
        return LanguageCode(this.language);
    }

    @GraphQL.Field(type => languageType, { name: 'language' })
    public async _language(context) {
        return this.language;
    }

    // @ORM.AfterLoad()
    // removePrivate() {
    //     delete this.private;
    // }
}