import fastify from 'fastify'

const app = fastify()

app.get('/hello', () => {
  return 'Hello World'
})

app
  .listen({
    port: 3334,
  })
  .then(() => {
    console.log('HTTP Server Running')
  })
