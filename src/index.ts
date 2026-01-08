import "dotenv/config";
import Fastify from "fastify";
import { authenticateUser } from "./ldap";

const fastify = Fastify({ logger: true });

fastify.post("/login", async (request, reply) => {
  const { uid, password } = request.body as {
    uid: string;
    password: string;
  };

  if (!uid || !password) {
    return reply.code(400).send({
      success: false,
      message: "uid and password required"
    });
  }

  const user = await authenticateUser(uid, password);

  if (!user) {
    return reply.code(401).send({
      success: false,
      message: "Invalid credentials"
    });
  }

  return { success: true, user };
});

const port = Number(process.env.PORT ?? 3000);
fastify.listen({ port, host: "0.0.0.0" });
