let allFeedback = [];
let currentFilter = 'all';

const ratingLabels = {
  5: '⭐ Excellent',
  4: '😊 Very Good',
  3: '👍 Good',
  2: '😐 Fair',
  1: '👎 Poor'
};

async function loadFeedback() {
  try {
    console.log('Loading feedback from /api/analysis/feedback');
    const response = await fetch('/api/analysis/feedback');
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Feedback loaded:', data);
    allFeedback = data.feedback || [];
    displayStats(data);
    displayFeedback(data.feedback || []);
  } catch (error) {
    console.error('Error loading feedback:', error);
    const errorHtml = `
      <div class="error">
        <strong>Error loading feedback:</strong><br/>
        ${error.message}<br/><br/>
        <small>Make sure your backend is running at http://localhost:3000</small>
      </div>
    `;
    document.getElementById('feedback-list').innerHTML = errorHtml;
  }
}

async function loadStats() {
  try {
    const response = await fetch('/api/analysis/feedback/stats');
    if (!response.ok) throw new Error('Failed to load stats');
    
    const stats = response.json();
    return stats;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

function displayStats(data) {
  document.getElementById('total-feedback').textContent = data.total;
  document.getElementById('avg-rating').textContent = data.average_rating || 'N/A';

  const webSource = data.by_source?.find(s => s.source === 'web');
  document.getElementById('web-count').textContent = webSource?.count || 0;

  // Count 5-star ratings
  const fiveStarFeedback = data.feedback?.filter(f => f.rating === 5) || [];
  document.getElementById('five-star-count').textContent = fiveStarFeedback.length;

  // Display rating distribution
  displayRatingDistribution(data.feedback);
}

function displayRatingDistribution(feedback) {
  const ratings = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  feedback.forEach(f => ratings[f.rating]++);

  const total = feedback.length || 1;
  const html = Object.entries(ratings)
    .sort((a, b) => b[0] - a[0])
    .map(([rating, count]) => {
      const percentage = ((count / total) * 100).toFixed(1);
      const stars = '★'.repeat(rating);
      return `
        <div class="rating-bar">
          <div class="rating-stars">${stars}</div>
          <div class="rating-bar-fill">
            <div class="rating-bar-progress" style="width: ${percentage}%">
              ${percentage}% (${count})
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  document.getElementById('rating-distribution').innerHTML = html;
}

function displayFeedback(feedback) {
  const filtered = filterFeedback(feedback);

  if (filtered.length === 0) {
    document.getElementById('feedback-list').innerHTML = 
      '<div class="feedback-empty">No feedback yet</div>';
    return;
  }

  const html = filtered.map(f => `
    <div class="feedback-item">
      <div class="feedback-header">
        <span class="feedback-rating">${ratingLabels[f.rating]}</span>
        <span class="feedback-date">${new Date(f.created_at).toLocaleDateString()}</span>
      </div>
      ${f.tos_url ? `<div class="feedback-url">📄 ${f.tos_url}</div>` : ''}
      ${f.user_feedback ? `<div class="feedback-text"><strong>Feedback:</strong> ${escapeHtml(f.user_feedback)}</div>` : ''}
      ${f.user_corrections ? `<div class="feedback-text" style="margin-top: 8px;"><strong>Corrections:</strong> ${escapeHtml(f.user_corrections)}</div>` : ''}
    </div>
  `).join('');

  document.getElementById('feedback-list').innerHTML = html;
}

function filterFeedback(feedback) {
  if (currentFilter === 'all') return feedback;
  if (currentFilter === '1-3') return feedback.filter(f => f.rating <= 3);
  return feedback.filter(f => f.rating === parseInt(currentFilter));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.filter;
      displayFeedback(allFeedback);
    });
  });

  // Load data on page load
  loadFeedback();

  // Refresh every 30 seconds
  setInterval(loadFeedback, 30000);
});
