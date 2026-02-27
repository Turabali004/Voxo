import { Router } from "express"
import { createTweet } from "./tweet.controller"
import { authenticate } from "../../middleware/auth"

const router = Router()

router.post("/", authenticate, createTweet)

export default router