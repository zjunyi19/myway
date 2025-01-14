// 计算本周进度
export const calculateWeekProgress = (habit, completions) => {
    // 如果completions为空，返回0
    if (!completions || !completions.length) return { progress: 0, showCheck: false };

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    // 得到所有在本周完成的completions
    const weekCompletions = completions.filter(c => {
        const date = new Date(c.date);
        return date >= weekStart && date <= weekEnd;
    });

    if (weekCompletions.length === 0) return { progress: 0, showCheck: false };

    const totalTimeThisWeek = weekCompletions.reduce((sum, c) => sum + c.timeSpend, 0);

    
    // 如果是times
    if (habit.target.unit === 'times') {
        // 如果timeamount为空
        if (!habit.target.timeIfUnitIsTime.timeAmount) {
            if (habit.frequency === 'week') {
                return { progress: (weekCompletions.length / habit.target.amount) * 100, showCheck: weekCompletions.length >= habit.target.amount };
            } else {
                // For daily frequency, count how many days met the target amount
                const dailyCompletions = new Map(); // Store completions by day
                weekCompletions.forEach(completion => {
                    const dateStr = new Date(completion.date).toDateString();
                    const count = (dailyCompletions.get(dateStr) || 0) + 1;
                    dailyCompletions.set(dateStr, Math.min(count, habit.target.amount));
                });

                // Sum up all the capped daily completions
                const totalCappedCompletions = Array.from(dailyCompletions.values())
                    .reduce((sum, count) => sum + count, 0);

                return { progress: (totalCappedCompletions/ habit.target.amount * 7) * 100, showCheck: totalCappedCompletions >= habit.target.amount * 7 };
            }
        }
        
        // 如果timeamount不为空
        // convert time amount to seconds
        const targetTimeAmount = habit.target.timeIfUnitIsTime.timeAmount * {
            mins: 60,
            hours: 3600
        }[habit.target.timeIfUnitIsTime.timeUnit]

        // 3 times every day 1 min each time
        // 3 times every week 1 min each time

        // 如果timeType为in total
        if (habit.target.timeIfUnitIsTime.timeType === 'intotal') {
            if (habit.frequency === 'week') {
                return { progress: (totalTimeThisWeek / targetTimeAmount) * 100, showCheck: totalTimeThisWeek >= targetTimeAmount };
            } else {
                // For daily frequency, count how many days met the target amount
                const dailyCompletions = new Map(); // Store completions by day
                weekCompletions.forEach(completion => {
                    const dateStr = new Date(completion.date).toDateString();
                    const count = (dailyCompletions.get(dateStr) || 0) + completion.timeSpend;
                    dailyCompletions.set(dateStr, Math.min(count, targetTimeAmount));
                });

                // Sum up all the capped daily completions
                const totalCappedCompletions = Array.from(dailyCompletions.values())
                    .reduce((sum, time) => sum + time, 0);

                return { progress: (totalCappedCompletions / targetTimeAmount * 7) * 100, showCheck: totalTimeThisWeek >= targetTimeAmount * 7 };
            }
        } 
        // 如果timeType为each time
        else {
            // 计算多少completion满足了each time的时间
            const completedSessions= weekCompletions.filter(c => 
                c.timeSpend >= targetTimeAmount
            );
            if (habit.frequency === 'week') {
                return { progress: (completedSessions.length / habit.target.amount) * 100, showCheck: completedSessions.length >= habit.target.amount };
            } else {
                const dailyCompletions = new Map(); // Store completions by day
                completedSessions.forEach(completion => {
                    const dateStr = new Date(completion.date).toDateString();
                    const count = (dailyCompletions.get(dateStr) || 0) + 1;
                    dailyCompletions.set(dateStr, Math.min(count, habit.target.amount));
                });

                // Sum up all the capped daily completions
                const totalCappedCompletions = Array.from(dailyCompletions.values())
                    .reduce((sum, count) => sum + count, 0);
                return { progress: (totalCappedCompletions / habit.target.amount * 7) * 100, showCheck: totalCappedCompletions >= habit.target.amount * 7 };
            }
        }
    } 
    // 如果是 mins or hours
    else {
        const targetTimeAmount = habit.target.amount * {
            mins: 60,
            hours: 3600
        }[habit.target.unit]

        if (habit.frequency === 'week') {
            return { progress: (totalTimeThisWeek / targetTimeAmount) * 100, showCheck: totalTimeThisWeek >= targetTimeAmount };
        } else {
            // For daily frequency, count how many days met the target amount
            const dailyCompletions = new Map(); // Store completions by day
            weekCompletions.forEach(completion => {
                const dateStr = new Date(completion.date).toDateString();
                const count = (dailyCompletions.get(dateStr) || 0) + completion.timeSpend;
                dailyCompletions.set(dateStr, Math.min(count, targetTimeAmount));
            });

            // Sum up all the capped daily completions
            const totalCappedCompletions = Array.from(dailyCompletions.values())
                .reduce((sum, time) => sum + time, 0);
            
            return { progress: (totalCappedCompletions / targetTimeAmount * 7) * 100, showCheck: totalCappedCompletions >= targetTimeAmount * 7 };
        }
    }
}; 








// 计算单日进度
// export const calculateDayProgress = (habit, completions, date) => {
//     if (!completions || !completions.length) return { progress: 0, showCheck: false };

//     const dayCompletions = completions.filter(c => {
//         const completionDate = new Date(c.date);
//         return completionDate.toDateString() === date.toDateString();
//     });

//     if (dayCompletions.length === 0) return { progress: 0, showCheck: false };

//     // 计算当天总时间
//     const totalTime = dayCompletions.reduce((sum, c) => sum + c.timeSpend, 0);

//     // 处理次数类型的目标
//     if (habit.target.unit === 'times') {
//         // 如果没有时间要求，只要完成就显示对勾
//         if (!habit.target.timeIfUnitIsTime.timeAmount) {
//             return { progress: (dayCompletions.length / habit.target.amount) * 100, showCheck: dayCompletions.length >= habit.target.amount };
//         }

//         const targetTimeAmount = habit.target.timeIfUnitIsTime.timeAmount * {
//             mins: 60,
//             hours: 3600
//         }[habit.target.timeIfUnitIsTime.timeUnit]
        
//         // 如果frequency是day
//         if (habit.frequency === 'day') {
//             if (habit.target.timeIfUnitIsTime.timeType === 'each time') {
//                 const dayCompletedSessions = dayCompletions.filter(c => c.timeSpend >= targetTimeAmount);
//                 return {
//                     progress: (dayCompletedSessions.length / habit.target.amount) * 100,
//                     showCheck: dayCompletedSessions.length >= habit.target.amount
//                 };
//             } else {
//                 return { progress: totalTime / targetTimeAmount * 100, showCheck: totalTime >= targetTimeAmount && dayCompletions.length >= habit.target.amount};
//             }
//         }
//         // 如是frequency是week 
//         else {
//             if (habit.target.timeIfUnitIsTime.timeType === 'each time') {
//                 const weekCompletedSessions = dayCompletions.filter(c => c.timeSpend >= targetTimeAmount);
//                 return { progress: weekCompletedSessions.length > 0 ? 100 : 0, showCheck: weekCompletedSessions.length > 0};
//             } else {
//                 return { progress: dayCompletions.length > 0 ? 100 : 0, showCheck: dayCompletions.length > 0};
//             }
//         }
//     }

//     // 处理时间类型的目标（mins 或 hours）
//     const targetTime = habit.target.unit === 'hours' ? 
//         habit.target.amount * 60 : habit.target.amount;

//     if (habit.frequency === 'day') {
//         return {
//             progress: Math.min((totalTime / targetTime) * 100, 100),
//             showCheck: totalTime >= targetTime
//         };
//     }

//     // week 或 month，只要当天有完成就显示对勾
//     return { progress: 100, showCheck: true };
// };




