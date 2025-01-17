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

const calculateDailyCompletions = (targetAmount, completions, type) => {
    const dailyCompletions = new Map(); // Store completions by day
    completions.forEach(completion => {
        const dateStr = new Date(completion.date).toDateString();
        let count = 0;
        if (type === 'times') {
            count = (dailyCompletions.get(dateStr) || 0) + 1;
            
        } else {
            count = (dailyCompletions.get(dateStr) || 0) + completion.timeSpend;
        }
        dailyCompletions.set(dateStr, Math.min(count, targetAmount));
    });
    return dailyCompletions;
}

// 计算本周进度
export const calculateWeekProgress = (habit, completions) => {
    // 如果completions为空，返回0
    if (!completions.length) return 0;
  
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
                const dailyCompletions = calculateDailyCompletions(habit.target.amount, completions, "times");

                // Sum up all the capped daily completions
                const totalCappedCompletions = Array.from(dailyCompletions.values())
                    .reduce((sum, count) => sum + count, 0);

                return (totalCappedCompletions/ (habit.target.amount * 7)) * 100
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
                const dailyCompletions = calculateDailyCompletions(targetTimeAmount, completions, "time");

                // Sum up all the capped daily completions
                const totalCappedCompletions = Array.from(dailyCompletions.values())
                    .reduce((sum, time) => sum + time, 0);

                return (totalCappedCompletions / (targetTimeAmount * 7)) * 100
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
                const dailyCompletions = calculateDailyCompletions(habit.target.amount, completedSessions, "times");
                const totalCappedCompletions = Array.from(dailyCompletions.values())
                    .reduce((sum, count) => sum + count, 0);
                return (totalCappedCompletions / (habit.target.amount * 7)) * 100
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
            const dailyCompletions = calculateDailyCompletions(targetTimeAmount, completions, "time");

            // Sum up all the capped daily completions
            const totalCappedCompletions = Array.from(dailyCompletions.values())
                .reduce((sum, time) => sum + time, 0);
            
            return (totalCappedCompletions / (targetTimeAmount * 7)) * 100
        }
    }
}; 



// 计算本周进度
export const calculateDayProgress = (habit, completions) => {
    // 如果completions为空，返回0
    if (!completions.length) return { progress: 0, count: 0};

    const totalTimeThisDay = completions.reduce((sum, c) => sum + c.timeSpend, 0);

    // 如果是times
    if (habit.target.unit === 'times') {
        // 如果timeamount为空，只要显示完成了几次
        if (!habit.target.timeIfUnitIsTime.timeAmount) {
            // 当frequency是week
            // progress = 今天完成次数的和 / （每周目标次数/7）
            if (habit.frequency === 'week') {
                return { progress: (completions.length / (habit.target.amount / 7)) * 100, count: completions.length}
            } 
            // 当frequency是day
            // progress = 今天完成次数 / 每日目标次数
            else {
                return { progress: Math.min(1, completions.length / habit.target.amount) * 100, count: completions.length}
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
            // progress = 今天时长和 / （每周目标时长/7）
            if (habit.frequency === 'week') {
                return { progress: (totalTimeThisDay / (targetTimeAmount / 7)) * 100, count: completions.length}
            } 
            // 当frequency是day
            // progress = 今天目标时长 / 每日目标时长
            else {
                return { progress: Math.min(1, totalTimeThisDay / targetTimeAmount) * 100, count: completions.length}
            }
        } 
        // 如果timeType为each time
        else {
            // 计算多少completion满足了each time的时间
            const completedSessions= completions.filter(c => 
                c.timeSpend >= targetTimeAmount
            );

            // 当frequency是week
            // progress = 今天达到目标次数的和 / （每周目标次数/7）
            if (habit.frequency === 'week') {
                return { progress: (completedSessions.length / (habit.target.amount / 7)) * 100, count: completedSessions.length}
            } 
            
            // 当frequency是day
            // progress = 今天达到目标次数 / 每日目标次数
            else {
                return { progress: Math.min(1, completedSessions.length / habit.target.amount) * 100, count: completedSessions.length}
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
            return { progress: (totalTimeThisDay / (targetTimeAmount / 7)) * 100, count: completions.length}
        } 
        
        // 当frequency是day
        // progress = 今天时长和 / 每日目标时长
        else {
            return { progress: Math.min(1, totalTimeThisDay / targetTimeAmount) * 100, count: completions.length}
        }
    }
}; 




