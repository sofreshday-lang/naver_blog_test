document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const addKeywordBtn = document.getElementById('addKeywordBtn');
    const customKeywordInput = document.getElementById('customKeyword');
    const keywordsGrid = document.querySelector('.keywords-grid');
    const resultsList = document.getElementById('resultsList');
    const resultsCount = document.getElementById('resultsCount');
    const loader = document.querySelector('.loader');
    const btnText = document.querySelector('.btn-text');

    // 커스텀 키워드 추가 기능
    addKeywordBtn.addEventListener('click', () => {
        const value = customKeywordInput.value.trim();
        if (value) {
            const label = document.createElement('label');
            label.className = 'checkbox-container';
            label.innerHTML = `
                <input type="checkbox" name="keyword" value="${value}" checked>
                <span class="checkmark"></span>
                ${value}
            `;
            keywordsGrid.appendChild(label);
            customKeywordInput.value = '';
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

        if (selectedKeywords.length === 0) {
            alert('최소 하나 이상의 키워드를 선택해주세요.');
            return;
        }

        // 로딩 상태 표시
        setLoading(true);
        resultsList.innerHTML = '';

        try {
            // 키워드를 쿼리 스트링으로 변환
            const queryParams = selectedKeywords.map(k => `keywords=${encodeURIComponent(k)}`).join('&');
            const response = await fetch(`/api/blog?${queryParams}`);

            if (!response.ok) throw new Error('데이터를 가져오는데 실패했습니다.');

            const data = await response.json();
            renderResults(data);
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

    function renderResults(blogs) {
        resultsCount.textContent = `검색된 블로그 ${blogs.length}건`;

        if (blogs.length === 0) {
            resultsList.innerHTML = '<div class="empty-state">검색 결과가 없습니다.</div>';
            return;
        }

        blogs.forEach((blog, index) => {
            const card = document.createElement('div');
            card.className = 'blog-card';
            card.style.animationDelay = `${index * 0.05}s`;

            card.innerHTML = `
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
