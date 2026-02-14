import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/api/auth/google/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0].value;
      
      // 1. Check if user already exists (by googleId or email)
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { googleId: profile.id },
            { email: email }
          ]
        }
      });

      if (user) {
        // 2. If user exists but has no googleId, link the account
        if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId: profile.id, avatar: profile.photos?.[0].value }
          });
        }
        return done(null, user);
      }

      // 3. If user doesn't exist, create a new one
      user = await prisma.user.create({
        data: {
          email: email!,
          googleId: profile.id,
          name: profile.displayName,
          avatar: profile.photos?.[0].value,
        }
      });

      return done(null, user);
    } catch (error) {
      return done(error as Error, undefined);
    }
  }
));

// Essential for session handling
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});