export enum AdminRule {
    Administator = 1
}

export function HasAdminRule(rules: AdminRule[], what: AdminRule[]|AdminRule) {
    if (Array.isArray(what)) {
        for (var key in what) {
            if (rules.findIndex(r => Number(r) === what[key]) >= 0) return true;
        }
    }
    else {
        return rules.findIndex(r => Number(r) === what) >= 0;
    }
}

export function AdminRuleStringify(rule: AdminRule) {
    switch (Number(rule)) {
        case AdminRule.Administator: return 'Administrator';
    }
}

export function AdminRuleForEach(callback: (language: AdminRule) => void) {
    for (var prop in AdminRule) {
        if (AdminRule.hasOwnProperty(prop) && (!isNaN(parseInt(prop)))) {
            callback(parseInt(prop) as AdminRule);
        }
    }
}