"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePassport = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const passport_jwt_1 = require("passport-jwt");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("./database");
const configurePassport = () => {
    // Local Strategy for username/password authentication
    passport_1.default.use(new passport_local_1.Strategy({
        usernameField: 'email',
        passwordField: 'password',
    }, async (email, password, done) => {
        try {
            const user = await database_1.prisma.user.findUnique({
                where: { email: email.toLowerCase() },
                include: { mfa: true },
            });
            if (!user) {
                return done(null, false, { message: 'Invalid email or password' });
            }
            if (!user.isActive) {
                return done(null, false, { message: 'Account is deactivated' });
            }
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
            if (!isValidPassword) {
                return done(null, false, { message: 'Invalid email or password' });
            }
            // Remove password from user object
            const { password: _, ...userWithoutPassword } = user;
            return done(null, userWithoutPassword);
        }
        catch (error) {
            return done(error);
        }
    }));
    // JWT Strategy for token-based authentication
    passport_1.default.use(new passport_jwt_1.Strategy({
        jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET || 'fallback-secret',
    }, async (payload, done) => {
        try {
            const user = await database_1.prisma.user.findUnique({
                where: { id: payload.id },
                include: { mfa: true },
            });
            if (!user) {
                return done(null, false);
            }
            if (!user.isActive) {
                return done(null, false);
            }
            // Remove password from user object
            const { password: _, ...userWithoutPassword } = user;
            return done(null, userWithoutPassword);
        }
        catch (error) {
            return done(error);
        }
    }));
};
exports.configurePassport = configurePassport;
//# sourceMappingURL=passport.js.map