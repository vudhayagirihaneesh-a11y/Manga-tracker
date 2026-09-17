export const getValidImageUrl = (url?: string | null, width = 200, height = 280) => {
  if (!url || url.includes("questionmark") || url.includes("qm_50")) {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect fill='%231e293b' width='${width}' height='${height}'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Cover%3C/text%3E%3C/svg%3E`;
  }
  return url;
};
