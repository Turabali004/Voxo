
import {prisma} from "../../lib/prisma"

interface CreateTweetInput {
  userId: string
  content: string
  parentTweetId?: string
}

// export const createTweetOrComment = async ({
//   userId,
//   content,
//   parentTweetId,
// }: CreateTweetInput) => {
//   if (!content || content.length > 280) {
//     throw new Error("Tweet content must be between 1 and 280 characters")
//   }

//   return await prisma.$transaction(async (tx) => {
//     // 1️⃣ Validate user
//     const user = await tx.user.findUnique({
//       where: { id: userId },
//       select: { isSuspended: true },
//     })

//     if (!user || user.isSuspended) {
//       throw new Error("User not allowed to tweet")
//     }

//     // 2️⃣ If comment → validate parent tweet
//     if (parentTweetId) {
//       const parentTweet = await tx.tweet.findUnique({
//         where: { id: parentTweetId },
//         select: { id: true },
//       })

//       if (!parentTweet) {
//         throw new Error("Parent tweet not found")
//       }
//     }

//     // 3️⃣ Create tweet or comment
//     const tweet = await tx.tweet.create({
//       data: {
//         content,
//         authorId: userId,
//         parentTweetId: parentTweetId || null,
//       },
//     })

//     // 4️⃣ Update counters
//     if (parentTweetId) {
//       // Comment
//       await tx.tweet.update({
//         where: { id: parentTweetId },
//         data: { commentsCount: { increment: 1 } },
//       })
//     } else {
//       // Root tweet
//       await tx.user.update({
//         where: { id: userId },
//         data: { tweetsCount: { increment: 1 } },
//       })
//     }

//     return tweet
//   })
// }

export const createTweetOrComment = async ({
  userId,
  content,
  parentTweetId,
}: CreateTweetInput) => {
  // 1. Logic Validation (Fast, non-DB)
  if (!content || content.length > 280) {
    throw new Error("Tweet content must be between 1 and 280 characters");
  }

  // 2. Pre-Validation (Outside the Transaction)
  // This frees up the transaction to only handle WRITES.
  const [user, parentTweet] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { isSuspended: true } }),
    parentTweetId ? prisma.tweet.findUnique({ where: { id: parentTweetId }, select: { id: true } }) : Promise.resolve(true)
  ]);

  if (!user || user.isSuspended) throw new Error("User not allowed to tweet");
  if (parentTweetId && !parentTweet) throw new Error("Parent tweet not found");

  // 3. The Actual Write Transaction (Keep it Lean)
  return await prisma.$transaction(async (tx) => {
    const tweet = await tx.tweet.create({
      data: {
        content,
        authorId: userId,
        parentTweetId: parentTweetId || null,
      },
    });

    if (parentTweetId) {
      await tx.tweet.update({
        where: { id: parentTweetId },
        data: { commentsCount: { increment: 1 } },
      });
    } else {
      await tx.user.update({
        where: { id: userId },
        data: { tweetsCount: { increment: 1 } },
      });
    }
    return tweet;
  }, {
    timeout: 10000 // Increase internal timeout to 10s for remote proxies
  });
};