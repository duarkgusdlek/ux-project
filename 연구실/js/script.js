document.addEventListener("DOMContentLoaded", () => {
  // ===========================
  // 1) Swiper (메인 페이지 전용)
  // ===========================
  const swiperContainer = document.querySelector(".mySwiper");
  if (swiperContainer && window.Swiper) {
    const swiper = new Swiper(".mySwiper", {
      loop: true,
      slidesPerView: 3,
      spaceBetween: 20,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
      },
      speed: 6000,
      freeMode: true,
      breakpoints: {
        0: { slidesPerView: 1.2, spaceBetween: 16 },
        600: { slidesPerView: 2, spaceBetween: 18 },
        1024: { slidesPerView: 3, spaceBetween: 20 },
      },
    });
  }

  // ===========================
  // 2) Particles.js (메인 hero 전용)
  // ===========================
  const particlesTarget = document.getElementById("particles-hero");
  if (particlesTarget && window.particlesJS) {
    particlesJS("particles-hero", {
      particles: {
        number: { value: 60 },
        size: { value: 3 },
        color: { value: "#ffffff" },
      },
    });
  }

  // ===========================
  // 3) 스크롤 애니메이션 (.curtain-side)
  // ===========================
  const curtainEls = document.querySelectorAll(".curtain-side");
  if (curtainEls.length > 0 && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          } else {
            entry.target.classList.remove("show");
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    curtainEls.forEach((el) => observer.observe(el));
  }

  // ===========================
  // 4) 전역 툴팁 (.tooltip-card)
  // ===========================
  const tooltipCards = document.querySelectorAll(".tooltip-card");
  if (tooltipCards.length > 0) {
    const tooltip = document.createElement("div");
    tooltip.id = "global-tooltip";
    document.body.appendChild(tooltip);

    tooltipCards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        tooltip.textContent = card.dataset.tooltip || "";
        tooltip.style.opacity = 1; 
      });

      card.addEventListener("mouseleave", () => {
        tooltip.style.opacity = 0;
      });

      card.addEventListener("mousemove", (e) => {
        tooltip.style.top = e.clientY + 10 + "px"; 
        tooltip.style.left = e.clientX + 10 + "px";
      });
    });
  }

  // ===========================
  // 5) 헤더 light/dark (hero 기준)
  // ===========================
  const header = document.querySelector("header");
  const hero = document.querySelector("#hero");

  if (header && hero && "IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            header.classList.add("light");
          } else {
            if (!document.body.classList.contains('contactpage')) { 
                header.classList.remove("light");
            }
          }
        });
      },
      {
        threshold: 0.4,
      }
    );

    heroObserver.observe(hero);
  }

  // ===========================
  // 6) Contact 페이지: 폼 → 남겨진 문의 (초기 비밀번호 설정 기능 포함)
  // ===========================
  const form = document.getElementById("contact-form");
  const savedList = document.getElementById("saved-list");
  const contactBoard = document.getElementById("contact-board");
  const adminBtn = document.getElementById("admin-mode-btn");
  
  const STORAGE_KEY = "lab_contact_board";
  const MASTER_KEY_STORAGE = "lab_master_key"; // 마스터 비밀번호 저장소 키
  
  let isAdminMode = false;

  // contact 페이지에서만 동작
  if (form && savedList && contactBoard) {

    // ⭐️ 6-0. 초기 관리자 비밀번호 설정
    function initializeMasterPassword() {
        const storedPassword = localStorage.getItem(MASTER_KEY_STORAGE);
        
        // 비밀번호가 설정되어 있지 않으면 초기 설정을 요청합니다.
        if (!storedPassword) {
            let newPassword = null;
            let isValid = false;
            
            while (!isValid) {
                newPassword = prompt("🚨 관리자 모드 초기 설정을 위해 마스터 비밀번호를 지정해주세요. (최소 4자)");
                
                if (newPassword === null) {
                    alert("마스터 비밀번호 설정을 취소했습니다. 관리자 모드를 활성화할 수 없습니다.");
                    return; 
                }
                
                // 비밀번호 유효성 검사 (최소 4자)
                if (newPassword.trim().length >= 4) {
                    localStorage.setItem(MASTER_KEY_STORAGE, newPassword.trim());
                    alert("마스터 비밀번호가 성공적으로 설정되었습니다! (비밀번호: " + newPassword.trim() + ")");
                    isValid = true;
                } else {
                    alert("비밀번호는 최소 4자 이상이어야 합니다.");
                }
            }
        }
    }

    // 6-5. LocalStorage에서 항목 삭제하는 함수
    function deleteItem(idToDelete) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      let arr = JSON.parse(saved);
      arr = arr.filter(item => item.id != idToDelete); 
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    }
    
    // 6-3. localStorage 저장 함수
    function saveItem(item) {
      const saved = localStorage.getItem(STORAGE_KEY);
      const arr = saved ? JSON.parse(saved) : [];
      arr.push(item);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    }

    // 6-4. 카드 렌더링 함수
    function renderItem(item) {
      const card = document.createElement("article");
      card.className = "saved-item";
      card.dataset.id = item.id;
      card.dataset.password = item.password;
      card.dataset.message = item.message;

      card.innerHTML = `
        <div class="saved-header">
          <span class="saved-name">${item.name}</span>
          <span class="saved-email">${item.email}</span>
          <span class="saved-date">${item.createdAt}</span>
          <button type="button" class="view-btn">내용 보기</button>
          <button type="button" class="delete-btn">삭제</button> 
        </div>
        <p class="saved-message" style="display:none;"></p>
      `;

      const msgEl = card.querySelector(".saved-message");
      const btn = card.querySelector(".view-btn");
      const deleteBtn = card.querySelector(".delete-btn");

      // 내용 보기 버튼 이벤트 (교수님 모드 반영)
      btn.addEventListener("click", () => {
        if (msgEl.style.display === "block") {
          msgEl.style.display = "none";
          btn.textContent = "내용 보기";
        } else {
          
          // ⭐️ 교수님 모드일 때
          if (isAdminMode) {
              msgEl.textContent = card.dataset.message;
              msgEl.style.display = "block";
              btn.textContent = "내용 숨기기";
              return;
          }
          
          // 일반 사용자: 비밀번호 확인 후 내용 보기
          const inputPassword = prompt("작성 시 입력한 비밀번호를 입력해주세요.");
          
          if (inputPassword !== null) {
            if (inputPassword === card.dataset.password) {
              msgEl.textContent = card.dataset.message;
              msgEl.style.display = "block";
              btn.textContent = "내용 숨기기";
            } else {
              alert("비밀번호가 일치하지 않습니다.");
            }
          }
        }
      });
      
      // 삭제 버튼 이벤트
      deleteBtn.addEventListener("click", () => {
        let isAuthorized = isAdminMode;

        if (!isAdminMode) {
            const inputPassword = prompt("삭제를 위해 글 작성 시 입력한 비밀번호를 입력해주세요.");
            if (inputPassword === card.dataset.password) {
                isAuthorized = true;
            } else if (inputPassword !== null) {
                 alert("비밀번호가 일치하지 않아 삭제할 수 없습니다.");
                 return;
            } else {
                return; 
            }
        }
        
        if (isAuthorized) {
            if (confirm("정말로 이 문의를 삭제하시겠습니까?")) {
              deleteItem(item.id);
              card.remove(); 
            }
        }
      });

      savedList.prepend(card); 
    }

    // ⭐️ 6-6. 교수님 모드 버튼 이벤트 (비밀번호 변경 옵션 추가)
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            const currentMasterPassword = localStorage.getItem(MASTER_KEY_STORAGE);
            
            // 비밀번호가 설정되어 있지 않으면 활성화 불가
            if (!currentMasterPassword) {
                alert("마스터 비밀번호가 설정되지 않아 활성화할 수 없습니다. 페이지를 새로고침하여 초기 설정을 해주세요.");
                return;
            }

            if (isAdminMode) {
                // 모드 비활성화 및 비밀번호 변경 옵션 제공
                const action = prompt("교수님 모드가 활성화되었습니다. 어떤 작업을 하시겠습니까? \n[1] 모드 해제 \n[2] 비밀번호 변경");
                
                if (action === '1') {
                    isAdminMode = false;
                    adminBtn.classList.remove('active');
                    adminBtn.textContent = '교수님 모드 (Admin)';
                    alert('교수님 모드가 해제되었습니다.');
                } else if (action === '2') {
                    const oldPass = prompt("현재 마스터 비밀번호를 입력해주세요.");
                    if (oldPass === currentMasterPassword) {
                         let newPass = prompt("새로운 마스터 비밀번호를 입력해주세요. (최소 4자)");
                         if (newPass && newPass.trim().length >= 4) {
                             localStorage.setItem(MASTER_KEY_STORAGE, newPass.trim());
                             alert('마스터 비밀번호가 성공적으로 변경되었습니다!');
                             // 비밀번호 변경 후에는 보안을 위해 모드 해제
                             isAdminMode = false;
                             adminBtn.classList.remove('active');
                             adminBtn.textContent = '교수님 모드 (Admin)';
                         } else if (newPass) {
                             alert('비밀번호는 최소 4자 이상이어야 합니다. 변경이 취소되었습니다.');
                         }
                    } else if (oldPass !== null) {
                        alert('현재 비밀번호가 일치하지 않습니다.');
                    }
                } else if (action === null) {
                    // 취소 버튼 누름: 아무것도 안 함
                }
                
            } else {
                // 모드 활성화 시도
                const inputPassword = prompt("관리자 비밀번호를 입력해주세요.");

                if (inputPassword === currentMasterPassword) {
                    isAdminMode = true;
                    adminBtn.classList.add('active');
                    adminBtn.textContent = '교수님 모드 (활성화됨)';
                    alert('교수님 모드가 활성화되었습니다. 이제 모든 글을 비밀번호 없이 보고 삭제할 수 있습니다.');
                } else if (inputPassword !== null) {
                    alert('비밀번호가 일치하지 않습니다.');
                }
            }
        });
    }
    
    // ⭐️ 페이지 로드 시 가장 먼저 관리자 비밀번호를 설정합니다.
    initializeMasterPassword();


    // 6-1. 첫 로드: localStorage에서 불러오기
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const items = JSON.parse(saved);
        items.reverse().forEach((item) => renderItem(item));
      } catch (e) {
        console.error("문의 데이터 파싱 에러:", e);
      }
    }

    // 6-2. 폼 제출 이벤트 처리
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("name")?.value.trim();
      const email = document.getElementById("email")?.value.trim();
      const password = document.getElementById("password")?.value.trim();
      const message = document.getElementById("message")?.value.trim();

      if (!name || !email || !password || !message) {
        alert("모든 항목을 입력해주세요.");
        return;
      }

      const item = {
        id: Date.now(),
        name,
        email,
        password,
        message,
        createdAt: new Date().toLocaleString(),
      };

      saveItem(item);
      renderItem(item);
      form.reset();

      contactBoard.scrollIntoView({ behavior: "smooth" });
    });
  }
});


//---------------------------------//
document.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (!header) return;

  // contact 페이지에서만 작동
  if (!document.body.classList.contains("contactpage")) return;

  if (window.scrollY > 10) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});


// js/script.js

document.addEventListener("DOMContentLoaded", () => {
  // 위쪽 Research Area 카드들
  const areaCards   = document.querySelectorAll(".리서치-에리아 .area > div");
  // 아래쪽 Research Detail 카드들
  const detailItems = document.querySelectorAll(".리서치-디테일 .detail-item");
  // 디테일 섹션 (스크롤용)
  const detailSection = document.getElementById("research-detail");

  // 이 페이지가 아닐 수도 있으니까 방어
  if (!areaCards.length || !detailItems.length) return;

  // 공통: 디테일 여는 함수
  function openDetail(index, scrollToDetail = false) {
    // 위 카드 active
    areaCards.forEach((card, i) => {
      card.classList.toggle("active", i === index);
    });

    // 아래 디테일 active
    detailItems.forEach((item, i) => {
      item.classList.toggle("active", i === index);
    });

    // 스크롤 옵션
    if (scrollToDetail && detailSection) {
      detailSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  // 1) Research Area 카드 클릭 → 디테일 열기 + 스크롤
  areaCards.forEach((card, index) => {
    card.addEventListener("click", () => {
      openDetail(index, true);
    });
  });

  // 2) 아래 디테일 박스 클릭 → 디테일 열기만 (스크롤 X)
  detailItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      openDetail(index, false);
    });
  });

  // 기본으로 아무것도 안 열려있게 두고 싶으면 이 상태 그대로.
  // 첫 번째를 기본으로 열어두고 싶으면:
  // openDetail(0, false);
});
