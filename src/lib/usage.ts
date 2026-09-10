import prisma from "./prisma";
import { getUserActivePlan, getAICreditBalance } from "./entitlement";

export async function getUserUsage(userId: string) {
  const plan = await getUserActivePlan(userId);

  const [
    projectsCount,
    tasksCount,
    notesCount,
    habitsCount,
    goalsCount,
    docsAggregate,
    aiCreditInfo,
  ] = await Promise.all([
    prisma.project.count({ where: { userId } }),
    prisma.task.count({ where: { userId } }),
    prisma.note.count({ where: { userId } }),
    prisma.habit.count({ where: { userId } }),
    prisma.goal.count({ where: { userId } }),
    prisma.documentItem.aggregate({
      where: { userId },
      _sum: { sizeBytes: true },
    }),
    getAICreditBalance(userId),
  ]);

  const usedStorageBytes = docsAggregate._sum.sizeBytes || 0;
  const usedStorageMb = Number((usedStorageBytes / (1024 * 1024)).toFixed(2));

  // Get plan limit values
  const getLimitVal = (key: string) => {
    const l = plan?.limits.find((item) => item.limitKey === key);
    return l !== undefined ? l.limitValue : 0;
  };

  const limits = {
    projects: getLimitVal("projects"),
    tasks: getLimitVal("tasks"),
    notes: getLimitVal("notes"),
    habits: getLimitVal("habits"),
    goals: getLimitVal("goals"),
    documents_mb: getLimitVal("documents_mb"),
    ai_credits: getLimitVal("ai_credits"),
  };

  return {
    plan: {
      id: plan?.id,
      name: plan?.name,
      slug: plan?.slug,
      priceMonthly: plan?.priceMonthly,
      priceYearly: plan?.priceYearly,
    },
    usage: {
      projects: { current: projectsCount, limit: limits.projects, unlimited: limits.projects === -1 },
      tasks: { current: tasksCount, limit: limits.tasks, unlimited: limits.tasks === -1 },
      notes: { current: notesCount, limit: limits.notes, unlimited: limits.notes === -1 },
      habits: { current: habitsCount, limit: limits.habits, unlimited: limits.habits === -1 },
      goals: { current: goalsCount, limit: limits.goals, unlimited: limits.goals === -1 },
      storageMb: { current: usedStorageMb, limit: limits.documents_mb, unlimited: limits.documents_mb === -1 },
      aiCredits: {
        current: aiCreditInfo.totalUsed,
        balance: aiCreditInfo.balance,
        limit: limits.ai_credits,
        unlimited: limits.ai_credits === -1,
      },
    },
  };
}
