async function addPlayer(nameArg, timeArg) {
    const placement = document.createElement('div');
    const rank = document.createElement('div');
    const name = document.createElement('div');
    const badges = document.createElement('div');
    const time = document.createElement('div');

    placement.className = 'placement';
    rank.className = 'rank';
    name.className = 'name';
    badges.className = 'badges';
    time.className = 'time';

    rank.textContent = document.querySelector('.leaderboard').childElementCount + 1;
    name.textContent = nameArg;
    badges.textContent = 'N/A';
    time.textContent = timeArg;

    placement.appendChild(rank);
    placement.appendChild(name);
    // placement.appendChild(badges);
    placement.appendChild(time);

    document.querySelector('.leaderboard').appendChild(placement);
}
async function makeRequest(url) {
    const data = await fetch(url);
    const json = await data.json();
    const body = json.body;
    for (i = 0; i < body.length; i++) {
        addPlayer(body[i].displayName, new Date(body[i].score).toISOString().slice(14, 23))
    }
    if (json.next) {
        await makeRequest(json.next);
    }
}

async function main() {
    const data = await fetch(`https://data.ninjakiwi.com/btd6/races/`);
    const json = await data.json();
    const currentRace = json.body.filter(event => event.start < Date.now())[0];
    document.querySelector(".playerCount").innerText = `${currentRace.totalScores}\nTotal\nPlayers`;
    makeRequest(currentRace.leaderboard);
}

document.addEventListener('DOMContentLoaded', function () {
    main();
})