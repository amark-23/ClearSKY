// routes/orchestrator/gradesUpdate.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const authenticateToken = require('../../middleware/authenticateToken');

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '../../tmp') });

// URLs των downstream services
const GRADES_UPLOAD_URL = process.env.GRADES_UPLOAD_URL || 'http://grades-upload:3005/api/upload-grades';
const REQUEST_EVENTS_URL = process.env.REQUEST_EVENTS_URL || 'http://request-mngmnt:3003/api/events';
const VIEW_GRADES_URL = process.env.VIEW_GRADES_URL || 'http://view-grades:3009/api/receiveGradeUpdates';
const GRADES_STATISTICS_URL = process.env.GRADES_STATISTICS_URL || 'http://grades-statistics:3011/api/grades-update';

router.post(
    '/grades-update',
    authenticateToken,

    // Αν έχει multipart file (xlsx) → επεξεργασία με multer
    (req, res, next) => {
        const ct = req.headers['content-type'] || '';
        if (ct.includes('multipart/form-data')) {
            return upload.single('gradesFile')(req, res, next);
        }
        next();
    },

    async (req, res) => {
        // === 1) Αν έχουμε αρχείο XLSX → το προωθούμε στο grades-upload
        if (req.file) {
            try {
                const form = new FormData();
                form.append('gradesFile', fs.createReadStream(req.file.path), req.file.originalname);

                const resp = await axios.post(GRADES_UPLOAD_URL, form, {
                    headers: {
                        ...form.getHeaders(),
                        Authorization: req.headers.authorization,
                    },
                });

                fs.unlink(req.file.path, () => {});
                return res.status(resp.status).json(resp.data);
            } catch (err) {
                console.error('❌ Upload-to-grades-upload failed:', err.message);
                return res.status(500).json({ message: 'Upload failed' });
            }
        }

        // === 2) Αν έχουμε JSON με grades → προώθηση στα MS
        const grades = req.body.grades;
        if (!Array.isArray(grades) || grades.length === 0) {
            return res.status(400).json({ message: 'No grades provided' });
        }

        try {
            console.log('🔁 Dispatching grade updates to downstream services');
            //console.log('🧾 Grades:', JSON.stringify(grades, null, 2));

            // REQUEST-MNGMNT
            const requestPromises = grades.map(async g => {
                const type = g.gradeID ? 'GradeUpdated' : 'GradeAdded';
                try {
                    console.log(`➡️ [REQ-MNGMNT] Sending event: ${type} for AM: ${g.AMnumber}, subID: ${g.subID}`);
                    const resp = await axios.post(
                        REQUEST_EVENTS_URL,
                        { type, data: g },
                        { headers: { Authorization: req.headers.authorization } }
                    );
                    console.log(`✅ [REQ-MNGMNT] Success for AM: ${g.AMnumber}, subID: ${g.subID}`);
                    return resp;
                } catch (err) {
                    console.error(`❌ [REQ-MNGMNT] Failed for AM: ${g.AMnumber}, subID: ${g.subID}:`, err.response?.status, err.response?.data, err.message);
                    throw err;
                }
            });

            // VIEW-GRADES
            const viewGradesPromises = grades.map(async g => {
                try {
                    console.log(`➡️ [VIEW-GRADES] Sending grade for AM: ${g.AMnumber}, subID: ${g.subID}`);
                    const resp = await axios.post(
                        VIEW_GRADES_URL,
                        g,
                        { headers: { Authorization: req.headers.authorization } }
                    );
                    console.log(`✅ [VIEW-GRADES] Success for AM: ${g.AMnumber}, subID: ${g.subID}`);
                    return resp;
                } catch (err) {
                    console.error(`❌ [VIEW-GRADES] Failed for AM: ${g.AMnumber}, subID: ${g.subID}:`, err.response?.status, err.response?.data, err.message);
                    throw err;
                }
            });

            // GRADES-STATISTICS
            const statsPromises = grades.map(async g => {
                try {
                    console.log(`➡️ [GRADES-STATISTICS] Sending grade for AM: ${g.AMnumber}, subID: ${g.subID}`);
                    const resp = await axios.post(
                        GRADES_STATISTICS_URL,
                        g,
                        { headers: { Authorization: req.headers.authorization } }
                    );
                    console.log(`✅ [GRADES-STATISTICS] Success for AM: ${g.AMnumber}, subID: ${g.subID}`);
                    return resp;
                } catch (err) {
                    console.error(`❌ [GRADES-STATISTICS] Failed for AM: ${g.AMnumber}, subID: ${g.subID}:`, err.response?.status, err.response?.data, err.message);
                    throw err;
                }
            });

            await Promise.all([
                ...requestPromises,
                ...viewGradesPromises,
                ...statsPromises,
            ]);

            console.log('✅ All grade events forwarded successfully.');
            return res.json({ message: 'Events forwarded to all services', count: grades.length });
        } catch (err) {
            console.error('❌ Forwarding failed (outer catch):', err.stack || err.message);
            return res.status(500).json({ message: 'Forward failed', error: err.message });
        }
    }
);

module.exports = router;
