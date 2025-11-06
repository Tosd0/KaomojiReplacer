/**
 * api-usage.js
 * 演示新的 API 使用方式
 * 运行: node examples/api-usage.js
 */

const {
    // 快捷 API
    quickReplace,
    quickQuery,
    batchReplace,

    // 工厂函数
    createReplacer,
    createManager,
    createSearchEngine,

    // 核心类
    EmoticonReplacer,
    SearchEngine,
    EmoticonDataManager,

    // 工具函数
    validateData,
    loadFromFile,

    // 常量
    VERSION,
    REPLACE_STRATEGIES
} = require('../index.js');

// 测试数据
const testEmoticons = [
    {
        emoticon: "= =",
        keywords: ["无语", "黑脸", "无奈", "翻白眼"],
        weight: 1.0,
        category: "表情"
    },
    {
        emoticon: "(╯°□°）╯︵ ┻━┻",
        keywords: ["掀桌", "愤怒", "生气", "暴躁"],
        weight: 1.0,
        category: "动作"
    },
    {
        emoticon: "ヽ(´▽`)/",
        keywords: ["开心", "高兴", "快乐", "兴奋"],
        weight: 1.0,
        category: "表情"
    },
    {
        emoticon: "_(:3」∠)_",
        keywords: ["躺平", "摆烂", "咸鱼", "懒"],
        weight: 1.0,
        category: "动作"
    }
];

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    red: '\x1b[31m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function separator() {
    console.log('='.repeat(60));
}

function demo(title, fn) {
    separator();
    log(`\n📌 ${title}\n`, 'cyan');
    fn();
    console.log();
}

console.log('\n🚀 Emoticon Replacer API 使用示例\n');
log(`版本: ${VERSION}`, 'yellow');
log(`策略: ${Object.values(REPLACE_STRATEGIES).join(', ')}`, 'yellow');

// ========== 演示 1: 快捷 API - quickReplace ==========
demo('演示 1: 快捷 API - quickReplace', () => {
    const text = '今天遇到 bug 真是[emoticon:无语,黑脸]，想要[emoticon:掀桌,愤怒]！';

    log('输入文本:', 'blue');
    console.log(text);

    const result = quickReplace(text, testEmoticons);

    log('\n输出文本:', 'blue');
    console.log(result.text);

    log('\n统计信息:', 'blue');
    console.log(`- 替换成功: ${result.successCount}`);
    console.log(`- 替换失败: ${result.failureCount}`);
});

// ========== 演示 2: 快捷 API - quickQuery ==========
demo('演示 2: 快捷 API - quickQuery', () => {
    const keywords = '开心 高兴';

    log(`查询关键词: ${keywords}`, 'blue');

    const results = quickQuery(keywords, testEmoticons, 3);

    log('\n匹配结果:', 'blue');
    results.forEach((r, i) => {
        console.log(`${i + 1}. ${r.emoticon} (分数: ${r.score.toFixed(2)}, 匹配: ${r.matchedKeywords.join(', ')})`);
    });
});

// ========== 演示 3: 批量替换 ==========
demo('演示 3: 批量替换 - batchReplace', () => {
    const texts = [
        '第一条[emoticon:开心,高兴]消息',
        '第二条[emoticon:无语]消息',
        '第三条[emoticon:掀桌,愤怒]消息'
    ];

    log('输入文本列表:', 'blue');
    texts.forEach((t, i) => console.log(`${i + 1}. ${t}`));

    const results = batchReplace(texts, testEmoticons);

    log('\n输出文本列表:', 'blue');
    results.forEach((r, i) => console.log(`${i + 1}. ${r.text}`));
});

// ========== 演示 4: 工厂函数 - createReplacer ==========
demo('演示 4: 工厂函数 - createReplacer', () => {
    const replacer = createReplacer({
        emoticons: testEmoticons,
        searchConfig: { k1: 1.5, b: 0.75 },
        replaceConfig: { replaceStrategy: 'best' }
    });

    const text = '今天[emoticon:开心]完成了任务';
    const result = replacer.replaceText(text);

    log('使用工厂函数创建的替换器:', 'blue');
    console.log(`输入: ${text}`);
    console.log(`输出: ${result.text}`);
});

// ========== 演示 5: 工厂函数 - createManager ==========
demo('演示 5: 工厂函数 - createManager', () => {
    // 从数组创建
    const manager = createManager(testEmoticons);

    log('从数组创建管理器:', 'blue');
    console.log(`总计颜文字: ${manager.getAllEmoticons().length}`);
    console.log(`总计关键词: ${manager.getAllKeywords().length}`);
    console.log(`分类列表: ${manager.getAllCategories().join(', ')}`);

    // 添加新颜文字
    manager.addEmoticon({
        emoticon: '(๑•̀ㅂ•́)و✧',
        keywords: ['加油', '努力'],
        weight: 1.5,
        category: '鼓励'
    });

    log('\n添加新颜文字后:', 'blue');
    console.log(`总计颜文字: ${manager.getAllEmoticons().length}`);
});

// ========== 演示 6: 核心类使用 ==========
demo('演示 6: 核心类直接使用', () => {
    const manager = new EmoticonDataManager();
    manager.loadFromArray(testEmoticons);

    const searchEngine = new SearchEngine({ k1: 1.5, b: 0.75 });
    const replacer = new EmoticonReplacer(searchEngine);
    replacer.loadEmoticons(manager.getAllEmoticons());

    const text = '调试了半天，最后[emoticon:开心,高兴]解决了！';
    const result = replacer.replaceText(text);

    log('使用核心类:', 'blue');
    console.log(`输入: ${text}`);
    console.log(`输出: ${result.text}`);
});

// ========== 演示 7: 预览功能 ==========
demo('演示 7: 预览功能', () => {
    const replacer = createReplacer({ emoticons: testEmoticons });

    const text = '今天[emoticon:开心,高兴]又[emoticon:躺平,摆烂]了';
    const preview = replacer.preview(text);

    log('预览替换结果（不实际替换）:', 'blue');
    console.log(`文本: ${text}\n`);

    preview.forEach((p, i) => {
        console.log(`标记 ${i + 1}: ${p.marker}`);
        console.log(`  关键词: ${p.keywords.join(', ')}`);
        console.log(`  最佳匹配: ${p.bestMatch?.emoticon || 'N/A'}`);
        console.log(`  分数: ${p.bestMatch?.score.toFixed(2) || 'N/A'}`);
    });
});

// ========== 演示 8: 数据验证 ==========
demo('演示 8: 数据验证 - validateData', () => {
    const validData = [
        { emoticon: '😊', keywords: ['笑', '开心'], weight: 1.0, category: '' }
    ];

    const invalidData = [
        { emoticon: '😊' }, // 缺少 keywords
        { keywords: ['test'] }, // 缺少 emoticon
        { emoticon: '😊', keywords: ['valid'] } // 有效
    ];

    log('验证有效数据:', 'blue');
    const result1 = validateData(validData);
    console.log(`结果: ${result1.valid ? '✓ 有效' : '✗ 无效'}`);

    log('\n验证无效数据:', 'blue');
    const result2 = validateData(invalidData);
    console.log(`结果: ${result2.valid ? '✓ 有效' : '✗ 无效'}`);
    if (!result2.valid) {
        console.log('错误列表:');
        result2.errors.forEach(err => console.log(`  - ${err}`));
    }
});

// ========== 演示 9: 数据管理 CRUD ==========
demo('演示 9: 数据管理 - CRUD 操作', () => {
    const manager = createManager(testEmoticons);

    log('原始数据:', 'blue');
    const emoticon = manager.getEmoticonByText('= =');
    console.log(`颜文字: ${emoticon.emoticon}`);
    console.log(`关键词: ${emoticon.keywords.join(', ')}`);
    console.log(`分类: ${emoticon.category || '(无)'}`);

    // 添加关键词
    manager.addKeyword('= =', '不爽');

    // 设置分类
    manager.setCategory('= =', '负面情绪');

    log('\n修改后:', 'blue');
    const updated = manager.getEmoticonByText('= =');
    console.log(`颜文字: ${updated.emoticon}`);
    console.log(`关键词: ${updated.keywords.join(', ')}`);
    console.log(`分类: ${updated.category}`);

    // 按分类筛选
    log('\n按分类筛选:', 'blue');
    const filtered = manager.filterByCategory('负面情绪');
    console.log(`找到 ${filtered.length} 个颜文字`);
});

// ========== 演示 10: 不同替换策略 ==========
demo('演示 10: 不同替换策略', () => {
    const replacer = createReplacer({ emoticons: testEmoticons });

    const text = '今天[emoticon:开心,高兴,快乐]';

    log('文本:', 'blue');
    console.log(text);

    log('\n策略: first (第一个匹配)', 'blue');
    const result1 = replacer.replaceText(text, { strategy: REPLACE_STRATEGIES.FIRST });
    console.log(result1.text);

    log('\n策略: best (最佳匹配，默认)', 'blue');
    const result2 = replacer.replaceText(text, { strategy: REPLACE_STRATEGIES.BEST });
    console.log(result2.text);

    log('\n策略: all (所有匹配)', 'blue');
    const result3 = replacer.replaceText(text, { strategy: REPLACE_STRATEGIES.ALL });
    console.log(result3.text);
});

// ========== 演示 11: 从文件加载（异步） ==========
demo('演示 11: 从文件加载数据', async () => {
    try {
        log('从 data/emoticons.template.json 加载...', 'blue');
        const emoticons = await loadFromFile('./data/emoticons.template.json');

        console.log(`✓ 成功加载 ${emoticons.length} 个颜文字`);

        // 使用加载的数据
        const result = quickReplace('测试[emoticon:无语]文本', emoticons);
        log('\n测试替换:', 'blue');
        console.log(result.text);
    } catch (error) {
        log(`✗ 加载失败: ${error.message}`, 'red');
    }
});

// ========== 演示 12: 数据导出 ==========
demo('演示 12: 数据导出', () => {
    const manager = createManager(testEmoticons);

    // 添加一些修改
    manager.addKeyword('= =', '不开心');
    manager.setCategory('= =', '表情');

    log('导出为 JSON 字符串:', 'blue');
    const json = manager.exportToJSON(false);
    console.log(`长度: ${json.length} 字节`);
    console.log(`预览: ${json.substring(0, 100)}...`);

    log('\n导出为数组:', 'blue');
    const array = manager.exportToArray();
    console.log(`数组长度: ${array.length}`);
    console.log(`第一项: ${JSON.stringify(array[0])}`);
});

// ========== 总结 ==========
separator();
log('\n✅ 所有演示完成！\n', 'green');
log('提示:', 'yellow');
console.log('- 快捷 API 适合简单场景');
console.log('- 工厂函数适合需要配置的场景');
console.log('- 核心类适合需要完全控制的场景');
console.log();
