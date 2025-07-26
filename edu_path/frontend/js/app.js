
// edu_path/frontend/js/app.js
document.addEventListener('DOMContentLoaded', function() {
    // 学习行为分析类
    class LearningAnalyzer {
        constructor() {
            this.userData = this.loadUserData();
            this.knowledgeGraph = this.initKnowledgeGraph();
        }

        loadUserData() {
            // 从localStorage加载用户数据
            return {
                skills: {
                    programming: localStorage.getItem('skill-programming') || 0,
                    dataStructure: localStorage.getItem('skill-data-structure') || 0,
                    algorithm: localStorage.getItem('skill-algorithm') || 0,
                    database: localStorage.getItem('skill-database') || 0,
                    systemDesign: localStorage.getItem('skill-system-design') || 0
                },
                goal: localStorage.getItem('learning-goal') || '',
                studyTime: localStorage.getItem('daily-study-time') || '2'
            };
        }

        initKnowledgeGraph() {
            // 基础知识图谱数据结构
            return {
                nodes: [
                    { id: 'programming', name: '编程基础', level: 1, mastery: 0 },
                    { id: 'data-structure', name: '数据结构', level: 2, mastery: 0 },
                    { id: 'algorithm', name: '算法', level: 2, mastery: 0 },
                    { id: 'database', name: '数据库', level: 3, mastery: 0 },
                    { id: 'system-design', name: '系统设计', level: 3, mastery: 0 }
                ],
                edges: [
                    { source: 'programming', target: 'data-structure', weight: 0.8 },
                    { source: 'programming', target: 'algorithm', weight: 0.7 },
                    { source: 'data-structure', target: 'system-design', weight: 0.6 },
                    { source: 'algorithm', target: 'system-design', weight: 0.5 },
                    { source: 'data-structure', target: 'database', weight: 0.4 }
                ]
            };
        }

        analyzeLearningBehavior() {
            // 分析用户学习行为并更新知识图谱掌握度
            this.knowledgeGraph.nodes.forEach(node => {
                node.mastery = this.userData.skills[node.id] || 0;
            });
            
            return {
                weakPoints: this.findWeakPoints(),
                recommendedOrder: this.generateLearningOrder(),
                estimatedTime: this.estimateCompletionTime()
            };
        }

        findWeakPoints() {
            // 找出掌握度低于3的知识点作为薄弱环节
            return this.knowledgeGraph.nodes
                .filter(node => node.mastery < 3)
                .sort((a, b) => a.mastery - b.mastery);
        }

        generateLearningOrder() {
            // 基于知识图谱生成推荐学习顺序
            const weakPoints = this.findWeakPoints();
            const order = [];
            
            // 简单推荐逻辑：先学习基础薄弱点
            weakPoints.forEach(point => {
                if (point.level === 1) order.unshift(point);
                else order.push(point);
            });
            
            return order;
        }

        estimateCompletionTime() {
            // 根据学习目标和每日时间估算完成时间
            const weakPointsCount = this.findWeakPoints().length;
            const dailyHours = parseInt(this.userData.studyTime);
            
            // 简单估算：每个薄弱点需要2-4小时
            const totalHours = weakPointsCount * (dailyHours > 2 ? 2 : 4);
            const days = Math.ceil(totalHours / dailyHours);
            
            return {
                days: days,
                completionDate: this.calculateCompletionDate(days)
            };
        }

        calculateCompletionDate(days) {
            // 计算预计完成日期
            const date = new Date();
            date.setDate(date.getDate() + days);
            return date.toISOString().split('T')[0];
        }
    }

    // 学习路径生成类
    class LearningPathGenerator {
        constructor(analyzer) {
            this.analyzer = analyzer;
            this.analysisResult = analyzer.analyzeLearningBehavior();
        }

        generateDailyPlan() {
            // 生成每日学习计划
            const { recommendedOrder, estimatedTime } = this.analysisResult;
            const dailyHours = parseInt(this.analyzer.userData.studyTime);
            
            return recommendedOrder.map((topic, index) => {
                const hoursNeeded = topic.level * (dailyHours > 2 ? 1 : 2);
                const startDate = new Date();
                startDate.setDate(startDate.getDate() + index);
                
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + Math.ceil(hoursNeeded / dailyHours) - 1);
                
                return {
                    topic: topic.name,
                    hours: hoursNeeded,
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    resources: this.getRecommendedResources(topic.id)
                };
            });
        }

        getRecommendedResources(topicId) {
            // 根据主题推荐学习资源
            const resources = {
                'programming': [
                    { title: 'Python编程入门', platform: 'Coursera', url: '#' },
                    { title: '编程基础视频教程', platform: 'Bilibili', url: '#' }
                ],
                'data-structure': [
                    { title: '数据结构与算法', platform: 'edX', url: '#' },
                    { title: '数据结构实战', platform: '网易云课堂', url: '#' }
                ],
                'algorithm': [
                    { title: '算法导论', platform: 'YouTube', url: '#' },
                    { title: '算法精讲', platform: 'Coursera', url: '#' }
                ],
                'database': [
                    { title: '数据库系统原理', platform: 'Bilibili', url: '#' },
                    { title: 'SQL实战', platform: '网易云课堂', url: '#' }
                ],
                'system-design': [
                    { title: '系统设计入门', platform: 'YouTube', url: '#' },
                    { title: '分布式系统设计', platform: 'Coursera', url: '#' }
                ]
            };
            
            return resources[topicId] || [];
        }

        generateWeeklyPlan() {
            // 将每日计划聚合为周计划
            const dailyPlan = this.generateDailyPlan();
            const weeklyPlan = [];
            let currentWeek = [];
            let currentWeekHours = 0;
            const weeklyHourTarget = parseInt(this.analyzer.userData.studyTime) * 5; // 假设每周学习5天
            
            dailyPlan.forEach(day => {
                if (currentWeekHours + day.hours <= weeklyHourTarget) {
                    currentWeek.push(day);
                    currentWeekHours += day.hours;
                } else {
                    weeklyPlan.push([...currentWeek]);
                    currentWeek = [day];
                    currentWeekHours = day.hours;
                }
            });
            
            if (currentWeek.length > 0) {
                weeklyPlan.push(currentWeek);
            }
            
            return weeklyPlan.map((week, index) => ({
                weekNumber: index + 1,
                topics: week.map(day => day.topic).join(', '),
                totalHours: week.reduce((sum, day) => sum + day.hours, 0),
                startDate: week[0].startDate,
                endDate: week[week.length - 1].endDate
            }));
        }
    }

    // 初始化应用
    if (document.getElementById('knowledge-graph')) {
        // 主页面逻辑
        const analyzer = new LearningAnalyzer();
        console.log('学习分析结果:', analyzer.analyzeLearningBehavior());
    }

    if (document.getElementById('submit-diagnosis')) {
        // 诊断页面逻辑
        document.getElementById('submit-diagnosis').addEventListener('click', function() {
            const goal = document.getElementById('goal').value;
            const studyTime = document.getElementById('study-time').value;
            
            if (!goal || !studyTime) {
                alert('请填写完整的基础信息');
                return;
            }
            
            // 保存到localStorage并跳转
            localStorage.setItem('learning-goal', goal);
            localStorage.setItem('daily-study-time', studyTime);
            window.location.href = 'path.html';
        });
    }

    if (document.getElementById('adjust-path')) {
        // 学习路径页面逻辑
        const analyzer = new LearningAnalyzer();
        const generator = new LearningPathGenerator(analyzer);
        
        console.log('每日学习计划:', generator.generateDailyPlan());
        console.log('每周学习计划:', generator.generateWeeklyPlan());
        
        document.getElementById('adjust-path').addEventListener('click', function() {
            alert('正在开发中：根据用户反馈调整学习路径');
        });
        
        document.getElementById('export-plan').addEventListener('click', function() {
            alert('正在开发中：导出PDF格式的学习计划');
        });
    }

    if (document.getElementById('personalized-recommend')) {
        // 资源页面逻辑
        document.getElementById('personalized-recommend').addEventListener('click', function() {
            const analyzer = new LearningAnalyzer();
            const weakPoints = analyzer.findWeakPoints();
            
            if (weakPoints.length > 0) {
                alert(`根据您的学习情况，推荐优先学习: ${weakPoints.map(p => p.name).join(', ')}`);
            } else {
                alert('您的各项技能掌握良好，可以尝试更高阶的内容！');
            }
        });
    }
});

// 3D知识图谱可视化函数
function renderKnowledgeGraph() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#6366F1" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: "#8B5CF6", opacity: 0.4, width: 1 },
                move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out" }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" }
                }
            }
        });
    }

    // 知识图谱交互效果
    const nodes = document.querySelectorAll('.knowledge-node');
    nodes.forEach(node => {
        node.addEventListener('click', function() {
            alert('正在开发中：点击节点将展示该知识点的详细内容和相关资源');
        });
    });
}

// 页面加载完成后执行
if (document.readyState !== 'loading') {
    renderKnowledgeGraph();
} else {
    document.addEventListener('DOMContentLoaded', renderKnowledgeGraph);
}
