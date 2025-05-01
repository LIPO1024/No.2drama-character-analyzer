// 插件安装或更新时运行
chrome.runtime.onInstalled.addListener(function() {
    console.log("戏剧人物性格分析全能助手已安装");
    
    // 初始化存储
    chrome.storage.local.set({
      'settings': {
        dramaType: 'psychological',
        analysisNeed: 'character',
        outputFormat: 'practical',
        models: ['bigfive', 'dramaticaction'],
        depth: 3,
        languageStyle: 'professional'
      },
      'history': []
    });
  });
  
  // 添加上下文菜单（可选功能）
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "analyzeCharacter",
      title: "分析所选角色",
      contexts: ["selection"]
    });
  });
  
  // 处理上下文菜单点击事件
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "analyzeCharacter") {
      // 获取所选文本
      const selectedText = info.selectionText;
      
      // 打开插件弹窗
      chrome.action.openPopup();
      
      // 发送选中的文本到popup
      setTimeout(() => {
        chrome.runtime.sendMessage({
          action: "setSelectedText",
          text: selectedText
        });
      }, 300);
    }
  });