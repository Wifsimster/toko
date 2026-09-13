import { describe, it, expect } from "vitest";
import { z } from "zod";
import { ValidationError, parseValue } from "../lib/http/validate";
import { app } from "../app";

// One validation contract for the whole API: handlers raise, the error
// handler renders. These assertions are what stops a third 422 shape from
// growing back.

const schema = z.object({ email: z.string().email() });

describe("parseValue", () => {
  it("returns parsed data on success", () => {
    expect(parseValue(schema, { email: "a@b.fr" })).toEqual({
      email: "a@b.fr",
    });
  });

  it("throws a ValidationError carrying the flattened issues", () => {
    try {
      parseValue(schema, { email: "nope" });
      throw new Error("expected a ValidationError");
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      const e = err as ValidationError;
      expect(e.status).toBe(422);
      expect(e.code).toBe("VALIDATION");
      expect(e.message).toBe("Données invalides");
      expect(e.details.fieldErrors).toHaveProperty("email");
    }
  });

  it("lets an endpoint say something more useful than the default", () => {
    try {
      parseValue(schema, {}, "Message invalide");
      throw new Error("expected a ValidationError");
    } catch (err) {
      expect((err as ValidationError).message).toBe("Message invalide");
    }
  });
});

describe("the rendered 422", () => {
  it("is the same shape for every route", async () => {
    const res = await app.request("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nope" }),
    });

    expect(res.status).toBe(422);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.error).toBe("Données invalides");
    expect(body.code).toBe("VALIDATION");
    expect(body).toHaveProperty("details");
  });
});
