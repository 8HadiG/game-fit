import gplay from 'google-play-scraper';

const CLASH_OF_CLANS = 'com.supercell.clashofclans';
const LORDS_MOBILE = 'com.igg.android.lordsmobile';
const MINECRAFT = 'com.mojang.minecraftpe';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const scrapeApp = async (appId, label) => {
    console.log(`\n========== ${label} (${appId}) ==========\n`);

    try {
        console.log('--- List 1 ---');
        const list1 = await gplay.list({
            collection: 'TOP_FREE',
            category: 'GAME_STRATEGY',
            num: 1,
            throttle: 1
        });
        console.log(list1);
        await sleep(1000);

        console.log('--- List 2 ---');
        const list2 = await gplay.list({
            collection: 'TOP_FREE',
            category: 'GAME_STRATEGY',
            num: 1,
            throttle: 1,
            fullDetail: false
        });
        console.log(list2);
        await sleep(1000);

        console.log('--- Detailed List ---');
        const list3 = await gplay.list({
            collection: 'TOP_FREE',
            category: 'GAME_STRATEGY',
            num: 1,
            throttle: 1,
            fullDetail: true
        });
        console.log(list3);
        await sleep(1000);

        console.log('--- App ---');
        const appDetails = await gplay.app({ appId });
        console.log(JSON.stringify(appDetails, null, 2));
        await sleep(1000);
    } catch (err) {
        console.error(`Error scraping ${label}:`, err.message);
    }
};

const main = async () => {
    const apps = [
        [CLASH_OF_CLANS, 'Clash of Clans'],
        // [LORDS_MOBILE, 'Lords Mobile'],
        // [MINECRAFT, 'Minecraft'],
    ];

    for (const [appId, label] of apps) {
        await scrapeApp(appId, label);
    }
};

main();
