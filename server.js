let express = require('express')
let app = express()

app.all('/', (req, res) => {
  res.send('bot is running...')
})
function keepAlive() {
app.listen(4200, () => console.log('server is ready!!'))
}
module.exports = keepAlive