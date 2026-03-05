

document.addEventListener('DOMContentLoaded', () => {
    const workTitles = document.querySelectorAll('.work_title');
  
    workTitles.forEach((title) => {
        title.addEventListener('click', () => {
            const isActive = title.classList.contains('active');
            
            workTitles.forEach((otherTitle) => {
                otherTitle.classList.remove('active');
            });
            
            if (!isActive) {
                title.classList.add('active');
            }
        });
    });
  
    // 모든 .btn 요소에 효과 적용
    const btns = document.querySelectorAll(".btn");
    
    btns.forEach(btn => {
        const span = btn.querySelector("span");
        
        btn.addEventListener("mouseenter", e => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
        
            const size = Math.max(rect.width, rect.height) * 2;
        
            span.style.left = x + "px";
            span.style.top = y + "px";
            span.style.width = size + "px";
            span.style.height = size + "px";
        
            btn.classList.add("active");
        });
        
        // btn.addEventListener("mouseleave", () => {
        //     span.style.width = "0";
        //     span.style.height = "0";
        
        //     span.addEventListener("transitionend", () => {
        //         btn.classList.remove("active");
        //     }, { once: true });
        // });

        btn.addEventListener("mouseleave", () => {
            btn.classList.remove("active"); // 즉시 제거
            
            span.style.width = "0";
            span.style.height = "0";
        });
    });
  });