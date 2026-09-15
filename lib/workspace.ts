import { prisma } from "./prisma";

export async function getDefaultWorkspace() {
  return prisma.workspace.upsert({
    where: { id: "default-workspace" },
    update: {},
    create: {
      id: "default-workspace",
      name: process.env.DEFAULT_WORKSPACE_NAME || "My Workspace",
    },
  });
}
