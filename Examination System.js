/* --- UNIFORM QUESTION BANK (5 QNS EACH) --- */
const examBank = {
    javascript: [
        { q: "JS tag?", options: ["<js>", "<script>", "<css>", "<html>"], ans: "<script>" },
        { q: "Function call?", options: ["f()", "call f", "run f", "f"], ans: "f()" },
        { q: "Equality?", options: ["=", "==", "===", "both b&c"], ans: "both b&c" },
        { q: "Variable keyword?", options: ["var", "string", "int", "float"], ans: "var" },
        { q: "Comment style?", options: ["//", "#", "/*", "--"], ans: "//" }
    ],
    python: [
        { q: "Extension?", options: [".py", ".pt", ".python", ".txt"], ans: ".py" },
        { q: "Define function?", options: ["def", "func", "function", "define"], ans: "def" },
        { q: "List type?", options: ["()", "{}", "[]", "<>"], ans: "[]" },
        { q: "Comment?", options: ["#", "//", "/*", "--"], ans: "#" },
        { q: "Print command?", options: ["print()", "echo", "printf", "write"], ans: "print()" }
    ],
    java: [
        { q: "Main method?", options: ["main()", "start()", "init()", "run()"], ans: "main()" },
        { q: "Is OOP?", options: ["Yes", "No", "Depends", "None"], ans: "Yes" },
        { q: "Inherit keyword?", options: ["extends", "implements", "inherits", "import"], ans: "extends" },
        { q: "Boolean value?", options: ["true/false", "0/1", "yes/no", "null"], ans: "true/false" },
        { q: "JVM stands for?", options: ["Java Virtual Machine", "Java Very Much", "Just Virtual Machine", "None"], ans: "Java Virtual Machine" }
    ]
};

let activeSub = "";
let activeQuestions = [];
let timer;
let userData = { name: "", email: "" };

function handleAuth() {
    const name = document.getElementById('student-name').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    
    // Regex Logic
    if(name && email.endsWith("@gmail.com") && /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(pass)) {
        userData = { name, email };
        document.getElementById('welcome-name').innerText = name;
        document.getElementById('prof-name').innerText = name;
        document.getElementById('prof-email').innerText = email;
        document.getElementById('profile-init').innerText = name.charAt(0).toUpperCase();
        
        // Switch Views
        document.getElementById('login-view').classList.add('hidden');
        document.getElementById('system-view').classList.remove('hidden');
        updateTable();
    } else { alert("Check your details (Name, @gmail.com, Strong Password)."); }
}

function toggleProfile() { document.getElementById('profile-card').classList.toggle('hidden'); }

function switchTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('tab-' + id).classList.remove('hidden');
    document.getElementById('nav-' + id).classList.add('active');
    if(id === 'results') updateTable();
    document.getElementById('profile-card').classList.add('hidden');
}

function updateTable() {
    const scores = JSON.parse(localStorage.getItem('scores')) || { javascript: null, python: null, java: null };
    const body = document.getElementById('scores-table-body');
    body.innerHTML = Object.keys(scores).map(s => {
        let score = scores[s];
        let status = "Not Attempted";
        let color = "var(--text-light)";
        if (score !== null) {
            if (score > 35) { status = "Passed"; color = "var(--success)"; }
            else { status = "Failed"; color = "var(--accent)"; }
        }
        return `<tr><td style="text-transform: capitalize;">${s}</td><td>${score !== null ? score + "%" : "-"}</td><td style="color: ${color}; font-weight: 600;">${status}</td></tr>`;
    }).join('');
}

function initiateExam(sub) {
    activeSub = sub;
    activeQuestions = [...examBank[sub]].sort(() => Math.random() - 0.5);
    document.getElementById('subject-title').innerText = sub.toUpperCase();
    document.getElementById('system-view').classList.add('hidden');
    document.getElementById('exam-interface').classList.remove('hidden');
    
    document.getElementById('questions-container').innerHTML = activeQuestions.map((q, i) => `
        <div class="question-card">
            <h4>Q${i+1}: ${q.q}</h4>
            <div class="options-grid">
                ${q.options.sort(() => Math.random() - 0.5).map(opt => `<label class="option-label"><input type="radio" name="q${i}" value="${opt}"> ${opt}</label>`).join('')}
            </div>
        </div>
    `).join('');

    let time = 600;
    timer = setInterval(() => {
        time--;
        document.getElementById('timer').innerText = `${Math.floor(time/60)}:${time%60 < 10 ? '0' : ''}${time%60}`;
        if(time <= 0) submitExam();
    }, 1000);
}

function submitExam() {
    clearInterval(timer);
    let scoreCount = 0;
    activeQuestions.forEach((q, i) => {
        const choice = document.querySelector(`input[name="q${i}"]:checked`);
        if(choice && choice.value === q.ans) scoreCount++;
    });
    const percent = (scoreCount / 5) * 100;
    const saved = JSON.parse(localStorage.getItem('scores')) || { javascript: null, python: null, java: null };
    if (percent > (saved[activeSub] || -1)) saved[activeSub] = percent;
    localStorage.setItem('scores', JSON.stringify(saved));
    alert(`${userData.name}, your score for ${activeSub} is: ${percent}%`);
    document.getElementById('exam-interface').classList.add('hidden');
    document.getElementById('system-view').classList.remove('hidden');
    switchTab('results');
}

// Anti-Cheat (Tab Switch Detection)
document.addEventListener('visibilitychange', () => {
    if(!document.getElementById('exam-interface').classList.contains('hidden') && document.hidden) alert("TAB SWITCH RECORDED!");
});
