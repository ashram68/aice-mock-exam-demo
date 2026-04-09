/**
 * Lobby: Exam card grid + progress tracking
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
    const grid = document.getElementById('stats-grid');
    const section = document.getElementById('progress-section');

    let totalViewed = 0;
    let totalQuestions = 0;
    let activeExams = 0;

    exams.forEach(exam => {
      if (!exam.enabled) return;
      const p = progress[exam.id];
      const viewed = p ? p.viewed.length : 0;
      totalViewed += viewed;
      totalQuestions += exam.questionCount;
      if (viewed > 0) activeExams++;
    });

    grid.innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${exams.filter(e => e.enabled).length}</div>
        <div class="stat-label">모의고사 회차</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalQuestions}</div>
        <div class="stat-label">총 문항 수</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalViewed}</div>
        <div class="stat-label">학습 완료 문항</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalQuestions > 0 ? Math.round(totalViewed / totalQuestions * 100) : 0}%</div>
        <div class="stat-label">진행률</div>
      </div>
    `;

    // Progress bar
    if (totalQuestions > 0) {
      section.style.display = 'block';
      document.getElementById('progress-text').textContent = `${totalViewed}/${totalQuestions}`;
      document.getElementById('progress-fill').style.width = `${(totalViewed / totalQuestions * 100).toFixed(1)}%`;
    }
  }

  function renderExamCards(exams) {
    const grid = document.getElementById('exam-grid');
    const progress = getProgress();

    grid.innerHTML = exams.map(exam => {
      const p = progress[exam.id];
      const viewed = p ? p.viewed.length : 0;
      const pct = exam.questionCount > 0 ? Math.round(viewed / exam.questionCount * 100) : 0;

      let statusBadge = '';
      let btnText = '학습 시작';
      let btnClass = 'btn-primary';

      if (!exam.enabled) {
        return `
          <div class="card exam-card disabled">
            <h3 style="margin-bottom: 0.25rem;">${exam.title}</h3>
            <p class="text-sm text-muted">${exam.subtitle}</p>
          </div>
        `;
      }

      if (viewed === 0) {
        statusBadge = '<span class="badge">미시작</span>';
        btnText = '학습 시작';
      } else if (viewed < exam.questionCount) {
        statusBadge = `<span class="badge badge-warning">진행중 ${pct}%</span>`;
        btnText = '이어서 학습';
      } else {
        statusBadge = '<span class="badge badge-success">완료</span>';
        btnText = '다시 보기';
        btnClass = 'btn-secondary';
      }

      const tagsHtml = exam.tags.map(t => `<span class="tag">${t}</span>`).join('');

      return `
        <div class="card exam-card card-clickable" onclick="location.href='viewer.html?exam=${exam.id}'">
          <div class="flex flex-between items-center">
            <h3>${exam.title}</h3>
            ${statusBadge}
          </div>
          <p class="text-sm text-muted mt-sm">${exam.subtitle}</p>
          <div class="exam-tags">${tagsHtml}</div>
          <div class="flex flex-between items-center mt-sm">
            <span class="text-xs text-muted">${exam.questionCount}문항</span>
            <span class="text-xs text-muted">${viewed}/${exam.questionCount} 완료</span>
          </div>
          <div class="progress-bar mt-sm" style="height: 4px;">
            <div class="progress-bar-fill" style="width: ${pct}%"></div>
          </div>
          <div class="flex gap-sm mt-md">
            <button class="btn ${btnClass} w-full" onclick="event.stopPropagation(); location.href='viewer.html?exam=${exam.id}'">
              ${btnText}
            </button>
            <a href="https://colab.research.google.com/github/ashram68/aice-mock-exam-demo/blob/main/data/exam-01/AICE_%EB%AA%A8%EC%9D%98%EA%B3%A0%EC%82%AC_1%ED%9A%8C_Titanic.ipynb" target="_blank" rel="noopener" class="btn btn-secondary" onclick="event.stopPropagation();" style="white-space:nowrap;">
              Colab 응시
            </a>
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
