import type { Request, Response } from "express"
import { createTweetOrComment } from "./tweet.service"

export const createTweet = async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId
        console.log("userId", userId)
        console.log("userId in createTweet", req.user.userId)
        const { content, parentTweetId } = req.body

        const tweet = await createTweetOrComment({
            userId,
            content,
            parentTweetId,
        })

        res.status(201).json({
            success: true,
            data: tweet,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Internal server error" })

    }
}

