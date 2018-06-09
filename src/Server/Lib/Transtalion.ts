import * as Translation from '../../Modules/Translation';

export function setLanguageContext(context) {
    if (!context.language) {
        context.language = Translation.getLanguage();
    }
    context.trans = (query: string, ...args): string => Translation.trans(context.language, query, ...args);
}