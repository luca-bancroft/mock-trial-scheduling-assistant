const STORAGE_KEY = 'mockTrialEntries';
let editingId = null;

const roleSelect = document.getElementById('roleSelect');

function updateFormByRole() {
    const role = roleSelect.value;

    const attorneyFields = [
        'attorneyOpening',
        'attorneyDirectExam',
        'attorneyCrossExam'
    ];

    const witnessFields = [
        'witnessDirectExam',
        'witnessCrossExam'
    ];

    function toggle(fields, enabled) {
        fields.forEach(id => {
            const input = document.getElementById(id);
            input.disabled = !enabled;
            input.required = enabled;

            if (!enabled) input.value = '';
        });
    }

    if (role === "attorney") {
        toggle(attorneyFields, true);
        toggle(witnessFields, false);
    } else if (role === "witness") {
        toggle(attorneyFields, false);
        toggle(witnessFields, true);
    } else if (role === "flex") {
        toggle(attorneyFields, true);
        toggle(witnessFields, true);
    }
}

roleSelect.addEventListener('change', updateFormByRole);

function loadEntries() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function generateId() {
    return Date.now().toString();
}

function displayEntries() {
    const entries = loadEntries();
    const entriesDiv = document.getElementById('entriesList');

    if (entries.length === 0) {
        entriesDiv.innerHTML = '<p>No entries submitted yet.</p>';
        return;
    }

    entriesDiv.innerHTML = entries.map((entry, index) => `
        <div class="entry-item">
            <h3>${entry.name}</h3>
                    
            <div class="player-role ${entry.role}">
                ${entry.role === 'flex' ? 'attorney/witness' : entry.role}
            </div>

            <div class="entry-scores">
                ${entry.attorney ? `
                <div>
                    <h4>Attorney</h4>
                    <p>Opening: ${entry.attorney.openingClosing ?? '-'}</p>
                    <p>Direct: ${entry.attorney.directExamination ?? '-'}</p>
                    <p>Cross: ${entry.attorney.crossExamination ?? '-'}</p>
                </div>` : ''}

                ${entry.witness ? `
                <div>
                    <h4>Witness</h4>
                    <p>Direct: ${entry.witness.directExamination ?? '-'}</p>
                    <p>Cross: ${entry.witness.crossExamination ?? '-'}</p>
                </div>` : ''}
            </div>

            <div class="entry-actions">
                <button class="edit-btn" onclick="editEntry(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteEntry(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function submitEntry(e) {
    e.preventDefault();

    const role = roleSelect.value;

    const formData = {
        id: editingId || generateId(),
        name: document.getElementById('personName').value,
        role: role,
        attorney: (role === 'attorney' || role === 'flex') ? {
            openingClosing: document.getElementById('attorneyOpening').value || null,
            directExamination: document.getElementById('attorneyDirectExam').value || null,
            crossExamination: document.getElementById('attorneyCrossExam').value || null
        } : null,
        witness: (role === 'witness' || role === 'flex') ? {
            directExamination: document.getElementById('witnessDirectExam').value || null,
            crossExamination: document.getElementById('witnessCrossExam').value || null
        } : null
    };

    let entries = loadEntries();

    if (editingId) {
        const index = entries.findIndex(e => e.id === editingId);
        if (index > -1) entries[index] = formData;
        editingId = null;
        document.querySelector('.submit-btn').textContent = 'Submit Entry';
    } else {
        entries.push(formData);
    }

    saveEntries(entries);
    displayEntries();

    document.getElementById('scoresForm').reset();
    roleSelect.value = '';
    updateFormByRole();
}

function editEntry(index) {
    const entries = loadEntries();
    const entry = entries[index];

    editingId = entry.id;

    document.getElementById('personName').value = entry.name;
    roleSelect.value = entry.role;
    updateFormByRole();

    if (entry.attorney) {
        document.getElementById('attorneyOpening').value = entry.attorney.openingClosing;
        document.getElementById('attorneyDirectExam').value = entry.attorney.directExamination;
        document.getElementById('attorneyCrossExam').value = entry.attorney.crossExamination;
    }

    if (entry.witness) {
        document.getElementById('witnessDirectExam').value = entry.witness.directExamination;
        document.getElementById('witnessCrossExam').value = entry.witness.crossExamination;
    }

    document.querySelector('.submit-btn').textContent = 'Update Entry';
    document.querySelector('.entry-form').scrollIntoView({ behavior: 'smooth' });
}

function deleteEntry(index) {
    if (confirm('Are you sure you want to delete this entry?')) {
        let entries = loadEntries();
        entries.splice(index, 1);
        saveEntries(entries);
        displayEntries();
    }
}

document.getElementById('scoresForm').addEventListener('submit', submitEntry);

updateFormByRole();
displayEntries();