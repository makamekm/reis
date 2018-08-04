import { setState, getTranslation, getLanguage, getLanguages, trans, transDefault } from '../../Both/Translation';
import { mapReduce } from '../../Server/Lib/Config';


describe("Both/Translation", function () {
    let language = 'en';
    let languages = ["en", "ru"];

    beforeEach(async () => {
        const translation = {
            "Authentication": {
                "SignIn": {
                    "en": "Test1",
                    "ru": "Test2"
                },
                "Error": {
                    "MissMatchLogin": {
                        "en": "Test1$0$$1$",
                        "ru": "Test2$0$$1$"
                    }
                }
            },
            "Error": {
                "NotLogged": {
                    "en": "You are not logged in",
                    "ru": "Вы не вошли"
                },
                "HaventRule": {
                    "en": "You haven't the necessary rule",
                    "ru": "У вас нет необходимых прав"
                }
            }
        };
        setState(language, languages, mapReduce(languages, translation));
    });

    it("getTranslation", function () {
        expect(JSON.stringify(getTranslation())).toBe(JSON.stringify(
            {
                "en": {
                    "Authentication": {
                        "SignIn":"Test1",
                        "Error": {
                            "MissMatchLogin": "Test1$0$$1$"
                        }
                    },
                    "Error": {
                        "NotLogged": "You are not logged in",
                        "HaventRule": "You haven't the necessary rule"
                    }
                },
                "ru": {
                    "Authentication": {
                        "SignIn": "Test2",
                        "Error": {
                            "MissMatchLogin": "Test2$0$$1$"
                        }
                    },
                    "Error": {
                        "NotLogged": "Вы не вошли",
                        "HaventRule": "У вас нет необходимых прав"
                    }
                }
            }
        ))
    });

    it("getLanguage", function () {
        expect(getLanguage()).toBe(language);
    });

    it("getLanguages", function () {
        expect(JSON.stringify(getLanguages())).toBe(JSON.stringify(languages));
    });

    it("trans - Simple", function () {
        expect(trans('en', 'Authentication.SignIn')).toBe('Test1');
    });

    it("trans - Arguments", function () {
        expect(trans('en', 'Authentication.Error.MissMatchLogin', 'ggg', 'ddd')).toBe('Test1gggddd');
    });

    it("trans - Another Language", function () {
        expect(trans('ru', 'Authentication.Error.MissMatchLogin', 'ggg', 'ddd')).toBe('Test2gggddd');
    });

    it("trans - Another Root Path", function () {
        expect(trans('en', 'Error.NotLogged')).toBe('You are not logged in');
    });

    it("trans - Empty String", function () {
        expect(trans('en', '')).toBe('');
    });

    it("trans - Empty Result", function () {
        expect(trans('en', '')).toBe('');
    });

    it("transDefault - Simple", function () {
        expect(transDefault('Authentication.SignIn')).toBe('Test1');
    });

    it("transDefault - Arguments", function () {
        expect(transDefault('Authentication.Error.MissMatchLogin', 'ggg', 'ddd')).toBe('Test1gggddd');
    });

    it("transDefault - Another Root Path", function () {
        expect(transDefault('Error.NotLogged')).toBe('You are not logged in');
    });

    it("transDefault - Empty String", function () {
        expect(transDefault('')).toBe('');
    });

    it("transDefault - Empty Result", function () {
        expect(transDefault('')).toBe('');
    });
});