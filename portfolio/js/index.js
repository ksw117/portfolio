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



  const btn = document.querySelector(".contact_btn");
  const span = btn.querySelector("span");
  const text = btn.querySelector("p");
  
  btn.addEventListener("mouseenter", e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
  
      const size = Math.max(rect.width, rect.height) * 2;
  
      span.style.left = x + "px";
      span.style.top = y + "px";
      span.style.width = size + "px";
      span.style.height = size + "px";
  
      btn.classList.add("active"); // 글자 흰색
  });
  
  btn.addEventListener("mouseleave", () => {
      span.style.width = "0";
      span.style.height = "0";
  
      // span 애니메이션 끝난 뒤 색상 복귀
      span.addEventListener("transitionend", () => {
          btn.classList.remove("active");
      }, { once: true });
  });
  
  

});

