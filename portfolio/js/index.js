document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.work_title').forEach((title) => {
      title.addEventListener('click', () => {
        title.classList.toggle('active');
      });
    });
});