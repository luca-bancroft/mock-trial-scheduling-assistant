function buildTeams() {
    const entries = JSON.parse(localStorage.getItem('mockTrialEntries')) || [];

    // ─── Step 1: Calculate scores ─────────────────────────────────────────────

    const players = entries.map(entry => {
        const aScore =
            (parseFloat(entry.attorney?.openingClosing)    || 0) * 0.5 +
            (parseFloat(entry.attorney?.directExamination) || 0) * 1.0 +
            (parseFloat(entry.attorney?.crossExamination)  || 0) * 1.0;

        const wScore =
            (parseFloat(entry.witness?.directExamination) || 0) * 1.0 +
            (parseFloat(entry.witness?.crossExamination)  || 0) * 1.0;

        return {
            id:            entry.id,
            name:          entry.name,
            baseRole:      entry.role,
            attorneyScore: aScore,
            witnessScore:  wScore,
            totalScore:    aScore + wScore,
        };
    });

    // ─── Step 2: Assign flex players to attorney or witness pool ──────────────

    const attorneyPool = players.filter(p => p.baseRole === 'attorney');
    const witnessPool  = players.filter(p => p.baseRole === 'witness');
    const flexPool     = players.filter(p => p.baseRole === 'flex')
                                .sort((a, b) => b.totalScore - a.totalScore);

    flexPool.forEach(flex => {
        const aNeeded = Math.max(0, 6 - attorneyPool.length);
        const wNeeded = Math.max(0, 6 - witnessPool.length);

        let goAttorney;

        if      (aNeeded === 0 && wNeeded === 0) goAttorney = flex.attorneyScore >= flex.witnessScore;
        else if (aNeeded === 0)                  goAttorney = false;
        else if (wNeeded === 0)                  goAttorney = true;
        else if (aNeeded > wNeeded)              goAttorney = true;
        else if (wNeeded > aNeeded)              goAttorney = false;
        else                                     goAttorney = true; // tied — attorney wins

        if (goAttorney) {
            attorneyPool.push({ ...flex, displayRole: 'attorney' });
        } else {
            witnessPool.push({ ...flex, displayRole: 'witness' });
        }
    });

    attorneyPool.forEach(p => { p.displayRole = 'attorney'; });
    witnessPool.forEach(p  => { p.displayRole = 'witness';  });

    // ─── Step 3: Check minimums ───────────────────────────────────────────────

    const totalPlayers = Math.min(players.length, 20);

    if (attorneyPool.length < 3 || witnessPool.length < 3) {
        alert("Need at least 3 attorneys and 3 witnesses to form a team.");
        return;
    }

    const canFormBothTeams = attorneyPool.length >= 6 && witnessPool.length >= 6;

    // ─── Step 4: Seed teams, then fill by total score ─────────────────────────

    // Sort pools best-first by role score
    attorneyPool.sort((a, b) => b.attorneyScore - a.attorneyScore);
    witnessPool.sort((a, b)  => b.witnessScore  - a.witnessScore);

    let teamA = [];
    let teamB = [];

    if (!canFormBothTeams) {
        // Team A only — seed top 3+3, fill rest by total score up to cap
        const seedA_att = attorneyPool.splice(0, 3);
        const seedA_wit = witnessPool.splice(0, 3);

        teamA = [...seedA_att, ...seedA_wit];

        const remaining = [...attorneyPool, ...witnessPool]
            .sort((a, b) => b.totalScore - a.totalScore);

        const teamACap = Math.min(totalPlayers, 10);
        remaining.forEach(p => {
            if (teamA.length < teamACap) teamA.push(p);
        });

    } else {
        // Team A seeds: top 3 attorneys + top 3 witnesses (front of sorted pool)
        const seedA_att = attorneyPool.splice(0, 3);
        const seedA_wit = witnessPool.splice(0, 3);

        // Team B seeds: bottom 3 attorneys + bottom 3 witnesses (back of sorted pool)
        const seedB_att = attorneyPool.splice(attorneyPool.length - 3, 3);
        const seedB_wit = witnessPool.splice(witnessPool.length - 3, 3);

        teamA = [...seedA_att, ...seedA_wit];
        teamB = [...seedB_att, ...seedB_wit];

        // Everyone in the middle, sorted by total score, fills A then B
        const remaining = [...attorneyPool, ...witnessPool]
            .sort((a, b) => b.totalScore - a.totalScore);

        let teamACap, teamBCap;

        if (totalPlayers <= 15) {
            teamACap = totalPlayers - 6;
            teamBCap = 6;
        } else {
            teamACap = 10;
            teamBCap = Math.min(totalPlayers - 10, 10);
        }

        remaining.forEach(p => {
            if (teamA.length < teamACap) {
                teamA.push(p);
            } else if (teamB.length < teamBCap) {
                teamB.push(p);
            }
        });
    }

    renderTeams(teamA, teamB);
}

function renderTeams(teamA, teamB) {
    const teamASlots = document.querySelectorAll(".team-a .team-item");
    const teamBSlots = document.querySelectorAll(".team-b .team-item");

    teamASlots.forEach(slot => { slot.innerHTML = '<span class="circle"></span>'; });
    teamBSlots.forEach(slot => { slot.innerHTML = '<span class="circle"></span>'; });

    function render(team, slots) {
        team.forEach((player, index) => {
            if (!slots[index]) return;

            const role      = player.displayRole || 'attorney';
            const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

            slots[index].innerHTML = `
                <div class="player-card">
                    <div class="player-name">${player.name}</div>
                    <div class="player-role ${role}">${roleLabel}</div>
                </div>
            `;
        });
    }

    render(teamA, teamASlots);
    render(teamB, teamBSlots);
}