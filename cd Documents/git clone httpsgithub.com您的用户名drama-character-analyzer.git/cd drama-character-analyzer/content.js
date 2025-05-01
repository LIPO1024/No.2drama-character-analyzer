// 监听来自popup的消息
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "injectPrompt") {
      injectPromptToAI(message.prompt);
    }
  });
  
  // 将提问注入到AI输入框
  function injectPromptToAI(prompt) {
    // 识别当前AI平台
    const platform = identifyAIPlatform();
    
    // 获取输入元素
    const inputElement = findInputElement(platform);
    
    if (!inputElement) {
      console.error('未找到输入框，无法注入提问');
      return;
    }
    
    // 设置输入框的值
    setInputValue(inputElement, prompt, platform);
    
    // 自动点击发送按钮（可选）
    const sendButton = findSendButton(platform);
    if (sendButton) {
      sendButton.click();
    }
  }
  
  // 识别当前AI平台
  function identifyAIPlatform() {
    const url = window.location.href;
    
    if (url.includes('chat.openai.com')) {
      return 'chatgpt';
    } else if (url.includes('claude.ai')) {
      return 'claude';
    } else if (url.includes('bing.com')) {
      return 'bing';
    } else if (url.includes('bard.google.com')) {
      return 'bard';
    }
    
    return 'unknown';
  }
  
  // 找到输入元素
  function findInputElement(platform) {
    let inputElement = null;
    
    switch(platform) {
      case 'chatgpt':
        // 尝试多种选择器，提高兼容性
        inputElement = document.querySelector('textarea[data-id="root"]') || 
                       document.querySelector('textarea[placeholder*="Send a message"]') ||
                       document.querySelector('div[role="textbox"]');
        break;
        
      case 'claude':
        // 尝试找到Claude的输入框
        inputElement = document.querySelector('div[contenteditable="true"]') ||
                       document.querySelector('textarea[placeholder*="Send a message"]');
        break;
        
      case 'bing':
        // 尝试找到Bing Chat的输入框
        inputElement = document.querySelector('#searchbox') ||
                       document.querySelector('textarea[placeholder*="Ask me anything"]');
        break;
        
      case 'bard':
        // 尝试找到Google Bard的输入框
        inputElement = document.querySelector('div[contenteditable="true"]') ||
                       document.querySelector('textarea[placeholder*="Ask me anything"]');
        break;
    }
    
    return inputElement;
  }
  
  // 设置输入值
  function setInputValue(element, value, platform) {
    if (!element) return;
    
    // 对于contenteditable元素
    if (element.getAttribute('contenteditable') === 'true') {
      element.innerHTML = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
    // 对于textarea或input元素
    else {
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      
      // 某些平台可能需要模拟用户输入
      if (platform === 'chatgpt') {
        simulateUserTyping(element, value);
      }
    }
  }
  
  // 模拟用户输入以触发某些平台的UI更新
  function simulateUserTyping(element, text) {
    const event = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: text
    });
    element.dispatchEvent(event);
  }
  
  // 查找发送按钮
  function findSendButton(platform) {
    let button = null;
    
    switch(platform) {
      case 'chatgpt':
        button = document.querySelector('button[data-testid="send-button"]') ||
                 document.querySelector('button[aria-label="Send message"]');
        break;
        
      case 'claude':
        button = document.querySelector('button[aria-label="Send message"]') ||
                 document.querySelector('button.send-button');
        break;
        
      case 'bing':
        button = document.querySelector('#search-button') ||
                 document.querySelector('button[aria-label="Submit"]');
        break;
        
      case 'bard':
        button = document.querySelector('button[aria-label="Send"]') ||
                 document.querySelector('button.send-button');
        break;
    }
    
    return button;
  }