import { CronJob } from 'cron';
import { cleanUpNavigationCalls } from '../controllers/navigation';
import { terminateIdlePendingCalls } from '../controllers/call';

// Default timezone
const TIMEZONE: string = 'Australia/Melbourne';

// Define cron job for cleaning up idle navigation calls
// Run every day, at 11:59:99
new CronJob(
    '99 59 23 * * *',
    async () => {
        try {
            await cleanUpNavigationCalls();
        } catch (err) {
            console.error(err);
        }
    },
    undefined,
    true,
    TIMEZONE
);

// Define cron job for cleaning up pending calls
// Runs every 20 seconds
new CronJob(
    '*/20 * * * * *',
    async () => {
        try {
            await terminateIdlePendingCalls();
        } catch (err) {
            console.error(err);
        }
    },
    undefined,
    true,
    TIMEZONE
);
