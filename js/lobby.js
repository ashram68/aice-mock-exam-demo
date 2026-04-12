/**
 * Lobby: Exam card grid + sidebar stats
 */
(function () {
  const PROGRESS_KEY = 'aice_progress';

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
    } catch (e) { return {}; }
  }

  function renderStats(exams) {
    const progress = getProgress();
    let totalViewed = 0;
    let totalQuestions = 0;
    let activeExams = 0;

    exams.forEach(exam => {
      if (!exam.enabled) return;
      const p = progress[exam.id];
      const viewed = p ? p.viewed.length : 0;
      totalViewed += viewed;
      totalQuestions += exam.questionCount;
      activeExams++;
    });

    document.getElementById('stat-total-exams').textContent = exams.length;
    document.getElementById('stat-active-exams').textContent = activeExams;
    document.getElementById('stat-total-questions').textContent = totalQuestions;
    document.getElementById('stat-viewed').textContent = totalViewed;
    document.getElementById('stat-progress').textContent =
      totalQuestions > 0 ? Math.round(totalViewed / totalQuestions * 100) + '%' : '0%';
  }

  function renderExamCards(exams) {
    const grid = document.getElementById('exam-grid');

    grid.innerHTML = exams.map(exam => {
      if (!exam.enabled) {
        return `
          <div class="lobby-card lobby-card-disabled">
            <h3 class="lobby-card-title">${exam.title}: ${exam.subtitle}</h3>
            <p class="lobby-card-desc">${(exam.description || '').replace(/\n/g, '<br>')}</p>
            <div class="lobby-card-buttons">
              <button class="lobby-btn lobby-btn-colab" disabled>Google Colab 실습</button>
              <button class="lobby-btn lobby-btn-outline" disabled>정답 및 해설 보기</button>
              <button class="lobby-btn lobby-btn-outline" disabled>해설 강의 수강</button>
            </div>
          </div>
        `;
      }

      return `
        <div class="lobby-card">
          <h3 class="lobby-card-title">${exam.title}: ${exam.subtitle}</h3>
          <p class="lobby-card-desc">${(exam.description || '').replace(/\n/g, '<br>')}</p>
          <div class="lobby-card-buttons">
            <a href="${exam.colabUrl}" target="_blank" rel="noopener" class="lobby-btn lobby-btn-colab" onclick="event.preventDefault(); if(window.openColabWithNotice){openColabWithNotice(this.href);}else{window.open(this.href,'_blank','noopener');}">Google Colab 실습</a>
            <button class="lobby-btn lobby-btn-outline" onclick="location.href='viewer.html?exam=${exam.id}'">정답 및 해설 보기</button>
            <button class="lobby-btn lobby-btn-outline" onclick="window.open('${exam.lectureUrl}','_blank')">해설 강의 수강</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Load data
  fetch('data/exams.json')
    .then(r => r.json())
    .then(data => {
      renderStats(data.exams);
      renderExamCards(data.exams);
    })
    .catch(err => {
      console.error('Failed to load exams:', err);
      document.getElementById('exam-grid').innerHTML = '<p class="text-muted">데이터를 불러올 수 없습니다.</p>';
    });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', function () {
    localStorage.removeItem('aice_auth');
    window.location.href = 'auth.html';
  });
})();
