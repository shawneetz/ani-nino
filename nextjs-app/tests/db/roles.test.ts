import { afterAll, describe, expect, it } from "vitest";
import { appPool, closePools, expectDbError } from "./helpers";

afterAll(closePools);

const BLOCKED = ["42501", "25006"];

describe("anino_app is read-only", () => {
  it("can SELECT", async () => {
    const { rows } = await appPool.query("SELECT count(*)::int AS n FROM pins");
    expect(typeof rows[0].n).toBe("number");
  });

  it("cannot INSERT", async () => {
    await expectDbError(
      appPool.query(
        "INSERT INTO sources (id, title, publisher, kind) VALUES ('x', 'x', 'x', 'news')",
      ),
      BLOCKED,
    );
  });

  it("cannot UPDATE", async () => {
    await expectDbError(appPool.query("UPDATE pins SET title = 'changed'"), BLOCKED);
  });

  it("cannot DELETE", async () => {
    await expectDbError(appPool.query("DELETE FROM pins"), BLOCKED);
  });

  it("cannot create tables", async () => {
    await expectDbError(appPool.query("CREATE TABLE evil (x int)"), BLOCKED);
  });

  it("has read-only and short-statement-timeout defaults", async () => {
    const readOnly = await appPool.query("SHOW default_transaction_read_only");
    const statementTimeout = await appPool.query("SHOW statement_timeout");
    expect(readOnly.rows[0].default_transaction_read_only).toBe("on");
    expect(statementTimeout.rows[0].statement_timeout).toBe("5s");
  });
});
