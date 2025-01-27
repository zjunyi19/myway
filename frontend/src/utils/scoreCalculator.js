const DAILY_FIRST_COMPLETION_SCORE = 15;
const DAILY_MAX_SCORE = 50;
const DAILY_COMPLETION_SCORE = 10;
const WEEKLY_COMPLETION_BONUS = 50;
const MIN_DURATION_FOR_FIRST_BONUS = 5; // 分钟

export const calculateScore = (firebaseUid, completion, habit, todayCompletions) => {
    let score = 0;
    if (habit.frequency === 'day') {
        // 检查是否是今天的第一个完成
        const isFirstCompletionToday = todayCompletions.length === 0;

        if (habit.target.unit === 'times') {
            // 如果是第一次完成，且有时长要求
            if (isFirstCompletionToday && completion.duration >= MIN_DURATION_FOR_FIRST_BONUS) {
                return DAILY_FIRST_COMPLETION_SCORE;
            } else {
                // 后续完成奖励固定分数
                return DAILY_COMPLETION_SCORE;
            }
        } else if (habit.target.unit === 'mins' || habit.target.unit === 'hours') {
            // 如果是第一次完成，且时长超过5分钟
            if (completion.duration >= habit.target.amount) {
                if (isFirstCompletionToday) {
                    return DAILY_FIRST_COMPLETION_SCORE;
                } else {
                    return DAILY_COMPLETION_SCORE;
                }
            } else {
                return 0;
            }
        }

        // 检查是否超过每日上限
        const existingScoreToday = todayCompletions.reduce((total, comp) => total + comp.score, 0);
        if (existingScoreToday + score > DAILY_MAX_SCORE) {
            score = Math.max(0, DAILY_MAX_SCORE - existingScoreToday);
        }
    }

    return score;
}