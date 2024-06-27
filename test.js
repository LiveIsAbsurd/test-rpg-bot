const size = [10, 10];

const newMap = [];
    for (let y = 0; y < size[0]; y++) {
        if (y === 0) {
            let end = [];

            for (let x = 0; x < size[1]; x++) {
                end.push('#')
            }

            newMap.push(end);
        } else if (y === size[0] - 1) {
            let end = [];

            for (let x = 0; x < size[1]; x++) {
                end.push('#')
            }

            newMap.push(end);
        } else {
            newMap.push([]);
        }
    }

    console.log(newMap);

    newMap.forEach(y => {
        if (y.length === 0) {
            for (let x = 0; x < size[1]; x++) {
                x === 0 || x === size[1] - 1 ? y.push(['#']) : y.push(['   ']);
            }
        }
    });

    console.log(newMap);