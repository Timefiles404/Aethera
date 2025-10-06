// 全局变量
let materials = []; // 存储所有创建的材料
let craftingSlots = {}; // 存储工艺台上的材料 {position: material}
let playerLevel = 10; // 模拟玩家等级
let playerSubLevel = 5; // 模拟玩家副职等级
let isCrafting = false; // 是否正在工艺中

// 材料类定义
class Material {
    constructor(name, icon, type, stats, modifyStats, levelRequirements) {
        this.id = Date.now() + Math.random(); // 唯一ID
        this.name = name;
        this.icon = icon;
        this.type = type; // 'ingredient' 或 'base'
        this.stats = stats; // {damage, critDamage, health, defense}
        this.modifyStats = modifyStats; // {left, right, up, down}
        this.levelRequirements = levelRequirements; // {main, sub}
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateStatusDisplay();
    createSampleMaterials(); // 创建一些示例材料
});

// 初始化事件监听器
function initializeEventListeners() {
    // 材料创建按钮
    document.getElementById('createMaterial').addEventListener('click', createMaterial);
    
    // 工艺按钮
    document.getElementById('craftButton').addEventListener('click', startCrafting);
    
    // 设置拖拽事件
    setupDragAndDrop();
}

// 创建材料
function createMaterial() {
    const name = document.getElementById('materialName').value.trim();
    const icon = document.getElementById('materialIcon').value.trim() || '📦';
    const type = document.querySelector('input[name="materialType"]:checked').value;
    
    if (!name) {
        alert('请输入材料名称！');
        return;
    }
    
    const stats = {
        damage: parseInt(document.getElementById('damage').value) || 0,
        critDamage: parseInt(document.getElementById('critDamage').value) || 0,
        health: parseInt(document.getElementById('health').value) || 0,
        defense: parseInt(document.getElementById('defense').value) || 0
    };
    
    const modifyStats = {
        left: parseInt(document.getElementById('modifyLeft').value) || 0,
        right: parseInt(document.getElementById('modifyRight').value) || 0,
        up: parseInt(document.getElementById('modifyUp').value) || 0,
        down: parseInt(document.getElementById('modifyDown').value) || 0
    };
    
    const levelRequirements = {
        main: parseInt(document.getElementById('mainLevel').value) || 1,
        sub: parseInt(document.getElementById('subLevel').value) || 1
    };
    
    const material = new Material(name, icon, type, stats, modifyStats, levelRequirements);
    materials.push(material);
    
    // 添加到库存显示
    addMaterialToInventory(material);
    
    // 清空表单
    clearMaterialForm();
    
    updateStatusDisplay();
}

// 创建示例材料
function createSampleMaterials() {
    const sampleMaterials = [
        new Material('铁剑', '⚔️', 'base', {damage: 10, critDamage: 5, health: 0, defense: 0}, {left: 0, right: 0, up: 0, down: 0}, {main: 1, sub: 1}),
        new Material('强化石', '💎', 'ingredient', {damage: 5, critDamage: 0, health: 0, defense: 0}, {left: 0, right: 10, up: 0, down: 0}, {main: 2, sub: 1}),
        new Material('生命宝石', '❤️', 'ingredient', {damage: 0, critDamage: 0, health: 20, defense: 0}, {left: 0, right: 0, up: 0, down: 15}, {main: 3, sub: 2}),
        new Material('防御符文', '🛡️', 'ingredient', {damage: 0, critDamage: 0, health: 0, defense: 8}, {left: 5, right: 0, up: 0, down: 0}, {main: 2, sub: 1}),
        new Material('暴击水晶', '💥', 'ingredient', {damage: 0, critDamage: 15, health: 0, defense: 0}, {left: 0, right: 0, up: 20, down: 0}, {main: 4, sub: 3}),
        new Material('魔法木材', '🪵', 'base', {damage: 3, critDamage: 2, health: 5, defense: 2}, {left: 0, right: 0, up: 0, down: 0}, {main: 1, sub: 1})
    ];
    
    sampleMaterials.forEach(material => {
        materials.push(material);
        addMaterialToInventory(material);
    });
}

// 添加材料到库存显示
function addMaterialToInventory(material) {
    const inventoryGrid = document.getElementById('inventoryGrid');
    const materialElement = createMaterialElement(material);
    inventoryGrid.appendChild(materialElement);
}

// 创建材料元素
function createMaterialElement(material) {
    const element = document.createElement('div');
    element.className = 'inventory-item';
    element.draggable = true;
    element.dataset.materialId = material.id;
    
    element.innerHTML = `
        <div class="material-icon">${material.icon}</div>
        <div class="material-name">${material.name}</div>
    `;
    
    // 添加拖拽事件
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragend', handleDragEnd);
    
    // 添加悬停显示属性
    element.addEventListener('mouseenter', (e) => showMaterialTooltip(e, material));
    element.addEventListener('mouseleave', hideMaterialTooltip);
    
    return element;
}

// 设置拖拽功能
function setupDragAndDrop() {
    // 为所有槽位添加拖拽事件
    const slots = document.querySelectorAll('.ingredient-slot, .base-material-slot');
    slots.forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', handleDrop);
        slot.addEventListener('dragenter', handleDragEnter);
        slot.addEventListener('dragleave', handleDragLeave);
        slot.addEventListener('click', handleSlotClick); // 点击移除材料
    });
}

// 拖拽开始
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.materialId);
    e.target.classList.add('dragging');
}

// 拖拽结束
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

// 拖拽悬停
function handleDragOver(e) {
    e.preventDefault();
}

// 拖拽进入
function handleDragEnter(e) {
    e.preventDefault();
    e.target.classList.add('drag-over');
}

// 拖拽离开
function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
}

// 拖拽放置
function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    
    const materialId = e.dataTransfer.getData('text/plain');
    const material = materials.find(m => m.id == materialId);
    const slot = e.target.closest('.ingredient-slot, .base-material-slot');
    
    if (!material || !slot) return;
    
    // 检查槽位类型匹配
    const position = slot.dataset.position;
    if (position === 'base' && material.type !== 'base') {
        alert('基础材料槽只能放置基础材料！');
        return;
    }
    if (position !== 'base' && material.type !== 'ingredient') {
        alert('配料槽只能放置配料！');
        return;
    }
    
    // 检查等级需求
    if (!checkLevelRequirements(material)) {
        alert(`等级不足！需要主等级${material.levelRequirements.main}，副职等级${material.levelRequirements.sub}`);
        return;
    }
    
    // 如果槽位已有材料，先移除
    if (craftingSlots[position]) {
        removeMaterialFromSlot(position);
    }
    
    // 放置材料
    placeMaterialInSlot(material, position, slot);
    
    // 从库存中移除（视觉上）
    const inventoryItem = document.querySelector(`[data-material-id="${materialId}"]`);
    if (inventoryItem) {
        inventoryItem.style.display = 'none';
    }
    
    updateStatusDisplay();
}

// 槽位点击事件（移除材料）
function handleSlotClick(e) {
    const slot = e.target.closest('.ingredient-slot, .base-material-slot');
    if (!slot) return;
    
    const position = slot.dataset.position;
    if (craftingSlots[position]) {
        removeMaterialFromSlot(position);
        updateStatusDisplay();
    }
}

// 放置材料到槽位
function placeMaterialInSlot(material, position, slot) {
    craftingSlots[position] = material;
    
    const materialElement = createMaterialElement(material);
    materialElement.classList.add('material-item');
    materialElement.style.cursor = 'pointer';
    
    slot.innerHTML = '';
    slot.appendChild(materialElement);
    slot.classList.add('occupied');
}

// 从槽位移除材料
function removeMaterialFromSlot(position) {
    const material = craftingSlots[position];
    if (!material) return;
    
    delete craftingSlots[position];
    
    const slot = document.querySelector(`[data-position="${position}"]`);
    if (slot) {
        slot.innerHTML = position === 'base' ? '<span class="checkmark">✓</span>' : position;
        slot.classList.remove('occupied');
    }
    
    // 恢复库存中的材料显示
    const inventoryItem = document.querySelector(`[data-material-id="${material.id}"]`);
    if (inventoryItem) {
        inventoryItem.style.display = 'flex';
    }
}

// 检查等级需求
function checkLevelRequirements(material) {
    return playerLevel >= material.levelRequirements.main && 
           playerSubLevel >= material.levelRequirements.sub;
}

// 开始工艺
function startCrafting() {
    if (isCrafting) return;
    
    // 检查是否有基础材料
    if (!craftingSlots.base) {
        alert('请先放置基础材料！');
        return;
    }
    
    // 检查是否有配料
    const ingredients = Object.keys(craftingSlots).filter(pos => pos !== 'base');
    if (ingredients.length === 0) {
        alert('请至少放置一个配料！');
        return;
    }
    
    isCrafting = true;
    const craftButton = document.getElementById('craftButton');
    craftButton.classList.add('crafting');
    craftButton.innerHTML = '<span class="arrow">⏳</span>';
    
    updateCraftingStatus('工艺进行中... 10秒');
    
    // 播放音效（模拟）
    playSound();
    
    // 10秒倒计时
    let countdown = 10;
    const countdownInterval = setInterval(() => {
        countdown--;
        updateCraftingStatus(`工艺进行中... ${countdown}秒`);
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            completeCrafting();
        }
    }, 1000);
}

// 完成工艺
function completeCrafting() {
    // 计算最终属性
    const finalStats = calculateFinalStats();
    
    // 创建结果武器
    const resultWeapon = createResultWeapon(finalStats);
    
    // 显示结果
    displayResult(resultWeapon);
    
    // 清空工艺台
    clearCraftingTable();
    
    // 重置状态
    isCrafting = false;
    const craftButton = document.getElementById('craftButton');
    craftButton.classList.remove('crafting');
    craftButton.innerHTML = '<span class="arrow">→</span>';
    
    updateCraftingStatus('工艺完成！');
    updateStatusDisplay();
}

// 计算最终属性
function calculateFinalStats() {
    const baseMaterial = craftingSlots.base;
    let finalStats = { ...baseMaterial.stats };
    
    // 获取所有配料
    const ingredients = [];
    for (let i = 1; i <= 8; i++) {
        if (craftingSlots[i]) {
            ingredients[i-1] = craftingSlots[i];
        }
    }
    
    // 应用modify效果
    for (let i = 0; i < 8; i++) {
        const ingredient = ingredients[i];
        if (!ingredient) continue;
        
        const modifyStats = ingredient.modifyStats;
        
        // 检查右修改（影响右边的材料）
        if (modifyStats.right > 0) {
            const rightIndex = getRightIndex(i);
            if (rightIndex !== -1 && ingredients[rightIndex]) {
                applyModifyEffect(ingredients[rightIndex], modifyStats.right);
            }
        }
        
        // 检查下修改（影响下面的材料）
        if (modifyStats.down > 0) {
            const downIndex = getDownIndex(i);
            if (downIndex !== -1 && ingredients[downIndex]) {
                applyModifyEffect(ingredients[downIndex], modifyStats.down);
            }
        }
        
        // 检查左修改（影响左边的材料）
        if (modifyStats.left > 0) {
            const leftIndex = getLeftIndex(i);
            if (leftIndex !== -1 && ingredients[leftIndex]) {
                applyModifyEffect(ingredients[leftIndex], modifyStats.left);
            }
        }
        
        // 检查上修改（影响上面的材料）
        if (modifyStats.up > 0) {
            const upIndex = getUpIndex(i);
            if (upIndex !== -1 && ingredients[upIndex]) {
                applyModifyEffect(ingredients[upIndex], modifyStats.up);
            }
        }
    }
    
    // 累加所有配料的属性
    ingredients.forEach(ingredient => {
        if (ingredient) {
            finalStats.damage += ingredient.stats.damage;
            finalStats.critDamage += ingredient.stats.critDamage;
            finalStats.health += ingredient.stats.health;
            finalStats.defense += ingredient.stats.defense;
        }
    });
    
    return finalStats;
}

// 获取相邻位置索引
function getRightIndex(index) {
    // 工艺台布局: 0,1,2,_,3,4,5,_,6,7,8,_
    // 实际位置: 1,2,3,_,4,5,6,_,7,8,9,_
    const positions = [0, 1, 2, -1, 3, 4, 5, -1, 6, 7, 8, -1];
    const currentPos = positions.indexOf(index);
    if (currentPos === -1) return -1;
    
    const rightPos = currentPos + 1;
    if (rightPos < positions.length && positions[rightPos] !== -1) {
        return positions[rightPos];
    }
    return -1;
}

function getDownIndex(index) {
    const positions = [0, 1, 2, -1, 3, 4, 5, -1, 6, 7, 8, -1];
    const currentPos = positions.indexOf(index);
    if (currentPos === -1) return -1;
    
    const downPos = currentPos + 4;
    if (downPos < positions.length && positions[downPos] !== -1) {
        return positions[downPos];
    }
    return -1;
}

function getLeftIndex(index) {
    const positions = [0, 1, 2, -1, 3, 4, 5, -1, 6, 7, 8, -1];
    const currentPos = positions.indexOf(index);
    if (currentPos === -1) return -1;
    
    const leftPos = currentPos - 1;
    if (leftPos >= 0 && positions[leftPos] !== -1) {
        return positions[leftPos];
    }
    return -1;
}

function getUpIndex(index) {
    const positions = [0, 1, 2, -1, 3, 4, 5, -1, 6, 7, 8, -1];
    const currentPos = positions.indexOf(index);
    if (currentPos === -1) return -1;
    
    const upPos = currentPos - 4;
    if (upPos >= 0 && positions[upPos] !== -1) {
        return positions[upPos];
    }
    return -1;
}

// 应用修改效果
function applyModifyEffect(material, modifyValue) {
    const multiplier = 1 + (modifyValue / 100);
    material.stats.damage = Math.floor(material.stats.damage * multiplier);
    material.stats.critDamage = Math.floor(material.stats.critDamage * multiplier);
    material.stats.health = Math.floor(material.stats.health * multiplier);
    material.stats.defense = Math.floor(material.stats.defense * multiplier);
}

// 创建结果武器
function createResultWeapon(finalStats) {
    const baseMaterial = craftingSlots.base;
    return new Material(
        `强化${baseMaterial.name}`,
        baseMaterial.icon,
        baseMaterial.type,
        finalStats,
        {left: 0, right: 0, up: 0, down: 0},
        baseMaterial.levelRequirements
    );
}

// 显示结果
function displayResult(weapon) {
    const resultSlot = document.getElementById('resultSlot');
    const weaponElement = createMaterialElement(weapon);
    weaponElement.classList.add('material-item');
    
    resultSlot.innerHTML = '';
    resultSlot.appendChild(weaponElement);
    
    // 添加到材料库存
    materials.push(weapon);
    addMaterialToInventory(weapon);
}

// 清空工艺台
function clearCraftingTable() {
    Object.keys(craftingSlots).forEach(position => {
        removeMaterialFromSlot(position);
    });
    craftingSlots = {};
}

// 播放音效（模拟）
function playSound() {
    // 创建音频上下文来播放简单的音效
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        const audioContext = new (AudioContext || webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
}

// 更新状态显示
function updateStatusDisplay() {
    updateStatsPreview();
    updateCraftingStatus('等待材料放置...');
}

// 更新属性预览
function updateStatsPreview() {
    const statsPreview = document.querySelector('.stats-preview');
    
    if (!craftingSlots.base) {
        statsPreview.innerHTML = '<p>请先放置基础材料</p>';
        return;
    }
    
    const previewStats = calculatePreviewStats();
    
    statsPreview.innerHTML = `
        <div class="stat-item">伤害: ${previewStats.damage}</div>
        <div class="stat-item">暴击伤害: ${previewStats.critDamage}</div>
        <div class="stat-item">生命值: ${previewStats.health}</div>
        <div class="stat-item">防御值: ${previewStats.defense}</div>
        <hr>
        <div class="stat-item">玩家等级: ${playerLevel} / ${playerSubLevel}</div>
    `;
}

// 计算预览属性
function calculatePreviewStats() {
    const baseMaterial = craftingSlots.base;
    let previewStats = { ...baseMaterial.stats };
    
    // 简单累加配料属性（不考虑modify效果）
    Object.keys(craftingSlots).forEach(position => {
        if (position !== 'base') {
            const material = craftingSlots[position];
            previewStats.damage += material.stats.damage;
            previewStats.critDamage += material.stats.critDamage;
            previewStats.health += material.stats.health;
            previewStats.defense += material.stats.defense;
        }
    });
    
    return previewStats;
}

// 更新工艺状态
function updateCraftingStatus(message) {
    const statusText = document.querySelector('.status-text');
    statusText.textContent = message;
}

// 显示材料提示
function showMaterialTooltip(e, material) {
    const tooltip = document.createElement('div');
    tooltip.className = 'material-tooltip';
    tooltip.innerHTML = `
        <strong>${material.name}</strong><br>
        类型: ${material.type === 'base' ? '基础材料' : '配料'}<br>
        伤害: ${material.stats.damage}<br>
        暴击伤害: ${material.stats.critDamage}<br>
        生命值: ${material.stats.health}<br>
        防御值: ${material.stats.defense}<br>
        等级需求: ${material.levelRequirements.main}/${material.levelRequirements.sub}
    `;
    
    tooltip.style.position = 'absolute';
    tooltip.style.background = 'rgba(0,0,0,0.8)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '10px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.fontSize = '12px';
    tooltip.style.zIndex = '1000';
    tooltip.style.pointerEvents = 'none';
    
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.right + 10 + 'px';
    tooltip.style.top = rect.top + 'px';
    
    e.target.tooltip = tooltip;
}

// 隐藏材料提示
function hideMaterialTooltip(e) {
    if (e.target.tooltip) {
        document.body.removeChild(e.target.tooltip);
        delete e.target.tooltip;
    }
}

// 清空材料表单
function clearMaterialForm() {
    document.getElementById('materialName').value = '';
    document.getElementById('materialIcon').value = '';
    document.getElementById('damage').value = '0';
    document.getElementById('critDamage').value = '0';
    document.getElementById('health').value = '0';
    document.getElementById('defense').value = '0';
    document.getElementById('modifyLeft').value = '0';
    document.getElementById('modifyRight').value = '0';
    document.getElementById('modifyUp').value = '0';
    document.getElementById('modifyDown').value = '0';
    document.getElementById('mainLevel').value = '1';
    document.getElementById('subLevel').value = '1';
}