const token = '';
const TGbot = require('node-telegram-bot-api');
const bot = new TGbot(token, {polling: true});

const sessions = {};

function carve(x, y, map, size) {
    let directions = [
        [0, -1], // вверх
        [0, 1], // вниз
        [-1, 0], // влево
        [1, 0] // вправо
    ];

    // Перемешиваем направления
    directions.sort(() => Math.random() - 0.5);

    for(let i = 0; i < directions.length; i++) {
        let dx = directions[i][0];
        let dy = directions[i][1];

        let nx = x + dx*2;
        let ny = y + dy * 2;

        if (nx >= 0 && nx < size[1] && ny >= 0 && ny < size[0] && map[ny][nx] === '⬛️') {
            if (y + dy !== size[0] && x + dx !== size[1] && ny !== size[0] && nx !== size[1]) {
                map[y+dy][x+dx] = '⬜️';
                map[ny][nx] = '⬜️';
            }
            carve(nx, ny, map, size);
        }
    }
}

const createMap = (heroPosition, size = [20, 20]) => {
    const newMap = [];
    for (let y = 0; y < size[0]; y++) {
        // if (y === size[0] - 1) {
        //     let end = [];

        //     for (let x = 0; x < size[1]; x++) {
        //         end.push('⬛️')
        //     }

        //     newMap.push(end);
        // } else {
            newMap.push([]);
        // }
    }

    newMap.forEach(y => {
        if (y.length === 0) {
            for (let x = 0; x < size[1]; x++) {
                // x === 0 || x === size[1] - 1 ? y.push('⬛️') :
                    y.push('⬛️');
            }
        }
    });

    carve(1, 1, newMap, size);

    //
    let end = [];

    for (let x = 0; x < size[1]; x++) {
        end.push('⬛️')
    }

    newMap.push(end);

    newMap.forEach(y => {
        y.push('⬛️');
    });
    //

    newMap[heroPosition[0]][heroPosition[1]] = '🔘';
    const boxPosition = [(Math.random() * size[0] + 1).toFixed(0), (Math.random() * size[1] + 1).toFixed(0)];
    newMap[boxPosition[0]][boxPosition[1]] = '⚰';

    console.log(newMap);
    return newMap;
};

const mapToText = (map, position) => {
    const visible = 5;
    let cloneMap = JSON.parse(JSON.stringify(map));

    cloneMap = cloneMap.slice(
        position[0] - visible < (cloneMap.indexOf(position[0]) + 1) ? 0 : position[0] - visible, 
        position[0] + visible + 1);

    let stringMap = '';

    cloneMap.forEach(el => {
        el = el.slice(
            position[1] - visible < (el.indexOf(position[1]) + 1) ? 0 : position[1] - visible,
            position[1] + visible + 1);
        el.forEach(el2 => {
            stringMap += el2;
        });

        stringMap += '\n';
    });
    return stringMap;
};

bot.onText(/\/start/, msg => {
    if (sessions[`${msg.chat.id}`]) {
        delete sessions[`${msg.chat.id}`];
    }

    sessions[`${msg.chat.id}`] = {
        hero: {
            position: [1, 1],
            step: 0
        },
        map: createMap([1, 1])
    }
    // console.log(sessions[`${msg.chat.id}`]);
    bot.sendMessage(msg.chat.id,
        `
Ход 0
${mapToText(sessions[`${msg.chat.id}`].map, sessions[`${msg.chat.id}`].hero.position)}
Уровень 1
Здоровье 100`, {
        reply_markup: {
            inline_keyboard: [
                [{text: '', callback_data: 'ее'}, {text: '🔼', callback_data: 'up'}, {text: '', callback_data: 'ее'}],
                [{text: '◀️', callback_data: 'left'}, {text: '🔽', callback_data: 'down'}, {text: '▶️', callback_data: 'right'}]
            ]
        }
    });
});

bot.on('callback_query', query => {
    const { hero, map } = sessions[`${query.message.chat.id}`];
    let prevPosition = [hero.position[0], hero.position[1]];
    
    switch (query.data) {
        case 'up' : 
            if (map[hero.position[0] - 1][hero.position[1]] === '⬛️') {
                bot.answerCallbackQuery(query.id, {
                    text: "По пути стена!",
                    show_alert: true,
                });
                return;
            }
            sessions[`${query.message.chat.id}`].hero.position[0] -= 1;
            break;
        case 'down' : 
            if (map[hero.position[0] + 1][hero.position[1]] === '⬛️') {
                bot.answerCallbackQuery(query.id, {
                    text: "По пути стена!",
                    show_alert: true,
                });
                return;
            }
            sessions[`${query.message.chat.id}`].hero.position[0] += 1;
            break;
        case 'left' : 
            if (map[hero.position[0]][hero.position[1] - 1] === '⬛️') {
                bot.answerCallbackQuery(query.id, {
                    text: "По пути стена!",
                    show_alert: true,
                });
                return;
            }
            sessions[`${query.message.chat.id}`].hero.position[1] -= 1;
            break;
        case 'right' : 
            if (map[hero.position[0]][hero.position[1] + 1] === '⬛️') {
                bot.answerCallbackQuery(query.id, {
                    text: "По пути стена!",
                    show_alert: true,
                });
                return;
            }
            sessions[`${query.message.chat.id}`].hero.position[1] += 1;
            break;
    }

    sessions[`${query.message.chat.id}`].map[hero.position[0]][hero.position[1]] = '🔘';
    sessions[`${query.message.chat.id}`].map[prevPosition[0]][prevPosition[1]] = '⬜️';
    sessions[`${query.message.chat.id}`].hero.step += 1;

    bot.editMessageText(
`
Ход ${sessions[`${query.message.chat.id}`].hero.step}
${mapToText(sessions[`${query.message.chat.id}`].map, sessions[`${query.message.chat.id}`].hero.position)}
Уровень 1
Здоровье 100`, 
{
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        reply_markup: {
            inline_keyboard: [
                [{text: '', callback_data: 'ее'}, {text: '🔼', callback_data: 'up'}, {text: '', callback_data: 'ее'}],
                [{text: '◀️', callback_data: 'left'}, {text: '🔽', callback_data: 'down'}, {text: '▶️', callback_data: 'right'}]
            ]
        }
    });
});