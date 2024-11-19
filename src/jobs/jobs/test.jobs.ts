import cron from "node-cron";

export default function registerTestJobs() {
  testJob();
}

function testJob() {
  cron.schedule("*/10 * * * * *", () => {
    console.log("running a task every 10 seconds");
  });
}
