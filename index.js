const HOUR = 3600000;

/**
 * Проверяет, что час входа не был в рамках запрещенного времени.
 * @param {number} hours
 * @returns {boolean} В рамках запрещенного времени?
 */
const checkHours = date => {
    const hours = date.getHours();
    return hours < 6 || hours >= 23;
}

/**
 * Проверяет6 не был ли вход совершен в предыдущий день.
 * @param {Date} item 
 * @param {Date} prevItem 
 * @returns {boolean} Вход был в предыдущий день?
 */
const inWasAtPrevDay = (item, prevItem) => {
    const itemDate = item.getDate();
    const prevItemDate = prevItem.getDate();
    return prevItemDate < itemDate;  
}

/**
 * Сравнивает дату выхода с датой входа.
 * @param {Date} item 
 * @param {Date} prevItem 
 * @returns {boolean} Подозрительный выход?
 */
const deepCompare = (item, prevItem) => {
    const prevItemHours = prevItem.getHours();
    return prevItemHours < 6 || inWasAtPrevDay(item, prevItem);  
}

/**
 * Проверяет дату выхода на подозрительность.
 * @param {Date} item - Дата выхода.
 * @param {Date} prevItem - Предыдущая запись (выход/вход).
 * @returns {boolena} Запись о выходе подозрительная? 
 */
const checkOut = (item, prevItem) => checkHours(item) || deepCompare(item, prevItem);

/**
 * Группирует данные по юзерам.
 * @param {Array<{ id: number, date: number, type: string}>} data - Входные данные.
 * @param {(number | Date)} dateStart - Дата начала периода.
 * @param {(number | Date)} dateEnd - Дата конца периода.
 * @returns {Object} Сдгруппированые по юзерам данные о входах и выходах.
 */
const group = (data, dateStart, dateEnd) => {
    const store = {};

    for (let i = 0; i < data.length; i++) {
        const item = data[i];

        // Запись входит в период?
        if (item.date >= dateStart && item.date <= dateEnd) {
            item.date = new Date(item.date);

            const collection = store[item.id] || [];
            store[item.id] = [...collection, item];
        }
    }

    return store;
}

/**
 * Подсчитывает сколько каждый пользователь провел времени в помещении и выявляет подозрительную активность.
 * @param {Array<{ id: number, date: number, type: string}>} data - Входные данные.
 * @param {(number | Date)} dateStart - Дата начала периода.
 * @param {(number | Date)} dateEnd - Дата конца периода.
 * @returns {Array<{ id: number, time: number, hasSuspiciousVisits: boolean }>}
 */
const buildVisitStatistics = (data, dateStart, dateEnd) => {
    const result = [];

    const store = group(data, dateStart, dateEnd);

    for (let key in store) {
        const records = store[key];

        if (records.length > 0) {
            let periodStart = dateStart;
            let prevType = 'out';

            const sortedRecords = records.sort((a, b) => a.date - b.date);
            const resultForPerson = { id: key, time: 0, hasSuspiciousVisits: false };
            
            for (let j = 0; j < sortedRecords.length; j++) {
                const i = sortedRecords[j];
                const prevItem = sortedRecords[j -1];

                // Выход без входа, не считаем.
                if (i.type === 'out' && (!prevItem || prevItem.type !== 'in')) {
                    resultForPerson.hasSuspiciousVisits = true;  
                } else {
                    const isSuspiciousRecord = i.type === 'in' ? checkHours(i.date) : checkOut(i.date, prevItem.date);
                
                    if (isSuspiciousRecord) {
                        resultForPerson.hasSuspiciousVisits = true;
                    }

                    switch (true) {
                        case i.type === 'in' && prevType === 'out': {
                            periodStart = i.date;
                            prevType = 'in';
                            break;
                        }
                        case i.type === 'out' && prevType === 'in': {
                            resultForPerson.time += (i.date - periodStart)/HOUR;   
                            prevType = 'out';
                            break;
                        }
                    }
                }
            }
            
            result.push(resultForPerson);
        }
    }

    // Выводим только тех, кто был в помещении.
    return result.filter(i => i.time > 0);
}

module.exports = buildVisitStatistics;
