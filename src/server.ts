import fastify from "fastify";
import { knex } from "./database";
import { randomUUID } from "node:crypto";

const app = fastify();

app.get("/hello", async () => {
  const transaction = await knex("transactions")
    .insert({
      id: randomUUID(),
      title: "Transacao de teste",
      amount: 1000,
    })
    .returning("*");

  return transaction;
});

app.get("/hello2", async () => {
  const transaction = await knex("transactions").select("*");

  return transaction;
});

app
  .listen({
    port: 3334,
  })
  .then(() => {
    console.log("HTTP Server Running");
  });
