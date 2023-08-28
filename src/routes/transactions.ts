import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const { sessionId } = req.cookies;

      const transactions = await knex("transactions")
        .where("session_id", sessionId)
        .select();

      return { transactions };
    },
  );

  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },

    async (req, res) => {
      const { sessionId } = req.cookies;

      const getTransactionsParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const params = getTransactionsParamsSchema.safeParse(req.params);

      if (params.success) {
        const transaction = await knex("transactions")
          .where({
            session_id: sessionId,
            id: params.data.id,
          })
          .first();
        return res.status(200).send({ transaction });
      }

      return res.status(404).send({
        error: {
          message: "ID not found",
        },
      });
    },
  );

  app.get(
    "/summary",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const { sessionId } = req.cookies;

      const summary = await knex("transactions")
        .where("session_id", sessionId)
        .sum("amount", { as: "amount" })
        .first();

      return { summary };
    },
  );

  app.post("/", async (req, res) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(req.body);

    let sessionId = req.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      res.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // CLEAN CODE - 7 Dias
      });
    }

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId,
    });

    return res.status(201).send();
  });
}
