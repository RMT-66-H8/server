const express = require('express')
const cors = require('cors')
const cartRouter = require('./router/cart')
const app = express()
const port = 3000

app.use(express.json())
app.use(cors())

app.use(cartRouter)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
