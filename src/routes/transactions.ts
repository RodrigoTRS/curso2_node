import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";

export async function transactionsRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const transactions = await knex("transactions").select();

    return { transactions };
  });

  app.get("/:id", async (req, res) => {
    const getTransactionsParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const params = getTransactionsParamsSchema.safeParse(req.params);

    if (params.success) {
      const transaction = await knex("transactions")
        .where("id", params.data.id)
        .first();
      return res.status(200).send({ transaction });
    }

    return res.status(404).send({
      error: {
        message: "ID not found",
      },
    });
  });

  app.post("/", async (req, res) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(req.body);

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
    });

    return res.status(201).send();
  });
}
