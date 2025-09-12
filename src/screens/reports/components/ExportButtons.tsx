import dayjs from 'dayjs';
import React, { useState } from 'react';
import {
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../app/providers/ThemeProvider';
import AlertModal from '../../../components/modals/AlertModal';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import Card from '../../../components/ui/Card';
import { Category, Transaction } from '../../../types/global';

const { width: screenWidth } = Dimensions.get('window');

interface ModalState {
    type: 'confirmation' | 'alert' | null;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm?: () => void;
    alertType?: 'success' | 'error' | 'warning' | 'info';
    icon?: string;
    data?: { filePath: string; fileName: string; fileType: 'csv' | 'html' };
}

interface ReportData {
    totals: {
        income: number;
        expense: number;
        net: number;
    };
    transactionCounts: {
        income: number;
        expense: number;
        total: number;
    };
    incomeCategoryData: Array<{
        category: Category;
        amount: number;
        type: 'income';
    }>;
    expenseCategoryData: Array<{
        category: Category;
        amount: number;
        type: 'expense';
    }>;
    trendData: Array<{
        date: string;
        income: number;
        expense: number;
        net: number;
    }>;
}

interface ExportButtonsProps {
    reportData: ReportData;
    periodTransactions: Transaction[];
    categories: Category[];
    dateRange: {
        label: string;
    };
    isLoading?: boolean;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
    reportData,
    periodTransactions,
    categories,
    dateRange,
    isLoading = false,
}) => {
    const { theme } = useTheme();
    const [modal, setModal] = useState<ModalState>({
        type: null,
        title: '',
        message: '',
    });

    const exportToCSV = async () => {
        if (isLoading) return;

        try {
            const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
            const fileName = `financial_report_${dateRange.label.replace(/[/\\?%*:|"<>]/g, '_')}_${timestamp}.csv`;

            // Use Downloads directory on Android, Documents on iOS
            const exportPath = Platform.OS === 'android'
                ? RNFS.DownloadDirectoryPath
                : RNFS.DocumentDirectoryPath;

            const filePath = `${exportPath}/${fileName}`;

            // Build CSV content
            let csvContent = `Financial Report\n`;
            csvContent += `Generated,${dayjs().format('YYYY-MM-DD HH:mm:ss')}\n`;
            csvContent += `Period,${dateRange.label}\n\n`;

            // Summary section
            csvContent += `SUMMARY\n`;
            csvContent += `Type,Amount,Transaction Count\n`;
            csvContent += `Income,$${reportData.totals.income.toFixed(2)},${reportData.transactionCounts.income}\n`;
            csvContent += `Expenses,$${reportData.totals.expense.toFixed(2)},${reportData.transactionCounts.expense}\n`;
            csvContent += `Net Amount,$${reportData.totals.net.toFixed(2)},${reportData.transactionCounts.total}\n\n`;

            // Income categories section
            if (reportData.incomeCategoryData.length > 0) {
                csvContent += `INCOME BY CATEGORY\n`;
                csvContent += `Category,Amount,Percentage\n`;
                reportData.incomeCategoryData.forEach(item => {
                    const percentage = reportData.totals.income > 0
                        ? ((item.amount / reportData.totals.income) * 100).toFixed(1)
                        : '0.0';
                    csvContent += `"${item.category.name}",$${item.amount.toFixed(2)},${percentage}%\n`;
                });
                csvContent += `\n`;
            }

            // Expense categories section
            if (reportData.expenseCategoryData.length > 0) {
                csvContent += `EXPENSES BY CATEGORY\n`;
                csvContent += `Category,Amount,Percentage\n`;
                reportData.expenseCategoryData.forEach(item => {
                    const percentage = reportData.totals.expense > 0
                        ? ((item.amount / reportData.totals.expense) * 100).toFixed(1)
                        : '0.0';
                    csvContent += `"${item.category.name}",$${item.amount.toFixed(2)},${percentage}%\n`;
                });
                csvContent += `\n`;
            }

            // Trend data section
            if (reportData.trendData.length > 0) {
                csvContent += `TREND DATA\n`;
                csvContent += `Period,Income,Expenses,Net\n`;
                reportData.trendData.forEach(item => {
                    csvContent += `"${item.date}",$${item.income.toFixed(2)},$${item.expense.toFixed(2)},$${item.net.toFixed(2)}\n`;
                });
                csvContent += `\n`;
            }

            // All transactions section
            csvContent += `ALL TRANSACTIONS\n`;
            csvContent += `Date,Type,Amount,Category,Description,Account\n`;
            periodTransactions
                .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
                .forEach(transaction => {
                    const category = categories.find(cat => cat.id === transaction.categoryId)?.name || 'Unknown';
                    const description = (transaction.note || '').replace(/"/g, '""');
                    const account = transaction.accountId || '';
                    csvContent += `"${dayjs(transaction.date).format('YYYY-MM-DD')}","${transaction.type}",$${transaction.amount.toFixed(2)},"${category}","${description}","${account}"\n`;
                });

            // Write file
            await RNFS.writeFile(filePath, csvContent, 'utf8');

            // Verify file was created
            const fileExists = await RNFS.exists(filePath);
            if (!fileExists) {
                throw new Error('Failed to create export file');
            }

            console.log('CSV file created at:', filePath);

            // Step 2: Ask if user wants to share the file
            setModal({
                type: 'confirmation',
                title: 'Export Successful!',
                message: `CSV file exported successfully to your device.\n\nWould you like to share the exported file?`,
                confirmText: 'Share',
                icon: 'checkmark-circle',
                data: { filePath, fileName, fileType: 'csv' },
                onConfirm: async () => {
                    await handleShareFile({ filePath, fileName, fileType: 'csv' });
                }
            });

        } catch (error) {
            console.error('CSV Export Error:', error);
            setModal({
                type: 'alert',
                title: 'Export Failed',
                message: 'Failed to export CSV file. Please check permissions and try again.',
                alertType: 'error',
            });
        }
    };

    // Handle sharing files after export
    const handleShareFile = async (fileInfo: { filePath: string; fileName: string; fileType: 'csv' | 'html' }) => {
        setModal({ type: null, title: '', message: '' });

        try {
            const shareOptions = {
                title: fileInfo.fileType === 'csv' ? 'Financial Report CSV' : 'Financial Report PDF',
                message: fileInfo.fileType === 'csv'
                    ? `Your financial report - ${fileInfo.fileName}`
                    : `Your financial report - ${fileInfo.fileName}. Open this file in a web browser and use "Save as PDF" or "Print to PDF" to create a PDF version.`,
                url: `file://${fileInfo.filePath}`,
                type: fileInfo.fileType === 'csv' ? 'text/csv' : 'text/html',
            };

            await Share.open(shareOptions);

            // If successful, show success message
            setModal({
                type: 'alert',
                title: 'Shared Successfully',
                message: `Your ${fileInfo.fileType.toUpperCase()} report has been exported and shared successfully.`,
                alertType: 'success',
            });

        } catch (shareError: any) {
            console.log('Sharing result:', shareError);

            // Check if user cancelled the share
            const errorMessage = shareError?.message?.toLowerCase() || '';
            const isCancelled = errorMessage.includes('cancel') ||
                errorMessage.includes('dismiss') ||
                errorMessage.includes('user did not share');

            if (isCancelled) {
                // User cancelled sharing - this is not an error
                setModal({
                    type: 'alert',
                    title: 'Share Cancelled',
                    message: `File export completed successfully. You can find your exported file in the ${Platform.OS === 'android' ? 'Downloads' : 'Files'} folder.`,
                    alertType: 'info',
                });
            } else {
                // Sharing failed for other reasons
                if (fileInfo.fileType === 'csv') {
                    // For CSV, try fallback with content
                    try {
                        const csvContent = await RNFS.readFile(fileInfo.filePath, 'utf8');
                        const truncatedContent = csvContent.length > 2000
                            ? csvContent.substring(0, 2000) + '\n\n... (content truncated)'
                            : csvContent;

                        await Share.open({
                            title: 'Financial Report CSV',
                            message: `Your financial report:\n\n${truncatedContent}`,
                        });

                        setModal({
                            type: 'alert',
                            title: 'Shared Successfully',
                            message: 'Your CSV report has been shared successfully.',
                            alertType: 'success',
                        });
                    } catch (fallbackError) {
                        setModal({
                            type: 'alert',
                            title: 'Share Failed',
                            message: `File was exported successfully, but sharing failed. You can find your file in the ${Platform.OS === 'android' ? 'Downloads' : 'Files'} folder.`,
                            alertType: 'warning',
                        });
                    }
                } else {
                    // For HTML files, don't try content fallback (too large)
                    setModal({
                        type: 'alert',
                        title: 'Share Failed',
                        message: `HTML report was exported successfully, but sharing failed. You can find your file in the ${Platform.OS === 'android' ? 'Downloads' : 'Files'} folder.`,
                        alertType: 'warning',
                    });
                }
            }
        }
    };

    const exportToPDF = async () => {
        if (isLoading) return;

        try {
            const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
            const fileName = `financial_report_${dateRange.label.replace(/[/\\?%*:|"<>]/g, '_')}_${timestamp}.html`;

            // Use Downloads directory on Android, Documents on iOS
            const exportPath = Platform.OS === 'android'
                ? RNFS.DownloadDirectoryPath
                : RNFS.DocumentDirectoryPath;

            const filePath = `${exportPath}/${fileName}`;

            // Generate HTML content for PDF-like report
            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Financial Report - ${dateRange.label}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
            background: white;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #007AFF;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #007AFF;
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        
        .header .period {
            font-size: 18px;
            color: #666;
            margin: 5px 0;
        }
        
        .header .generated {
            font-size: 14px;
            color: #999;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .summary-card {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            border-left: 4px solid #007AFF;
        }
        
        .summary-card.income { border-left-color: #10B981; }
        .summary-card.expense { border-left-color: #EF4444; }
        .summary-card.net { border-left-color: ${reportData.totals.net >= 0 ? '#10B981' : '#EF4444'}; }
        
        .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 16px;
            color: #666;
        }
        
        .summary-card .amount {
            font-size: 24px;
            font-weight: bold;
            margin: 5px 0;
        }
        
        .summary-card .count {
            font-size: 14px;
            color: #999;
        }
        
        .income .amount { color: #10B981; }
        .expense .amount { color: #EF4444; }
        .net .amount { color: ${reportData.totals.net >= 0 ? '#10B981' : '#EF4444'}; }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section h2 {
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        
        .category-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
        }
        
        .category-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 3px solid #007AFF;
        }
        
        .category-item.income { border-left-color: #10B981; }
        .category-item.expense { border-left-color: #EF4444; }
        
        .category-name {
            font-weight: 500;
        }
        
        .category-amount {
            font-weight: bold;
        }
        
        .category-amount.income { color: #10B981; }
        .category-amount.expense { color: #EF4444; }
        
        .trend-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        
        .trend-table th,
        .trend-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .trend-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #666;
        }
        
        .trend-table tr:hover {
            background: #f8f9fa;
        }
        
        .positive { color: #10B981; }
        .negative { color: #EF4444; }
        
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        
        @media print {
            body { margin: 0; padding: 15px; }
            .header { page-break-after: avoid; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Financial Report</h1>
        <div class="period">${dateRange.label}</div>
        <div class="generated">Generated on ${dayjs().format('MMMM D, YYYY at h:mm A')}</div>
    </div>
    
    <div class="summary-grid">
        <div class="summary-card income">
            <h3>Total Income</h3>
            <div class="amount">$${reportData.totals.income.toFixed(2)}</div>
            <div class="count">${reportData.transactionCounts.income} transactions</div>
        </div>
        <div class="summary-card expense">
            <h3>Total Expenses</h3>
            <div class="amount">$${reportData.totals.expense.toFixed(2)}</div>
            <div class="count">${reportData.transactionCounts.expense} transactions</div>
        </div>
        <div class="summary-card net">
            <h3>Net Amount</h3>
            <div class="amount">${reportData.totals.net >= 0 ? '+' : '-'}$${Math.abs(reportData.totals.net).toFixed(2)}</div>
            <div class="count">${reportData.totals.net >= 0 ? 'Surplus' : 'Deficit'}</div>
        </div>
    </div>
    
    ${reportData.incomeCategoryData.length > 0 ? `
    <div class="section">
        <h2>Income by Category</h2>
        <div class="category-list">
            ${reportData.incomeCategoryData.map(item => {
                const percentage = reportData.totals.income > 0
                    ? ((item.amount / reportData.totals.income) * 100).toFixed(1)
                    : '0.0';
                return `
                <div class="category-item income">
                    <span class="category-name">${item.category.name}</span>
                    <span class="category-amount income">$${item.amount.toFixed(2)} (${percentage}%)</span>
                </div>`;
            }).join('')}
        </div>
    </div>` : ''}
    
    ${reportData.expenseCategoryData.length > 0 ? `
    <div class="section">
        <h2>Expenses by Category</h2>
        <div class="category-list">
            ${reportData.expenseCategoryData.map(item => {
                const percentage = reportData.totals.expense > 0
                    ? ((item.amount / reportData.totals.expense) * 100).toFixed(1)
                    : '0.0';
                return `
                <div class="category-item expense">
                    <span class="category-name">${item.category.name}</span>
                    <span class="category-amount expense">$${item.amount.toFixed(2)} (${percentage}%)</span>
                </div>`;
            }).join('')}
        </div>
    </div>` : ''}
    
    ${reportData.trendData.length > 0 ? `
    <div class="section">
        <h2>Trend Analysis</h2>
        <table class="trend-table">
            <thead>
                <tr>
                    <th>Period</th>
                    <th>Income</th>
                    <th>Expenses</th>
                    <th>Net</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.trendData.map(item => `
                <tr>
                    <td>${item.date}</td>
                    <td class="positive">$${item.income.toFixed(2)}</td>
                    <td class="negative">$${item.expense.toFixed(2)}</td>
                    <td class="${item.net >= 0 ? 'positive' : 'negative'}">
                        ${item.net >= 0 ? '+' : '-'}$${Math.abs(item.net).toFixed(2)}
                    </td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>` : ''}
    
    <div class="footer">
        <p>Report generated by Financial Tracker App</p>
        <p>Export this page as PDF using your browser's print function</p>
    </div>
</body>
</html>`;

            // Write HTML file
            await RNFS.writeFile(filePath, htmlContent, 'utf8');

            // Verify file was created
            const fileExists = await RNFS.exists(filePath);
            if (!fileExists) {
                throw new Error('Failed to create HTML report file');
            }

            console.log('HTML file created at:', filePath);

            // Step 2: Ask if user wants to share the file
            setModal({
                type: 'confirmation',
                title: 'Export Successful!',
                message: `HTML report exported successfully to your device.\n\nWould you like to share the exported file?`,
                confirmText: 'Share',
                icon: 'checkmark-circle',
                data: { filePath, fileName, fileType: 'html' },
                onConfirm: async () => {
                    await handleShareFile({ filePath, fileName, fileType: 'html' });
                }
            });

        } catch (error) {
            console.error('PDF Export Error:', error);
            setModal({
                type: 'alert',
                title: 'Export Failed',
                message: 'Failed to export HTML report file. Please check permissions and try again.',
                alertType: 'error',
            });
        }
    };

    // Handle modal close
    const closeModal = () => {
        // If user is declining to share an already exported file, show success message
        if (modal.type === 'confirmation' && modal.data) {
            const fileType = modal.data.fileType;
            setModal({
                type: 'alert',
                title: 'Export Completed',
                message: `${fileType.toUpperCase()} file exported successfully to your device. You can find it in your ${Platform.OS === 'android' ? 'Downloads' : 'Files'} folder.`,
                alertType: 'success',
            });
        } else {
            setModal({ type: null, title: '', message: '' });
        }
    };

    return (
        <Card style={styles.exportCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Export Report</Text>
            <View style={styles.exportButtons}>
                <TouchableOpacity
                    style={[styles.exportButton, { backgroundColor: theme.colors.primary[500] }]}
                    onPress={exportToCSV}
                    disabled={isLoading}
                >
                    <Icon name="document-text" size={20} color={theme.colors.onPrimary} />
                    <Text style={[styles.exportButtonText, { color: theme.colors.onPrimary }]}>
                        Export CSV
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.exportButton, { backgroundColor: theme.colors.secondary?.[500] || theme.colors.primary[500] }]}
                    onPress={exportToPDF}
                    disabled={isLoading}
                >
                    <Icon name="document" size={20} color={theme.colors.onPrimary} />
                    <Text style={[styles.exportButtonText, { color: theme.colors.onPrimary }]}>
                        Export PDF
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Confirmation Modal */}
            <ConfirmationModal
                visible={modal.type === 'confirmation'}
                title={modal.title}
                message={modal.message}
                confirmText={modal.confirmText}
                icon={modal.icon}
                onConfirm={modal.onConfirm || closeModal}
                onCancel={closeModal}
            />

            {/* Alert Modal */}
            <AlertModal
                visible={modal.type === 'alert'}
                title={modal.title}
                message={modal.message}
                type={modal.alertType}
                onClose={closeModal}
            />
        </Card>
    );
};

const styles = StyleSheet.create({
    exportCard: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    exportButtons: {
        flexDirection: screenWidth > 400 ? 'row' : 'column',
        gap: 12,
    },
    exportButton: {
        flex: screenWidth > 400 ? 1 : undefined,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
    },
    exportButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});