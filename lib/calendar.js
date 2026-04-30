export function generateCalendar(runDate, sourceFilename, items) {
  // Find next Monday from runDate
  const start = new Date(runDate);
  const day = start.getDay(); // 0=Sun, 1=Mon...
  const daysUntilMonday = day === 1 ? 0 : (8 - day) % 7 || 7;
  start.setDate(start.getDate() + daysUntilMonday);

  function addDays(d, n) {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  }

  function fmt(d) {
    return d.toISOString().split('T')[0];
  }

  function dayName(d) {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  }

  function preview(text) {
    const first = text.replace(/^#+\s*/m, '').replace(/\n/g, ' ').trim();
    return first.length > 60 ? first.slice(0, 57) + '...' : first;
  }

  const rows = [];

  // LinkedIn: Mon/Wed/Fri weeks 1-2, Mon week 3 → offsets 0,2,4,7,9,14
  const linkedinDays = [0, 2, 4, 7, 9, 14].slice(0, 5);
  items.linkedin.forEach((post, i) => {
    const d = addDays(start, linkedinDays[i]);
    rows.push({ date: fmt(d), day: dayName(d), type: 'LinkedIn Post', preview: preview(post), status: 'Draft' });
  });

  // Tweets: Mon-Fri each week (days 0-4, 7-11, 14-18)
  const tweetDays = [0,1,2,3,4,7,8,9,10,11].slice(0, 10);
  items.tweets.forEach((tweet, i) => {
    const d = addDays(start, tweetDays[i]);
    rows.push({ date: fmt(d), day: dayName(d), type: 'Tweet', preview: preview(tweet), status: 'Draft' });
  });

  // Newsletter: Tuesday each week → offsets 1, 8, 15
  const newsletterDays = [1, 8, 15];
  items.newsletter.forEach((section, i) => {
    const d = addDays(start, newsletterDays[i]);
    rows.push({ date: fmt(d), day: dayName(d), type: 'Newsletter', preview: preview(section), status: 'Draft' });
  });

  // YouTube: Thursday weeks 1 and 3 → offsets 3, 17
  const youtubeDays = [3, 17];
  items.youtube.forEach((script, i) => {
    const d = addDays(start, youtubeDays[i]);
    rows.push({ date: fmt(d), day: dayName(d), type: 'YouTube Script', preview: preview(script), status: 'Draft' });
  });

  // Substack Notes: Wednesday weeks 1, 2, 3 → offsets 2, 9, 16
  const substackDays = [2, 9, 16];
  (items.substack || []).forEach((note, i) => {
    const d = addDays(start, substackDays[i]);
    rows.push({ date: fmt(d), day: dayName(d), type: 'Substack Note', preview: preview(note), status: 'Draft' });
  });

  rows.sort((a, b) => a.date.localeCompare(b.date));

  const header = `# Content Calendar — ${sourceFilename}\n\nGenerated: ${fmt(runDate)}  |  Publishing window: ${fmt(start)} → ${fmt(addDays(start, 20))}\n\n`;
  const tableHeader = `| Date | Day | Content Type | Preview | Status |\n|------|-----|-------------|---------|--------|\n`;
  const tableRows = rows.map(r =>
    `| ${r.date} | ${r.day} | ${r.type} | ${r.preview} | ${r.status} |`
  ).join('\n');

  return header + tableHeader + tableRows + '\n';
}
