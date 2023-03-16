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
async function makeRequest(url, format) {
    const data = await fetch(url);
    const json = await data.json();
    const body = json.body;
    if (format) {
        for (i = 0; i < body.length; i++) {
            addPlayer(body[i].displayName, new Date(body[i].score).toISOString().slice(14, 23))
        }
    } else {
        for (i = 0; i < body.length; i++) {
            addPlayer(body[i].displayName, body[i].score)
        }
    }
    if (json.next) {
        await makeRequest(json.next, format);
    } else {
        loading = false;
    }
}

async function main(url, totalKey, leaderboardKey, format) {
    loading = true;
    const data = await fetch(url);
    const json = await data.json();
    const currentLeaderboard = json.body.filter(event => event.start < Date.now())[0];
    document.querySelector(".playerCount").innerText = `${currentLeaderboard[totalKey]}\nTotal\nEntries`;
    makeRequest(currentLeaderboard[leaderboardKey], format);
}

let prevButton = null;
let loading = false;

document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            if (loading) return alert('Please refresh the page or wait for the current leaderboard to finish before switching to another one.');
            document.getElementsByClassName('leaderboard')[0].innerHTML = ''
            if (prevButton !== null) prevButton.style.backgroundColor = '';
            prevButton = button;
            button.style.backgroundColor = 'yellow';
            document.getElementsByClassName('label')[1].innerText = 'Player Name';
            document.getElementsByClassName('label')[6].innerText = 'Best Time';
            switch (button.id) {
                case 'race':
                    main('https://data.ninjakiwi.com/btd6/races', 'totalScores', 'leaderboard', true);
                    break;
                case 'normalboss':
                    main('https://data.ninjakiwi.com/btd6/bosses', 'totalScores_standard', 'leaderboard_standard_players_1', true);
                    break;
                case 'eliteboss':
                    main('https://data.ninjakiwi.com/btd6/bosses', 'totalScores_elite', 'leaderboard_elite_players_1', true);
                    break;
                case 'ctplayers':
                    document.getElementsByClassName('label')[6].innerText = 'Score';
                    main('https://data.ninjakiwi.com/btd6/ct', 'totalScores_player', 'leaderboard_player', false);
                    break;
                case 'ctteams':
                    document.getElementsByClassName('label')[1].innerText = 'Team Name';
                    document.getElementsByClassName('label')[6].innerText = 'Score';
                    main('https://data.ninjakiwi.com/btd6/ct', 'totalScores_team', 'leaderboard_team', false);
                    break;
            }
        });
    });
    // main();
})
