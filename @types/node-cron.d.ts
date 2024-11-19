declare module "node-cron" {
  type ScheduleCallback = () => void;

  interface ScheduledTask {
    start: () => void;
    stop: () => void;
    destroy: () => void;
  }

  function schedule(
    cronExpression: string,
    callback: ScheduleCallback,
    options?: { timezone?: string }
  ): ScheduledTask;

  export = {
    schedule,
  };
}
