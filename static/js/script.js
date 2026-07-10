document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Theme Management (Dark / Light Mode)
    // ----------------------------------------------------
    const themeSwitch = document.getElementById('themeSwitch');
    const themeIcon = document.getElementById('themeIcon');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    if (themeSwitch) {
        themeSwitch.addEventListener('click', () => {
            const activeTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
        });
    }
    
    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
            themeSwitch.querySelector('span').textContent = 'Light Mode';
        } else {
            themeIcon.className = 'fas fa-moon';
            themeSwitch.querySelector('span').textContent = 'Dark Mode';
        }
    }

    // ----------------------------------------------------
    // 2. Mobile Sidebar Toggle
    // ----------------------------------------------------
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 991 && sidebar && sidebar.classList.contains('show')) {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        }
    });

    // ----------------------------------------------------
    // 3. Floating AI Neural Network Canvas Animation
    // ----------------------------------------------------
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;
        
        const particles = [];
        const particleCount = Math.min(60, Math.floor((width * height) / 15000));
        const connectionDistance = 120;
        
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;
                this.radius = Math.random() * 2.5 + 1.5;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#00f5d4';
                ctx.fill();
            }
        }
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 245, 212, ${1 - dist / connectionDistance})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }
        
        animate();
        
        window.addEventListener('resize', () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        });
    }

    // ----------------------------------------------------
    // 4. Back to Top Button
    // ----------------------------------------------------
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
    }

    // ----------------------------------------------------
    // 5. Toast Notifications
    // ----------------------------------------------------
    window.showToast = function(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} border-0 show`;
        toast.role = 'alert';
        toast.ariaLive = 'assertive';
        toast.ariaAtomic = 'true';
        toast.style.marginBottom = '10px';
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 4000);
    };

    // ----------------------------------------------------
    // 6. Dataset Client-side Search and Pagination
    // ----------------------------------------------------
    const datasetSearchInput = document.getElementById('datasetSearch');
    const datasetTableBody = document.getElementById('datasetTableBody');
    
    if (datasetTableBody && typeof datasetRawData !== 'undefined') {
        let filteredData = [...datasetRawData];
        let currentPage = 1;
        const recordsPerPage = 10;
        
        function renderTable() {
            datasetTableBody.innerHTML = '';
            
            if (filteredData.length === 0) {
                datasetTableBody.innerHTML = `<tr><td colspan="6" class="text-center">No matching flowers found.</td></tr>`;
                document.getElementById('paginationInfo').textContent = 'Showing 0 to 0 of 0 records';
                return;
            }
            
            const startIndex = (currentPage - 1) * recordsPerPage;
            const endIndex = Math.min(startIndex + recordsPerPage, filteredData.length);
            const pageData = filteredData.slice(startIndex, endIndex);
            
            pageData.forEach((row, index) => {
                const tr = document.createElement('tr');
                const badgeClass = row.species === 'setosa' ? 'badge-setosa' : row.species === 'versicolor' ? 'badge-versicolor' : 'badge-virginica';
                
                tr.innerHTML = `
                    <td><strong>${startIndex + index + 1}</strong></td>
                    <td>${parseFloat(row.sepal_length).toFixed(1)} cm</td>
                    <td>${parseFloat(row.sepal_width).toFixed(1)} cm</td>
                    <td>${parseFloat(row.petal_length).toFixed(1)} cm</td>
                    <td>${parseFloat(row.petal_width).toFixed(1)} cm</td>
                    <td><span class="badge-species ${badgeClass}">${row.species.charAt(0).toUpperCase() + row.species.slice(1)}</span></td>
                `;
                datasetTableBody.appendChild(tr);
            });
            
            // Update UI elements
            document.getElementById('paginationInfo').textContent = `Showing ${startIndex + 1} to ${endIndex} of ${filteredData.length} records`;
            
            const prevLi = document.getElementById('prevPageBtn');
            const nextLi = document.getElementById('nextPageBtn');
            
            if (currentPage === 1) {
                prevLi.classList.add('disabled');
            } else {
                prevLi.classList.remove('disabled');
            }
            
            if (endIndex >= filteredData.length) {
                nextLi.classList.add('disabled');
            } else {
                nextLi.classList.remove('disabled');
            }
        }
        
        // Search handler
        if (datasetSearchInput) {
            datasetSearchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                
                filteredData = datasetRawData.filter(row => {
                    return (
                        row.sepal_length.toString().includes(query) ||
                        row.sepal_width.toString().includes(query) ||
                        row.petal_length.toString().includes(query) ||
                        row.petal_width.toString().includes(query) ||
                        row.species.toLowerCase().includes(query)
                    );
                });
                
                currentPage = 1;
                renderTable();
            });
        }
        
        // Pagination clicks
        const prevBtn = document.getElementById('prevPageLink');
        const nextBtn = document.getElementById('nextPageLink');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentPage > 1) {
                    currentPage--;
                    renderTable();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const totalPages = Math.ceil(filteredData.length / recordsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    renderTable();
                }
            });
        }
        
        // Initial Draw
        renderTable();
    }

    // ----------------------------------------------------
    // 7. KNN Range Slider & Dynamic Retraining AJAX
    // ----------------------------------------------------
    const kSlider = document.getElementById('kSlider');
    const kValueDisplay = document.getElementById('kValueDisplay');
    const retrainBtn = document.getElementById('retrainBtn');
    
    if (kSlider) {
        kSlider.addEventListener('input', (e) => {
            if (kValueDisplay) kValueDisplay.textContent = e.target.value;
        });
    }
    
    if (retrainBtn) {
        retrainBtn.addEventListener('click', () => {
            const k = kSlider ? kSlider.value : 5;
            
            // Show loading animation overlay & block the card
            const overlay = document.getElementById('trainingOverlay');
            const progressBar = document.getElementById('trainingProgressBar');
            
            if (overlay && progressBar) {
                overlay.style.display = 'flex';
                progressBar.style.width = '0%';
                
                // Simulate training progress bar for better UX
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 10;
                    progressBar.style.width = `${progress}%`;
                    if (progress >= 100) {
                        clearInterval(interval);
                    }
                }, 100);
            }
            
            // Hit backend `/train` endpoint
            fetch('/train', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `k=${k}`
            })
            .then(res => res.json())
            .then(data => {
                setTimeout(() => { // small delay for simulation feeling
                    if (overlay) overlay.style.display = 'none';
                    
                    if (data.status === 'success') {
                        showToast(`KNN Retrained successfully with K = ${data.k}!`, 'success');
                        
                        // Update UI metrics dynamically
                        const elementsToUpdate = {
                            'statAccuracy': `${(data.metrics.test_accuracy * 100).toFixed(2)}%`,
                            'statK': data.k,
                            'bestKSuggestion': data.metrics.best_k,
                            'trainAccuracySpan': `${(data.metrics.train_accuracy * 100).toFixed(2)}%`,
                            'testAccuracySpan': `${(data.metrics.test_accuracy * 100).toFixed(2)}%`,
                            'precisionSpan': `${(data.metrics.precision * 100).toFixed(2)}%`,
                            'recallSpan': `${(data.metrics.recall * 100).toFixed(2)}%`,
                            'f1Span': `${(data.metrics.f1_score * 100).toFixed(2)}%`,
                            'trainingTimeSpan': `${data.metrics.training_time_ms} ms`
                        };
                        
                        for (const [id, value] of Object.entries(elementsToUpdate)) {
                            const el = document.getElementById(id);
                            if (el) el.textContent = value;
                        }
                        
                        // Dynamically refresh graphs with timestamp cache-buster
                        const t = new Date().getTime();
                        const graphs = {
                            'confusionMatrixImg': `/graphs/confusion_matrix.png?t=${t}`,
                            'accuracyGraphImg': `/graphs/accuracy_graph.png?t=${t}`
                        };
                        
                        for (const [id, src] of Object.entries(graphs)) {
                            const img = document.getElementById(id);
                            if (img) img.src = src;
                        }
                        
                        // Update Classification Report table dynamically
                        const reportBody = document.getElementById('classificationReportBody');
                        if (reportBody && data.metrics.classification_report) {
                            reportBody.innerHTML = '';
                            const rep = data.metrics.classification_report;
                            const classes = ['setosa', 'versicolor', 'virginica'];
                            
                            classes.forEach(cls => {
                                const rowMetrics = rep[cls];
                                const tr = document.createElement('tr');
                                tr.innerHTML = `
                                    <td><strong>Iris-${cls.charAt(0).toUpperCase() + cls.slice(1)}</strong></td>
                                    <td>${parseFloat(rowMetrics.precision).toFixed(4)}</td>
                                    <td>${parseFloat(rowMetrics.recall).toFixed(4)}</td>
                                    <td>${parseFloat(rowMetrics['f1-score']).toFixed(4)}</td>
                                    <td>${rowMetrics.support}</td>
                                `;
                                reportBody.appendChild(tr);
                            });
                            
                            // Add overall averages
                            const macroAvg = rep['macro avg'];
                            const trMacro = document.createElement('tr');
                            trMacro.className = 'table-secondary fw-bold';
                            trMacro.innerHTML = `
                                <td>Macro Average</td>
                                <td>${parseFloat(macroAvg.precision).toFixed(4)}</td>
                                <td>${parseFloat(macroAvg.recall).toFixed(4)}</td>
                                <td>${parseFloat(macroAvg['f1-score']).toFixed(4)}</td>
                                <td>${macroAvg.support}</td>
                            `;
                            reportBody.appendChild(trMacro);
                        }
                    } else {
                        showToast(`Training failed: ${data.message}`, 'error');
                    }
                }, 1000);
            })
            .catch(err => {
                if (overlay) overlay.style.display = 'none';
                showToast(`Server communication error: ${err.message}`, 'error');
            });
        });
    }

    // ----------------------------------------------------
    // 8. Prediction Input Validation
    // ----------------------------------------------------
    const predictForm = document.getElementById('predictForm');
    if (predictForm) {
        predictForm.addEventListener('submit', (e) => {
            const sepalLength = parseFloat(document.getElementById('sepal_length').value);
            const sepalWidth = parseFloat(document.getElementById('sepal_width').value);
            const petalLength = parseFloat(document.getElementById('petal_length').value);
            const petalWidth = parseFloat(document.getElementById('petal_width').value);
            
            let isValid = true;
            let errorMessage = '';
            
            // Specific validation limits for Iris dataset ranges
            if (isNaN(sepalLength) || sepalLength < 4.0 || sepalLength > 8.5) {
                isValid = false;
                errorMessage = 'Sepal length must be between 4.0 cm and 8.5 cm.';
            } else if (isNaN(sepalWidth) || sepalWidth < 1.5 || sepalWidth > 5.0) {
                isValid = false;
                errorMessage = 'Sepal width must be between 1.5 cm and 5.0 cm.';
            } else if (isNaN(petalLength) || petalLength < 0.5 || petalLength > 7.5) {
                isValid = false;
                errorMessage = 'Petal length must be between 0.5 cm and 7.5 cm.';
            } else if (isNaN(petalWidth) || petalWidth < 0.05 || petalWidth > 3.0) {
                isValid = false;
                errorMessage = 'Petal width must be between 0.05 cm and 3.0 cm.';
            }
            
            if (!isValid) {
                e.preventDefault();
                showToast(errorMessage, 'error');
            }
        });
        
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                predictForm.reset();
                showToast('Inputs reset to defaults', 'info');
            });
        }
    }
});
