export enum Language {
    En = 1,
    Ru = 2
}

export function LanguageStringify(language: Language) {
    switch (Number(language)) {
        case Language.En: return 'English';
        case Language.Ru: return 'Russian';
    }

    return null;
}

export function LanguageCode(language: Language): string {
    switch (Number(language)) {
        case Language.En: return 'en';
        case Language.Ru: return 'ru';
    }

    return null;
}

export function CodeLanguage(code: string): Language {
    switch (code) {
        case 'en': return Language.En;
        case 'ru': return Language.Ru;
    }

    return null;
}

export function LanguageBrowserCode(language: string): string {
    if (language.indexOf('en') == 0) return 'en';
    if (language.indexOf('ru') == 0) return 'ru';
    return null;
}


export function CodeFlag(code: string): string {
    switch (code) {
        case 'en': return 'gb';
        case 'ru': return 'ru';
    }

    return null;
}

export function LanguageForEach(callback: (language: Language) => void) {
    for (var prop in Language) {
        if (Language.hasOwnProperty(prop) && (!isNaN(parseInt(prop)))) {
            callback(parseInt(prop) as Language);
        }
    }
}