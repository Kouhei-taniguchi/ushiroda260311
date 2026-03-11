// ========================================
// 見積書作成アプリ - メインロジック
// 株式会社 後田建築
// ========================================

(function () {
    'use strict';

    // --- 定数 ---
    const STORAGE_KEY_MASTER = 'ushiroda_estimate_master';
    const STORAGE_KEY_HISTORY = 'ushiroda_estimate_history';
    const STORAGE_KEY_COUNTER = 'ushiroda_estimate_counter';

    const SENDER_NAME = '株式会社 後田建築';
    const SENDER_ADDRESS = '〒854-1112　長崎県諫早市飯盛町開２６−２';
    const SENDER_TEL = '0957-51-7543';
    const TAX_RATE = 0.10;

    // ロゴは logo.js から EMBEDDED_LOGO として読み込み済み
    const logoDataUrl = (typeof EMBEDDED_LOGO !== 'undefined') ? EMBEDDED_LOGO : null;

    // 日本語フォントは font.js から EMBEDDED_FONT として読み込み済み（ローカル埋め込み）
    const FONT_NAME = 'NotoSansCJK';
    const FONT_FILE = 'NotoSansCJK-Regular.ttf';

    // --- 初期マスタデータ ---
    const DEFAULT_MASTER = [
        { construction: '床張替', product: '大引き　105×105×4000', unitPrice: 4200, unit: '本' },
        { construction: '床張替', product: '大引き　105×105×3000', unitPrice: 3800, unit: '本' },
        { construction: '床張替', product: '銅製束　L＝420', unitPrice: 860, unit: '本' },
        { construction: '床張替', product: '根太　45×60×4000', unitPrice: 880, unit: '本' },
        { construction: '床張替', product: '根太　45×60×3000', unitPrice: 720, unit: '本' },
        { construction: '床張替', product: '木取り　45×90×4000', unitPrice: 2400, unit: '' },
        { construction: '床張替', product: 'カネライトフォーム　E3　60', unitPrice: 5200, unit: '板' },
        { construction: '床張替', product: 'カネライトフォーム　E3　40', unitPrice: 3800, unit: '板' },
        { construction: '床張替', product: '針葉樹合板　12.5×910×1820', unitPrice: 3800, unit: '枚' },
        { construction: '床張替', product: '針葉樹合板　24×910×1820', unitPrice: 4180, unit: '枚' },
        { construction: '床張替', product: '耐水べニヤ　4×910×1820', unitPrice: 1900, unit: '枚' },
        { construction: '床張替', product: '耐水べニヤ　9.5×910×1820', unitPrice: 3100, unit: '枚' },
        { construction: '床張替', product: '耐水べニヤ　12.5×910×1820', unitPrice: 4500, unit: '枚' },
        { construction: '床張替', product: '複合フローリング　12.5×1303×1818', unitPrice: 19000, unit: '坪' },
        { construction: '床張替', product: '無垢板フローリング　15×105×1800', unitPrice: 26000, unit: '坪' },
        { construction: '床張替', product: 'CP', unitPrice: 5200, unit: '㎡' },
        { construction: '床張替', product: 'Pタイル', unitPrice: 6800, unit: '枚' },
        { construction: '床張替', product: '巾木', unitPrice: 2000, unit: '本' },
        { construction: '床張替', product: '人工代', unitPrice: 18000, unit: '人工' },
        { construction: '床張替', product: '諸経費', unitPrice: 40, unit: '式', isPercent: true },
        { construction: '壁張替工事', product: '解体工事', unitPrice: 5000, unit: '平米' },
        { construction: '壁張替工事', product: '耐水ベニヤ　4×910×1820', unitPrice: 1900, unit: '枚' },
        { construction: '壁張替工事', product: '耐水ベニヤ　9.5×910×1820', unitPrice: 3100, unit: '枚' },
        { construction: '壁張替工事', product: '耐水ベニヤ　12.5×910×1820　', unitPrice: 4500, unit: '枚' },
        { construction: '壁張替工事', product: 'ベベルボード　9.5×910×1820', unitPrice: 820, unit: '枚' },
        { construction: '壁張替工事', product: 'ベベルボード　12.5×910×1820', unitPrice: 1020, unit: '枚' },
        { construction: '壁張替工事', product: 'クロス張り', unitPrice: 1800, unit: '平米' },
        { construction: '壁張替工事', product: 'クロス張り（改修）', unitPrice: 2100, unit: '平米' },
        { construction: '壁張替工事', product: '人工', unitPrice: 18000, unit: '人工' },
        { construction: '壁張替工事', product: '諸経費', unitPrice: 40, unit: '式', isPercent: true },
        { construction: '建具交換', product: '解体処分費', unitPrice: 7500, unit: '箇所' },
        { construction: '建具交換', product: '引戸　W＿×H＿', unitPrice: 140000, unit: '箇所' },
        { construction: '建具交換', product: '開き戸　W_×H_', unitPrice: 97000, unit: '箇所' },
        { construction: '建具交換', product: '折れ戸　W_×H_', unitPrice: 170000, unit: '箇所' },
        { construction: '建具交換', product: 'ガラスサイズ　W_×H_', unitPrice: 0, unit: '箇所' },
        { construction: 'ユニットバス交換工事', product: '解体処分費', unitPrice: 150000, unit: '式' },
        { construction: 'ユニットバス交換工事', product: '給排水工事', unitPrice: 85000, unit: '式' },
        { construction: 'ユニットバス交換工事', product: '電気設備工事', unitPrice: 35000, unit: '式' },
        { construction: 'ユニットバス交換工事', product: 'エコ給湯器', unitPrice: 350000, unit: '台' },
        { construction: 'ユニットバス交換工事', product: 'ユニットバス　グランスパ', unitPrice: 750000, unit: '台' },
        { construction: 'ユニットバス交換工事', product: 'ユニットバス　サザナ', unitPrice: 720000, unit: '台' },
        { construction: 'キッチン交換', product: '解体処分費', unitPrice: 75000, unit: '式' },
        { construction: 'キッチン交換', product: '給排水工事', unitPrice: 75000, unit: '式' },
    ];

    // --- 状態 ---
    let masterData = [];
    let invoiceItems = [];
    let invoiceHistory = [];

    // --- ローディングオーバーレイ ---
    function showLoading(msg) {
        let overlay = document.getElementById('loadingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
            const box = document.createElement('div');
            box.style.cssText = 'background:white;padding:30px 40px;border-radius:12px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.3);';
            box.innerHTML = '<div id="loadingSpinner" style="border:4px solid #eee;border-top:4px solid #4a6741;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 16px;"></div><div id="loadingMsg" style="font-size:15px;color:#333;"></div>';
            overlay.appendChild(box);
            document.body.appendChild(overlay);
            if (!document.getElementById('spinStyle')) {
                const style = document.createElement('style');
                style.id = 'spinStyle';
                style.textContent = '@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}';
                document.head.appendChild(style);
            }
        }
        document.getElementById('loadingMsg').textContent = msg || '処理中...';
        overlay.style.display = 'flex';
    }

    function hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'none';
    }

    // --- 埋め込みフォント取得（font.jsから） ---
    function getEmbeddedFont() {
        if (typeof EMBEDDED_FONT === 'undefined' || !EMBEDDED_FONT) {
            throw new Error('日本語フォントが読み込まれていません。font.js が正しく配置されているか確認してください。');
        }
        return EMBEDDED_FONT;
    }

    // --- 初期化 ---
    function init() {
        loadMasterData();
        loadHistory();
        setupEventListeners();
        populateConstructionSelect();
        renderMasterTable();
        renderHistoryTable();
        setDefaultDate();
    }

    // --- データ永続化 ---
    function loadMasterData() {
        const saved = localStorage.getItem(STORAGE_KEY_MASTER);
        if (saved) {
            masterData = JSON.parse(saved);
        } else {
            masterData = DEFAULT_MASTER.slice();
            saveMasterData();
        }
    }

    function saveMasterData() {
        localStorage.setItem(STORAGE_KEY_MASTER, JSON.stringify(masterData));
    }

    function loadHistory() {
        const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
        invoiceHistory = saved ? JSON.parse(saved) : [];
    }

    function saveHistory() {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(invoiceHistory));
    }

    function getNextInvoiceNo() {
        let counter = parseInt(localStorage.getItem(STORAGE_KEY_COUNTER) || '0', 10);
        counter++;
        localStorage.setItem(STORAGE_KEY_COUNTER, counter.toString());
        const now = new Date();
        return now.getFullYear() + (now.getMonth() + 1).toString().padStart(2, '0') + '-' + counter.toString().padStart(4, '0');
    }

    function setDefaultDate() {
        document.getElementById('invoiceDate').value = new Date().toISOString().split('T')[0];
    }

    // --- 工事セレクトボックス ---
    function populateConstructionSelect() {
        const select = document.getElementById('constructionSelect');
        const filterSelect = document.getElementById('masterFilterConstruction');
        const constructions = [...new Set(masterData.map(item => item.construction).filter(Boolean))];

        select.innerHTML = '<option value="">-- 工事を選択 --</option>';
        filterSelect.innerHTML = '<option value="">-- 全て表示 --</option>';

        constructions.forEach(c => {
            select.appendChild(new Option(c, c));
            filterSelect.appendChild(new Option(c, c));
        });
    }

    // --- 明細テーブル ---
    function addConstructionItems() {
        const construction = document.getElementById('constructionSelect').value;
        if (!construction) { alert('工事を選択してください。'); return; }

        const items = masterData.filter(item => item.construction === construction);
        if (items.length === 0) { alert('選択した工事に品目がありません。'); return; }

        items.forEach(item => {
            invoiceItems.push({
                id: Date.now() + Math.random(),
                construction: item.construction,
                product: item.product,
                unitPrice: item.unitPrice,
                unit: item.unit,
                quantity: 0,
                isPercent: item.isPercent || false,
                isManual: false,
            });
        });

        renderItemsTable();
    }

    function addManualItemRow() {
        const construction = document.getElementById('constructionSelect').value;
        if (!construction) { alert('工事を選択してください。'); return; }

        invoiceItems.push({
            id: Date.now() + Math.random(),
            construction: construction,
            product: '',
            unitPrice: 0,
            unit: '',
            quantity: 1,
            isPercent: false,
            isManual: true,
        });

        renderItemsTable();
    }

    function renderItemsTable() {
        const tbody = document.getElementById('itemsBody');
        tbody.innerHTML = '';

        invoiceItems.forEach((item, index) => {
            const tr = document.createElement('tr');
            if (item.isPercent) tr.classList.add('expenses-row');

            const amount = calcItemAmount(item, index);
            const unitPriceDisplay = item.isPercent
                ? '<span class="td-right">' + item.unitPrice + '%</span>'
                : (item.isManual
                    ? '<input type="number" class="item-input item-unit-price-input" value="' + (item.unitPrice || 0) + '" min="0" step="any" data-index="' + index + '">'
                    : '¥' + item.unitPrice.toLocaleString());
            const productDisplay = item.isPercent || !item.isManual
                ? escapeHtml(item.product)
                : '<input type="text" class="item-input item-product-input" value="' + escapeHtml(item.product) + '" placeholder="品名を入力" data-index="' + index + '">';

            tr.innerHTML =
                '<td class="td-center">' + (index + 1) + '</td>'
                + '<td>' + escapeHtml(item.construction) + '</td>'
                + '<td>' + productDisplay + '</td>'
                + '<td class="td-right">' + unitPriceDisplay + '</td>'
                + '<td class="td-center">' + escapeHtml(item.unit) + '</td>'
                + '<td class="td-center">'
                + '  <div class="qty-cell">'
                + '    <button type="button" class="qty-btn qty-minus" data-index="' + index + '">−</button>'
                + '    <input type="number" class="qty-input" value="' + item.quantity + '" min="0" step="any" data-index="' + index + '">'
                + '    <button type="button" class="qty-btn qty-plus" data-index="' + index + '">＋</button>'
                + '  </div>'
                + '</td>'
                + '<td class="td-right">¥' + amount.toLocaleString() + '</td>'
                + '<td class="td-center"><button class="btn-delete" data-index="' + index + '">削除</button></td>';
            tbody.appendChild(tr);
        });

        // 数量入力イベント
        tbody.querySelectorAll('.qty-input').forEach(input => {
            input.addEventListener('change', handleQtyChange);
            input.addEventListener('blur', handleQtyChange);
        });

        // 品名入力イベント
        tbody.querySelectorAll('.item-product-input').forEach(input => {
            input.addEventListener('input', handleProductChange);
        });

        // 単価入力イベント
        tbody.querySelectorAll('.item-unit-price-input').forEach(input => {
            input.addEventListener('change', handleUnitPriceChange);
            input.addEventListener('blur', handleUnitPriceChange);
        });

        // ＋ボタン
        tbody.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index, 10);
                invoiceItems[idx].quantity = (invoiceItems[idx].quantity || 0) + 1;
                renderItemsTable();
            });
        });

        // −ボタン
        tbody.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index, 10);
                const newVal = (invoiceItems[idx].quantity || 0) - 1;
                invoiceItems[idx].quantity = Math.max(0, newVal);
                renderItemsTable();
            });
        });

        // 削除ボタン
        tbody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                invoiceItems.splice(parseInt(e.target.dataset.index, 10), 1);
                renderItemsTable();
            });
        });

        updateTotals();
    }

    function handleProductChange(e) {
        const idx = parseInt(e.target.dataset.index, 10);
        if (Number.isNaN(idx) || !invoiceItems[idx]) return;
        invoiceItems[idx].product = e.target.value || '';
    }

    function handleUnitPriceChange(e) {
        const idx = parseInt(e.target.dataset.index, 10);
        if (Number.isNaN(idx) || !invoiceItems[idx]) return;
        const val = parseFloat(e.target.value);
        invoiceItems[idx].unitPrice = Number.isFinite(val) && val >= 0 ? val : 0;
        renderItemsTable();
    }

    function handleQtyChange(e) {
        const idx = parseInt(e.target.dataset.index, 10);
        const val = parseFloat(e.target.value) || 0;
        invoiceItems[idx].quantity = Math.max(0, val);
        renderItemsTable();
    }

    function calcItemAmount(item, _index) {
        if (item.isPercent) {
            const sameItems = invoiceItems.filter(it => it.construction === item.construction && !it.isPercent);
            const sub = sameItems.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
            return Math.round(sub * (item.unitPrice / 100) * item.quantity);
        }
        return Math.round(item.unitPrice * item.quantity);
    }

    function updateTotals() {
        let subtotal = 0;
        invoiceItems.forEach((item, i) => { subtotal += calcItemAmount(item, i); });
        const tax = Math.round(subtotal * TAX_RATE);
        const grandTotal = subtotal + tax;
        document.getElementById('subtotal').textContent = '¥' + subtotal.toLocaleString();
        document.getElementById('tax').textContent = '¥' + tax.toLocaleString();
        document.getElementById('grandTotal').textContent = '¥' + grandTotal.toLocaleString();
    }

    // --- マスタテーブル ---
    function renderMasterTable(filterConstruction) {
        const tbody = document.getElementById('masterBody');
        const noMsg = document.getElementById('noMasterMsg');
        tbody.innerHTML = '';

        let filtered = filterConstruction
            ? masterData.filter(item => item.construction === filterConstruction)
            : masterData;

        if (filtered.length === 0) { noMsg.style.display = 'block'; return; }
        noMsg.style.display = 'none';

        filtered.forEach(item => {
            const tr = document.createElement('tr');
            const upd = item.isPercent ? item.unitPrice + '%' : '¥' + (item.unitPrice || 0).toLocaleString();
            tr.innerHTML = '<td>' + escapeHtml(item.construction) + '</td>'
                + '<td>' + escapeHtml(item.product) + '</td>'
                + '<td class="td-right">' + upd + '</td>'
                + '<td class="td-center">' + escapeHtml(item.unit) + '</td>';
            tbody.appendChild(tr);
        });
    }

    // --- 履歴テーブル ---
    function renderHistoryTable(search) {
        const tbody = document.getElementById('historyBody');
        const noMsg = document.getElementById('noHistoryMsg');
        tbody.innerHTML = '';

        let filtered = invoiceHistory;
        if (search) {
            const s = search.toLowerCase();
            filtered = invoiceHistory.filter(inv =>
                (inv.clientName || '').toLowerCase().includes(s) ||
                (inv.invoiceNo || '').toLowerCase().includes(s)
            );
        }

        if (filtered.length === 0) { noMsg.style.display = 'block'; return; }
        noMsg.style.display = 'none';

        filtered.slice().reverse().forEach(inv => {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td>' + escapeHtml(inv.invoiceNo) + '</td>'
                + '<td>' + escapeHtml(inv.invoiceDate) + '</td>'
                + '<td>' + escapeHtml(inv.clientName) + '</td>'
                + '<td class="td-right">¥' + (inv.grandTotal || 0).toLocaleString() + '</td>'
                + '<td>'
                + '<button class="btn-view" data-id="' + inv.id + '">表示</button>'
                + '<button class="btn-pdf" data-id="' + inv.id + '">PDF</button>'
                + '<button class="btn-delete" data-id="' + inv.id + '">削除</button>'
                + '</td>';
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('.btn-view').forEach(btn => btn.addEventListener('click', e => {
            const inv = invoiceHistory.find(h => h.id === e.target.dataset.id);
            if (inv) showPreview(inv);
        }));
        tbody.querySelectorAll('.btn-pdf').forEach(btn => btn.addEventListener('click', e => {
            const inv = invoiceHistory.find(h => h.id === e.target.dataset.id);
            if (inv) generatePdf(inv);
        }));
        tbody.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', e => {
            if (!confirm('この見積書履歴を削除しますか？')) return;
            invoiceHistory = invoiceHistory.filter(h => h.id !== e.target.dataset.id);
            saveHistory();
            renderHistoryTable();
        }));
    }

    // --- Excel取込 ---
    function importExcel(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                const newMaster = [];
                let currentConstruction = '';

                for (let i = 0; i < json.length; i++) {
                    const row = json[i];
                    if (!row || row.length === 0) continue;
                    if (row[0] === '工事名' && row[1] === '品名') continue;

                    const col0 = (row[0] || '').toString().trim();
                    const col1 = (row[1] || '').toString().trim();
                    const col2 = row[2];
                    const col3 = (row[3] || '').toString().trim();

                    if (col0) currentConstruction = col0;
                    if (!col1) continue;

                    let unitPrice = 0, isPercent = false;
                    if (col2 !== undefined && col2 !== null && col2 !== '') {
                        const priceStr = col2.toString().trim();
                        if (priceStr.includes('%')) {
                            unitPrice = parseFloat(priceStr.replace('%', ''));
                            isPercent = true;
                        } else {
                            unitPrice = parseFloat(priceStr) || 0;
                        }
                    }

                    newMaster.push({ construction: currentConstruction, product: col1, unitPrice, unit: col3, isPercent });
                }

                if (newMaster.length > 0) {
                    masterData = newMaster;
                    saveMasterData();
                    populateConstructionSelect();
                    renderMasterTable();
                    alert('マスタを更新しました。（' + newMaster.length + '件）');
                } else {
                    alert('有効なデータが見つかりませんでした。');
                }
            } catch (err) {
                console.error(err);
                alert('Excelファイルの読込に失敗しました。\n' + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // --- 見積書データ構築 ---
    function buildInvoiceData() {
        const invoiceDate = document.getElementById('invoiceDate').value;
        const invoiceNo = document.getElementById('invoiceNo').value || getNextInvoiceNo();
        const clientName = document.getElementById('clientName').value;
        const remarks = document.getElementById('remarks').value;

        const filteredItems = [];
        invoiceItems.forEach((item, index) => {
            if (item.quantity > 0) {
                filteredItems.push({ ...item, amount: calcItemAmount(item, index) });
            }
        });

        let subtotal = 0;
        filteredItems.forEach(item => { subtotal += item.amount; });
        const tax = Math.round(subtotal * TAX_RATE);

        return {
            id: Date.now().toString(),
            invoiceDate, invoiceNo, clientName, remarks,
            items: filteredItems, subtotal, tax,
            grandTotal: subtotal + tax,
        };
    }

    // --- プレビュー ---
    function showPreview(invoiceData) {
        const preview = document.getElementById('invoicePreview');
        const logoHtml = logoDataUrl
            ? '<img src="' + logoDataUrl + '" style="max-height:80px;max-width:80px;object-fit:contain;">' : '';

        let itemsHtml = '';
        invoiceData.items.forEach((item, i) => {
            const upd = item.isPercent ? item.unitPrice + '%' : '¥' + item.unitPrice.toLocaleString();
            itemsHtml += '<tr>'
                + '<td style="text-align:center">' + (i + 1) + '</td>'
                + '<td>' + escapeHtml(item.construction) + '</td>'
                + '<td>' + escapeHtml(item.product) + '</td>'
                + '<td style="text-align:right">' + upd + '</td>'
                + '<td style="text-align:center">' + escapeHtml(item.unit) + '</td>'
                + '<td style="text-align:right">' + item.quantity + '</td>'
                + '<td style="text-align:right">¥' + item.amount.toLocaleString() + '</td></tr>';
        });

        const fd = invoiceData.invoiceDate ? formatDateJP(invoiceData.invoiceDate) : '';
        preview.innerHTML =
            '<div class="preview-header"><div>'
            + '<div class="preview-title">御　見　積　書</div>'
            + '<div class="preview-client">' + escapeHtml(invoiceData.clientName || '') + '　御中</div>'
            + '<p style="margin-top:12px;">下記の通りお見積り申し上げます。</p>'
            + '<div style="margin-top:12px;font-size:20px;font-weight:bold;border:2px solid #333;padding:8px 16px;display:inline-block;">お見積金額: ¥' + invoiceData.grandTotal.toLocaleString() + '</div>'
            + '</div><div class="preview-info">'
            + '<div style="margin-bottom:8px;">' + fd + '</div>'
            + '<div style="margin-bottom:2px;">No. ' + escapeHtml(invoiceData.invoiceNo || '') + '</div>'
            + '<div class="preview-sender" style="margin-top:16px;">'
            + '<div style="display:flex;align-items:center;justify-content:flex-end;gap:12px;"><div>'
            + '<div class="preview-sender-name">' + SENDER_NAME + '</div>'
            + '<div>' + SENDER_ADDRESS + '</div>'
            + '<div>TEL: ' + SENDER_TEL + '</div>'
            + '</div>' + logoHtml + '</div></div></div></div>'
            + '<table class="preview-table"><thead><tr>'
            + '<th style="width:30px">No</th><th>工事名</th><th>品名</th>'
            + '<th style="width:80px">単価</th><th style="width:40px">単位</th>'
            + '<th style="width:50px">数量</th><th style="width:100px">金額</th></tr></thead>'
            + '<tbody>' + itemsHtml + '</tbody></table>'
            + '<div class="preview-totals">'
            + '<div class="preview-total-row"><span>小計</span><span>¥' + invoiceData.subtotal.toLocaleString() + '</span></div>'
            + '<div class="preview-total-row"><span>消費税 (10%)</span><span>¥' + invoiceData.tax.toLocaleString() + '</span></div>'
            + '<div class="preview-total-row preview-total-grand"><span>合計</span><span>¥' + invoiceData.grandTotal.toLocaleString() + '</span></div></div>'
            + (invoiceData.remarks ? '<div class="preview-remarks"><strong>備考:</strong> ' + escapeHtml(invoiceData.remarks) + '</div>' : '');

        document.getElementById('previewModal').classList.add('show');
    }

    // --- PDF出力 ---
    function generatePdf(invoiceData) {
        showLoading('PDFを生成中...');

        try {
            const fontBase64 = getEmbeddedFont();

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            // フォント登録（ローカル埋め込みフォント）
            doc.addFileToVFS(FONT_FILE, fontBase64);
            doc.addFont(FONT_FILE, FONT_NAME, 'normal');
            doc.setFont(FONT_NAME, 'normal');

            // テキスト色を濃い黒に設定
            doc.setTextColor(0, 0, 0);

            const pw = doc.internal.pageSize.getWidth();
            const m = 15;
            let y = m;

            // タイトル
            doc.setFontSize(24);
            doc.text('御　見　積　書', pw / 2, y + 8, { align: 'center' });
            y += 12;
            doc.setLineWidth(0.5);
            doc.line(m + 30, y, pw - m - 30, y);
            y += 10;

            // 日付・番号（右上）
            doc.setFontSize(10);
            doc.text(invoiceData.invoiceDate ? formatDateJP(invoiceData.invoiceDate) : '', pw - m, y, { align: 'right' });
            y += 5;
            doc.text('No. ' + (invoiceData.invoiceNo || ''), pw - m, y, { align: 'right' });

            // 見積先（左上）
            y -= 5;
            doc.setFontSize(14);
            const clientText = (invoiceData.clientName || '') + '　御中';
            doc.text(clientText, m, y);
            y += 2;
            doc.setLineWidth(0.3);
            doc.line(m, y, m + doc.getTextWidth(clientText) + 2, y);
            y += 8;
            doc.setFontSize(10);
            doc.text('下記の通りお見積り申し上げます。', m, y);
            y += 8;

            // お見積金額ボックス
            doc.setFontSize(14);
            const totalText = 'お見積金額: ¥' + invoiceData.grandTotal.toLocaleString();
            doc.setLineWidth(0.5);
            doc.rect(m, y - 5, doc.getTextWidth(totalText) + 10, 10);
            doc.text(totalText, m + 5, y + 2);
            y += 14;

            // 差出人（右側）+ ロゴ
            const sx = pw - m;
            let sy = y - 24;
            const lo = logoDataUrl ? 25 : 0;

            if (logoDataUrl) {
                try { doc.addImage(logoDataUrl, 'PNG', sx - 22, sy - 2, 20, 20); }
                catch (e) { console.warn('ロゴ挿入失敗:', e); }
            }

            doc.setFontSize(12);
            doc.text(SENDER_NAME, sx - lo, sy + 2, { align: 'right' });
            sy += 6;
            doc.setFontSize(8);
            doc.text(SENDER_ADDRESS, sx - lo, sy + 2, { align: 'right' });
            sy += 4;
            doc.text('TEL: ' + SENDER_TEL, sx - lo, sy + 2, { align: 'right' });

            // 明細テーブル
            const tableData = [];
            invoiceData.items.forEach((item, i) => {
                const upd = item.isPercent ? item.unitPrice + '%' : '¥' + item.unitPrice.toLocaleString();
                tableData.push([(i + 1).toString(), item.construction, item.product, upd, item.unit, item.quantity.toString(), '¥' + item.amount.toLocaleString()]);
            });

            doc.autoTable({
                startY: y,
                head: [['No', '工事名', '品名', '単価', '単位', '数量', '金額']],
                body: tableData,
                theme: 'grid',
                styles: { font: FONT_NAME, fontStyle: 'normal', fontSize: 8, cellPadding: 2, textColor: [0, 0, 0] },
                headStyles: { font: FONT_NAME, fontStyle: 'normal', fillColor: [74, 103, 65], textColor: [255, 255, 255], halign: 'center' },
                bodyStyles: { font: FONT_NAME, fontStyle: 'normal', textColor: [0, 0, 0] },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 10 },
                    1: { cellWidth: 30 },
                    3: { halign: 'right', cellWidth: 22 },
                    4: { halign: 'center', cellWidth: 14 },
                    5: { halign: 'right', cellWidth: 16 },
                    6: { halign: 'right', cellWidth: 28 },
                },
                margin: { left: m, right: m },
            });

            y = doc.autoTable.previous.finalY + 6;

            // 合計欄
            const tx = pw - m - 60;
            doc.setFont(FONT_NAME, 'normal');
            doc.setFontSize(10);
            doc.text('小計', tx, y);
            doc.text('¥' + invoiceData.subtotal.toLocaleString(), pw - m, y, { align: 'right' });
            y += 5;
            doc.setLineWidth(0.2);
            doc.line(tx, y - 1, pw - m, y - 1);
            doc.text('消費税 (10%)', tx, y + 3);
            doc.text('¥' + invoiceData.tax.toLocaleString(), pw - m, y + 3, { align: 'right' });
            y += 8;
            doc.line(tx, y - 1, pw - m, y - 1);
            doc.setFontSize(12);
            doc.setLineWidth(0.5);
            doc.line(tx, y, pw - m, y);
            y += 1;
            doc.text('合計', tx, y + 5);
            doc.text('¥' + invoiceData.grandTotal.toLocaleString(), pw - m, y + 5, { align: 'right' });
            y += 7;
            doc.line(tx, y, pw - m, y);

            // 備考
            if (invoiceData.remarks) {
                y += 8;
                doc.setFontSize(9);
                doc.text('備考:', m, y);
                y += 5;
                doc.setFontSize(8);
                doc.text(doc.splitTextToSize(invoiceData.remarks, pw - m * 2), m, y);
            }

            doc.save('見積書_' + (invoiceData.invoiceNo || '') + '_' + (invoiceData.clientName || '') + '.pdf');
            hideLoading();
        } catch (err) {
            hideLoading();
            console.error(err);
            alert('PDF生成エラー: ' + err.message);
        }
    }

    // --- 保存 & PDF出力 ---
    function saveAndExport() {
        const invoiceData = buildInvoiceData();
        if (!invoiceData.clientName) { alert('見積先を入力してください。'); return; }
        if (invoiceData.items.length === 0) { alert('数量が1以上の品目がありません。'); return; }

        if (!document.getElementById('invoiceNo').value) {
            document.getElementById('invoiceNo').value = invoiceData.invoiceNo;
        }

        invoiceHistory.push(invoiceData);
        saveHistory();
        renderHistoryTable();
        generatePdf(invoiceData);
    }

    // --- イベントリスナー ---
    function setupEventListeners() {
        // タブ切替
        document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', e => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById('tab-' + e.target.dataset.tab).classList.add('active');
        }));

        document.getElementById('addConstructionBtn').addEventListener('click', addConstructionItems);
        document.getElementById('addManualItemBtn').addEventListener('click', addManualItemRow);

        document.getElementById('previewBtn').addEventListener('click', () => {
            const data = buildInvoiceData();
            if (data.items.length === 0) { alert('数量が1以上の品目がありません。\n数量を入力してください。'); return; }
            showPreview(data);
        });

        document.getElementById('exportPdfBtn').addEventListener('click', saveAndExport);

        document.getElementById('modalExportBtn').addEventListener('click', () => {
            document.getElementById('previewModal').classList.remove('show');
            saveAndExport();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            if (!confirm('入力内容をクリアしますか？')) return;
            invoiceItems = [];
            document.getElementById('invoiceNo').value = '';
            document.getElementById('clientName').value = '';
            document.getElementById('remarks').value = '';
            setDefaultDate();
            renderItemsTable();
        });

        document.getElementById('closePreview').addEventListener('click', () => document.getElementById('previewModal').classList.remove('show'));
        document.getElementById('modalCloseBtn').addEventListener('click', () => document.getElementById('previewModal').classList.remove('show'));

        document.getElementById('uploadBtn').addEventListener('click', () => document.getElementById('masterFile').click());
        document.getElementById('masterFile').addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            document.getElementById('uploadFileName').textContent = file.name;
            importExcel(file);
            e.target.value = '';
        });

        document.getElementById('masterFilterConstruction').addEventListener('change', e => renderMasterTable(e.target.value));
        document.getElementById('historySearch').addEventListener('input', e => renderHistoryTable(e.target.value));

        // モーダル外クリック
        document.querySelectorAll('.modal').forEach(modal => modal.addEventListener('click', e => {
            if (e.target === modal) modal.classList.remove('show');
        }));
    }

    // --- ユーティリティ ---
    function escapeHtml(str) {
        if (!str) return '';
        return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function formatDateJP(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
    }

    document.addEventListener('DOMContentLoaded', init);
})();
