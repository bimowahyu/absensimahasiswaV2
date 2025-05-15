const PdfPrinter = require('pdfmake');
const ExcelJS = require('exceljs');
const path = require('path');

const exportToPDF = (req, res) => {
    try {
        const { data } = req.body;
        console.log('Received data:', data);

        const fonts = {
            Roboto: {
                normal: 'Helvetica',
                bold: 'Helvetica-Bold',
                italics: 'Helvetica-Oblique',
                bolditalics: 'Helvetica-BoldOblique'
            }
        };
        console.log('Resolved font paths:', fonts);

        const printer = new PdfPrinter(fonts);

        const uniqueDates = [...new Set(data.absensi.map(item => new Date(item.tgl_absensi).toLocaleDateString('id-ID')))]
            .sort((a, b) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-')));

        const employeeData = data.absensi.reduce((acc, item) => {
            const employee = acc[item.mahasiswa.nama_lengkap] || {};
            const dateKey = new Date(item.tgl_absensi).toLocaleDateString('id-ID');
            employee[dateKey] = { jamMasuk: item.jam_masuk, jamKeluar: item.jam_keluar };
            acc[item.mahasiswa.nama_lengkap] = employee;
            return acc;
        }, {});

        const chunkSize = 5;
        const tableContent = [];

        for (let i = 0; i < uniqueDates.length; i += chunkSize) {
            const dateChunk = uniqueDates.slice(i, i + chunkSize);
            const headers = ['Nama', ...dateChunk.flatMap(date => [`${date}\nJam Masuk`, 'Jam Keluar'])];
            tableContent.push(headers);

            Object.entries(employeeData).forEach(([employeeName, attendance]) => {
                const row = [
                    employeeName,
                    ...dateChunk.flatMap(date => [
                        attendance[date]?.jamMasuk || 'Tidak Hadir',
                        attendance[date]?.jamKeluar || ''
                    ])
                ];
                tableContent.push(row);
            });

            if (i + chunkSize < uniqueDates.length) {
                tableContent.push(Array(headers.length).fill(''));
            }
        }

        const docDefinition = {
            pageSize: 'A4',
            pageOrientation: 'landscape',
            pageMargins: [20, 20, 20, 20],
            content: [
                { text: `Data Absensi PT.BR Solusindo ${data.cabang.nama}`, style: 'header' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', ...Array(tableContent[0].length - 1).fill('*')],
                        body: tableContent
                    },
                    layout: {
                        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 2 : 1,
                        vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 2 : 1,
                        hLineColor: (i, node) => (i === 0 || i === node.table.body.length) ? 'black' : 'gray',
                        vLineColor: (i, node) => (i === 0 || i === node.table.widths.length) ? 'black' : 'gray'
                    }
                }
            ],
            styles: {
                header: {
                    fontSize: 16,
                    bold: true,
                    margin: [0, 0, 0, 8]
                }
            },
            defaultStyle: {
                fontSize: 8
            }
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        let chunks = [];
        pdfDoc.on('data', (chunk) => {
            chunks.push(chunk);
        });
        pdfDoc.on('end', () => {
            const result = Buffer.concat(chunks);
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=attendance-${data.cabang.nama}.pdf`,
                'Content-Length': result.length
            });
            res.end(result);
        });
        pdfDoc.end();
        if (!data || !data.absensi || data.absensi.length === 0) {
            return res.status(400).json({ message: 'Data absensi tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error exporting PDF:', error.response?.data || error.message);
        res.status(500).json({ message: 'Error generating PDF', error: error.message });
    }
};

const exportToExcel = async (req, res) => {
    const { data } = req.body;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Data');

    const uniqueDates = [...new Set(data.absensi.map(item => new Date(item.tgl_absensi).toLocaleDateString('id-ID')))]
        .sort((a, b) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-')));

    const employeeData = data.absensi.reduce((acc, item) => {
        const employee = acc[item.mahasiswa.nama_lengkap] || {};
        const dateKey = new Date(item.tgl_absensi).toLocaleDateString('id-ID');
        employee[dateKey] = { jamMasuk: item.jam_masuk, jamKeluar: item.jam_keluar ,status :item.status};
        acc[item.mahasiswa.nama_lengkap] = employee;
        return acc;
    }, {});

    const chunkSize = 5;

    for (let i = 0; i < uniqueDates.length; i += chunkSize) {
        const dateChunk = uniqueDates.slice(i, i + chunkSize);

        const headers = ['Nama', ...dateChunk.flatMap(date => [date, ''])];
        worksheet.addRow(headers);

        const subHeaders = ['', ...dateChunk.flatMap(() => ['Jam Masuk', 'Jam Keluar','status'])];
        worksheet.addRow(subHeaders);

        Object.entries(employeeData).forEach(([employeeName, attendance]) => {
            const row = [
                employeeName,
                ...dateChunk.flatMap(date => [
                    attendance[date]?.jamMasuk || '',
                    attendance[date]?.jamKeluar || '',
                    attendance[date]?.status || ''
                ])
            ];
            worksheet.addRow(row);
        });

        worksheet.columns.forEach((column, index) => {
            if (index === 0) {
                column.width = 20;
            } else {
                column.width = 15;
            }
        });

        dateChunk.forEach((_, index) => {
            const col = index * 2 + 2;
            worksheet.mergeCells(worksheet.rowCount - Object.keys(employeeData).length - 1, col, worksheet.rowCount - Object.keys(employeeData).length - 1, col + 1);
        });

        worksheet.getRow(worksheet.rowCount - Object.keys(employeeData).length - 1).font = { bold: true };
        worksheet.getRow(worksheet.rowCount - Object.keys(employeeData).length).font = { bold: true };
    }

    const buffer = await workbook.xlsx.writeBuffer();

    res.writeHead(200, {
        'Content-Disposition': `attachment; filename=attendance-${data.cabang}.xlsx`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Length': buffer.length
    });
    res.end(buffer);
};

module.exports = {
    exportToPDF,
    exportToExcel
};
