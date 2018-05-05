export const stringValidator = (value: any, opts: {
  min: number
  max: number
  nullable?: boolean
} = {
  min: 3,
  max: 20
}): string[] => {
  let errors = [];

  if (!opts.nullable && !value) {
    errors.push("Shouldn't be null");
  } else if (opts.nullable && !value) {
    return [];
  } else {
    if (typeof value != 'string') {
      errors.push('Is not a string' + value);
    } else {
      let reg = RegExp(`^(.{${opts.min},${opts.max}})$`, "i");
      if(!reg.test(value)) {
        errors.push(`Should be betwen ${opts.min} and ${opts.max} chars`);
      }
    }
  }

  return errors;
}

export const arrayValidator = (value: any[], opts: {
  min?: number
  max?: number
  dublicates?: boolean | ((value: any, array: any[]) => boolean)
  type?: string
  nullable?: boolean
  validator?: (value: any) => string[]
} = {
  min: 3,
  max: 20
}): string[] => {
  let errors = [];

  if (!opts.nullable && !value) {
    errors.push("Shouldn't be null");
  } else if (opts.nullable && !value) {
    return [];
  }
  else {
    if (!Array.isArray(value)) {
      errors.push('Is not an array' + value);
    } else {
      if ((opts.min && value.length < opts.min)) {
        errors.push('Should be > ' + opts.min);
      }

      if ((opts.max && value.length < opts.max)) {
        errors.push('Should be < ' + opts.max);
      }

      let dub = [];

      value.forEach(item => {
        if (opts.type && opts.type == 'number' ? Number.isNaN(item) : typeof item != opts.type) {
          errors.push('Is not a ' + opts.type + ': ' + item);
        }

        if (opts.validator) {
          errors.concat(opts.validator(item));
        }

        if (opts.dublicates && typeof opts.dublicates === 'function' && opts.dublicates(item, dub)) {
          dub.push(item);
        } else if (opts.dublicates && typeof opts.dublicates !== 'function' && dub.indexOf(item)) {
          dub.push(item);
        }
      });

      if (opts.dublicates && dub.length != value.length) {
          errors.push('The array has dublicates');
      }
    }
  }

  return errors;
}

export const emailValidator = (value: any, opts: {
  nullable?: boolean
} = {
}): string[] => {
  let errors = [];

  if (!opts.nullable && !value) {
    errors.push("Shouldn't be null");
  } else if (opts.nullable && !value) {
    return [];
  } else {
    if (typeof value != 'string') {
      errors.push('Is not a string');
    } else {
      let reg = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
      if(!reg.test(value)) {
        errors.push('Is not a valid');
      }
    }
  }

  return errors;
}

export const colorValidator = (value: any, opts: {
  nullable?: boolean
} = {}): string[] => {
  let errors = [];

  if (!opts.nullable && !value) {
    errors.push("Shouldn't be null");
  } else if (opts.nullable && !value) {
    return [];
  } else {
    if (typeof value != 'string') {
      errors.push('Is not a string');
    }
    else {
      if(!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
        errors.push('Should be betwen 3 and 6 chars with HEX style');
      }
    }
  }

  return errors;
}

export const dateValidator = (value: any, opts: {
  nullable?: boolean
} = {}): string[] => {
  let errors = [];

  if (!opts.nullable && !value) {
    errors.push("Shouldn't be null");
  } else if (opts.nullable && !value) {
    return [];
  } else {
    if (!Date.parse(value)) {
      errors.push('Is not a date: ' + value);
    }
  }

  return errors;
}