import * as fs from 'fs';
import * as gm from 'gm';
import * as path from 'path';
const crypto = require('crypto');

import { getConfig } from 'reiso/Modules/Config';
import * as ORM from 'reiso/Modules/ORM';
import * as GraphQL from 'reiso/Modules/Query';
import * as Translation from 'reiso/Modules/Translation';

import Code from '~/Export/Code';
import { uploadType } from "~/Global/QueryType";
import { stringValidator, emailValidator } from '~/Global/Validator';
import { DenyError, ValidationError, InputError } from '~/Global/Error';
import { Session } from '~/Modules/Authentication/Entity/Session';
import { User } from '~/Modules/Authentication/Entity/User';
import { UserAvatar } from '~/Modules/Authentication/Entity/UserAvatar';
import { Email } from '~/Modules/Authentication/Entity/Email';
import { UserPrivate } from '~/Modules/Authentication/Entity/UserPrivate';
import { AdminRule, HasAdminRule } from '~/Modules/Authentication/Enum/AdminRule';
import { Language } from '~/Modules/Language/Enum/Language';
import { emailType } from '~/Modules/Authentication/Query/Type/Email';
import { usernameType, passwordType } from '~/Modules/Authentication/Query/Type/User';
import { languageType } from '~/Modules/Authentication/Query/Type/Language';
import { ruleAdminType } from '~/Modules/Authentication/Query/Type/AdminRule';

@GraphQL.Input('UserEditDate')
export class UserEditDate {

  @GraphQL.InputField(type => usernameType)
  username: string;

  @GraphQL.InputField(type => passwordType, { nullable: true })
  password?: string;

  @GraphQL.InputField(type => emailType, { nullable: true })
  email?: string;

  @GraphQL.InputField(type => uploadType, { nullable: true })
  avatar?: string;

  @GraphQL.InputField(type => languageType, { nullable: true })
  language: Language;

  @GraphQL.InputField(type => ruleAdminType, { array: true })
  rules: AdminRule[];
}

@GraphQL.Input('UserEditMeDate')
export class UserEditMeDate {

  @GraphQL.InputField(type => usernameType)
  username: string;

  @GraphQL.InputField(type => passwordType, { nullable: true })
  password?: string;

  @GraphQL.InputField(type => emailType, { nullable: true })
  email?: string;

  @GraphQL.InputField(type => uploadType, { nullable: true })
  avatar?: string;

  @GraphQL.InputField(type => languageType, { nullable: true })
  language: Language;
}

@GraphQL.Mutation({ name: 'user' })
@GraphQL.Structure('UserEditMutation')
export class UserEditMutation {

  private avatarType = ['image/jpeg', 'image/png'];

  @GraphQL.Field('boolean', { name: "delete" })
  public async delete(
    @GraphQL.Arg('id', 'ids', { array: true }) ids: number[],
    context: { session: Session, trans: (query: string, ...args) => string, files: any[] }
    ): Promise<boolean> {

    if (!context.session) {
      throw new DenyError(null, context.trans('Error.NotLogged'));
    }

    if (!HasAdminRule(context.session.user.rules, [AdminRule.Administator])) {
      throw new DenyError(null, context.trans('Error.HaventRule'));
    }

    let connection = await ORM.Manager().Connect();
    let userRepository = connection.getRepository(User);

    if (ids.find(id => id == context.session.user.id)) {
      throw new DenyError(null, "You cannot delete yourself");
    }

    for (let id of ids) {
      let user = await userRepository.findOne(id);

      if (!user) throw new DenyError(null, "The user hasn't been found by id: " + id);

      if (!HasAdminRule(context.session.user.rules, [AdminRule.Administator]) && HasAdminRule(user.rules, [AdminRule.Administator])) {
        throw new DenyError(null, "You cannot delete Administator");
      }

      await userRepository.remove(user);
    }

    return true;
  }

  @GraphQL.Field(type => User, { name: "create" })
  public async create(
    @GraphQL.Arg(type => UserEditDate, 'data') data: UserEditDate,
    context: { session: Session, trans: (query: string, ...args) => string, files: any[] }
    ): Promise<User> {

    if (!context.session) {
      throw new DenyError(null, context.trans('Error.NotLogged'));
    }

    if (!HasAdminRule(context.session.user.rules, [AdminRule.Administator])) {
      throw new DenyError(null, context.trans('Error.HaventAdminRule'));
    }

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

    if (!data.language) {
      errors.push({
        key: 'language',
        message: 'The language should be selected'
      });
    }

    if (!HasAdminRule(context.session.user.rules, [AdminRule.Administator]) && HasAdminRule(data.rules, [AdminRule.Administator])) {
      errors.push({
        key: 'rules',
        message: 'You cannot set Administator rule'
      });
    }

    if (errors.length) {
      throw new ValidationError(null, null, Code.CreateUserDataWrong, errors);
    }

    // ----------------

    let user = userRepository.create({
      username: data.username,
      date: new Date(),
      rules: data.rules,
      language: data.language
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

        let fileBase = Math.random().toString(36) + '-' + Date.now()
        let fileName = fileBase + path.extname(file.originalname)
        let fileUrl = url + fileName;
        let filePath = path.resolve(dir, fileName);

        var raw = new Buffer(file.buffer, 'base64')
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

  @GraphQL.Field(type => User, { name: "edit" })
  public async edit(
    @GraphQL.Arg('id', 'id') id: number,
    @GraphQL.Arg(type => UserEditDate, 'data') data: UserEditDate,
    context: { session: Session, trans: (query: string, ...args) => string, files: any[] }
    ): Promise<User> {

    if (!context.session) {
      throw new DenyError(null, context.trans('Error.NotLogged'));
    }
    else if (!HasAdminRule(context.session.user.rules, [AdminRule.Administator])) {
      throw new DenyError(null, context.trans('Error.HaventAdminRule'));
    }

    let connection = await ORM.Manager().Connect();
    let userRepository = connection.getRepository(User);
    let userPrivateRepository = connection.getRepository(UserPrivate);
    let emailRepository = connection.getRepository(Email);
    let userAvatarRepository = connection.getRepository(UserAvatar);

    let user = await userRepository.findOne(id);

    if (!user) throw new DenyError(null, "The user hasn't been found by id: " + id);

    // ----------------

    let errors = stringValidator(data.username, {
      min: 3,
      max: 20
    }).map(i => ({
      key: 'username',
      message: i
    }));

    if (data.username != user.username && await userRepository.findOne({ username: data.username })) {
      errors.push({
        key: 'username',
        message: 'The name is busy, change it.'
      });
    }

    errors = errors.concat(stringValidator(data.password, {
      min: 3,
      max: 20,
      nullable: true
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

    let email = await emailRepository.createQueryBuilder('email').where("email.name = :email").leftJoinAndSelect("email.user", "user", "user.id != :user").setParameter('user', user.id).setParameter('email', data.email).limit(0).getOne();

    if (email && email.user && email.user != user) {
      errors.push({
        key: 'email',
        message: 'The email is busy, change it.'
      });
    }

    if (!data.language) {
      errors.push({
        key: 'language',
        message: 'The language should be selected'
      });
    }

    if (!HasAdminRule(context.session.user.rules, [AdminRule.Administator]) && (HasAdminRule(data.rules, [AdminRule.Administator]) || HasAdminRule(user.rules, [AdminRule.Administator]))) {
      errors.push({
        key: 'rules',
        message: 'You cannot set rules for Administator'
      });
    }

    if(errors.length) {
      throw new ValidationError(null, null, Code.EditUserDataWrong, errors);
    }

    // ----------------

    if (data.password) {
      let userPrivate = await user.private;
      userPrivate.password = crypto.createHash('md5').update(data.password + getConfig().secretKey).digest("hex");
      userPrivateRepository.save(userPrivate);
    }

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

        let avatar: UserAvatar = await userAvatarRepository.createQueryBuilder('avatar').where('avatar.user = :user').setParameter('user', user.id).getOne();

        if (!avatar) {
          avatar = new UserAvatar();
        }
        else {
          fs.unlinkSync(path.resolve(dir, path.basename(avatar.path)));
          fs.unlinkSync(path.resolve(dir, path.basename(avatar.thumb)));
        }

        avatar.path = fileUrl;
        avatar.width = imageSize.width;
        avatar.height = imageSize.height;
        avatar.thumb = thumbUrl;
        avatar.user = user;

        user.avatar = avatar;

        await userAvatarRepository.save(avatar);
      }
    }

    if (!email) email = await emailRepository.createQueryBuilder('email').where("email.name = :email").setParameter('email', data.email).limit(0).getOne();

    if (!email) email = user.email;

    if ((data.email && !email)) {
      email = new Email();
      email.name = data.email;
      email.user = user;

      user.email = email;

      await emailRepository.save(email);
    }
    else if (email && (data.email != email.name)) {
      if (data.email) {
        email.name = data.email;
        email.user = user;

        user.email = email;
      }
      else {
        user.email = null;
      }

      await emailRepository.save(email);
    }
    else if (email && data.email) {
      email.user = user;
      user.email = email;

      await emailRepository.save(email);
    }

    user.username = data.username;
    user.language = data.language;
    user.rules = data.rules;

    // ----------------

    user = await userRepository.save(user);

    return user;
  }

  @GraphQL.Field(type => User, { name: "editMe" })
  public async editMe(
    @GraphQL.Arg(type => UserEditMeDate, 'data') data: UserEditMeDate,
    context: { session: Session, trans: (query: string, ...args) => string, files: any[] }
    ): Promise<User> {

    if (!context.session) {
      throw new DenyError(null, context.trans('Error.NotLogged'));
    }

    let connection = await ORM.Manager().Connect();
    let userRepository = connection.getRepository(User);
    let userPrivateRepository = connection.getRepository(UserPrivate);
    let emailRepository = connection.getRepository(Email);
    let userAvatarRepository = connection.getRepository(UserAvatar);

    let user = await userRepository.findOne(context.session.user.id);

    // ----------------

    let errors = stringValidator(data.username, {
      min: 3,
      max: 20
    }).map(i => ({
      key: 'username',
      message: i
    }));

    if (data.username != user.username && await userRepository.findOne({ username: data.username })) {
      errors.push({
        key: 'username',
        message: 'The name is busy, change it.'
      });
    }

    errors = errors.concat(stringValidator(data.password, {
      min: 3,
      max: 20,
      nullable: true
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

    let email = await emailRepository.createQueryBuilder('email').where("email.name = :email").leftJoinAndSelect("email.user", "user", "user.id != :user").setParameter('user', user.id).setParameter('email', data.email).limit(0).getOne();

    if (email && email.user && email.user != user) {
      errors.push({
        key: 'email',
        message: 'The email is busy, change it.'
      });
    }

    if (!data.language) {
      errors.push({
        key: 'language',
        message: 'The language should be selected'
      });
    }

    if(errors.length) {
      throw new ValidationError(null, null, Code.EditUserDataWrong, errors);
    }

    // ----------------

    if (data.password) {
      let userPrivate = await user.private;
      userPrivate.password = crypto.createHash('md5').update(data.password + getConfig().secretKey).digest("hex");
      userPrivateRepository.save(userPrivate);
    }

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

        let avatar: UserAvatar = await userAvatarRepository.createQueryBuilder('avatar').where('avatar.user = :user').setParameter('user', user.id).getOne();

        if (!avatar) {
          avatar = new UserAvatar();
        }
        else {
          fs.unlinkSync(path.resolve(dir, path.basename(avatar.path)));
          fs.unlinkSync(path.resolve(dir, path.basename(avatar.thumb)));
        }

        avatar.path = fileUrl;
        avatar.width = imageSize.width;
        avatar.height = imageSize.height;
        avatar.thumb = thumbUrl;
        avatar.user = user;

        user.avatar = avatar;

        await userAvatarRepository.save(avatar);
      }
    }

    if (!email) email = await emailRepository.createQueryBuilder('email').where("email.name = :email").setParameter('email', data.email).limit(0).getOne();

    if (!email) email = user.email;

    if ((data.email && !email)) {
      email = new Email();
      email.name = data.email;
      email.user = user;

      user.email = email;

      await emailRepository.save(email);
    }
    else if (email && (data.email != email.name)) {
      if (data.email) {
        email.name = data.email;
        email.user = user;

        user.email = email;
      }
      else {
        user.email = null;
      }

      await emailRepository.save(email);
    }
    else if (email && data.email) {
      email.user = user;
      user.email = email;

      await emailRepository.save(email);
    }

    user.username = data.username;
    user.language = data.language;

    // ----------------

    user = await userRepository.save(user);

    return user;
  }
}