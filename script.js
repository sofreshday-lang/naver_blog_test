document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const addKeywordBtn = document.getElementById('addKeywordBtn');
    const customKeywordInput = document.getElementById('customKeyword');
    const keywordsGrid = document.querySelector('.keywords-grid');
    const resultsList = document.getElementById('resultsList');
    const resultsCount = document.getElementById('resultsCount');
    const loader = document.querySelector('.loader');
    const btnText = document.querySelector('.btn-text');
    const filterChips = document.querySelectorAll('.filter-chip');

    let allBlogs = []; // 검색된 전체 데이터를 저장할 변수

    // 필터 칩 클릭 이벤트
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // 활성 상태 변경
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const filter = chip.getAttribute('data-filter');
            filterResults(filter);
        });
    });

    function filterResults(filter) {
        let filtered;
        if (filter === 'all') {
            filtered = allBlogs;
        } else if (filter === 'naedon') {
            filtered = allBlogs.filter(blog => blog.is_naedon);
        } else {
            // positive, negative, neutral 필터
            filtered = allBlogs.filter(blog => blog.sentiment === filter);
        }
        renderResults(filtered, false); // 필터링 시에는 스크롤 초기화 등을 고려해 false 전달 가능
    }

    // 커스텀 키워드 추가 기능
    addKeywordBtn.addEventListener('click', () => {
        const value = customKeywordInput.value.trim();
        if (value) {
            const item = document.createElement('div');
            item.className = 'keyword-item';
            item.innerHTML = `
                <label class="checkbox-container">
                    <input type="checkbox" name="keyword" value="${value}" checked>
                    <span class="checkmark"></span>
                    ${value}
                </label>
                <button class="delete-keyword">×</button>
            `;
            keywordsGrid.appendChild(item);
            customKeywordInput.value = '';
        }
    });

    // 키워드 삭제 기능 (이벤트 위임)
    keywordsGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-keyword')) {
            e.target.closest('.keyword-item').remove();
        }
    });

    // 엔터키로 커스텀 키워드 추가
    customKeywordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addKeywordBtn.click();
    });

    // 검색 기능
    searchBtn.addEventListener('click', async () => {
        const selectedKeywords = Array.from(document.querySelectorAll('input[name="keyword"]:checked'))
            .map(cb => cb.value);

        const searchMode = document.querySelector('input[name="searchMode"]:checked').value;

        if (selectedKeywords.length === 0) {
            alert('최소 하나 이상의 키워드를 선택해주세요.');
            return;
        }

        // 로딩 상태 표시
        setLoading(true);
        resultsList.innerHTML = '';

        try {
            // 키워드와 모드를 쿼리 스트링으로 변환
            const queryParams = selectedKeywords.map(k => `keywords=${encodeURIComponent(k)}`).join('&');
            const response = await fetch(`/api/blog?${queryParams}&mode=${searchMode}`);

            if (!response.ok) throw new Error('데이터를 가져오는데 실패했습니다.');

            const data = await response.json();
            allBlogs = data; // 결과 저장

            // 필터 초기화 (전체 선택 상태로)
            filterChips.forEach(c => c.classList.remove('active'));
            document.querySelector('.filter-chip[data-filter="all"]').classList.add('active');

            renderResults(allBlogs);
        } catch (error) {
            console.error(error);
            resultsList.innerHTML = `<div class="empty-state">오류가 발생했습니다: ${error.message}</div>`;
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        if (isLoading) {
            loader.classList.remove('hidden');
            btnText.textContent = '검색 중...';
            searchBtn.disabled = true;
        } else {
            loader.classList.add('hidden');
            btnText.textContent = '검색 시작';
            searchBtn.disabled = false;
        }
    }

    function formatDate(dateStr) {
        if (!dateStr || dateStr.length !== 8) return dateStr;
        return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
    }

    function renderResults(blogs, updateCount = true) {
        if (updateCount) {
            resultsCount.textContent = `검색된 블로그 ${blogs.length}건`;
        } else {
            // 필터링된 결과 개수 표시 (선택 사항)
            resultsCount.innerHTML = `검색된 블로그 ${allBlogs.length}건 <span style="font-size:0.8rem; color:var(--text-dim);">(필터링됨: ${blogs.length}건)</span>`;
        }

        if (blogs.length === 0) {
            resultsList.innerHTML = '<div class="empty-state">검색 결과가 없습니다.</div>';
            return;
        }

        blogs.forEach((blog, index) => {
            const card = document.createElement('div');
            card.className = 'blog-card';
            card.style.animationDelay = `${index * 0.05}s`;

            // 분석 태그 생성
            let analysisTags = `<span class="tag tag-${blog.sentiment}">${blog.sentiment.toUpperCase()}</span>`;
            if (blog.is_naedon) {
                analysisTags += `<span class="tag tag-naedon">내돈내산</span>`;
            }

            card.innerHTML = `
                <div class="analysis-bar">
                    ${analysisTags}
                </div>
                <div class="blog-meta">
                    <span class="blogger">@${blog.bloggername}</span>
                    <span class="date">${formatDate(blog.postdate)}</span>
                    <span class="keyword-tag">#${blog.search_keyword}</span>
                </div>
                <h3><a href="${blog.link}" target="_blank">${blog.title}</a></h3>
                <p class="blog-desc">${blog.description}</p>
            `;
            resultsList.appendChild(card);
        });
    }
});
