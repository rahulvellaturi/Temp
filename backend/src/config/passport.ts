import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcryptjs';
import { prisma } from './database';

export const configurePassport = () => {
  // Local Strategy for username/password authentication
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: { mfa: true },
          });

          if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          if (!user.isActive) {
            return done(null, false, { message: 'Account is deactivated' });
          }

          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          // Remove password from user object
          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // JWT Strategy for token-based authentication
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET || 'fallback-secret',
      },
      async (payload, done) => {
        try {
          const user = await prisma.user.findUnique({
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
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};