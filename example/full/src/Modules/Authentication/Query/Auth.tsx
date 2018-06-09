import * as fs from 'fs';
import * as gm from 'gm';
import * as path from 'path';
const crypto = require('crypto');
// import * as Subscriptions from 'graphql-subscriptions';

import { getConfig } from 'reiso/Modules/Config';
import * as ORM from 'reiso/Modules/ORM';
import * as GraphQL from 'reiso/Modules/Query';
import * as Translation from 'reiso/Modules/Translation';
import * as Log from 'reiso/Modules/Log';

import { SessionStore } from '../Service/Session';

import Code from '../../../Export/Code';
import { uploadType } from '../../../Global/QueryType';
import { stringValidator, emailValidator } from '../../../Global/Validator';
import { ValidationError, InputError, DenyError } from '../../../Global/Error';
import { CodeLanguage } from '../../Language/Enum/Language';
import { Session } from '../Entity/Session';
import { User } from '../Entity/User';
import { UserAvatar } from '../Entity/UserAvatar';
import { Email } from '../Entity/Email';
import { UserPrivate } from '../Entity/UserPrivate';
import { UserRule } from '../Enum/UserRule';
import { emailType } from '../Query/Type/Email';
import { usernameType, passwordType } from '../Query/Type/User';

// export const pubsub: Subscriptions.PubSub = new Subscriptions.PubSub();

@GraphQL.Input('AuthRegistration')
export class AuthRegistration {

  @GraphQL.InputField(type => usernameType)
  username: string;

  @GraphQL.InputField(type => passwordType)
  password: string;

  @GraphQL.InputField(type => emailType, { nullable: true })
  email?: string;

  @GraphQL.InputField(type => uploadType, { nullable: true })
  avatar?: string;
}

// @GraphQL.Structure({ id: 'User' })
// export class User {

//   @GraphQL.Field({type: 'integer'})
//   id: number;

//   @GraphQL.Constructor()
//   async constr(
//     @GraphQL.Arg({name: 'id', type: 'integer', constr: true}) id: number,
//     context) {
//       await new Promise(r => setTimeout(r, 300));
//       this.id = id;
//   }

//   @GraphQL.Field({type: 'string'})
//   public async login(
//     @GraphQL.Arg({name: 'name', type: 'string'}) name: string,
//     @GraphQL.Arg({name: 'password', type: 'string', nullable: true}) password: string,
//     context
//     ) {
//     await new Promise(r => setTimeout(r, 300));
//     return 'Auth ID: ' + this.id + ' name: ' + name + ' password: ' + password;
//   }

//   @GraphQL.Field({type: 'string'})
//   public async check(
//     @GraphQL.Arg({name: 'name', type: AuthLogin}) data: AuthLogin,
//     context
//     ) {
//     await new Promise(r => setTimeout(r, 300));
//     return 'Auth ID: ' + this.id + ' name: ' + data.username + ' password: ' + data.password;
//   }
// }

@GraphQL.Mutation({ name: 'auth' })
@GraphQL.Structure('Auth')
export class Auth {

  // @GraphQL.Field({type: User, substructure: true})
  // user: User;

  // @GraphQL.Field({type: User, array: true})
  // users: User[] = [];

  // @GraphQL.Field({type: 'integer'})
  // id: number;

  // @GraphQL.Field('boolean', { name: "log" })
  // public async log(
  //   @GraphQL.Arg('string', 'message') message: string,
  //   @GraphQL.Arg('string', 'stack') stack: string,
  //   context: { session: Session, language: string }
  //   ) {
  //   await Log.fixClientError(message, stack);
  //   return true;
  // }

  @GraphQL.Field(type => Session, { name: "login" })
  public async login(
    @GraphQL.Arg('string', 'login', { nullable: true }) login: string,
    @GraphQL.Arg(type => usernameType, 'username', { nullable: true }) username: string,
    @GraphQL.Arg(type => emailType, 'email', { nullable: true }) email: string,
    @GraphQL.Arg(type => passwordType, 'password') password: string,
    context: { session: Session, language: string }
    ) {

    let errors = stringValidator(login, {
      min: 3,
      max: 20,
      nullable: true
    }).map(i => ({
      key: 'login',
      message: i
    }));

    errors = errors.concat(stringValidator(username, {
      min: 3,
      max: 20,
      nullable: true
    }).map(i => ({
      key: 'username',
      message: i
    })));

    errors = errors.concat(emailValidator(email, {
      nullable: true
    }).map(i => ({
      key: 'email',
      message: i
    })));

    if (!(email || username || login)) errors.push({
      key: 'username',
      message: 'Email or Username or Login should be provided'
    });

    errors = errors.concat(stringValidator(password, {
      min: 3,
      max: 20
    }).map(i => ({
      key: 'password',
      message: i
    })));

    if (errors.length) {
      throw new ValidationError(null, null, Code.LoginDataWrong, errors);
    }

    let connection = await ORM.Manager().Connect();
    let userRepository = connection.getRepository(User);

    let q = userRepository
    .createQueryBuilder('u')
    .leftJoin('u.private', "private")
    .leftJoinAndSelect('u.email', "email")
    .leftJoinAndSelect('u.avatar', "avatar")
    .where('private.password = :password')
    .setParameter('password', crypto.createHash('md5').update(password + getConfig().secretKey).digest("hex"));
    if (login) q = q.andWhere('u.username = :login OR email.name = :login').setParameter('login', login);
    if (username) q = q.andWhere('u.username = :username').setParameter('username', username);
    if (email) q = q.andWhere('email.name = :email').setParameter('email', email);

    let user = await q.getOne();

    if (!user) {
      throw new InputError(null, Translation.trans(context.language, 'Authentication.Error.MissMatchLogin'), Code.LoginDataWrong);
    }

    let session = SessionStore.create(user);

    return session;
  }

  private avatarType = ['image/jpeg', 'image/png'];

  @GraphQL.Field(type => User, { name: "registration" })
  public async registration(
    @GraphQL.Arg(type => AuthRegistration, 'data') data: AuthRegistration,
    context: { session: Session, language: string, files: any[] }
    ) {

    let connection = await ORM.Manager().Connect();
    let userRepository = connection.getRepository(User);
    let userPrivateRepository = connection.getRepository(UserPrivate);
    let emailRepository = connection.getRepository(Email);
    let userAvatarRepository = connection.getRepository(UserAvatar);

    let errors = stringValidator(data.username, {
      min: 3,
      max: 20
    }).map(i => ({
      key: 'username',
      message: i
    }));

    if (await userRepository.findOne({ username: data.username })) {
      errors.push({
        key: 'username',
        message: 'The name is busy, change it.'
      });
    }

    errors = errors.concat(stringValidator(data.password, {
      min: 3,
      max: 20
    }).map(i => ({
      key: 'password',
      message: i
    })));

    errors = errors.concat(stringValidator(data.avatar, {
      min: 3,
      max: 100,
      nullable: true
    }).map(i => ({
      key: 'avatar',
      message: i
    })));

    errors = errors.concat(emailValidator(data.email, {
      nullable: true
    }).map(i => ({
      key: 'email',
      message: i
    })));

    let email = await emailRepository.createQueryBuilder('email').where("email.name = :email").leftJoinAndSelect("email.user", "user").setParameter('email', data.email).limit(0).getOne();

    if (email && email.user) {
      errors.push({
        key: 'email',
        message: 'The email is busy, change it.'
      });
    }

    if(errors.length) {
      throw new ValidationError(null, null, Code.RegistrationDataWrong, errors);
    }

    // ----------------

    let userCount = await userRepository.count();

    let rules = [];
    let verifyed = false;

    if (userCount == 0) {
      rules.push(UserRule.Administator);
    }

    let user = userRepository.create({
      username: data.username,
      date: new Date(),
      rules: rules,
      language: CodeLanguage(context.language)
    });

    let userPrivate = new UserPrivate();
    userPrivate.password = crypto.createHash('md5').update(data.password + getConfig().secretKey).digest("hex");
    userPrivate.user = user;

    let avatar: UserAvatar = null;
    if (context.files && data.avatar) {
      const dir = path.resolve(getConfig().uploadDir, 'avatars');
      const url = '/uploads/avatars/';

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      let file = context.files.find(f => f.fieldname == data.avatar);

      if (file) {
        if (this.avatarType.indexOf(file.mimetype) < 0) throw new InputError(null, 'The file has wrong format: ' + file.mimetype, Code.FileInputWrong);

        let fileBase = Math.random().toString(36) + '-' + Date.now();
        let fileName = fileBase + path.extname(file.originalname)
        let fileUrl = url + fileName;
        let filePath = path.resolve(dir, fileName);

        var raw = new Buffer(file.buffer, 'base64');
        await new Promise((r, e) => fs.writeFile(filePath, raw, { flag: "w" }, function (err) {
          if (err) return e(err);
          r();
        }));

        let inputImage = gm(filePath);

        let imageSize: any = await new Promise((r, e) => inputImage.size(function (err, size) {
          if (err) return e(err);
          r(size);
        }));

        inputImage = inputImage.resize(200, 200, "^");
        inputImage = inputImage.gravity("Center");
        inputImage = inputImage.extent(200, 200);

        let thumbBase = fileBase + '-thumb';
        let thumbName = thumbBase + path.extname(file.originalname);
        let thumbUrl = url + thumbName;
        let thumbPath = path.resolve(dir, thumbName);

        await new Promise((r, e) => inputImage.write(thumbPath, function (err) {
          if (err) return e(err);
          r();
        }));

        avatar = new UserAvatar();
        avatar.path = fileUrl;
        avatar.width = imageSize.width;
        avatar.height = imageSize.height;
        avatar.thumb = thumbUrl;
        avatar.user = user;

        user.avatar = avatar;
      }
    }

    if (data.email) {
      if (!email) {
        email = new Email();
        email.name = data.email;
      }
      email.user = user;

      user.email = email;
    }

    // ----------------

    if (email) await emailRepository.save(email);
    user = await userRepository.save(user);
    await userPrivateRepository.save(userPrivate);
    if (email) await emailRepository.save(email);
    if (avatar) await userAvatarRepository.save(avatar);

    return user;
  }

  @GraphQL.Field(type => Session, { name: "check" })
  public async check(context: { session: Session, language: string }) {

    if (context.session) {
      return context.session;
    }

    throw new DenyError(null, 'You are not logged in', Code.DenyAccess);
  }

  @GraphQL.Field('boolean', { name: "logout" })
  public async logout(context: { session: Session, language: string }) {

    if (context.session) {
      await SessionStore.destroy(context.session);

      return true;
    }

    return false;
  }

  @GraphQL.Field(type => Session, { name: "touch" })
  public async touch(context: { session: Session, language: string }) {

    if (context.session) {
      let session = await SessionStore.touch(context.session);

      return session;
    }

    throw new DenyError(null, 'You are not logged in', Code.DenyAccess);
  }

  // @GraphQL.Field({type: User})
  // public async check(
  //   @GraphQL.Arg({name: 'data', type: AuthLogin}) data: AuthLogin,
  //   context
  //   ): Promise<User> {
    // pubsub.publish('newUsers', user);
  //   await new Promise(r => setTimeout(r, 300));
  //   return new User();
  // }

  // @GraphQL.Subscription({
  //   name: 'newUsers',
  //   type: User,
  //   subscribe: (id: number, context) => pubsub.asyncIterator('newUsers')
  // })
  // public static async newUsers(
  //   @GraphQL.SubscriptionArg({name: 'id', type: 'integer'}) id: number,
  //   user: User,
  //   context
  //   ): Promise<User> {
  //   await new Promise(r => setTimeout(r, 300));
  //   return user;
  // }
}