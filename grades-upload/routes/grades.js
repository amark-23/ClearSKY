const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const db = require('../db/connection');
const axios = require('axios');
const authenticateToken = require('../middleware/authMiddleware');
require('dotenv').config();

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '../uploads') });

router.post('/upload-grades', authenticateToken, upload.single('gradesFile'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    try {
        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        const usefulRows = data.slice(2);
        const operations = [];
        const changedGrades = [];

        for (const row of usefulRows) {
            if (!Array.isArray(row) || row.length < 7 || isNaN(row[0])) continue;

            const [
                AMnumber,
                studentName,
                studentMail,
                periodFull,
                subjectFull,
                scale,
                grade
            ] = row;

            const subIDMatch = String(subjectFull).match(/\((\d+)\)/);
            if (!subIDMatch) continue;

            const subID = parseInt(subIDMatch[1]);
            const period = periodFull.split(' ').slice(1).join(' ').trim();
            const instrID = req.user?.id;
            if (!instrID) continue;

            const submissionDate = new Date().toISOString().replace('T', ' ').substring(0, 19);

            const selectSQL = `
                SELECT gradeID, grade FROM grades
                WHERE AMnumber = ? AND studentName = ? AND studentMail = ?
                  AND period = ? AND subID = ? AND scale = ?
            `;

            const selectParams = [AMnumber, studentName, studentMail, period, subID, scale];

            operations.push(
                (async () => {
                    try {
                        const existing = await db.get(selectSQL, selectParams);

                        if (existing) {
                            if (Number(existing.grade) === Number(grade)) {
                                return 'skipped';
                            }

                            await db.run(
                                `UPDATE grades SET grade = ?, submissionDate = ? WHERE gradeID = ?`,
                                [grade, submissionDate, existing.gradeID]
                            );

                            changedGrades.push({
                                gradeID: existing.gradeID,
                                AMnumber,
                                studentName,
                                studentMail,
                                period,
                                subID,
                                scale,
                                grade,
                                instrID,
                                submissionDate
                            });

                            return 'updated';
                        } else {
                            const insertResult = await db.run(`
                                INSERT INTO grades
                                (AMnumber, studentName, studentMail, period, instrID, subID, scale, grade, submissionDate)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `, [AMnumber, studentName, studentMail, period, instrID, subID, scale, grade, submissionDate]);

                            const newGradeID = insertResult.lastID;

                            changedGrades.push({
                                gradeID: newGradeID,
                                AMnumber,
                                studentName,
                                studentMail,
                                period,
                                subID,
                                scale,
                                grade,
                                instrID,
                                submissionDate
                            });

                            return 'inserted';
                        }
                    } catch (err) {
                        console.error('❌ Operation error for row:', row, err);
                        return 'error';
                    }
                })()
            );
        }

        const results = await Promise.all(operations);
        const inserted = results.filter(r => r === 'inserted').length;
        const updated = results.filter(r => r === 'updated').length;
        const skipped = results.filter(r => r === 'skipped').length;
        const failed = results.filter(r => r === 'error').length;

        // 🔁 Αποστολή στον orchestrator
        if (changedGrades.length > 0) {
            try {
                const orchestratorURL = process.env.ORCHESTRATOR_URL;
                await axios.post(
                    orchestratorURL,
                    { grades: changedGrades },
                    {
                        headers: {
                            Authorization: req.headers['authorization'],
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log('📡 Grades sent to orchestrator');
            } catch (err) {
                console.error('❌ Failed to send to orchestrator:', err.message);
            }
        }

        fs.unlink(req.file.path, (err) => {
            if (err) console.error('⚠️ Failed to delete uploaded file:', err);
        });

        res.json({
            message: 'Grades processed successfully',
            inserted,
            updated,
            skipped,
            failed
        });

    } catch (error) {
        console.error('❌ File processing error:', error);
        res.status(500).json({ message: 'Error processing uploaded file' });
    }
});

module.exports = router;
