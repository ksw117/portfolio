// document.addEventListener('DOMContentLoaded', () => {
//     document.querySelectorAll('.work_title').forEach((title) => {
//       title.addEventListener('click', () => {
//         title.classList.toggle('active');
//       });
//     });
// });

document.addEventListener('DOMContentLoaded', () => {
  const workTitles = document.querySelectorAll('.work_title');


  workTitles.forEach((title) => {
      title.addEventListener('click', () => {
          // 현재 클릭한 요소가 이미 active 상태인지 확인
          const isActive = title.classList.contains('active');
          
          // 모든 work_title에서 active 클래스 제거
          workTitles.forEach((otherTitle) => {
              otherTitle.classList.remove('active');
          });
          
          // 클릭한 요소가 active가 아니었다면 active 추가
          if (!isActive) {
              title.classList.add('active');
          }
      });
  });
});
