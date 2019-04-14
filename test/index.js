const expect = require('expect.js');

const buildVisitStatistics = require('../index');
const correctData = require('./correct_data.json');
const outWithoutIn = require('./outWithoutIn.json');
const earlyIn = require('./earlyIn.json');
const lateOut = require('./lateOut.json');
const wasInBuildingAtNight = require('./wasInBuildingAtNight.json');

const start = new Date(2019, 3, 5).valueOf();
const end = new Date(2019, 3, 8).valueOf();

describe('Функция buildVisitStatistics:', () => {
    it('Возвращает [], когда нет данных за период.', () => {
        expect(buildVisitStatistics(
            correctData,
            new Date(2019, 4, 5).valueOf(),
            new Date(2019, 4, 8).valueOf()
        )).to.be.eql([]);
    });

    it('Верно подсчитывает проведенное в здании время.', () => {
        expect(buildVisitStatistics(correctData, start, end)).to.be.eql([
            { id: 0, time: 16, hasSuspiciousVisits: false },
            { id: 1, time: 16, hasSuspiciousVisits: false },
            { id: 2, time: 16, hasSuspiciousVisits: false }
        ]);
    });

    it('Указывает на подозрительную активность при несовпадении числа входов и выходов.', () => {
        const result = buildVisitStatistics([...outWithoutIn, ...correctData], start, end);
        expect(result.sort((a, b) => a.id - b.id)).to.be.eql([
            { id: 0, time: 16, hasSuspiciousVisits: true },
            { id: 1, time: 16, hasSuspiciousVisits: false },
            { id: 2, time: 16, hasSuspiciousVisits: false },
        ]);
    });

    it('Указывает на подозрительную активность при нахождении в помещении после до 06:00.', () => {
        expect(buildVisitStatistics([...earlyIn, ...correctData], start, end).sort((a, b) => a.id - b.id)).to.be.eql([
            { id: 0, time: 20, hasSuspiciousVisits: true },
            { id: 1, time: 16, hasSuspiciousVisits: false },
            { id: 2, time: 16, hasSuspiciousVisits: false }
        ]);
    });

    it('Указывает на подозрительную активность при нахождении в помещении после 23:00.', () => {
        expect(buildVisitStatistics([...lateOut, ...correctData], start, end).sort((a, b) => a.id - b.id)).to.be.eql([
            { id: 0, time: 30.5, hasSuspiciousVisits: true },
            { id: 1, time: 16, hasSuspiciousVisits: false },
            { id: 2, time: 16, hasSuspiciousVisits: false }
        ]);
    });

    it('Указывает на подозрительную активность при нахождении в помещении с 23:00 до 6:00.', () => {
        expect(buildVisitStatistics([...wasInBuildingAtNight, ...correctData], start, end).sort((a, b) => a.id - b.id)).to.be.eql([
            { id: 0, time: 16, hasSuspiciousVisits: false },
            { id: 1, time: 16, hasSuspiciousVisits: false },
            { id: 2, time: 16, hasSuspiciousVisits: false },
            { id: 5, time: 10, hasSuspiciousVisits: true },
        ]);
    });
});
