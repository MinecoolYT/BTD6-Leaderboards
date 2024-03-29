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

function removeLeadingHour(formattedTime) {
    if (formattedTime.startsWith("00:")) return formattedTime.slice(3);
    return formattedTime;
}

async function addPlayer(nameArg, primaryScore, primaryScoreType, secondaryScore) {
    const placement = document.createElement('div');
    const rank = document.createElement('div');
    const name = document.createElement('div');
    const badges = document.createElement('div');
    const firstScore = document.createElement('div');
    const secondScore = document.createElement('div');

    placement.className = 'placement';
    rank.className = 'rank';
    name.className = 'name';
    firstScore.className = 'primaryScore';
    secondScore.className = 'secondaryScore';

    rank.textContent = document.querySelector('.leaderboard').childElementCount + 1;
    name.textContent = nameArg;
    // if (scoreOne < flagTime) {
    //     placement.style.backgroundColor = 'red';
    // }
    badges.textContent = 'N/A';
    if (primaryScoreType === "Cash Spent") primaryScore = `$${primaryScore}`;
    if (primaryScoreType === "Tiers") primaryScore = `${primaryScore} Tiers`;
    firstScore.textContent = primaryScore;
    secondScore.textContent = secondaryScore;

    placement.appendChild(rank);
    placement.appendChild(name);
    placement.appendChild(firstScore);
    placement.appendChild(secondScore);

    document.querySelector('.leaderboard').appendChild(placement);
}

async function makeRequest(url, key) {
    const data = await fetch(url);
    const json = await data.json();
    const body = json.body;
    fullData.push(...body);
    if (body[0].scoreParts?.[0].type === "number") {
        for (i = 0; i < body.length; i++) {
            addPlayer(body[i].displayName, body[i].score, body[0].scoreParts[0].name, removeLeadingHour(new Date(body[i].scoreParts[1].score).toISOString().slice(11, 23)));
        }
    }
    else if (format) {
        for (i = 0; i < body.length; i++) {
            addPlayer(body[i].displayName, removeLeadingHour(new Date(body[i].score).toISOString().slice(11, 23)));
        }
    } else {
        for (i = 0; i < body.length; i++) {
            addPlayer(body[i].displayName, body[i].score);
        }
    }
    if (json.next) return await makeRequest(json.next, key);
    console.log(structuredClone(fullData));
    console.info("%cFull Raw Data for your Convenience :)", "font-size: 20px; color:red");
    const csv = fullData.map(json => {
        try {
            json.scoreParts.forEach(scorePart => {
                json[scorePart.name] = scorePart.score;
            });
            delete json.scoreParts;
        } catch (err) { }
        return Object.values(json).join(',');
    })
    const download = document.querySelector('a');
    download.style.display = "block";
    download.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(`${Object.keys(fullData[0]).join(',')}\r\n${csv.join('\r\n')}`));
    download.setAttribute('download', `${key}.csv`);
}

let fullData = [];

async function fetchSpecificWeek(availableLeaderboards, totalScoresKey, leaderboardKey) {
    const selectedWeek = new URLSearchParams(window.location.search).get('week');
    const currentLeaderboard = availableLeaderboards.filter(event => event.name == selectedWeek)[0] || availableLeaderboards.filter(event => event.id == selectedWeek)[0] || availableLeaderboards.filter(event => event.start < Date.now())[0];

    if (!(availableLeaderboards.filter(event => event.id == selectedWeek).length || availableLeaderboards.filter(event => event.name == selectedWeek).length) && selectedWeek) {
        const warningMessage = document.createElement('div');
        warningMessage.textContent = "You did not enter a valid week. Click to default to current week";
        warningMessage.style.textAlign = "center";
        warningMessage.addEventListener("click", () => {
            const url = new URL(window.location.href);
            const params = url.searchParams;
            params.set("week", availableLeaderboards.filter(event => event.start < Date.now())[0].id)
            window.location.href = url.origin + url.pathname + '?' + params.toString();
        })
        document.querySelector('.leaderboard').appendChild(warningMessage);
        return;
    }

    // handleFlagTime(currentLeaderboard, leaderboardKey);
    if (currentLeaderboard.end - Date.now() >= 0) document.querySelector(".timeLeft").style.display = "block";
    const endTimeInMilliseconds = new Date(currentLeaderboard.end - Date.now());
    document.querySelector(".timeLeft").innerText = `Event Ends in:\n${endTimeInMilliseconds > 86400000 ? Math.floor(endTimeInMilliseconds / 3600000) + " Hours" : endTimeInMilliseconds.toISOString().slice(11, 19)}`;
    document.querySelector(".playerCount").innerText = `${currentLeaderboard[totalScoresKey]} \nTotal\nEntries`;
    fullData = [];
    makeRequest(currentLeaderboard[leaderboardKey], currentLeaderboard.id);
}

async function main(url, totalScoresKey, leaderboardKey) {
    const data = await fetch(`https://data.ninjakiwi.com/btd6/${url}`);
    const json = await data.json();
    const availableLeaderboards = json.body;
    fetchSpecificWeek(availableLeaderboards, totalScoresKey, leaderboardKey);
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
    // document.getElementsByClassName('label')[1].innerText = 'Player Name';
    // document.getElementsByClassName('label')[2].innerText = 'Best Time';
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
            // document.getElementsByClassName('label')[3].innerText = 'Score';
            main('ct', 'totalScores_player', 'leaderboard_player');
            break;
        case 'ctteams':
            format = false;
            // document.getElementsByClassName('label')[1].innerText = 'Team Name';
            // document.getElementsByClassName('label')[3].innerText = 'Score';
            main('ct', 'totalScores_team', 'leaderboard_team');
            break;
    }
});
