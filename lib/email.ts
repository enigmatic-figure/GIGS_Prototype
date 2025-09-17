import { mkdir, writeFile } from "fs/promises";
import path from "path";

const EMAIL_DIR = path.join("/tmp", "emails");

export type EmailStubPayload = {
  to: string;
  subject: string;
  body: string;
};

export async function writeEmailStub(payload: EmailStubPayload): Promise<string> {
  await mkdir(EMAIL_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeSubject = payload.subject.replace(/[^a-z0-9\-]+/gi, "_").slice(0, 50);
  const filename = `${timestamp}-${safeSubject || "message"}.txt`;
  const filePath = path.join(EMAIL_DIR, filename);
  const content = [`To: ${payload.to}`, `Subject: ${payload.subject}`, "", payload.body].join("\n");
  await writeFile(filePath, content, "utf8");
  return filePath;
}
