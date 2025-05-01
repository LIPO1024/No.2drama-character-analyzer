// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化UI元素
    initializeUI();
    
    // 加载保存的设置
    loadSavedSettings();
    
    // 添加事件监听器
    addEventListeners();
  });
  
  // 初始化UI元素
  function initializeUI() {
    // 设置标签页切换
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // 移除所有active类
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.add('hidden'));
        
        // 添加active类到当前标签
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(`${tabId}-tab`).classList.remove('hidden');
      });
    });
    
    // 根据戏剧类型动态更新心理模型选择
    document.getElementById('drama-type').addEventListener('change', updatePsychModels);
  }
  
  // 加载保存的设置
  function loadSavedSettings() {
    chrome.storage.local.get(['settings'], function(result) {
      if (result.settings) {
        const settings = result.settings;
        
        // 基本设置
        if (settings.dramaType) document.getElementById('drama-type').value = settings.dramaType;
        if (settings.analysisNeed) document.getElementById('analysis-need').value = settings.analysisNeed;
        if (settings.outputFormat) document.getElementById('output-format').value = settings.outputFormat;
        
        // 高级设置
        if (settings.models) {
          document.getElementById('model-jungian').checked = settings.models.includes('jungian');
          document.getElementById('model-freudian').checked = settings.models.includes('freudian');
          document.getElementById('model-bigfive').checked = settings.models.includes('bigfive');
          document.getElementById('model-adlerian').checked = settings.models.includes('adlerian');
          document.getElementById('model-dramaticaction').checked = settings.models.includes('dramaticaction');
          document.getElementById('model-attachment').checked = settings.models.includes('attachment');
        }
        
        if (settings.depth) document.getElementById('depth-slider').value = settings.depth;
        if (settings.languageStyle) document.getElementById('language-style').value = settings.languageStyle;
      }
      
      // 更新心理模型
      updatePsychModels();
    });
  }
  
  // 添加事件监听器
  function addEventListeners() {
    // 生成提问按钮
    document.getElementById('generate-btn').addEventListener('click', generatePrompt);
    
    // 复制按钮
    document.getElementById('copy-btn').addEventListener('click', copyToClipboard);
    
    // 发送到AI按钮
    document.getElementById('inject-btn').addEventListener('click', injectToAI);
    
    // 保存设置按钮
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    
    // 重置设置按钮
    document.getElementById('reset-settings').addEventListener('click', resetSettings);
  }
  
  // 根据戏剧类型更新推荐的心理模型
  function updatePsychModels() {
    const dramaType = document.getElementById('drama-type').value;
    
    // 重置所有模型选择
    document.getElementById('model-jungian').checked = false;
    document.getElementById('model-freudian').checked = false;
    document.getElementById('model-bigfive').checked = false;
    document.getElementById('model-adlerian').checked = false;
    document.getElementById('model-dramaticaction').checked = false;
    document.getElementById('model-attachment').checked = false;
    
    // 根据戏剧类型设置推荐模型
    switch(dramaType) {
      case 'classical':
        document.getElementById('model-jungian').checked = true;
        document.getElementById('model-dramaticaction').checked = true;
        break;
      case 'psychological':
        document.getElementById('model-freudian').checked = true;
        document.getElementById('model-bigfive').checked = true;
        break;
      case 'postmodern':
        document.getElementById('model-jungian').checked = true;
        document.getElementById('model-attachment').checked = true;
        break;
      case 'chinese':
        document.getElementById('model-dramaticaction').checked = true;
        document.getElementById('model-jungian').checked = true;
        break;
      case 'realistic':
        document.getElementById('model-bigfive').checked = true;
        document.getElementById('model-adlerian').checked = true;
        break;
      case 'absurd':
        document.getElementById('model-freudian').checked = true;
        document.getElementById('model-jungian').checked = true;
        break;
      case 'epic':
        document.getElementById('model-dramaticaction').checked = true;
        document.getElementById('model-adlerian').checked = true;
        break;
    }
  }
  
  // 生成提问
  function generatePrompt() {
    // 收集基础信息
    const dramaType = document.getElementById('drama-type').value;
    const analysisNeed = document.getElementById('analysis-need').value;
    const characterName = document.getElementById('character-name').value;
    const playName = document.getElementById('play-name').value;
    const simpleQuestion = document.getElementById('simple-question').value;
    const outputFormat = document.getElementById('output-format').value;
    
    // 验证必填字段
    if (!characterName || !playName || !simpleQuestion) {
      alert('请填写角色名称、剧本名称和简单问题描述');
      return;
    }
    
    // 收集高级设置
    const selectedModels = getSelectedModels();
    const depth = document.getElementById('depth-slider').value;
    const languageStyle = document.getElementById('language-style').value;
    
    // 生成提问
    const promptContent = buildPrompt({
      dramaType,
      analysisNeed,
      characterName,
      playName,
      simpleQuestion,
      outputFormat,
      selectedModels,
      depth,
      languageStyle
    });
    
    // 显示结果区域
    document.getElementById('result-section').classList.remove('hidden');
    document.getElementById('result-container').textContent = promptContent;
    
    // 保存提问到local storage以便content script使用
    chrome.storage.local.set({ 'lastPrompt': promptContent });
  }
  
  // 获取选中的心理模型
  function getSelectedModels() {
    const models = [];
    
    if (document.getElementById('model-jungian').checked) models.push('jungian');
    if (document.getElementById('model-freudian').checked) models.push('freudian');
    if (document.getElementById('model-bigfive').checked) models.push('bigfive');
    if (document.getElementById('model-adlerian').checked) models.push('adlerian');
    if (document.getElementById('model-dramaticaction').checked) models.push('dramaticaction');
    if (document.getElementById('model-attachment').checked) models.push('attachment');
    
    // 确保至少选择一个模型
    if (models.length === 0) {
      models.push('bigfive'); // 默认至少使用五因素模型
    }
    
    return models;
  }
  
  // 构建提问内容
  function buildPrompt(params) {
    const {
      dramaType,
      analysisNeed,
      characterName,
      playName,
      simpleQuestion,
      outputFormat,
      selectedModels,
      depth,
      languageStyle
    } = params;
    
    // 1. 构建提问标题和背景信息
    let prompt = `# 戏剧人物分析专业提问\n\n`;
    prompt += `## 背景信息\n`;
    prompt += `- 剧作: ${playName}\n`;
    prompt += `- 角色: ${characterName}\n`;
    prompt += `- 戏剧类型: ${getReadableDramaType(dramaType)}\n`;
    prompt += `- 分析需求: ${getReadableAnalysisNeed(analysisNeed)}\n\n`;
    
    // 2. 构建理论框架部分
    prompt += `## 理论分析框架\n`;
    prompt += `请使用以下心理学模型进行分析:\n`;
    selectedModels.forEach(model => {
      const modelInfo = getPsychModelInfo(model);
      prompt += `- **${modelInfo.name}**: ${modelInfo.description}\n`;
      
      // 如果深度大于3，添加更详细的模型说明
      if (depth >= 4 && modelInfo.concepts) {
        prompt += `  核心概念: ${modelInfo.concepts.join(', ')}\n`;
      }
    });
    prompt += `\n`;
    
    // 3. 根据分析需求构建具体问题
    prompt += `## 分析请求\n`;
    prompt += `我的原始问题是: ${simpleQuestion}\n\n`;
    prompt += `请${getDepthDescription(depth)}地分析${playName}中${characterName}的${getAnalysisAspect(analysisNeed)}。`;
    
    // 4. 添加分析维度
    prompt += `\n\n请从以下维度进行分析:\n`;
    getAnalysisDimensions(analysisNeed, dramaType).forEach((dimension, index) => {
      prompt += `${index + 1}. ${dimension}\n`;
    });
    
    // 5. 添加输出格式要求
    prompt += `\n## 输出格式要求\n`;
    prompt += getOutputFormatRequirements(outputFormat, languageStyle);
    
    return prompt;
  }
  
  // 复制到剪贴板
  function copyToClipboard() {
    const resultContainer = document.getElementById('result-container');
    const textToCopy = resultContainer.textContent;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        // 显示复制成功的视觉反馈
        const copyBtn = document.getElementById('copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '已复制!';
        copyBtn.style.backgroundColor = '#0f9d58';
        
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.style.backgroundColor = '';
        }, 2000);
      })
      .catch(err => {
        console.error('复制失败: ', err);
      });
  }
  
  // 发送到AI
  function injectToAI() {
    // 获取最后生成的提问
    chrome.storage.local.get(['lastPrompt'], function(result) {
      if (result.lastPrompt) {
        // 查询当前活动标签页
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          // 发送消息到content script
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "injectPrompt",
            prompt: result.lastPrompt
          });
          
          // 提供视觉反馈
          const injectBtn = document.getElementById('inject-btn');
          const originalText = injectBtn.textContent;
          injectBtn.textContent = '已发送!';
          
          setTimeout(() => {
            injectBtn.textContent = originalText;
          }, 2000);
        });
      }
    });
  }
  
  // 保存设置
  function saveSettings() {
    const settings = {
      dramaType: document.getElementById('drama-type').value,
      analysisNeed: document.getElementById('analysis-need').value,
      outputFormat: document.getElementById('output-format').value,
      models: getSelectedModels(),
      depth: document.getElementById('depth-slider').value,
      languageStyle: document.getElementById('language-style').value
    };
    
    chrome.storage.local.set({ 'settings': settings }, function() {
      // 提供视觉反馈
      const saveBtn = document.getElementById('save-settings');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = '已保存!';
      
      setTimeout(() => {
        saveBtn.textContent = originalText;
      }, 2000);
    });
  }
  
  // 重置设置
  function resetSettings() {
    // 默认设置
    const defaultSettings = {
      dramaType: 'psychological',
      analysisNeed: 'character',
      outputFormat: 'practical',
      models: ['bigfive', 'dramaticaction'],
      depth: 3,
      languageStyle: 'professional'
    };
    
    // 应用默认设置到UI
    document.getElementById('drama-type').value = defaultSettings.dramaType;
    document.getElementById('analysis-need').value = defaultSettings.analysisNeed;
    document.getElementById('output-format').value = defaultSettings.outputFormat;
    document.getElementById('depth-slider').value = defaultSettings.depth;
    document.getElementById('language-style').value = defaultSettings.languageStyle;
    
    // 重置模型选择
    document.getElementById('model-jungian').checked = false;
    document.getElementById('model-freudian').checked = false;
    document.getElementById('model-bigfive').checked = true;
    document.getElementById('model-adlerian').checked = false;
    document.getElementById('model-dramaticaction').checked = true;
    document.getElementById('model-attachment').checked = false;
    
    // 保存默认设置
    chrome.storage.local.set({ 'settings': defaultSettings }, function() {
      // 提供视觉反馈
      const resetBtn = document.getElementById('reset-settings');
      const originalText = resetBtn.textContent;
      resetBtn.textContent = '已重置!';
      
      setTimeout(() => {
        resetBtn.textContent = originalText;
      }, 2000);
    });
  }
  
  // 获取可读的戏剧类型名称
  function getReadableDramaType(dramaType) {
    const types = {
      'classical': '古典悲剧/神话戏剧',
      'psychological': '现代心理剧',
      'postmodern': '后现代/实验戏剧',
      'chinese': '传统中国戏曲',
      'realistic': '社会现实主义戏剧',
      'absurd': '荒诞派戏剧',
      'epic': '史诗剧场/叙事剧场'
    };
    return types[dramaType] || dramaType;
  }
  
  // 获取可读的分析需求名称
  function getReadableAnalysisNeed(analysisNeed) {
    const needs = {
      'character': '角色性格分析',
      'relationship': '角色关系分析',
      'acting': '表演指导建议',
      'development': '角色发展弧线',
      'symbolic': '象征意义解读'
    };
    return needs[analysisNeed] || analysisNeed;
  }
  
  // 获取分析的方面
  function getAnalysisAspect(analysisNeed) {
    const aspects = {
      'character': '性格特点',
      'relationship': '关系网络',
      'acting': '表演诠释方法',
      'development': '人物发展弧线',
      'symbolic': '象征意义与隐喻'
    };
    return aspects[analysisNeed] || '特点';
  }
  
  // 获取深度描述
  function getDepthDescription(depth) {
    const descriptions = {
      1: '简要',
      2: '基本',
      3: '全面',
      4: '深入',
      5: '极其详尽'
    };
    return descriptions[depth] || '全面';
  }
  
  // 获取心理模型信息
  function getPsychModelInfo(model) {
    const models = {
      'jungian': {
        name: '荣格原型理论',
        description: '分析角色的原型特征、集体潜意识模式和象征意义',
        concepts: ['原型', '集体潜意识', '阴影', '阿尼玛/阿尼姆斯', '人格面具', '个体化']
      },
      'freudian': {
        name: '弗洛伊德精神分析',
        description: '探索角色的潜意识动机、心理防御机制和早期经历影响',
        concepts: ['本我-自我-超我', '恋母/恋父情结', '心理防御机制', '力比多与死亡本能']
      },
      'bigfive': {
        name: '五因素人格模型',
        description: '从开放性、尽责性、外向性、宜人性和神经质五个维度分析角色性格',
        concepts: ['开放性', '尽责性', '外向性', '宜人性', '神经质']
      },
      'adlerian': {
        name: '阿德勒个体心理学',
        description: '分析角色的追求优越感、社会兴趣和生活风格',
        concepts: ['自卑与优越', '社会兴趣', '生活风格', '目标导向', '创造性自我']
      },
      'dramaticaction': {
        name: '戏剧行动模型',
        description: '关注角色的行动目标、策略和戏剧性转变',
        concepts: ['戏剧性行动', '超级目标', '行动策略', '转折点', '戏剧冲突']
      },
      'attachment': {
        name: '依恋理论',
        description: '分析角色的人际依恋模式、安全感需求和关系策略',
        concepts: ['安全型依恋', '焦虑型依恋', '回避型依恋', '混乱型依恋', '内部工作模式']
      }
    };
    
    return models[model] || { name: '未知模型', description: '请选择有效的心理学模型' };
  }
  
  // 获取分析维度
  function getAnalysisDimensions(analysisNeed, dramaType) {
    // 基础维度集
    const baseDimensions = {
      'character': [
        '核心性格特质与气质',
        '内在冲突与矛盾',
        '价值观与信念系统',
        '行为模式与决策风格',
        '心理防御机制'
      ],
      'relationship': [
        '与主要角色的关系动态',
        '权力结构与依赖模式',
        '冲突来源与演变',
        '关系中的沟通模式',
        '关系对角色发展的影响'
      ],
      'acting': [
        '角色的核心情感状态',
        '身体语言与声音特征',
        '关键场景的表演重点',
        '角色转变点的处理方法',
        '与其他角色互动的节奏与能量'
      ],
      'development': [
        '角色起点与背景',
        '关键转变点与催化事件',
        '内在成长与外在变化',
        '角色弧线的节奏与结构',
        '最终状态与变化意义'
      ],
      'symbolic': [
        '角色的象征意义',
        '与主题的关联',
        '文化与历史语境',
        '重复意象与隐喻',
        '角色作为社会/心理原型的功能'
      ]
    };
    
    // 特定戏剧类型的附加维度
    const additionalDimensions = {
      'classical': {
        'character': ['悲剧性缺陷(Hamartia)', '英雄原型特征'],
        'symbolic': ['神话元素与原型意义', '命运与自由意志的冲突']
      },
      'chinese': {
        'character': ['角色行当特征', '伦理关系网络中的定位'],
        'acting': ['程式化表演元素', '传统身段与唱腔']
      },
      'absurd': {
        'character': ['存在主义特征', '荒诞性与异化感'],
        'symbolic': ['反常规逻辑', '存在困境的象征']
      }
    };
    
    // 获取基础维度
    let dimensions = [...baseDimensions[analysisNeed]];
    
    // 添加特定戏剧类型的维度
    if (additionalDimensions[dramaType] && additionalDimensions[dramaType][analysisNeed]) {
      dimensions = dimensions.concat(additionalDimensions[dramaType][analysisNeed]);
    }
    
    return dimensions;
  }
  
  // 获取输出格式要求
  function getOutputFormatRequirements(outputFormat, languageStyle) {
    // 基本格式要求
    const baseRequirements = {
      'academic': '请以学术论文风格输出，包含理论框架、多维度分析、文化历史语境、象征意义和理论应用结论等部分。',
      'practical': '请以实用指导风格输出，包含角色核心概述、关键性格特质、关系网络、表演技术指导和发展关键节点等部分。',
      'creative': '请以创意分析风格输出，包含角色意象构想、内在风景图、声音与节奏特性、隐藏故事和创意演绎可能性等部分。',
      'comprehensive': '请综合多种视角进行全面分析，包含角色核心概述、多维度心理分析、关系网络、戏剧行动分析、表演指导和视觉感官构想等部分。'
    };
    
    // 语言风格修饰
    const styleModifiers = {
      'formal': '使用学术术语和规范格式，保持客观严谨的学术语言。',
      'professional': '使用专业戏剧和心理学术语，但确保清晰可理解，重点提供可操作的建议。',
      'creative': '使用生动形象的语言和比喻，激发创作灵感，可以适当使用诗意表达。',
      'simple': '使用简明易懂的语言，避免过多专业术语，确保戏剧实践者能够直接应用。'
    };
    
    return `${baseRequirements[outputFormat]} ${styleModifiers[languageStyle]}`;
  }