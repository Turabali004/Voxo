import 'dotenv/config'
import { app } from "./app"

app.listen(process.env.PORT, () => {
    console.log(`Server listening on http://localhost:${process.env.PORT}`)
})

