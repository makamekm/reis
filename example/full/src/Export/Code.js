// Notification messaging
// --- Pattern ---
// TRANSLATION CODE : SYSTEM_NUMBER
// --- SYSTEMS ---
// R: Router
// V: Verification
// A: Authtorization

exports.default = {
    PageNotFound: "R404", // Page has not been found
    DenyAccess: "R401", // Cannot login because wrong login data
    FileInputWrong: "V0", // Page has not been found
    ColorInputWrong: "V1", // Page has not been found
    DateInputWrong: "V2", // Page has not been found
    LanguageInputWrong: "V3", // Page has not been found
    AdminRuleInputWrong: "V4", // Page has not been found
    EmailInputWrong: "V5", // Page has not been found
    UsernameInputWrong: "V6", // Page has not been found
    PasswordInputWrong: "V7", // Page has not been found
    LoginDataWrong: "A0", // Cannot login because wrong login data
    RegistrationDataWrong: "A1", // Cannot login because wrong login data
    CreateUserDataWrong: "A2", // Cannot login because wrong login data
    EditUserDataWrong: "A3", // Cannot login because wrong login data
}