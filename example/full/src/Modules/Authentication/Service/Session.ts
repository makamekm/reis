const util = require('util');

import * as ORM from 'reiso/Modules/ORM';

import { User } from '../Entity/User';
import { Session } from '../Entity/Session';

export class SessionStore {

  public static async get(sid: string, token: string) {
    let connection = await ORM.Manager().Connect();

    let sessionRepository = connection.getRepository(Session);

    return await sessionRepository
    .createQueryBuilder('s')
    .leftJoinAndSelect('s.user', "u")
    .leftJoinAndSelect('u.email', "email")
    .leftJoinAndSelect('u.avatar', "avatar")
    .where('s.sid = :sid AND s.token = :token')
    .setParameter('sid', sid)
    .setParameter('token', token)
    .getOne();
  }

  public static async create(user: User): Promise<Session> {
    let connection = await ORM.Manager().Connect();

    let sessionRepository = connection.getRepository(Session);

    let sess = sessionRepository.create({
      sid: this.generateToken(32),
      date: new Date(),
      user: user,
      token: this.generateToken(32)
    });

    try {
      await sessionRepository.save(sess);
    }
    catch (e) {
      sess = sessionRepository.create({
        sid: this.generateToken(32),
        date: new Date(),
        user: user,
        token: this.generateToken(32)
      });

      await sessionRepository.save(sess);
    }

    return sess;
  }

  public static async touch(session: Session): Promise<Session> {
    let connection = await ORM.Manager().Connect();

    let sessionRepository = connection.getRepository(Session);

    session.token = this.generateToken();

    await sessionRepository.save(session);

    return session;
  }

  public static async destroy(session: Session) {
    let connection = await ORM.Manager().Connect();

    let sessionRepository = connection.getRepository(Session);

    await sessionRepository.remove(session);
  }

  private static generateToken(count = 32) {
    let chars = 'abcdefghijklmnopqrstuvwxyz12345678900';
    let str = '';

    for(let i = 0; i < count; i++) {
      str += chars[Math.floor(Math.random() * (chars.length))];
    }

    return str;
  }
}