const token = '';
const TGbot = require('node-telegram-bot-api');
const bot = new TGbot(token, {polling: true});

const sessions = {};

const createMap = (heroPosition, size = [10, 10]) => {
    const newMap = [];
    for (let y = 0; y < size[0]; y++) {
        if (y === 0 || y === size[0] - 1) {
            let end = [];

            for (let x = 0; x < size[1]; x++) {
                end.push('⬛️')
            }

            newMap.push(end);
        } else {
            newMap.push([]);
        }
    }

    newMap.forEach(y => {
        if (y.length === 0) {
            for (let x = 0; x < size[1]; x++) {
                x === 0 || x === size[1] - 1 ? y.push('⬛️') : y.push('⬜️');
            }
        }
    });

    newMap[heroPosition[0]][heroPosition[1]] = '🔘';

    return newMap;
};

const mapToText = (map, position) => {
    const visible = 3;
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

bot.on('message', msg => {
    console.log(msg.chat.id);
    sessions[`${msg.chat.id}`] = {
        hero: {
            position: [3, 3],
            step: 0
        },
        map: createMap([3, 3])
    }
    // console.log(sessions[`${msg.chat.id}`]);
    bot.sendMessage(msg.chat.id, mapToText(sessions[`${msg.chat.id}`].map, sessions[`${msg.chat.id}`].hero.position), {
        reply_markup: {
            inline_keyboard: [
                [{text: '', callback_data: 'ее'}, {text: '🔼', callback_data: 'up'}, {text: '', callback_data: 'ее'}],
                [{text: '◀️', callback_data: 'left'}, {text: '🔽', callback_data: 'down'}, {text: '▶️', callback_data: 'right'}]
            ]
        }
    });
});

bot.on('callback_query', query => {
    const {hero, map} = sessions[`${query.message.chat.id}`];
    
    switch (query.data){
        case 'up' : 
        console.log(map[hero.position[0] - 1][hero.position[1]]);
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
            console.log(map[hero.position[0]][hero.position[1] - 1]);
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
        console.log(map[hero.position[0]][hero.position[1] + 1]);
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

    sessions[`${query.message.chat.id}`].map = createMap([sessions[`${query.message.chat.id}`].hero.position[0], sessions[`${query.message.chat.id}`].hero.position[1]]);
    sessions[`${query.message.chat.id}`].hero.step += 1;

    bot.editMessageText(
`
${mapToText(sessions[`${query.message.chat.id}`].map, sessions[`${query.message.chat.id}`].hero.position)}
Ход ${sessions[`${query.message.chat.id}`].hero.step}`, 
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