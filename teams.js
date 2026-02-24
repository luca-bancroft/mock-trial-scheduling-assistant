function buildTeams() {
    const entries = JSON.parse(localStorage.getItem('mockTrialEntries')) || [];

    if (entries.length < 6) {
        alert("Not enough players to build teams.");
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
            name: player.name,
            attorneyScore,
            witnessScore,
            totalScore: attorneyScore + witnessScore
        };
    });

    const sortedAttorneys = [...players].sort((a, b) => b.attorneyScore - a.attorneyScore);
    const sortedWitnesses = [...players].sort((a, b) => b.witnessScore - a.witnessScore);
    const sortedOverall = [...players].sort((a, b) => b.totalScore - a.totalScore);

    let teamA = [];
    let teamB = [];

    const usedPlayers = new Set();

    function draftRole(sortedList, count, team, role) {
        for (let player of sortedList) {
            if (team.filter(p => p.role === role).length >= count) break;

            if (!usedPlayers.has(player.name)) {
                team.push({ ...player, role });
                usedPlayers.add(player.name);
            }
        }
    }

    // Draft Attorneys
    draftRole(sortedAttorneys, 3, teamA, "Attorney");
    draftRole(sortedAttorneys, 6, teamB, "Attorney");

    // Draft Witnesses
    draftRole(sortedWitnesses, 3, teamA, "Witness");
    draftRole(sortedWitnesses, 6, teamB, "Witness");

    // Fill remaining slots to 10
    function fillTeam(team) {
        for (let player of sortedOverall) {
            if (team.length >= 10) break;

            if (!usedPlayers.has(player.name)) {
                team.push({ ...player, role: "Flex" });
                usedPlayers.add(player.name);
            }
        }
    }

    fillTeam(teamA);
    fillTeam(teamB);

    renderTeams(teamA, teamB);
}

function renderTeams(teamA, teamB) {
    const teamASlots = document.querySelectorAll(".team-a .team-item");
    const teamBSlots = document.querySelectorAll(".team-b .team-item");

    // Clear slots
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
