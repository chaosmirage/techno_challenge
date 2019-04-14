const data = [];

for (let i = 0; i < 1; i++) {
    data.push({ id: i, date: new Date(2019, 3, 7, 5).valueOf(), type: 'in' });
}
for (let i = 0; i < 1; i++) {
    data.push({ id: i, date: new Date(2019, 3, 7, 9).valueOf(), type: 'out' });
}

console.log(JSON.stringify(data))
