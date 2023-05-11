let format = true;

/*
EXPERIMENTAL STUFF
let flagTime = 0;

async function handleFlagTime(leaderboard, leaderboardKey) {
    if (leaderboardKey == 'leaderboard') {
        console.log(leaderboard);
        // const data = await fetch(leaderboard);
    }
    if (leaderboardKey == 'leaderboard_standard_players_1') {
        if (leaderboard.bossType == 'bloonarius') flagTime = 34250;
        if (leaderboard.bossType == 'lych') flagTime = 186660;
        if (leaderboard.bossType == 'vortex') flagTime = 36250;
        if (leaderboard.bossType == 'dreadbloon') flagTime = 34250;
    }
    if (leaderboardKey == 'leaderboard_elite_players_1') {
        if (leaderboard.bossType == 'bloonarius') flagTime = 30250;
        if (leaderboard.bossType == 'lych') flagTime = 246850;
        if (leaderboard.bossType == 'vortex') flagTime = 36250;
        if (leaderboard.bossType == 'dreadbloon') flagTime = 34250;
    }
}
*/

async function addPlayer(nameArg, timeArg) {
    const placement = document.createElement('div');
    const rank = document.createElement('div');
    const name = document.createElement('div');
    const badges = document.createElement('div');
    const time = document.createElement('div');

    placement.className = 'placement';
    rank.className = 'rank';
    name.className = 'name';
    time.className = 'time';

    rank.textContent = document.querySelector('.leaderboard').childElementCount + 1;
    name.textContent = nameArg;
    // if (timeArg < flagTime) {
    //     placement.style.backgroundColor = 'red';
    // }
    badges.textContent = 'N/A';
    time.textContent = timeArg;

    placement.appendChild(rank);
    placement.appendChild(name);
    placement.appendChild(time);

    document.querySelector('.leaderboard').appendChild(placement);
}
async function makeRequest(url) {
    const data = await fetch(url);
    const json = await data.json();
    const body = json.body;
    if (format) {
        for (i = 0; i < body.length; i++) {
            addPlayer(body[i].displayName, new Date(body[i].score).toISOString().slice(14, 23));
        }
    } else {
        for (i = 0; i < body.length; i++) {
            addPlayer(body[i].displayName, body[i].score);
        }
    }
    await makeRequest(json.next);
}

async function main(url, totalKey, leaderboardKey) {
    const data = await fetch(`https://data.ninjakiwi.com/btd6/${url}`);
    const json = await data.json();
    const currentLeaderboard = json.body.filter(event => event.start < Date.now())[0];
    //handleFlagTime(currentLeaderboard, leaderboardKey);
    document.querySelector(".playerCount").innerText = `${currentLeaderboard[totalKey]}\nTotal\nEntries`;
    makeRequest(currentLeaderboard[leaderboardKey]);
}

document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            window.location.replace(`./?lb=${button.id}`)
        });
    })
    const currentLeaderboard = new URLSearchParams(window.location.search).get('lb') || null;
    if (currentLeaderboard === null) return;
    const button = document.getElementById(currentLeaderboard);
    button.style.backgroundColor = 'yellow';
    document.getElementsByClassName('label')[1].innerText = 'Player Name';
    document.getElementsByClassName('label')[6].innerText = 'Best Time';
    switch (button.id) {
        case 'race':
            format = true;
            main('races', 'totalScores', 'leaderboard');
            break;
        case 'normalboss':
            format = true;
            main('bosses', 'totalScores_standard', 'leaderboard_standard_players_1');
            break;
        case 'eliteboss':
            format = true;
            main('bosses', 'totalScores_elite', 'leaderboard_elite_players_1');
            break;
        case 'ctplayers':
            format = false;
            document.getElementsByClassName('label')[6].innerText = 'Score';
            main('ct', 'totalScores_player', 'leaderboard_player');
            break;
        case 'ctteams':
            format = false;
            document.getElementsByClassName('label')[1].innerText = 'Team Name';
            document.getElementsByClassName('label')[6].innerText = 'Score';
            main('ct', 'totalScores_team', 'leaderboard_team');
            break;
    }
});