/* --- QUESTION BANK --- */
const examBank = {
    javascript: [
        { q: "Which tag is used for JavaScript?", options: ["<js>", "<script>", "<css>", "<html>"], ans: "<script>" },
        { q: "How do you call a function named 'myFunction'?", options: ["myFunction()", "call myFunction", "run myFunction", "myFunction"], ans: "myFunction()" },
        { q: "Which operator is used for strict equality?", options: ["=", "==", "===", "both b&c"], ans: "===" },
        { q: "Variable keyword for block scope?", options: ["var", "let", "int", "float"], ans: "let" },
        { q: "Single-line comment style?", options: ["//", "#", "/*", "--"], ans: "//" }
    ],
    python: [
        { q: "Standard Python file extension?", options: [".py", ".pt", ".python", ".txt"], ans: ".py" },
        { q: "Keyword to define a function?", options: ["def", "func", "function", "define"], ans: "def" },
        { q: "Which symbol defines a list?", options: ["()", "{}", "[]", "<>"], ans: "[]" },
        { q: "Comment symbol in Python?", options: ["#", "//", "/*", "--"], ans: "#" },
        { q: "Output command?", options: ["print()", "echo", "printf", "write"], ans: "print()" }
    ],
    java: [
        { q: "Entry point of a Java program?", options: ["main()", "start()", "init()", "run()"], ans: "main()" },
        { q: "Is Java a pure OOP language?", options: ["Yes", "No", "Mostly", "None"], ans: "Mostly" },
        { q: "Keyword for inheritance?", options: ["extends", "implements", "inherits", "import"], ans: "extends" },
        { q: "Correct boolean values?", options: ["true/false", "0/1", "yes/no", "null"], ans: "true/false" },
        { q: "JVM stands for?", options: ["Java Virtual Machine", "Java Virtual Method", "Just Virtual Machine", "None"], ans: "Java Virtual Machine" }
    ]
};

let activeSub = "";
let activeQuestions = [];
let timer;
let userData = { name: "", email: "" };

/* --- AUTHENTICATION --- */
function handleAuth() {
    const name = document.getElementById('student-name').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    
    // Simple Validation: Name exists, Gmail used, and Regex for Strong Password
    const passRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    
    if(name && email.endsWith("@gmail.com") && passRegex.test(pass)) {
        userData = { name, email };
        document.getElementById('welcome-name').innerText = name;
        document.getElementById('prof-name').innerText = name;
        document.getElementById('prof-email').innerText = email;
        document.getElementById('profile-init').innerText = name.charAt(0).toUpperCase();
        
        document.getElementById('login-view').classList.add('hidden');
        document.getElementById('system-view').classList.remove('hidden');
        updateTable();
    } else { 
        alert("Please provide valid details:\n- Name required\n- Email must be @gmail.com\n- Password must be 8+ chars with A, a, and 1"); 
    }
}

/* --- NAVIGATION & UI --- */
function toggleProfile() { 
    document.getElementById('profile-card').classList.toggle('hidden'); 
}

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
        
        return `
            <tr>
                <td style="text-transform: capitalize;">${s}</td>
                <td>${score !== null ? score + "%" : "-"}</td>
                <td style="color: ${color}; font-weight: 600;">${status}</td>
            </tr>`;
    }).join('');
}

/* --- EXAM LOGIC --- */
function initiateExam(sub) {
    activeSub = sub;
    // Shuffle questions
    activeQuestions = [...examBank[sub]].sort(() => Math.random() - 0.5);
    
    document.getElementById('subject-title').innerText = sub.toUpperCase();
    document.getElementById('system-view').classList.add('hidden');
    document.getElementById('exam-interface').classList.remove('hidden');
    
    document.getElementById('questions-container').innerHTML = activeQuestions.map((q, i) => `
        <div class="question-card">
            <h4>Q${i+1}: ${q.q}</h4>
            <div class="options-grid">
                ${q.options.sort(() => Math.random() - 0.5).map(opt => `
                    <label class="option-label">
                        <input type="radio" name="q${i}" value="${opt}"> ${opt}
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');

    let time = 600; // 10 minutes
    timer = setInterval(() => {
        time--;
        let mins = Math.floor(time / 60);
        let secs = time % 60;
        document.getElementById('timer').innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
    
    const percent = (scoreCount / activeQuestions.length) * 100;
    const saved = JSON.parse(localStorage.getItem('scores')) || { javascript: null, python: null, java: null };
    
    // Save only if it's the new best score
    if (percent > (saved[activeSub] || -1)) saved[activeSub] = percent;
    localStorage.setItem('scores', JSON.stringify(saved));
    
    alert(`Assessment Completed!\nStudent: ${userData.name}\nSubject: ${activeSub}\nScore: ${percent}%`);
    
    document.getElementById('exam-interface').classList.add('hidden');
    document.getElementById('system-view').classList.remove('hidden');
    switchTab('results');
}

/* --- PROCTORING ALERT --- */
document.addEventListener('visibilitychange', () => {
    const isExamOpen = !document.getElementById('exam-interface').classList.contains('hidden');
    if(isExamOpen && document.hidden) {
        alert("WARNING: Tab switching detected. This activity has been logged by the proctoring system.");
    }
});
