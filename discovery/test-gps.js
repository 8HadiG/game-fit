import gplay from "google-play-scraper";

const limit = Number(process.argv[2]) || 1;

const collections = [
    'TOP_FREE',
    'TOP_PAID',
    'GROSSING'
];

const categories = [
    'GAME',
    'GAME_ACTION',
    'GAME_ADVENTURE',
    'GAME_ARCADE',
    'GAME_BOARD',
    'GAME_CARD',
    'GAME_CASINO',
    'GAME_CASUAL',
    'GAME_EDUCATIONAL',
    'GAME_MUSIC',
    'GAME_PUZZLE',
    'GAME_RACING',
    'GAME_ROLE_PLAYING',
    'GAME_SIMULATION',
    'GAME_SPORTS',
    'GAME_STRATEGY',
    'GAME_TRIVIA',
    'GAME_WORD'
];

async function main(reqps = 5, resps = 1) {
    for (const category of categories) {
        for (const collection of collections) {
            if (collection === 'TOP_PAID' && category === 'GAME_CASINO') {
                continue;
            }

            const res = await gplay.list({
                collection: collection,
                category: category,
                num: limit,
                throttle: reqps
            });

            console.log(`\n\nCategory: ${category}\nCollection: ${collection}\n`, res.map(g => g.title));

            await new Promise(r => setTimeout(r, 1000 / resps));
        }
    }
}

main(2, 2);
