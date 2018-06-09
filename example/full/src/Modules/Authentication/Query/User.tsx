import { GraphQLEnumType } from 'graphql';
import * as Subscriptions from 'graphql-subscriptions';
import * as ORM from 'reiso/Modules/ORM';
import * as GraphQL from 'reiso/Modules/Query';
import * as Translation from 'reiso/Modules/Translation';

import { dateType, orderEnum } from '../../../Global/QueryType';
import { DenyError } from '../../../Global/Error';
import { Language } from '../../Language/Enum/Language';
import { Session } from '../Entity/Session';
import { User } from '../Entity/User';
import { UserRule, HasUserRule } from '../Enum/UserRule';

// export const pubsub: Subscriptions.PubSub = new Subscriptions.PubSub();

@GraphQL.Input('UserFilter')
export class UserFilter {

  @GraphQL.InputField('string', { nullable: true })
  username?: string;

  @GraphQL.InputField('integer', { nullable: true, array: true })
  rules?: UserRule[];

  @GraphQL.InputField('integer', { nullable: true, array: true })
  language?: Language[];

  @GraphQL.InputField(type => dateType, { nullable: true })
  dateFrom?: Date;

  @GraphQL.InputField(type => dateType, { nullable: true })
  dateTo?: Date;

  @GraphQL.InputField('string', { nullable: true })
  email?: string;
}

@GraphQL.Structure('UserListResult')
export class UserListResult {

  @GraphQL.Field(type => User, { array: true })
  users: User[];

  @GraphQL.Field('integer')
  count: number;
}

const UserOrderEnum = new GraphQLEnumType({
  name: 'UserOrderEnum',
  values: {
    username: { value: 'username' },
    date: { value: 'date' },
    email: { value: 'email' },
    language: { value: 'language' }
  }
});

@GraphQL.Input('UserOrder')
export class UserOrder {

  @GraphQL.InputField(type => UserOrderEnum)
  name: string;

  @GraphQL.InputField(type => orderEnum)
  type: 'DESC'|'ASC';
}

@GraphQL.Query({ name: 'user' })
@GraphQL.Structure('UserQuery')
export class UserQuery {

  @GraphQL.Field(type => UserListResult, { name: "list" })
  public async list(
    @GraphQL.Arg(type => UserFilter, 'filter') filter: UserFilter,
    @GraphQL.Arg(type => UserOrder, 'order', { nullable: true, array: true }) order: UserOrder[] = [],
    @GraphQL.Arg('integer', 'limit', { nullable: true }) limit: number = 10,
    @GraphQL.Arg('integer', 'offset', { nullable: true }) offset: number = 0,
    context: { session: Session, trans: (query: string, ...args) => string }
  ): Promise<UserListResult> {

    if (!context.session) {
      throw new DenyError(null, context.trans('Error.NotLogged'));
    }

    if (!(HasUserRule(context.session.user.rules, [UserRule.Administator]))) {
      throw new DenyError(null, context.trans('Error.HaventRule'));
    }

    let connection = await ORM.Manager().Connect();
    let userRepository = connection.getRepository(User);

    let query = userRepository
    .createQueryBuilder('u')
    .leftJoinAndSelect('u.avatar', "avatar")
    .leftJoinAndSelect('u.email', "email");

    if (filter.username) query = query
    .andWhere('u.username LIKE :username')
    .setParameter('username', '%' + filter.username + '%');

    if (filter.email) query = query
    .andWhere('email.name LIKE :email')
    .setParameter('email', '%' + filter.email + '%');

    if (filter.language && filter.language.length) query = query
    .andWhere('language IN (:language)')
    .setParameter('language', filter.language);

    if (filter.rules && filter.rules.length) query = query
    .andWhere('rules IN (:rules)')
    .setParameter('rules', filter.rules);

    if (filter.dateFrom) query = query
    .andWhere('u.date >= :dateFrom')
    .setParameter('dateFrom', filter.dateFrom);

    if (filter.dateTo) query = query
    .andWhere('u.date <= :dateTo')
    .setParameter('dateFrom', filter.dateTo);

    order.forEach(o => query.addOrderBy('u.' + o.name, o.type));

    query.limit(limit);
    query.offset(offset);

    let res = await query.getManyAndCount();

    await new Promise(r => setTimeout(r, 1000));

    return {
      users: res[0],
      count: res[1]
    };
  }

  @GraphQL.Field(type => User, { name: "me" })
  public async me(context: { session: Session, trans: (query: string, ...args) => string }): Promise<User> {

    if (!context.session) {
      throw new DenyError(null, context.trans('Error.NotLogged'));
    }

    let connection = await ORM.Manager().Connect();
    let userRepository = connection.getRepository(User);

    let q = userRepository
    .createQueryBuilder('u')
    .leftJoin('u.private', "private")
    .leftJoinAndSelect('u.avatar', "avatar")
    .leftJoinAndSelect('u.email', "email")
    .where('u.id = :id')
    .setParameter('id', context.session.user.id);

    let user = await q.getOne();

    return user;
  }
}