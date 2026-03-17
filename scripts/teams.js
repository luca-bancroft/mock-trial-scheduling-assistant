function buildTeams() {
    const entries = JSON.parse(localStorage.getItem('mockTrialEntries')) || [];

    if (entries.length < 6) {
        alert("At least 6 players are required.");
        return;
    }

    const players = entries.map(player => {
        const attorneyScore =
            (parseFloat(player.attorney.openingClosing) * 0.5) +
            (parseFloat(player.attorney.directExamination) * 1) +
            (parseFloat(player.attorney.crossExamination) * 1);

        const witnessScore =
            (parseFloat(player.witness.directExamination) * 1) +
            (parseFloat(player.witness.crossExamination) * 1);

        return {
            id: player.id,
            name: player.name,
            attorneyScore,
            witnessScore,
            totalScore: attorneyScore + witnessScore
        };
    });

    const sortedOverall = [...players].sort((a, b) => b.totalScore - a.totalScore);

    let teamA = [];
    let teamB = [];

    const usedPlayers = new Set();

    if (players.length >= 6 && players.length < 12) {

        for (let player of sortedOverall) {
            if (teamA.length >= Math.min(players.length, 10)) break;

            teamA.push({ ...player, role: "Player" });
            usedPlayers.add(player.id);
        }

    }

    else if (players.length >= 12) {

        for (let player of sortedOverall) {

            if (teamA.length < 6) {
                teamA.push({ ...player, role: "Player" });
                usedPlayers.add(player.id);
            }

            else if (teamB.length < 6) {
                teamB.push({ ...player, role: "Player" });
                usedPlayers.add(player.id);
            }

            if (teamA.length === 6 && teamB.length === 6) break;
        }

        for (let player of sortedOverall) {

            if (usedPlayers.has(player.id)) continue;

            if (teamA.length < 10) {
                teamA.push({ ...player, role: "Player" });
                usedPlayers.add(player.id);
            }

            else if (teamB.length < 10) {
                teamB.push({ ...player, role: "Player" });
                usedPlayers.add(player.id);
            }
        }
    }

    renderTeams(teamA, teamB);
}

function renderTeams(teamA, teamB) {
    const teamASlots = document.querySelectorAll(".team-a .team-item");
    const teamBSlots = document.querySelectorAll(".team-b .team-item");

    teamASlots.forEach(slot => {
        slot.innerHTML = '<span class="circle"></span>';
    });

    teamBSlots.forEach(slot => {
        slot.innerHTML = '<span class="circle"></span>';
    });

    function render(team, slots) {
        team.forEach((player, index) => {
            if (slots[index]) {
                slots[index].innerHTML = `
                    <div class="player-card">
                        <div class="player-name">${player.name}</div>
                        <div class="player-role ${player.role.toLowerCase()}">
                            ${player.role}
                        </div>
                    </div>
                `;
            }
        });
    }

    render(teamA, teamASlots);
    render(teamB, teamBSlots);
}
