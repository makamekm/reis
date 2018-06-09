export enum UserRule {
    Administator = 1
}

export function HasUserRule(rules: UserRule[], what: UserRule[]|UserRule) {
    if (Array.isArray(what)) {
        for (var key in what) {
            if (rules.findIndex(r => Number(r) === what[key]) >= 0) return true;
        }
    }
    else {
        return rules.findIndex(r => Number(r) === what) >= 0;
    }
}

export function UserRuleStringify(rule: UserRule) {
    switch (Number(rule)) {
        case UserRule.Administator: return 'Useristrator';
    }
}

export function UserRuleForEach(callback: (language: UserRule) => void) {
    for (var prop in UserRule) {
        if (UserRule.hasOwnProperty(prop) && (!isNaN(parseInt(prop)))) {
            callback(parseInt(prop) as UserRule);
        }
    }
}