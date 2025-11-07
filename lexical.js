// lexical.js - Управление словарём, идиомами, поиском, игрой и редактированием

function initLexical() {
    // DOM Elements
    const englishWordInput = document.getElementById('english-word');
    const turkishTranslationInput = document.getElementById('turkish-translation');
    const addWordBtn = document.getElementById('add-word-btn');
    const idiomInput = document.getElementById('idiom-input');
    const idiomMeaningInput = document.getElementById('idiom-meaning');
    const addIdiomBtn = document.getElementById('add-idiom-btn');
    const addFeedback = document.getElementById('add-feedback');
    const wordListElement = document.getElementById('word-list');
    const wordsCountElement = document.getElementById('words-count');
    const wordSearchInput = document.getElementById('word-search');
    const resourceTabs = document.querySelectorAll('.resource-tab');
    const mainTabs = document.querySelectorAll('.tab');
    const sections = document.querySelectorAll('.section');
    
    // Exam elements
    const startExamBtn = document.getElementById('start-exam');
    const examInstructions = document.getElementById('exam-instructions');
    const examContent = document.getElementById('exam-content');
    const turkishQuestionInput = document.getElementById('turkish-question');
    const englishAnswerInput = document.getElementById('english-answer');
    const checkAnswerBtn = document.getElementById('check-answer');
    const examFeedback = document.getElementById('exam-feedback');
    const progressElement = document.getElementById('progress');
    
    // Game elements
    const idiomGameSection = document.getElementById('idiom-game-section');
    const startGameBtn = document.getElementById('start-game-btn');
    
    // Application State
    let examWords = [];
    let currentExamIndex = 0;
    let correctAnswers = 0;
    let currentResourceView = 'words';
    let editingItem = null;
    
    // Event Listeners
    addWordBtn.addEventListener('click', addNewWord);
    addIdiomBtn.addEventListener('click', addNewIdiom);
    startExamBtn.addEventListener('click', startExam);
    checkAnswerBtn.addEventListener('click', checkAnswer);
    wordSearchInput.addEventListener('input', searchWords);
    if (startGameBtn) {
        startGameBtn.addEventListener('click', startMatchingGame);
    }
    
    // Resource tabs
    resourceTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            resourceTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentResourceView = tab.dataset.resource;
            displayWordList();
        });
    });
    
    // Initialize
    displayWordList();
    updateWordCount();
    checkGameAvailability();
    
    // Functions for words
    function addNewWord() {
        if (editingItem && editingItem.type === 'word') {
            updateWord();
            return;
        }
        
        const englishWord = englishWordInput.value.trim();
        const turkishTranslation = turkishTranslationInput.value.trim();
        
        if (!englishWord || !turkishTranslation) {
            showFeedback('Please fill in both fields', false);
            return;
        }
        
        const words = getWords();
        
        if (words.some(word => 
            word.english.toLowerCase() === englishWord.toLowerCase() && 
            word.type !== 'idiom' &&
            word !== editingItem
        )) {
            showFeedback('This word already exists in your vocabulary', false);
            return;
        }
        
        words.push({
            english: englishWord,
            turkish: turkishTranslation,
            type: 'word',
            id: Date.now()
        });
        
        localStorage.setItem('englishWords', JSON.stringify(words));
        
        resetWordForm();
        showFeedback('✓ Word added successfully', true);
        
        updateWordCount();
        displayWordList();
    }
    
    // Functions for idioms
    function addNewIdiom() {
        if (editingItem && editingItem.type === 'idiom') {
            updateIdiom();
            return;
        }
        
        const idiom = idiomInput.value.trim();
        const meaning = idiomMeaningInput.value.trim();
        
        if (!idiom || !meaning) {
            showFeedback('Please fill in both fields', false);
            return;
        }
        
        const words = getWords();
        
        if (words.some(item => 
            item.english.toLowerCase() === idiom.toLowerCase() && 
            item.type === 'idiom' &&
            item !== editingItem
        )) {
            showFeedback('This idiom already exists in your collection', false);
            return;
        }
        
        words.push({
            english: idiom,
            turkish: meaning,
            type: 'idiom',
            id: Date.now()
        });
        
        localStorage.setItem('englishWords', JSON.stringify(words));
        
        resetIdiomForm();
        showFeedback('✓ Idiom added successfully', true);
        
        updateWordCount();
        displayWordList();
        checkGameAvailability();
    }
    
    // Функция обновления слова
    function updateWord() {
        const englishWord = englishWordInput.value.trim();
        const turkishTranslation = turkishTranslationInput.value.trim();
        
        if (!englishWord || !turkishTranslation) {
            showFeedback('Please fill in both fields', false);
            return;
        }
        
        const words = getWords();
        const index = words.findIndex(item => item.id === editingItem.id);
        
        if (index !== -1) {
            words[index].english = englishWord;
            words[index].turkish = turkishTranslation;
            
            localStorage.setItem('englishWords', JSON.stringify(words));
            
            resetWordForm();
            cancelEdit();
            showFeedback('✓ Word updated successfully', true);
            
            updateWordCount();
            displayWordList();
        }
    }
    
    // Функция обновления идиомы
    function updateIdiom() {
        const idiom = idiomInput.value.trim();
        const meaning = idiomMeaningInput.value.trim();
        
        if (!idiom || !meaning) {
            showFeedback('Please fill in both fields', false);
            return;
        }
        
        const words = getWords();
        const index = words.findIndex(item => item.id === editingItem.id);
        
        if (index !== -1) {
            words[index].english = idiom;
            words[index].turkish = meaning;
            
            localStorage.setItem('englishWords', JSON.stringify(words));
            
            resetIdiomForm();
            cancelEdit();
            showFeedback('✓ Idiom updated successfully', true);
            
            updateWordCount();
            displayWordList();
            checkGameAvailability();
        }
    }
    
    // Функция редактирования элемента
    function editItem(item) {
        editingItem = item;
        
        // Переключаемся на вкладку Add Words
        switchToAddWordsTab();
        
        if (item.type === 'word') {
            // Заполняем форму слова
            englishWordInput.value = item.english;
            turkishTranslationInput.value = item.turkish;
            addWordBtn.textContent = 'Update Word';
            addWordBtn.style.background = '#ffa500';
        } else {
            // Заполняем форму идиомы
            idiomInput.value = item.english;
            idiomMeaningInput.value = item.turkish;
            addIdiomBtn.textContent = 'Update Idiom';
            addIdiomBtn.style.background = '#ffa500';
        }
        
        // Показываем кнопку отмены если её нет
        showCancelButton();
    }
    
    // Функция переключения на вкладку Add Words
    function switchToAddWordsTab() {
        mainTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-target') === 'add-words') {
                tab.classList.add('active');
            }
        });
        
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === 'add-words') {
                section.classList.add('active');
            }
        });
    }
    
    // Функция удаления элемента
    function deleteItem(item) {
        if (confirm('Are you sure you want to delete this item?')) {
            const words = getWords();
            const updatedWords = words.filter(word => word.id !== item.id);
            
            localStorage.setItem('englishWords', JSON.stringify(updatedWords));
            
            showFeedback('✓ Item deleted successfully', true);
            updateWordCount();
            displayWordList();
            checkGameAvailability();
            
            // Если удаляем редактируемый элемент, сбрасываем форму
            if (editingItem && editingItem.id === item.id) {
                cancelEdit();
            }
            
            // Остаемся на текущей вкладке, просто обновляем список
            const currentTab = document.querySelector('.tab.active').getAttribute('data-target');
            if (currentTab === 'lexical-resources') {
                // Ничего не делаем, остаемся на этой же вкладке
            }
        }
    }
    
    // Функция отмены редактирования
    function cancelEdit() {
        editingItem = null;
        resetWordForm();
        resetIdiomForm();
        hideCancelButton();
    }
    
    // Сброс формы слова
    function resetWordForm() {
        englishWordInput.value = '';
        turkishTranslationInput.value = '';
        addWordBtn.textContent = 'Add Word';
        addWordBtn.style.background = '';
    }
    
    // Сброс формы идиомы
    function resetIdiomForm() {
        idiomInput.value = '';
        idiomMeaningInput.value = '';
        addIdiomBtn.textContent = 'Add Idiom';
        addIdiomBtn.style.background = '';
    }
    
    // Показать кнопку отмены
    function showCancelButton() {
        let cancelBtn = document.getElementById('cancel-edit-btn');
        if (!cancelBtn) {
            cancelBtn = document.createElement('button');
            cancelBtn.id = 'cancel-edit-btn';
            cancelBtn.textContent = 'Cancel Edit';
            cancelBtn.style.background = '#6c757d';
            cancelBtn.style.marginLeft = '10px';
            cancelBtn.addEventListener('click', cancelEdit);
            
            // Добавляем кнопку после форм
            const formsContainer = document.querySelector('#add-words');
            formsContainer.appendChild(cancelBtn);
        }
    }
    
    // Скрыть кнопку отмены
    function hideCancelButton() {
        const cancelBtn = document.getElementById('cancel-edit-btn');
        if (cancelBtn) {
            cancelBtn.remove();
        }
    }
    
    function getWords() {
        const wordsJSON = localStorage.getItem('englishWords');
        return wordsJSON ? JSON.parse(wordsJSON) : [];
    }
    
    function updateWordCount() {
        const words = getWords();
        const wordCount = words.filter(word => word.type === 'word').length;
        const idiomCount = words.filter(word => word.type === 'idiom').length;
        if (wordsCountElement) {
            wordsCountElement.textContent = `(${wordCount} words, ${idiomCount} idioms)`;
        }
    }
    
    function displayWordList(filteredWords = null) {
        let words = filteredWords || getWords();
        
        // Фильтруем по выбранному виду
        if (currentResourceView === 'words') {
            words = words.filter(word => word.type === 'word');
        } else if (currentResourceView === 'idioms') {
            words = words.filter(word => word.type === 'idiom');
        }
        
        if (words.length === 0) {
            wordListElement.innerHTML = '<p>No items found. Add some words or idioms/useful phrases to start learning!</p>';
            return;
        }
        
        wordListElement.innerHTML = '';
        
        words.forEach(word => {
            const wordElement = document.createElement('div');
            wordElement.className = 'word-item';
            const typeBadge = word.type === 'idiom' ? '<span class="type-badge">IDIOM</span>' : '';
            
            wordElement.innerHTML = `
                <div class="word-content">
                    <div>
                        <span class="english-word">${word.english}</span>
                        ${typeBadge}
                    </div>
                    <span class="turkish-translation">${word.turkish}</span>
                </div>
                <div class="word-actions">
                    <button class="edit-btn" title="Edit">✏️</button>
                    <button class="delete-btn" title="Delete">🗑️</button>
                </div>
            `;
            
            // Добавляем обработчики для кнопок
            const editBtn = wordElement.querySelector('.edit-btn');
            const deleteBtn = wordElement.querySelector('.delete-btn');
            
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                editItem(word);
            });
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteItem(word);
            });
            
            wordListElement.appendChild(wordElement);
        });
    }
    
    function searchWords() {
        const searchTerm = wordSearchInput.value.trim().toLowerCase();
        const words = getWords();
        
        if (!searchTerm) {
            displayWordList();
            return;
        }
        
        const filteredWords = words.filter(word => 
            word.english.toLowerCase().includes(searchTerm) || 
            word.turkish.toLowerCase().includes(searchTerm)
        );
        
        displayWordList(filteredWords);
    }
    
    function checkGameAvailability() {
        const words = getWords();
        const idiomCount = words.filter(word => word.type === 'idiom').length;
        if (idiomGameSection) {
            if (idiomCount >= 10) {
                idiomGameSection.style.display = 'block';
            } else {
                idiomGameSection.style.display = 'none';
            }
        }
    }
    
    function showFeedback(message, isSuccess) {
        if (addFeedback) {
            addFeedback.textContent = message;
            addFeedback.className = `feedback ${isSuccess ? 'correct' : 'incorrect'}`;
            
            if (isSuccess) {
                setTimeout(() => {
                    addFeedback.textContent = '';
                }, 2000);
            }
        }
    }
    
    // Остальные функции (Exam и Game) остаются без изменений
    function startExam() {
        const words = getWords().filter(word => word.type === 'word');
        
        if (words.length < 30) {
            alert('You need at least 30 words in your vocabulary to start the exam');
            return;
        }
        
        examWords = [];
        const shuffled = [...words].sort(() => 0.5 - Math.random());
        examWords = shuffled.slice(0, 30);
        
        currentExamIndex = 0;
        correctAnswers = 0;
        
        examInstructions.style.display = 'none';
        examContent.style.display = 'block';
        examFeedback.textContent = '';
        progressElement.textContent = `0/30`;
        
        showQuestion();
    }
    
    function showQuestion() {
        if (currentExamIndex >= examWords.length) {
            finishExam();
            return;
        }
        
        const currentWord = examWords[currentExamIndex];
        turkishQuestionInput.value = currentWord.turkish;
        englishAnswerInput.value = '';
        englishAnswerInput.focus();
        progressElement.textContent = `${currentExamIndex}/30`;
    }
    
    function checkAnswer() {
        const userAnswer = englishAnswerInput.value.trim().toLowerCase();
        const correctAnswer = examWords[currentExamIndex].english.toLowerCase();
        
        if (userAnswer === correctAnswer) {
            showExamFeedback('✓ Correct!', true);
            correctAnswers++;
            currentExamIndex++;
            
            setTimeout(() => {
                examFeedback.textContent = '';
                showQuestion();
            }, 1000);
        } else {
            showExamFeedback('✗ Incorrect. Try again.', false);
            
            setTimeout(() => {
                englishAnswerInput.value = '';
                englishAnswerInput.focus();
            }, 1000);
        }
    }
    
    function finishExam() {
        examInstructions.style.display = 'block';
        examContent.style.display = 'none';
        
        alert(`Exam completed!\nYou got ${correctAnswers} out of 30 correct.`);
        
        if (correctAnswers < 30) {
            alert('You need to get all answers correct to pass. Please try again.');
        }
    }
    
    function showExamFeedback(message, isSuccess) {
        examFeedback.textContent = message;
        examFeedback.className = `feedback ${isSuccess ? 'correct' : 'incorrect'}`;
    }

    // 🎮 GAME FUNCTIONS (без изменений)
    function startMatchingGame() {
        const words = getWords();
        const idioms = words.filter(word => word.type === 'idiom');
        
        if (idioms.length < 10) {
            alert('You need at least 10 idioms/useful phrases to play the game!');
            return;
        }
        
        document.getElementById('exam').innerHTML = createGameHTML();
        initializeGame(idioms);
    }

    function createGameHTML() {
        return `
            <div class="game-container">
                <h2>Idiom Matching Game</h2>
                <div class="game-info">
                    <span id="game-timer">Time: 0s</span>
                    <span id="game-score">Matches: 0/10</span>
                    <button id="back-to-exam" class="game-btn">← Back to Exam</button>
                </div>
                
                <div class="matching-game">
                    <div class="left-column">
                        <h3>Idioms/Useful phrases</h3>
                        <div id="idioms-column" class="game-column"></div>
                    </div>
                    
                    <div class="right-column">
                        <h3>Meanings</h3>
                        <div id="meanings-column" class="game-column"></div>
                    </div>
                </div>
                
                <div id="game-result" class="game-result" style="display: none;"></div>
            </div>
        `;
    }

    function initializeGame(idioms) {
        const selectedIdioms = getRandomIdioms(idioms, 10);
        
        window.gameState = {
            idioms: selectedIdioms,
            selectedIdiom: null,
            selectedMeaning: null,
            matchedPairs: 0,
            startTime: Date.now(),
            timerInterval: null
        };
        
        createGameColumns(selectedIdioms);
        startTimer();
        document.getElementById('back-to-exam').addEventListener('click', backToExam);
    }

    function getRandomIdioms(idioms, count) {
        const shuffled = [...idioms].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    function createGameColumns(idioms) {
        const idiomsColumn = document.getElementById('idioms-column');
        const meaningsColumn = document.getElementById('meanings-column');
        
        idiomsColumn.innerHTML = '';
        meaningsColumn.innerHTML = '';
        
        idioms.forEach(idiom => {
            const idiomElement = document.createElement('div');
            idiomElement.className = 'game-item idiom-item';
            idiomElement.textContent = idiom.english;
            idiomElement.dataset.id = idiom.id;
            idiomElement.addEventListener('click', () => selectItem(idiomElement, 'idiom'));
            idiomsColumn.appendChild(idiomElement);
        });
        
        const shuffledMeanings = [...idioms].sort(() => 0.5 - Math.random());
        shuffledMeanings.forEach(idiom => {
            const meaningElement = document.createElement('div');
            meaningElement.className = 'game-item meaning-item';
            meaningElement.textContent = idiom.turkish;
            meaningElement.dataset.id = idiom.id;
            meaningElement.addEventListener('click', () => selectItem(meaningElement, 'meaning'));
            meaningsColumn.appendChild(meaningElement);
        });
    }

    function selectItem(element, type) {
        if (element.classList.contains('matched')) return;
        
        if (type === 'idiom') {
            if (window.gameState.selectedIdiom) {
                window.gameState.selectedIdiom.classList.remove('selected');
            }
            window.gameState.selectedIdiom = element;
            element.classList.add('selected');
        } else {
            if (window.gameState.selectedMeaning) {
                window.gameState.selectedMeaning.classList.remove('selected');
            }
            window.gameState.selectedMeaning = element;
            element.classList.add('selected');
        }
        
        if (window.gameState.selectedIdiom && window.gameState.selectedMeaning) {
            checkPair();
        }
    }

    function checkPair() {
        const idiomId = window.gameState.selectedIdiom.dataset.id;
        const meaningId = window.gameState.selectedMeaning.dataset.id;
        
        if (idiomId === meaningId) {
            window.gameState.selectedIdiom.classList.add('matched');
            window.gameState.selectedMeaning.classList.add('matched');
            window.gameState.matchedPairs++;
            
            updateScore();
            
            if (window.gameState.matchedPairs === 10) {
                finishGame();
            }
        } else {
            setTimeout(() => {
                window.gameState.selectedIdiom.classList.remove('selected');
                window.gameState.selectedMeaning.classList.remove('selected');
            }, 1000);
        }
        
        window.gameState.selectedIdiom = null;
        window.gameState.selectedMeaning = null;
    }

    function updateScore() {
        document.getElementById('game-score').textContent = `Matches: ${window.gameState.matchedPairs}/10`;
    }

    function startTimer() {
        window.gameState.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - window.gameState.startTime) / 1000);
            document.getElementById('game-timer').textContent = `Time: ${elapsed}s`;
        }, 1000);
    }

    function finishGame() {
        clearInterval(window.gameState.timerInterval);
        const elapsed = Math.floor((Date.now() - window.gameState.startTime) / 1000);
        
        const gameResult = document.getElementById('game-result');
        gameResult.style.display = 'block';
        gameResult.innerHTML = `
            <h3>🎉 Game Completed! 🎉</h3>
            <p>Time: ${elapsed} seconds</p>
            <p>All 10 pairs matched correctly!</p>
            <button id="play-again-btn" class="game-btn">Play Again</button>
            <button id="back-to-exam-btn" class="game-btn">Back to Exam</button>
        `;
        
        document.getElementById('play-again-btn').addEventListener('click', () => startMatchingGame());
        document.getElementById('back-to-exam-btn').addEventListener('click', backToExam);
    }

    function backToExam() {
        if (window.gameState && window.gameState.timerInterval) {
            clearInterval(window.gameState.timerInterval);
        }
        location.reload();
    }
}