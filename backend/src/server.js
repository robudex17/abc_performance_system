// server.js
const http = require('http')
const { Server } = require('socket.io')
const app = require('./app')
const pool = require('./config/db')

const PORT = process.env.PORT || 3000

const importExportDataRoutes = require('./routes/import_export_data_routes')
const salesTargetShipokRoutes = require('./routes/sales_target_shipok_route')

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: "*" } })

app.use("/api", salesTargetShipokRoutes(io))  // in test, we can pass fake io if needed
app.use("/api", importExportDataRoutes(io))  // in test, we can pass fake io if needed


const startServer = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✅ DB connected')
    connection.release()

    server.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('❌ Failed to start:', err)
  }
}

startServer()
