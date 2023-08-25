import fastify from "fastify";
import { transactionsRoutes } from "./routes/transactions";
import { env } from "./env";

const app = fastify();

app.register(transactionsRoutes, {
  prefix: "transactions",
});

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("HTTP Server Running");
  });
