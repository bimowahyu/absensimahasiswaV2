const Absensi = require("../models/Absensi");
const Mahasiswa = require("../models/Mahasiswa");
const Cabang = require("../models/Cabang");
const Matkul = require('../models/Matkul')
const MahasiswaMatkul = require('../models/MahasiswaMatkul')
const { writeFile } = require('fs/promises');
const { Op, where } = require('sequelize');
const moment = require('moment');
const fs = require("fs");
const path = require("path");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const axios = require('axios')
const Users = require('../models/Users');
const { model } = require("@tensorflow/tfjs");

const today = new Date();
const dayIndex = today.getDay();
const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const currentDay = daysOfWeek[dayIndex];
const distance = (lat1, lon1, lat2, lon2) => {

    const R = 6371e3; 
    const φ1 = deg2rad(lat1); 
    const φ2 = deg2rad(lat2);
    const Δφ = deg2rad(lat2 - lat1);
    const Δλ = deg2rad(lon2 - lon1);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const meters = R * c; 
    return { meters };
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};

// dayjs.locale('id.js'); // Set locale ke Bahasa Indonesia
// dayjs.extend(require('dayjs/plugin/timezone.js')); // Load plugin timezone

// const getAbsenAll = async (req, res) => {
//     try {
//         const absensi = await Absensi.findAll({
//             attributes: ['id', 'tgl_absensi', 'jam_masuk', 'jam_keluar', 'mahasiswa_id'],
//             include: [
//                 {
//                     model: Mahasiswa,
//                     as: 'mahasiswa',
//                     attributes: ['id', 'nama_lengkap']
//                 },{
//                     model: Matkul
//                 },
//                 {
//                     model: MahasiswaMatkul
//                 }
//             ]
//         });
//         res.status(200).json(absensi);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Internal Server Error');
//     }
// };
const getAbsenAllByDosen = async (req, res) => {
    try {
        const dosen = await Users.findByPk(req.session.userId);
        if (!dosen || dosen.role !== 'dosen') {
            return res.status(403).json({ msg: 'Akses ditolak, bukan dosen' });
        }
        const absensi = await Absensi.findAll({
            where: {
                matkul_id: dosen.MatkulId
            },
             attributes: ['id', 'mahasiswa_id', 'matkul_id', 'tgl_absensi', 'jam_masuk', 'jam_keluar', 'status'], // tambahkan status
            include: [
                {
                    model: Mahasiswa,
                    as: 'mahasiswa',
                    attributes: ['id', 'nama_lengkap', 'username']
                },
                {
                    model: Matkul,
                    as: 'matkul',
                    attributes: ['id', 'nama_matkul', 'hari']
                }
            ],
            order: [['tgl_absensi', 'DESC']]
        });

        return res.status(200).json({
            code: 200,
            status: 'success',
            data: absensi
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
};

const getAbsenAll = async (req, res) => {
    try {
        const queryOptions = {
            include: [
                {
                    model: Mahasiswa,
                    as: 'mahasiswa',
                    attributes: ['id', 'nama_lengkap', 'username', 'avatar'],
                    required: true
                },
                {
                    model: Matkul,
                    as: 'matkul',
                    attributes: ['id', 'nama_matkul', 'hari'],
                    required: true
                }
            ],
            attributes: ['id', 'tgl_absensi', 'jam_masuk', 'jam_keluar', 'status', 'lokasi_masuk', 'lokasi_keluar']
        };

        // Filter berdasarkan tanggal
        if (req.query.tanggal) {
            queryOptions.where = {
                ...queryOptions.where,
                tgl_absensi: req.query.tanggal
            };
        }

        // Filter berdasarkan mahasiswa
        if (req.query.mahasiswa_id) {
            queryOptions.where = {
                ...queryOptions.where,
                mahasiswa_id: req.query.mahasiswa_id
            };
        }

        // Filter berdasarkan matkul
        if (req.query.matkul_id) {
            queryOptions.where = {
                ...queryOptions.where,
                matkul_id: req.query.matkul_id
            };
        }

        // Filter berdasarkan status absensi
        if (req.query.status) {
            queryOptions.where = {
                ...queryOptions.where,
                status: req.query.status
            };
        }

        const absensi = await Absensi.findAll(queryOptions);
     //   const totalAbsensi = await Absensi.count(queryOptions);

        res.status(200).json({
            absensi,
         //   totalAbsensi
        });
    } catch (error) {
        console.error("Error in getAllAbsensi:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

// Controller untuk mendapatkan absensi berdasarkan ID
const getAbsensiById = async (req, res) => {
    try {
        const { id } = req.params;
        const absensi = await Absensi.findByPk(id, {
            include: [
                {
                    model: Mahasiswa,
                    as: 'mahasiswa',
                    attributes: ['id', 'nama_lengkap', 'username', 'avatar']
                },
                {
                    model: Matkul,
                    as: 'matkul',
                    attributes: ['id', 'nama_matkul', 'hari', 'jam_dibuka_presensi', 'jam_masuk_presensi', 'jam_keluar_presensi']
                }
            ]
        });

        if (absensi) {
            res.status(200).json(absensi);
        } else {
            res.status(404).json({ msg: "Absensi tidak ditemukan" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

// Controller untuk mendapatkan absensi berdasarkan mahasiswa dan tanggal
const getAbsensiByMahasiswaAndDate = async (req, res) => {
    try {
        const { mahasiswaId } = req.params;
        const tanggal = req.query.tanggal || moment().format("YYYY-MM-DD");

        const absensi = await Absensi.findAll({
            where: {
                mahasiswa_id: mahasiswaId,
                tgl_absensi: tanggal
            },
            include: [
                {
                    model: Matkul,
                    as: 'matkul',
                    attributes: ['id', 'nama_matkul', 'hari', 'jam_dibuka_presensi', 'jam_masuk_presensi', 'jam_keluar_presensi']
                }
            ]
        });

        res.status(200).json(absensi);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const getAbsensi = async (req, res) => {
    try {
        const hariIni = moment().tz('Asia/Jakarta').format('YYYY-MM-DD');
        const mahasiswaId = req.mahasiswa.id;
        const mahasiswa = await Mahasiswa.findByPk(mahasiswaId);

        if (!mahasiswa) {
            return res.status(404).json({ msg: "mahasiswa tidak ditemukan" });
        }

        //const absensiHariIni = await Absensi.findOne({ where: { mahasiswa_id: mahasiswaId, tgl_absensi: hariIni } });
        // const cek = await Absensi.count({ where: { tgl_absensi: hariIni, mahasiswa_id: mahasiswaId },include:[{
        //     model:Matkul,
        //     as: 'matkul'
        // }] });
        const absensiHariIni = await Absensi.findAll({
            where: { tgl_absensi: hariIni, mahasiswa_id: mahasiswaId },
            include: [{
                model: Matkul,
                as: 'matkul',
                include:{
                    model: Users
                }
            },
        ]

        });
        
        const jumlah = absensiHariIni.length;
        const lokasi = await Cabang.findByPk(mahasiswa.CabangId);

        res.status(200).json({
            jumlah: absensiHariIni.length,
            lokasi,
            data: absensiHariIni });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// const getAbsensiById = async (req, res) => {
//     try {
//         const response = await Absensi.findOne({
//             attributes: ['tgl_absensi', 'jam_masuk', 'jam_keluar'],
//             where: { id: req.params.id },
//             include: [{
//                 model: Mahasiswa,
//                 as: 'mahasiswa',
//                 attributes: ['id', 'nama_lengkap', 'username'],
//                 include: [{
//                     model: Cabang,
//                     as: 'Cabang',
//                     attributes: ['id', 'nama']
//                 }]
//             }]
//         });

//         if (response) {
//             response.jam_masuk = moment(response.jam_masuk, "HH:mm:ss").format("HH:mm");
//             response.jam_keluar = moment(response.jam_keluar, "HH:mm:ss").format("HH:mm");
//         }

//         res.status(200).json(response);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send(error.message);
//     }
// };

const getAbsensiBulanMahasiswa = async (req, res) => {
    try {
        const bulan = req.query.bulan;
        const tahun = req.query.tahun;
        const MahasiswaId = req.mahasiswa.id;
        const mahasiswa = await Mahasiswa.findByPk(MahasiswaId);

        if (!mahasiswa) {
            return res.status(404).json({ msg: "mahasiswa tidak ditemukan" });
        }

        const startDate = moment(`${tahun}-${bulan}-01`).startOf('month').format('YYYY-MM-DD');
        const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

        const absensiBulanIni = await Absensi.findAll({
            where: {
                mahasiswa_id: MahasiswaId,
                tgl_absensi: {
                    [Op.between]: [startDate, endDate]
                },
               
            },
            include: [{
                model: Matkul,
                as: 'matkul',
                attributes: ['id', 'nama_matkul', 'hari', 'jam_dibuka_presensi', 'jam_masuk_presensi', 'jam_keluar_presensi'],
                required: false 
            }]
        });

        if (absensiBulanIni.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(absensiBulanIni);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// module.exports = {
   
// };


const getAbsensiByCabang = async (req, res) => {
    try {
        const { bulan, tahun } = req.query;

        if (!bulan || !tahun) {
            return res.status(400).json({ msg: "Bulan dan tahun harus disertakan" });
        }

        const tanggalMulai = moment(`${tahun}-${bulan}-01`).startOf('month').format('YYYY-MM-DD');
        const tanggalSelesai = moment(`${tahun}-${bulan}-01`).endOf('month').format('YYYY-MM-DD');

        const absensiData = await Absensi.findAll({
            where: {
                tgl_absensi: {
                    [Op.between]: [tanggalMulai, tanggalSelesai]
                }
            },
            include: [{
                model: Mahasiswa,
                as: 'mahasiswa',
                attributes: ['id', 'nama_lengkap', 'username'],
                include: [{
                    model: Cabang,
                    as: 'Cabang',
                    attributes: ['id', 'nama']
                }]
            }],
            order: [['tgl_absensi', 'ASC']]
        });

        if (absensiData.length === 0) {
            return res.status(404).json({ msg: "Tidak ada data absensi yang ditemukan" });
        }

        const groupedAbsensi = absensiData.reduce((acc, absensi) => {
            const cabangId = absensi.mahasiswa.Cabang.id;
            if (!acc[cabangId]) {
                acc[cabangId] = {
                    cabang: absensi.mahasiswa.Cabang,
                    absensi: []
                };
            }
            acc[cabangId].absensi.push(absensi);
            return acc;
        }, {});

        res.status(200).json(groupedAbsensi);

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
};

const getAbsensiByMatkul = async (req, res) => {
    try {
        const { bulan, tahun } = req.query;

        if (!bulan || !tahun) {
            return res.status(400).json({ msg: "Bulan dan tahun harus disertakan" });
        }

        const tanggalMulai = moment(`${tahun}-${bulan}-01`).startOf('month').format('YYYY-MM-DD');
        const tanggalSelesai = moment(`${tahun}-${bulan}-01`).endOf('month').format('YYYY-MM-DD');

        const absensiData = await Absensi.findAll({
            where: {
                tgl_absensi: {
                    [Op.between]: [tanggalMulai, tanggalSelesai]
                }
            },
            include: [
                {
                    model: Mahasiswa,
                    as: 'mahasiswa',
                    attributes: ['id', 'nama_lengkap', 'username'],
                    include: [{
                        model: Cabang,
                        as: 'Cabang',
                        attributes: ['id', 'nama']
                    }]
                },
                {
                    model: Matkul,
                    as: 'matkul',
                    attributes: ['id', 'nama_matkul', 'hari']
                }
            ],
            order: [['tgl_absensi', 'ASC']]
        });

        if (absensiData.length === 0) {
            return res.status(404).json({ msg: "Tidak ada data absensi yang ditemukan" });
        }

        const groupedAbsensi = absensiData.reduce((acc, absensi) => {
            // Periksa apakah ada data mata kuliah
            if (!absensi.matkul) {
                // Jika tidak ada matkul, bisa tambahkan ke kategori "Tidak Ada Mata Kuliah" atau lewati
                if (!acc["no_matkul"]) {
                    acc["no_matkul"] = {
                        matkul: { id: "no_matkul", nama_matkul: "Tidak Ada Mata Kuliah" },
                        absensi: []
                    };
                }
                acc["no_matkul"].absensi.push(absensi);
                return acc;
            }

            const matkulId = absensi.matkul.id;
            if (!acc[matkulId]) {
                acc[matkulId] = {
                    matkul: absensi.matkul,
                    absensi: []
                };
            }
            acc[matkulId].absensi.push(absensi);
            return acc;
        }, {});

        res.status(200).json(groupedAbsensi);

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
}

const getAbsensiHarian = async (req, res) => {
    try {
        const hariIni = moment().format('YYYY-MM-DD');

        const absensiHarian = await Absensi.findAll({
            where: {
                tgl_absensi: hariIni
            },
            include: [
                {
                    model: Mahasiswa,
                    as: 'mahasiswa',
                    attributes: ['nama_lengkap'],
                    include: [
                        {
                            model: Cabang,
                            attributes: ['nama']
                        }
                    ]
                }
            ]
        });

        const jumlahAbsensi = absensiHarian.length;
        res.status(200).json({
            jumlahAbsensi,
            absensiHarian
        });

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
};

const getAbsensiByMahasiswaId = async (req, res) => {
    try {
        const mahasiswaId = req.mahasiswa.id;
        const { bulan, tahun } = req.query;

        const tanggalMulai = moment(`${tahun}-${bulan}-01`).startOf('month').format('YYYY-MM-DD');
        const tanggalSelesai = moment(`${tahun}-${bulan}-01`).endOf('month').format('YYYY-MM-DD');

        const absensiMahasiswa = await Absensi.findAll({
            where: {
                mahasiswa_id: mahasiswaId,
                tgl_absensi: {
                    [Op.between]: [tanggalMulai, tanggalSelesai]
                }
            }
        });

        res.status(200).json(absensiMahasiswa);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// module.exports = {
   
// };

const getAbsensiBulanIni = async (req, res) => {
    try {
        const bulan = req.query.bulan;
        const tahun = req.query.tahun;

        const tanggalMulai = moment(`${tahun}-${bulan}-01`).format('YYYY-MM-DD');
        const tanggalSelesai = moment(`${tahun}-${bulan}-30`).format('YYYY-MM-DD');

        const absensiBulanan = await Absensi.findAll({
            where: {
                tgl_absensi: {
                    [Op.between]: [tanggalMulai, tanggalSelesai]
                }
            },
            include: [
                {
                    model: Mahasiswa,
                    as: 'mahasiswa',
                    attributes: ['nama_lengkap'],
                    include: [
                        {
                            model: Cabang,
                            attributes: ['nama']
                        }
                    ]
                }
            ]
        });

        const dataAbsensi = {};

        absensiBulanan.forEach(absensi => {
            const mahasiswaId = absensi.mahasiswa_id;
            if (!dataAbsensi[mahasiswaId]) {
                dataAbsensi[mahasiswaId] = {
                    nama: absensi.mahasiswa ? absensi.mahasiswa.nama_lengkap : 'Unknown',
                    cabang: absensi.mahasiswa && absensi.mahasiswa.Cabang ? absensi.mahasiswa.Cabang.nama : 'Unknown',
                    absensi: []
                };
            }

            dataAbsensi[mahasiswaId].absensi.push({
                tanggal: absensi.tgl_absensi,
                jam_masuk: absensi.jam_masuk,
                foto_masuk: absensi.foto_masuk,
                foto_keluar: absensi.foto_keluar,
                jam_keluar: absensi.jam_keluar,
                lokasi_masuk: absensi.lokasi_masuk,
                lokasi_keluar: absensi.lokasi_keluar
            });

            if (!absensi.jam_keluar || !absensi.lokasi_keluar || !absensi.foto_keluar) {
                dataAbsensi[mahasiswaId].absensi.push({ error: 'Anda belum absen keluar' });
            }
            if (!absensi.jam_masuk || !absensi.lokasi_masuk || !absensi.foto_masuk) {
                dataAbsensi[mahasiswaId].absensi.push({ error: 'Anda Tidak Presensi Hari ini' });
            }
        });

        res.status(200).json(Object.values(dataAbsensi));
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const getAbsensiTotal = async (req, res) => {
    try {
        const bulan = req.query.bulan;
        const tahun = req.query.tahun;

        const tanggalMulai = moment(`${tahun}-${bulan}-01`).format('YYYY-MM-DD');
        const tanggalSelesai = moment(`${tahun}-${bulan}-30`).format('YYYY-MM-DD');

        const absensiBulanan = await Absensi.findAll({
            where: {
                tgl_absensi: {
                    [Op.between]: [tanggalMulai, tanggalSelesai]
                }
            },
            include: [{
                model: Mahasiswa,
                as: 'mahasiswa',
                attributes: ['nama_lengkap']
            }]
        });

        const kehadiranMahasiswa = {};

        absensiBulanan.forEach(absensi => {
            const mahasiswaId = absensi.mahasiswa_id;
            const namaLengkap = absensi.mahasiswa.nama_lengkap;

            if (!kehadiranMahasiswa[mahasiswaId]) {
                kehadiranMahasiswa[mahasiswaId] = {
                    nama_lengkap: namaLengkap,
                    kehadiran: 1
                };
            } else {
                kehadiranMahasiswa[mahasiswaId].kehadiran++;
            }
        });

        res.status(200).json(kehadiranMahasiswa);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

function convertToGMT7(dateString) {
    return moment.utc(dateString).tz('Asia/Jakarta').format();
}

function createAdjustedAbsensi(dataMasuk) {
    return {
        ...dataMasuk,
        createdAt: convertToGMT7(new Date()),
        updatedAt: convertToGMT7(new Date())
    };
}

// const absenManual = async (req, res) => {
//     try {
//         const { jam_masuk, jam_keluar, mahasiswaId, tanggal } = req.body; 
//         if (!mahasiswaId) {
//             return res.status(400).json({ msg: "ID mahasiswa tidak valid" });
//         }
//         const tglAbsensi = tanggal ? moment(tanggal).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
//         const existingAbsensi = await Absensi.findOne({
//             where: {
//                 tgl_absensi: tglAbsensi,
//                 mahasiswa_id: mahasiswaId 
//             }
//         });
//         if (existingAbsensi) {
//             return res.status(400).json({ msg: "Absensi sudah ada untuk tanggal tersebut" });
//         }
//         const absen = {
//             mahasiswa_id: mahasiswaId,
//             jam_masuk: jam_masuk,
//            // jam_keluar: jam_keluar,
//             tgl_absensi: tglAbsensi
//         };  if (jam_keluar) {
//             absen.jam_keluar = jam_keluar;
//         }

//         const adjustedDataMasuk = createAdjustedAbsensi(absen);
//         const absensi = await Absensi.create(adjustedDataMasuk);
//         if (absensi) {
//             return res.status(200).json({ msg: "Absensi berhasil ditambahkan" });
//         } else {
//             return res.status(500).json({ msg: "Error saat menyimpan data absensi" });
//         }
        
//     } catch (error) {
//         console.error(error); 
//         res.status(500).json({ msg: error.message });
//     }
// }
const absenManual = async (req, res) => {
    try {
        const { jam_masuk, jam_keluar, mahasiswaId, tanggal, matkul_id } = req.body;

        if (!mahasiswaId || !matkul_id) {
            return res.status(400).json({ msg: "Mahasiswa dan mata kuliah wajib diisi" });
        }
        const tglAbsensi = tanggal ? moment(tanggal).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
        const relasi = await MahasiswaMatkul.findOne({
            where: {
                MahasiswaId: mahasiswaId,
                MatkulId: matkul_id
            }
        });

        if (!relasi) {
            return res.status(400).json({ msg: "Mahasiswa tidak terdaftar pada mata kuliah tersebut" });
        }
        const existingAbsensi = await Absensi.findOne({
            where: {
                mahasiswa_id: mahasiswaId,
                matkul_id,
                tgl_absensi: tglAbsensi
            }
        });

        if (existingAbsensi) {
            return res.status(400).json({ msg: "Absensi sudah dibuat untuk mahasiswa dan mata kuliah ini di tanggal tersebut" });
        }
        const absen = {
            mahasiswa_id: mahasiswaId,
            matkul_id,
            tgl_absensi: tglAbsensi,
            jam_masuk: jam_masuk || null,
            jam_keluar: jam_keluar || null,
            status: 'hadir'
        };

        const created = await Absensi.create(absen);

        return res.status(201).json({
            msg: "Absensi manual berhasil ditambahkan",
            data: created
        });

    } catch (error) {
        console.error("Error absenManual:", error);
        return res.status(500).json({ msg: "Terjadi kesalahan saat input absensi", error: error.message });
    }
};

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const loadModels = async () => {
    try {
        const modelPath = path.join(__dirname, "../models/ssd_mobilenetv1");
        console.log("Model Path:", modelPath); 

        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
        
        console.log("Models loaded successfully");
    } catch (error) {
        console.error("Error loading models:", error);
    }
};
loadModels();

const cosineSimilarity = (vecA, vecB) => {
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (normA * normB);
};

const compareFaceLandmarks = (landmarks1, landmarks2) => {
    if (landmarks1.length !== landmarks2.length) return 0;
    const vec1 = landmarks1.flat();
    const vec2 = landmarks2.flat();
    return cosineSimilarity(vec1, vec2);
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = deg2rad(lat1);
    const φ2 = deg2rad(lat2);
    const Δφ = deg2rad(lat2 - lat1);
    const Δλ = deg2rad(lon2 - lon1);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const meters = R * c;
    return { meters };
};
const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.7, 
    maxResults: 1        
});

// const CreateAbsensiMahasiswa = async (req, res) => {
//     try {
//         const mahasiswa = req.mahasiswa;
//         if (!mahasiswa || !mahasiswa.CabangId) {
//             return res.status(404).json({ msg: "Mahasiswa tidak ditemukan" });
//         }

//         const tglAbsensi = moment().format("YYYY-MM-DD");
//         const jamSekarang = moment().format("HH:mm:ss");
//         const hariIni = moment().locale('id').format('dddd').toLowerCase();

//         const lokasiKantor = await Cabang.findOne({ 
//             where: { id: mahasiswa.CabangId }, 
//             attributes: ["lokasi", "radius"] 
//         });

//         if (!lokasiKantor || !lokasiKantor.lokasi) {
//             return res.status(404).json({ msg: "Lokasi kampus tidak ditemukan" });
//         }
//         const matkulHariIni = await Matkul.findAll({
//             where: { hari: hariIni },
//             include: [
//                 {
//                     model: Mahasiswa,
//                     where: { id: mahasiswa.id },
//                     through: { attributes: [] },
//                     attributes: []
//                 }
//             ]
//         });

//         if (matkulHariIni.length === 0) {
//             return res.status(404).json({ msg: "Tidak ada mata kuliah hari ini" });
//         }
//         const matkulBerlangsung = matkulHariIni.filter(matkul => {
//             const jamDibuka = moment(matkul.jam_dibuka_presensi, 'HH:mm:ss');
//             const jamKeluar = moment(matkul.jam_keluar_presensi, 'HH:mm:ss');
//             const sekarang = moment(jamSekarang, 'HH:mm:ss');
            
//             return sekarang.isBetween(jamDibuka, jamKeluar, null, '[]'); 
//         });

//       //  if (matkulBerlangsung.length === 0) 
//     //   if (matkulBerlangsung.length > 1)
//     //         {
//     //         return res.status(400).json({ msg: "Tidak ada mata kuliah yang sedang berlangsung saat ini" });
            
//     //     }
//     if (matkulBerlangsung.length === 0) {
//         return res.status(400).json({ msg: "Tidak ada mata kuliah yang sedang berlangsung saat ini" });
//     }
    
//     if (matkulBerlangsung.length > 1) {
//         return res.status(400).json({ 
//             msg: "Ada lebih dari satu mata kuliah yang berlangsung saat ini",
//             matkul_list: matkulBerlangsung.map(m => ({ id: m.id, nama: m.nama_matkul }))
//         });
//     }

//         const matkul = matkulBerlangsung[0]; 
//         const existingAbsensi = await Absensi.findOne({
//             where: {
//                 tgl_absensi: tglAbsensi,
//                 mahasiswa_id: mahasiswa.id,
//                 matkul_id: matkul.id
//             }
//         });
//         const sekarang = moment(jamSekarang, 'HH:mm:ss');
//         const jamMasuk = moment(matkul.jam_masuk_presensi, 'HH:mm:ss');
//         const jamKeluar = moment(matkul.jam_keluar_presensi, 'HH:mm:ss');
        
//         let isPresensiMasuk = false;
        
//         if (sekarang.isBefore(jamMasuk) || sekarang.isSame(jamMasuk)) {
//             isPresensiMasuk = true;
//         }
//         if (existingAbsensi) {
//             if (isPresensiMasuk && existingAbsensi.jam_masuk) {
//                 return res.status(400).json({ msg: "Anda sudah melakukan presensi masuk untuk mata kuliah ini" });
//             }
            
//             if (!isPresensiMasuk && !existingAbsensi.jam_masuk) {
//                 return res.status(400).json({ msg: "Anda belum melakukan presensi masuk" });
//             }
            
//             if (!isPresensiMasuk && existingAbsensi.jam_keluar) {
//                 return res.status(400).json({ msg: "Anda sudah melakukan presensi keluar untuk mata kuliah ini" });
//             }
//         }
//         const { latitude: latitudeUser, longitude: longitudeUser, image, matkul_id  } = req.body;
//         if (!latitudeUser || !longitudeUser) {
//             return res.status(400).json({ msg: "Lokasi tidak valid" });
//         }
//         if (matkulBerlangsung.length > 1 && matkul_id) {
//             const selectedMatkul = matkulBerlangsung.find(m => m.id === matkul_id);
//             if (selectedMatkul) {
//                 matkul = selectedMatkul;
//             } else {
//                 return res.status(400).json({ 
//                     msg: "Mata kuliah yang dipilih tidak sedang berlangsung",
//                     matkul_list: matkulBerlangsung.map(m => ({ id: m.id, nama: m.nama_matkul }))
//                 });
//             }
//         }

//         const [latitudeKantor, longitudeKantor] = lokasiKantor.lokasi.split(",");
//         const { meters: jarakMahasiswa } = calculateDistance(
//             latitudeKantor, longitudeKantor, latitudeUser, longitudeUser
//         );

//         if (jarakMahasiswa > lokasiKantor.radius) {
//             return res.status(400).json({ 
//                 msg: `Anda berada di luar radius kampus (${jarakMahasiswa.toFixed(2)} M)` 
//             });
//         }

//         // Ambil foto profil mahasiswa dan proses deteksi wajah
//         let avatarPath = path.join(process.cwd(), 'public', 'uploads', 'mahasiswa', mahasiswa.avatar);
//         if (!fs.existsSync(avatarPath)) {
//             // Jika file tidak ada, ambil dari URL (jika ada)
//             if (mahasiswa.avatar && mahasiswa.avatar.startsWith('http')) {
//                 const response = await axios.get(mahasiswa.avatar, { 
//                     responseType: "arraybuffer", 
//                     timeout: 10000 
//                 });
//                 avatarPath = path.join(process.cwd(), 'public', 'uploads', 'mahasiswa', 
//                                       `downloaded-${Date.now()}.png`);
//                 fs.writeFileSync(avatarPath, response.data);
//             } else {
//                 return res.status(400).json({ msg: "Foto profil tidak ditemukan" });
//             }
//         }
//         const [, imageData] = image.split(";base64,");
//         const bufferImage = Buffer.from(imageData, "base64");
//         const profileImage = await canvas.loadImage(avatarPath);
//         const absensiImage = await canvas.loadImage(bufferImage);

//         const profileDescriptor = await faceapi.detectSingleFace(profileImage, faceDetectionOptions)
//                                       .withFaceLandmarks().withFaceDescriptor();
//         const absensiDescriptor = await faceapi.detectSingleFace(absensiImage, faceDetectionOptions)
//                                       .withFaceLandmarks().withFaceDescriptor();

//         if (!profileDescriptor || !absensiDescriptor) {
//             return res.status(400).json({ 
//                 msg: "Wajah tidak terdeteksi, pastikan wajah terlihat jelas" 
//             });
//         }
//         const faceDistance = faceapi.euclideanDistance(
//             profileDescriptor.descriptor, absensiDescriptor.descriptor
//         );
//         const FACE_MATCH_THRESHOLD = 0.45;
//         if (faceDistance > FACE_MATCH_THRESHOLD) {
//             return res.status(400).json({ msg: "Wajah tidak cocok dengan foto profil" });
//         }

//         // Simpan gambar absensi
//         const jenisAbsensi = isPresensiMasuk ? "masuk" : "keluar";
//         const formatName = `${mahasiswa.nama_lengkap}-${tglAbsensi}-${matkul.nama_matkul}-${jenisAbsensi}.png`;
//         const file = `public/uploads/absensi/${formatName}`;
//         await writeFile(file, bufferImage);

//         if (!existingAbsensi) {
//             await Absensi.create({
//                 mahasiswa_id: mahasiswa.id,
//                 matkul_id: matkul.id,
//                 tgl_absensi: tglAbsensi,
//                 jam_masuk: isPresensiMasuk ? jamSekarang : null,
//                 jam_keluar: isPresensiMasuk ? null : jamSekarang,
//                 foto_masuk: isPresensiMasuk ? formatName : null,
//                 foto_keluar: isPresensiMasuk ? null : formatName,
//                 lokasi_masuk: isPresensiMasuk ? `${latitudeUser},${longitudeUser}` : null,
//                 lokasi_keluar: isPresensiMasuk ? null : `${latitudeUser},${longitudeUser}`,
//                 status: 'hadir'
//             });
//         } else {
//             // Update absensi yang sudah ada
//             await existingAbsensi.update({
//                 jam_keluar: jamSekarang,
//                 foto_keluar: formatName,
//                 lokasi_keluar: `${latitudeUser},${longitudeUser}`
//             });
//         }

//         const pesanSukses = isPresensiMasuk 
//             ? "Presensi masuk berhasil, selamat belajar!" 
//             : "Presensi keluar berhasil, sampai jumpa!";
            
//         return res.status(200).json({ 
//             msg: pesanSukses,
//             matkul: matkul.nama_matkul
//         });
        
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ msg: "Terjadi kesalahan server" });
//     }
// };
const CreateAbsensiMahasiswa = async (req, res) => {
    try {
        const mahasiswa = req.mahasiswa;
        if (!mahasiswa || !mahasiswa.CabangId) {
            return res.status(404).json({ msg: "Mahasiswa tidak ditemukan" });
        }

        const tglAbsensi = moment().format("YYYY-MM-DD");
        const jamSekarang = moment().format("HH:mm:ss");
        const hariIni = moment().locale('id').format('dddd').toLowerCase();

        const lokasiKantor = await Cabang.findOne({
            where: { id: mahasiswa.CabangId },
            attributes: ["lokasi", "radius"]
        });

        if (!lokasiKantor || !lokasiKantor.lokasi) {
            return res.status(404).json({ msg: "Lokasi kampus tidak ditemukan" });
        }

        const matkulHariIni = await Matkul.findAll({
            where: { hari: hariIni },
            include: [{
                model: Mahasiswa,
                where: { id: mahasiswa.id },
                through: { attributes: [] },
                attributes: []
            }]
        });

        if (matkulHariIni.length === 0) {
            return res.status(404).json({ msg: "Tidak ada mata kuliah hari ini" });
        }

        let matkulBerlangsung = matkulHariIni.filter(matkul => {
            const jamDibuka = moment(matkul.jam_dibuka_presensi, 'HH:mm:ss');
            const jamKeluar = moment(matkul.jam_keluar_presensi, 'HH:mm:ss');
            const sekarang = moment(jamSekarang, 'HH:mm:ss');
            return sekarang.isBetween(jamDibuka, jamKeluar, null, '[]');
        });

        if (matkulBerlangsung.length === 0) {
            return res.status(400).json({ msg: "Tidak ada mata kuliah yang sedang berlangsung saat ini" });
        }

        if (matkulBerlangsung.length > 1) {
            return res.status(400).json({
                msg: "Ada lebih dari satu mata kuliah yang berlangsung saat ini",
                matkul_list: matkulBerlangsung.map(m => ({ id: m.id, nama: m.nama_matkul }))
            });
        }

        let matkul = matkulBerlangsung[0];

        //const { latitude: latitudeUser, longitude: longitudeUser, image, matkul_id } = req.body;
        const { latitude: latitudeUser, longitude: longitudeUser, image, matkul_id, status } = req.body;

        if (!latitudeUser || !longitudeUser) {
            return res.status(400).json({ msg: "Lokasi tidak valid" });
        }
if (status === 'izin' || status === 'sakit') {
    const existingAbsensi = await Absensi.findOne({
        where: {
            tgl_absensi: tglAbsensi,
            mahasiswa_id: mahasiswa.id,
            matkul_id: matkul_id
        }
    });

    if (existingAbsensi) {
        return res.status(400).json({ msg: "Absensi sudah tercatat sebelumnya" });
    }

    await Absensi.create({
        mahasiswa_id: mahasiswa.id,
        matkul_id: matkul_id,
        tgl_absensi: tglAbsensi,
        status: status
    });

    return res.status(200).json({ msg: `Absensi ${status} berhasil disimpan` });
}

        const existingAbsensi = await Absensi.findOne({
            where: {
                tgl_absensi: tglAbsensi,
                mahasiswa_id: mahasiswa.id,
                matkul_id: matkul.id
            }
        });

        const sekarang = moment(jamSekarang, 'HH:mm:ss');
        const jamMasuk = moment(matkul.jam_masuk_presensi, 'HH:mm:ss');

        let isPresensiMasuk = sekarang.isSameOrBefore(jamMasuk);

        if (existingAbsensi) {
            if (isPresensiMasuk && existingAbsensi.jam_masuk) {
                return res.status(400).json({ msg: "Anda sudah melakukan presensi masuk untuk mata kuliah ini" });
            }
            if (!isPresensiMasuk && !existingAbsensi.jam_masuk) {
                return res.status(400).json({ msg: "Anda belum melakukan presensi masuk" });
            }
            if (!isPresensiMasuk && existingAbsensi.jam_keluar) {
                return res.status(400).json({ msg: "Anda sudah melakukan presensi keluar untuk mata kuliah ini" });
            }
        }

        const [latitudeKantor, longitudeKantor] = lokasiKantor.lokasi.split(",");
        const { meters: jarakMahasiswa } = calculateDistance(
            latitudeKantor, longitudeKantor, latitudeUser, longitudeUser
        );

        if (jarakMahasiswa > lokasiKantor.radius) {
            return res.status(400).json({
                msg: `Anda berada di luar radius kampus (${jarakMahasiswa.toFixed(2)} M)`
            });
        }

        // Proses deteksi wajah dengan penanganan error
        if (!mahasiswa.face_descriptor) {
            return res.status(400).json({ msg: "Data wajah mahasiswa tidak tersedia" });
        }

        // Extract image data
        const [, imageData] = image.split(";base64,");
        if (!imageData) {
            return res.status(400).json({ msg: "Format gambar tidak valid" });
        }

        try {
            const bufferImage = Buffer.from(imageData, "base64");
            const absensiImage = await canvas.loadImage(bufferImage);

            const absensiDescriptor = await faceapi.detectSingleFace(absensiImage, faceDetectionOptions)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!absensiDescriptor) {
                return res.status(400).json({ msg: "Wajah tidak terdeteksi, pastikan wajah terlihat jelas" });
            }

            // Replace the descriptor parsing section with this improved version
let storedDescriptorArray;
try {
    // First attempt: Try parsing the JSON string into an object
    const parsedDescriptor = JSON.parse(mahasiswa.face_descriptor);
    
    // Handle different possible formats
    
    if (Array.isArray(parsedDescriptor)) {
        // If it's already an array, use it directly
        storedDescriptorArray = parsedDescriptor;
    } else if (typeof parsedDescriptor === 'object') {
        // If it's an object with numeric keys (0, 1, 2, etc.)
        if (Object.keys(parsedDescriptor).every(key => !isNaN(Number(key)))) {
            // Convert object with numeric keys to array
            storedDescriptorArray = Object.values(parsedDescriptor);
        } else {
            // Otherwise, it's some other object format we don't recognize
            console.error("Unrecognized descriptor format:", parsedDescriptor);
            return res.status(400).json({ msg: "Format data wajah tersimpan tidak valid" });
        }
    } else {
        console.error("Invalid descriptor type:", typeof parsedDescriptor);
        return res.status(400).json({ msg: "Format data wajah tersimpan tidak valid" });
        console.log("Parsed descriptor type:", typeof parsedDescriptor, 
            "isArray:", Array.isArray(parsedDescriptor),
            "sample:", Object.keys(parsedDescriptor).slice(0, 5));
    }
} catch (error) {
    console.error("Error parsing face descriptor:", error);
    return res.status(400).json({ msg: "Data wajah tersimpan rusak" });
}

            // Extract detected descriptor
            let detectedDescriptorArray;
            if (absensiDescriptor && absensiDescriptor.descriptor) {
                detectedDescriptorArray = Array.from(absensiDescriptor.descriptor);
            } else {
                return res.status(400).json({ msg: "Format data wajah tidak valid dari gambar yang dikirim" });
            }

            // Compare lengths
            if (storedDescriptorArray.length !== detectedDescriptorArray.length) {
                console.log(`Length mismatch: stored=${storedDescriptorArray.length}, new=${detectedDescriptorArray.length}`);
                return res.status(400).json({ msg: "Ketidakcocokan dalam format data wajah" });
            }
           
            // Calculate face distance
            const faceDistance = faceapi.euclideanDistance(storedDescriptorArray, detectedDescriptorArray);
            const FACE_MATCH_THRESHOLD = 0.45;

            console.log("Face distance:", faceDistance);

            if (faceDistance > FACE_MATCH_THRESHOLD) {
                return res.status(400).json({ msg: "Wajah tidak cocok dengan data profil" });
            }

            // Simpan gambar presensi
            const jenisAbsensi = isPresensiMasuk ? "masuk" : "keluar";
            const formatName = `${mahasiswa.nama_lengkap}-${tglAbsensi}-${matkul.nama_matkul}-${jenisAbsensi}.png`;
            const file = `public/uploads/absensi/${formatName}`;
            await writeFile(file, bufferImage);

            if (!existingAbsensi) {
                await Absensi.create({
                    mahasiswa_id: mahasiswa.id,
                    matkul_id: matkul.id,
                    tgl_absensi: tglAbsensi,
                    jam_masuk: isPresensiMasuk ? jamSekarang : null,
                    jam_keluar: isPresensiMasuk ? null : jamSekarang,
                    foto_masuk: isPresensiMasuk ? formatName : null,
                    foto_keluar: isPresensiMasuk ? null : formatName,
                    lokasi_masuk: isPresensiMasuk ? `${latitudeUser},${longitudeUser}` : null,
                    lokasi_keluar: isPresensiMasuk ? null : `${latitudeUser},${longitudeUser}`,
                    status: 'hadir'
                });
            } else {
                await existingAbsensi.update({
                    jam_keluar: jamSekarang,
                    foto_keluar: formatName,
                    lokasi_keluar: `${latitudeUser},${longitudeUser}`
                });
            }

            return res.status(200).json({
                msg: isPresensiMasuk
                    ? "Presensi masuk berhasil, selamat belajar!"
                    : "Presensi keluar berhasil, sampai jumpa!",
                matkul: matkul.nama_matkul
            });

        } catch (faceError) {
            console.error("Face detection error:", faceError);
            return res.status(500).json({ msg: "Terjadi kesalahan saat memproses data wajah" });
        }

    } catch (error) {
        console.error("CreateAbsensiMahasiswa error:", error);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
};


// const CreateAbsensiMahasiswaKeluar = async (req, res) => {
//     try {
//         const mahasiswa = req.mahasiswa;
//         if (!mahasiswa || !mahasiswa.CabangId) {
//             return res.status(404).json({ msg: "Mahasiswa tidak ditemukan" });
//         }

//         const tglAbsensi = moment().format("YYYY-MM-DD");
//         const jamSekarang = moment().format("HH:mm:ss");
//         const hariIni = moment().locale('id').format('dddd').toLowerCase();

//         // Cari lokasi kampus/cabang
//         const lokasiKantor = await Cabang.findOne({ 
//             where: { id: mahasiswa.CabangId }, 
//             attributes: ["lokasi", "radius"] 
//         });

//         if (!lokasiKantor || !lokasiKantor.lokasi) {
//             return res.status(404).json({ msg: "Lokasi kampus tidak ditemukan" });
//         }

//         // Cek mata kuliah yang tersedia hari ini untuk mahasiswa
//         const matkulHariIni = await Matkul.findAll({
//             where: { hari: hariIni },
//             include: [
//                 {
//                     model: Mahasiswa,
//                     where: { id: mahasiswa.id },
//                     through: { attributes: [] }, // Tidak perlu data dari tabel penghubung
//                     attributes: []
//                 }
//             ]
//         });

//         if (matkulHariIni.length === 0) {
//             return res.status(404).json({ msg: "Tidak ada mata kuliah hari ini" });
//         }

//         // Cek apakah sudah waktunya untuk presensi keluar
//         const matkulBisaAbsenKeluar = matkulHariIni.filter(matkul => {
//             const jamKeluar = moment(matkul.jam_keluar_presensi, 'HH:mm:ss');
//             const sekarang = moment(jamSekarang, 'HH:mm:ss');
            
//             // Absen keluar hanya bisa dilakukan SETELAH jam keluar mata kuliah
//             return sekarang.isAfter(jamKeluar);
//         });

//         if (matkulBisaAbsenKeluar.length === 0) {
//             return res.status(400).json({ msg: "Belum waktunya untuk presensi keluar" });
//         }

//         // Cari mata kuliah yang sudah memiliki presensi masuk tapi belum memiliki presensi keluar
//         const presensiMasukHariIni = await Absensi.findAll({
//             where: {
//                 tgl_absensi: tglAbsensi,
//                 mahasiswa_id: mahasiswa.id,
//                 jam_masuk: { [Op.ne]: null },
//                 jam_keluar: null
//             },
//             include: [
//                 {
//                     model: Matkul,
//                     as: 'matkul',
//                     attributes: ['id', 'nama_matkul', 'jam_keluar_presensi']
//                 }
//             ]
//         });

//         if (presensiMasukHariIni.length === 0) {
//             return res.status(400).json({ msg: "Anda belum melakukan presensi masuk atau sudah melakukan presensi keluar untuk semua mata kuliah hari ini" });
//         }

//         // Filter presensi yang sudah melewati jam keluar
//         const presensiYangBisaAbsenKeluar = presensiMasukHariIni.filter(absensi => {
//             if (!absensi.matkul) return false;
            
//             const jamKeluar = moment(absensi.matkul.jam_keluar_presensi, 'HH:mm:ss');
//             const sekarang = moment(jamSekarang, 'HH:mm:ss');
            
//             return sekarang.isAfter(jamKeluar);
//         });

//         if (presensiYangBisaAbsenKeluar.length === 0) {
//             return res.status(400).json({ msg: "Belum waktunya untuk presensi keluar pada mata kuliah yang Anda hadiri" });
//         }

//         // Ambil presensi pertama yang bisa diisi
//         const absensi = presensiYangBisaAbsenKeluar[0];
//         const matkul = absensi.matkul;

//         // Cek lokasi GPS
//         const { latitude: latitudeUser, longitude: longitudeUser, image } = req.body;
//         if (!latitudeUser || !longitudeUser || !image) {
//             return res.status(400).json({ msg: "Lokasi atau foto tidak valid" });
//         }

//         const [latitudeKantor, longitudeKantor] = lokasiKantor.lokasi.split(",");
//         const { meters: jarakMahasiswa } = calculateDistance(
//             latitudeKantor, longitudeKantor, latitudeUser, longitudeUser
//         );

//         if (jarakMahasiswa > lokasiKantor.radius) {
//             return res.status(400).json({ 
//                 msg: `Anda berada di luar radius kampus (${jarakMahasiswa.toFixed(2)} M)` 
//             });
//         }

//         // Ambil foto profil mahasiswa dan proses deteksi wajah
//         let avatarPath = path.join(process.cwd(), 'public', 'uploads', 'mahasiswa', mahasiswa.avatar);
//         if (!fs.existsSync(avatarPath)) {
//             // Jika file tidak ada, ambil dari URL (jika ada)
//             if (mahasiswa.avatar && mahasiswa.avatar.startsWith('http')) {
//                 const response = await axios.get(mahasiswa.avatar, { 
//                     responseType: "arraybuffer", 
//                     timeout: 10000 
//                 });
//                 avatarPath = path.join(process.cwd(), 'public', 'uploads', 'mahasiswa', 
//                                       `downloaded-${Date.now()}.png`);
//                 fs.writeFileSync(avatarPath, response.data);
//             } else {
//                 return res.status(400).json({ msg: "Foto profil tidak ditemukan" });
//             }
//         }

//         // Proses deteksi wajah
//         const [, imageData] = image.split(";base64,");
//         const bufferImage = Buffer.from(imageData, "base64");
//         const profileImage = await canvas.loadImage(avatarPath);
//         const absensiImage = await canvas.loadImage(bufferImage);

//         const profileDescriptor = await faceapi.detectSingleFace(profileImage, faceDetectionOptions)
//                                       .withFaceLandmarks().withFaceDescriptor();
//         const absensiDescriptor = await faceapi.detectSingleFace(absensiImage, faceDetectionOptions)
//                                       .withFaceLandmarks().withFaceDescriptor();

//         if (!profileDescriptor || !absensiDescriptor) {
//             return res.status(400).json({ 
//                 msg: "Wajah tidak terdeteksi, pastikan wajah terlihat jelas" 
//             });
//         }

//         // Pencocokan wajah
//         const faceDistance = faceapi.euclideanDistance(
//             profileDescriptor.descriptor, absensiDescriptor.descriptor
//         );
//         const FACE_MATCH_THRESHOLD = 0.45;
//         if (faceDistance > FACE_MATCH_THRESHOLD) {
//             return res.status(400).json({ msg: "Wajah tidak cocok dengan foto profil" });
//         }

//         // Simpan gambar absensi
//         const formatName = `${mahasiswa.nama_lengkap}-${tglAbsensi}-${matkul.nama_matkul}-keluar.png`;
//         const file = `public/uploads/absensi/${formatName}`;
//         await writeFile(file, bufferImage);

//         // Update presensi yang sudah ada dengan data keluar
//         await absensi.update({
//             jam_keluar: jamSekarang,
//             foto_keluar: formatName,
//             lokasi_keluar: `${latitudeUser},${longitudeUser}`
//         });

//         return res.status(200).json({ 
//             msg: "Presensi keluar berhasil, sampai jumpa!",
//             matkul: matkul.nama_matkul
//         });
        
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ msg: "Terjadi kesalahan server" });
//     }
// };

const CreateAbsensiMahasiswaKeluar = async (req, res) => {
    try {
        const mahasiswa = req.mahasiswa;
        if (!mahasiswa || !mahasiswa.CabangId) {
            return res.status(404).json({ msg: "Mahasiswa tidak ditemukan" });
        }

        // Verifikasi bahwa data wajah tersedia
        if (!mahasiswa.face_descriptor) {
            return res.status(400).json({ msg: "Data wajah mahasiswa tidak tersedia" });
        }

        const tglAbsensi = moment().format("YYYY-MM-DD");
        const jamSekarang = moment().format("HH:mm:ss");
        const hariIni = moment().locale('id').format('dddd').toLowerCase();

        // Cari lokasi kampus/cabang
        const lokasiKantor = await Cabang.findOne({ 
            where: { id: mahasiswa.CabangId }, 
            attributes: ["lokasi", "radius"] 
        });

        if (!lokasiKantor || !lokasiKantor.lokasi) {
            return res.status(404).json({ msg: "Lokasi kampus tidak ditemukan" });
        }

        // Cek mata kuliah yang tersedia hari ini untuk mahasiswa
        const matkulHariIni = await Matkul.findAll({
            where: { hari: hariIni },
            include: [{
                model: Mahasiswa,
                where: { id: mahasiswa.id },
                through: { attributes: [] },
                attributes: []
            }]
        });

        if (matkulHariIni.length === 0) {
            return res.status(404).json({ msg: "Tidak ada mata kuliah hari ini" });
        }

        // Cari presensi masuk yang belum memiliki presensi keluar
        const presensiMasukHariIni = await Absensi.findAll({
            where: {
                tgl_absensi: tglAbsensi,
                mahasiswa_id: mahasiswa.id,
                jam_masuk: { [Op.ne]: null },
                jam_keluar: null
            },
            include: [{
                model: Matkul,
                as: 'matkul',
                attributes: ['id', 'nama_matkul', 'jam_keluar_presensi']
            }]
        });

        if (presensiMasukHariIni.length === 0) {
            return res.status(400).json({ msg: "Anda belum melakukan presensi masuk atau sudah melakukan presensi keluar untuk semua mata kuliah hari ini" });
        }

        // Jika ada lebih dari satu presensi tanpa keluar, berikan daftar mata kuliah
        if (presensiMasukHariIni.length > 1) {
            return res.status(400).json({
                msg: "Ada lebih dari satu mata kuliah yang belum presensi keluar",
                matkul_list: presensiMasukHariIni.map(p => ({ id: p.matkul.id, nama: p.matkul.nama_matkul }))
            });
        }

        // Ambil presensi yang akan diisi keluar
        const absensi = presensiMasukHariIni[0];
        const matkul = absensi.matkul;

        // Cek waktu keluar
        const jamKeluar = moment(matkul.jam_keluar_presensi, 'HH:mm:ss');
        const sekarang = moment(jamSekarang, 'HH:mm:ss');
        
        // Verifikasi waktu presensi keluar
        if (sekarang.isBefore(jamKeluar)) {
            return res.status(400).json({ msg: "Belum waktunya untuk presensi keluar pada mata kuliah ini" });
        }

        // Cek lokasi GPS
        const { latitude: latitudeUser, longitude: longitudeUser, image } = req.body;
        if (!latitudeUser || !longitudeUser || !image) {
            return res.status(400).json({ msg: "Lokasi atau foto tidak valid" });
        }

        const [latitudeKantor, longitudeKantor] = lokasiKantor.lokasi.split(",");
        const { meters: jarakMahasiswa } = calculateDistance(
            latitudeKantor, longitudeKantor, latitudeUser, longitudeUser
        );

        if (jarakMahasiswa > lokasiKantor.radius) {
            return res.status(400).json({ 
                msg: `Anda berada di luar radius kampus (${jarakMahasiswa.toFixed(2)} M)` 
            });
        }

        // Proses deteksi wajah dengan data dari database
        const [, imageData] = image.split(";base64,");
        if (!imageData) {
            return res.status(400).json({ msg: "Format gambar tidak valid" });
        }

        try {
            const bufferImage = Buffer.from(imageData, "base64");
            const absensiImage = await canvas.loadImage(bufferImage);

            const absensiDescriptor = await faceapi.detectSingleFace(absensiImage, faceDetectionOptions)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!absensiDescriptor) {
                return res.status(400).json({ msg: "Wajah tidak terdeteksi, pastikan wajah terlihat jelas" });
            }

            // Parse data wajah tersimpan menggunakan metode yang sama dengan CreateAbsensiMahasiswa
            let storedDescriptorArray;
            try {
                // Coba parse JSON string menjadi objek
                const parsedDescriptor = JSON.parse(mahasiswa.face_descriptor);
                
                // Tangani berbagai format yang mungkin
                if (Array.isArray(parsedDescriptor)) {
                    // Jika sudah berupa array, gunakan langsung
                    storedDescriptorArray = parsedDescriptor;
                } else if (typeof parsedDescriptor === 'object') {
                    // Jika berupa objek dengan kunci numerik (0, 1, 2, dll)
                    if (Object.keys(parsedDescriptor).every(key => !isNaN(Number(key)))) {
                        // Konversi objek dengan kunci numerik ke array
                        storedDescriptorArray = Object.values(parsedDescriptor);
                    } else {
                        // Format objek lain yang tidak dikenali
                        console.error("Format descriptor tidak dikenali:", parsedDescriptor);
                        return res.status(400).json({ msg: "Format data wajah tersimpan tidak valid" });
                    }
                } else {
                    console.error("Tipe descriptor tidak valid:", typeof parsedDescriptor);
                    return res.status(400).json({ msg: "Format data wajah tersimpan tidak valid" });
                }
            } catch (error) {
                console.error("Error parsing face descriptor:", error);
                return res.status(400).json({ msg: "Data wajah tersimpan rusak" });
            }

            // Ekstrak descriptor yang terdeteksi
            let detectedDescriptorArray;
            if (absensiDescriptor && absensiDescriptor.descriptor) {
                detectedDescriptorArray = Array.from(absensiDescriptor.descriptor);
            } else {
                return res.status(400).json({ msg: "Format data wajah tidak valid dari gambar yang dikirim" });
            }

            // Bandingkan panjang
            if (storedDescriptorArray.length !== detectedDescriptorArray.length) {
                console.log(`Length mismatch: stored=${storedDescriptorArray.length}, new=${detectedDescriptorArray.length}`);
                return res.status(400).json({ msg: "Ketidakcocokan dalam format data wajah" });
            }
           
            // Hitung jarak wajah
            const faceDistance = faceapi.euclideanDistance(storedDescriptorArray, detectedDescriptorArray);
            const FACE_MATCH_THRESHOLD = 0.45;

            console.log("Face distance:", faceDistance);

            if (faceDistance > FACE_MATCH_THRESHOLD) {
                return res.status(400).json({ msg: "Wajah tidak cocok dengan data profil" });
            }

            // Simpan gambar presensi
            const formatName = `${mahasiswa.nama_lengkap}-${tglAbsensi}-${matkul.nama_matkul}-keluar.png`;
            const file = `public/uploads/absensi/${formatName}`;
            await writeFile(file, bufferImage);

            // Update presensi dengan data keluar
            await absensi.update({
                jam_keluar: jamSekarang,
                foto_keluar: formatName,
                lokasi_keluar: `${latitudeUser},${longitudeUser}`
            });

            return res.status(200).json({ 
                msg: "Presensi keluar berhasil, sampai jumpa!",
                matkul: matkul.nama_matkul
            });
            
        } catch (faceError) {
            console.error("Face detection error:", faceError);
            return res.status(500).json({ msg: "Terjadi kesalahan saat memproses data wajah" });
        }
        
    } catch (error) {
        console.error("CreateAbsensiMahasiswaKeluar error:", error);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
};


const edit = async (req, res) => {
    try {
        const { jam_masuk, jam_keluar } = req.body;

        // Validasi waktu di backend
        const timeFormat = /^([01]\d|2[0-3]):?([0-5]\d)$/;
        if (!timeFormat.test(jam_masuk) || !timeFormat.test(jam_keluar)) {
            return res.status(400).send('Format waktu tidak valid');
        }

        const absensi = await Absensi.findOne({
            where: { id: req.params.id }
        });

        if (!absensi) {
            return res.status(404).send('Absensi tidak ditemukan');
        }

        await Absensi.update({
            jam_masuk: jam_masuk || absensi.jam_masuk,
            jam_keluar: jam_keluar || absensi.jam_keluar
        }, {
            where: { id: absensi.id }
        });

        res.status(200).send('Absensi berhasil diupdate');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const deleteAbsen = async (req, res) => {
    try {
        const absensi = await Absensi.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!absensi) {
            return res.status(404).send('Absensi tidak ditemukan');
        }

        await absensi.destroy();
        res.status(200).send('Absensi berhasil dihapus');
    } catch (error) {
        res.status(500).json(error.message);
    }
};

// const distance = (lat1, lon1, lat2, lon2) => {
//     const theta = lon1 - lon2;
//     let miles = (Math.sin(deg2rad(lat1)) * Math.sin(deg2rad(lat2))) + (Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.cos(deg2rad(theta)));
//     miles = Math.acos(miles);
//     miles = rad2deg(miles);
//     miles = miles * 60 * 1.1515;
//     const feet = miles * 5280;
//     const yards = feet / 3;
//     const kilometers = miles * 1.609344;
//     const meters = kilometers * 1000;

//     return { meters };
// };

// const deg2rad = (deg) => {
//     return deg * (Math.PI / 180);
// };

// const rad2deg = (rad) => {
//     return rad * (180 / Math.PI);
// };


module.exports = {
    edit,
    deleteAbsen,
    distance,
    getAbsenAll,
    getAbsensi,
    getAbsensiById,
    getAbsensiBulanMahasiswa,
    CreateAbsensiMahasiswa,
    CreateAbsensiMahasiswaKeluar,
    getAbsensiBulanIni,
    getAbsensiTotal,
    convertToGMT7,
    createAdjustedAbsensi,
    getAbsensiByCabang,
    getAbsensiHarian,
    getAbsensiBulanMahasiswa,
    getAbsensiByMahasiswaId,
    absenManual,
    getAbsensiByMahasiswaAndDate,
    getAbsenAllByDosen,
    getAbsensiByMatkul
};