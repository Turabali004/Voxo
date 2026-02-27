import express from 'express'
import morgan from "morgan"
import { responseLogger } from './middleware/logger'
const app = express()
// app.use(morgan("dev"))
app.use(responseLogger)


// routes
import authRoutes from "./common/routes/auth.routes"
import tweetRoutes from "./controllers/Tweets/tweet.routes"

app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/tweets", tweetRoutes)


app.get('/check', (req: any, res: any) => {
      res.json({message: "resonse ok"})
})

export {app}