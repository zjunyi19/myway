export const getWeekStart = () => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
};

export const getWeekEnd = () => {
    const weekEnd = new Date(getWeekStart());
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
}; 

const calculateDailyCompletions = (targetAmount, completions) => {
    const dailyCompletions = new Map(); // Store completions by day
    completions.forEach(completion => {
        const dateStr = new Date(completion.date).toDateString();
        const count = (dailyCompletions.get(dateStr) || 0) + 1;
        dailyCompletions.set(dateStr, Math.min(count, targetAmount));
    });
    return dailyCompletions;
}

const weekStart = getWeekStart(); 
const weekEnd = getWeekEnd();

// 计算本周进度
export const calculateWeekProgress = (habit, completions) => {
    // 如果completions为空，返回0
    if (!completions || !completions.length) return 0;

  
    const totalTimeThisWeek = completions.reduce((sum, c) => sum + c.timeSpend, 0);

    // 如果是times
    if (habit.target.unit === 'times') {
        // 如果timeamount为空，只要显示完成了几次
        if (!habit.target.timeIfUnitIsTime.timeAmount) {
            // 当frequency是week
            // progress = 每天完成次数的和 / 每周目标次数
            if (habit.frequency === 'week') {
                return (completions.length / habit.target.amount) * 100
            } 
            // 当frequency是day
            // 每天最多完成每日目标次数
            // progress = min(每天完成次数的和， 每日目标次书) / (每日目标次书 * 7)
            else {
                // For daily frequency, count how many days met the target amount
                const dailyCompletions = calculateDailyCompletions(habit.target.amount, completions);

                // Sum up all the capped daily completions
                const totalCappedCompletions = Array.from(dailyCompletions.values())
                    .reduce((sum, count) => sum + count, 0);

                return (totalCappedCompletions/ habit.target.amount * 7) * 100
            }
        }
        
        // 如果timeamount不为空
        // convert time amount to seconds
        const targetTimeAmount = habit.target.timeIfUnitIsTime.timeAmount * {
            mins: 60,
            hours: 3600
        }[habit.target.timeIfUnitIsTime.timeUnit]

        // 如果timeType为in total
        if (habit.target.timeIfUnitIsTime.timeType === 'intotal') {

            // 当frequency是week
            // progress = 每天时长和 / 每周目标时长
            if (habit.frequency === 'week') {
                return (totalTimeThisWeek / targetTimeAmount) * 100
            } 
            // 当frequency是day
            // 每天最多完成每日目标时长
            // progress = min(每天时长和， 每日目标时长) / (每日目标时长 * 7)
            else {
                // For daily frequency, count how many days met the target amount
                const dailyCompletions = calculateDailyCompletions(targetTimeAmount, completions);

                // Sum up all the capped daily completions
                const totalCappedCompletions = Array.from(dailyCompletions.values())
                    .reduce((sum, time) => sum + time, 0);

                return (totalCappedCompletions / targetTimeAmount * 7) * 100
            }
        } 
        // 如果timeType为each time
        else {
            // 计算多少completion满足了each time的时间
            const completedSessions= completions.filter(c => 
                c.timeSpend >= targetTimeAmount
            );

            // 当frequency是week
            // progress = 每天达到目标次数的和 / 每周目标次数
            if (habit.frequency === 'week') {
                return (completedSessions.length / habit.target.amount) * 100
            } 
            
            // 当frequency是day
            // 每天最多完成每日目标次数
            // progress = min(每天达到目标次数的和， 每日目标次书) / (每日目标次书 * 7)
            else {
                const dailyCompletions = calculateDailyCompletions(habit.target.amount, completedSessions);
                const totalCappedCompletions = Array.from(dailyCompletions.values())
                    .reduce((sum, count) => sum + count, 0);
                return (totalCappedCompletions / habit.target.amount * 7) * 100
            }
        }
    } 
    // 如果是 mins or hours
    else {
        const targetTimeAmount = habit.target.amount * {
            mins: 60,
            hours: 3600
        }[habit.target.unit]

        // 当frequency是week
        // progress = 每天时长和 / 每周目标时长
        if (habit.frequency === 'week') {
            return (totalTimeThisWeek / targetTimeAmount) * 100
        } 
        
        // 当frequency是day
        // 每天最多完成每日目标时长
        // progress = min(每天时长和， 每日目标时长) / (每日目标时长 * 7)
        else {
            // For daily frequency, count how many days met the target amount
            const dailyCompletions = calculateDailyCompletions(targetTimeAmount, completions);

            // Sum up all the capped daily completions
            const totalCappedCompletions = Array.from(dailyCompletions.values())
                .reduce((sum, time) => sum + time, 0);
            
            return (totalCappedCompletions / targetTimeAmount * 7) * 100
        }
    }
}; 








// 计算单日进度
export const calculateDayProgress = (habit, completions, date) => {
    if (!completions || !completions.length) return { progress: 0, showCheck: false };

    const dayCompletions = completions.filter(c => {
        const completionDate = new Date(c.date);
        return completionDate.toDateString() === date.toDateString();
    });

    if (dayCompletions.length === 0) return { progress: 0, showCheck: false };

    // 计算当天总时间
    const totalTime = dayCompletions.reduce((sum, c) => sum + c.timeSpend, 0);

    // 处理次数类型的目标
    if (habit.target.unit === 'times') {
        // 如果没有时间要求，只要完成就显示对勾
        if (!habit.target.timeIfUnitIsTime.timeAmount) {
            return { progress: (dayCompletions.length / habit.target.amount) * 100, showCheck: dayCompletions.length >= habit.target.amount };
        }

        const targetTimeAmount = habit.target.timeIfUnitIsTime.timeAmount * {
            mins: 60,
            hours: 3600
        }[habit.target.timeIfUnitIsTime.timeUnit]
        
        // 如果frequency是day
        if (habit.frequency === 'day') {
            if (habit.target.timeIfUnitIsTime.timeType === 'each time') {
                const dayCompletedSessions = dayCompletions.filter(c => c.timeSpend >= targetTimeAmount);
                return {
                    progress: (dayCompletedSessions.length / habit.target.amount) * 100,
                    showCheck: dayCompletedSessions.length >= habit.target.amount
                };
            } else {
                return { progress: totalTime / targetTimeAmount * 100, showCheck: totalTime >= targetTimeAmount && dayCompletions.length >= habit.target.amount};
            }
        }
        // 如是frequency是week 
        else {
            if (habit.target.timeIfUnitIsTime.timeType === 'each time') {
                const weekCompletedSessions = dayCompletions.filter(c => c.timeSpend >= targetTimeAmount);
                return { progress: weekCompletedSessions.length > 0 ? 100 : 0, showCheck: weekCompletedSessions.length > 0};
            } else {
                return { progress: dayCompletions.length > 0 ? 100 : 0, showCheck: dayCompletions.length > 0};
            }
        }
    }

    // 处理时间类型的目标（mins 或 hours）
    const targetTime = habit.target.unit === 'hours' ? 
        habit.target.amount * 60 : habit.target.amount;

    if (habit.frequency === 'day') {
        return {
            progress: Math.min((totalTime / targetTime) * 100, 100),
            showCheck: totalTime >= targetTime
        };
    }

    // week 或 month，只要当天有完成就显示对勾
    return { progress: 100, showCheck: true };
};




